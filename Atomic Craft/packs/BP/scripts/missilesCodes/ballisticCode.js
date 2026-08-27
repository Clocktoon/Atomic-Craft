import { ItemStack, Player, system, world, } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString, ObservableBoolean } from "@minecraft/server-ui";
const distanceUiNumber = new ObservableNumber(0);
let fail = false;
function initializeMissile(missile, targetPos) {
    const launch = missile.location;
    const dx = targetPos.x - launch.x;
    const dz = targetPos.z - launch.z;
    const range = Math.sqrt(dx * dx + dz * dz);
    const apexHeight = Math.max(100, Math.min(100, range * 0.4));
    missile.setDynamicProperty("waypoint", 0);
    missile.setDynamicProperty("climbing", true);
    missile.setDynamicProperty("liftOffX", launch.x);
    missile.setDynamicProperty("liftOffY", launch.y);
    missile.setDynamicProperty("liftOffZ", launch.z);
    const yaw = -((Math.atan2(dx, dz) * 180) / Math.PI);
    missile.setDynamicProperty("yaw", yaw);
    missile.setDynamicProperty("pitch", -45);
    missile.setProperty("atomic:yaw", yaw);
    missile.setProperty("atomic:pitch", -45);
    missile.setRotation({ x: -45, y: yaw });
    const fractions = [0.15, 0.35, 0.5, 0.65, 0.75, 0.95];
    const heights = [0.60, 0.75, 0.90, 0.75, 0.65, 0.20];
    for (let i = 0; i < 6; i++) {
        missile.setDynamicProperty(`wp${i}x`, launch.x + dx * fractions[i]);
        missile.setDynamicProperty(`wp${i}y`, launch.y + apexHeight * heights[i]);
        missile.setDynamicProperty(`wp${i}z`, launch.z + dz * fractions[i]);
    }
}
function moveTowardAngle(current, target, maxTurn) {
    let diff = target - current;
    while (diff > 180)
        diff -= 360;
    while (diff < -180)
        diff += 360;
    if (Math.abs(diff) <= maxTurn) {
        return target;
    }
    return current + Math.sign(diff) * maxTurn;
}
function getGuidePoint(missile, target) {
    const waypoint = missile.getDynamicProperty("waypoint");
    if (waypoint <= 5) {
        return {
            x: missile.getDynamicProperty(`wp${waypoint}x`),
            y: missile.getDynamicProperty(`wp${waypoint}y`),
            z: missile.getDynamicProperty(`wp${waypoint}z`),
        };
    }
    return target.location;
}
//THIS IS THE IMPORTANT ONE, HAS COMMENTS TO HELP (KINDA)
function updateMissile(missile, target, payload, name) {
    if (!missile.isValid || !target.isValid) {
        return payload;
    }
    let waypoint = missile.getDynamicProperty("waypoint");
    if (waypoint >= 6 && !payload?.isValid) {
        world.sendMessage("PAYLOAD NOT VAILD");
        return null;
    }
    const active = waypoint >= 6 ? payload : missile;
    const pos = active.location;
    const climbing = missile.getDynamicProperty("climbing") ?? true;
    if (climbing && waypoint === 0) {
        const liftPoint = {
            x: missile.getDynamicProperty("liftOffX"),
            y: missile.getDynamicProperty("liftOffY") + 60,
            z: missile.getDynamicProperty("liftOffZ"),
        };
        const dx = liftPoint.x - pos.x;
        const dy = liftPoint.y - pos.y;
        const dz = liftPoint.z - pos.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 10) {
            missile.setDynamicProperty("climbing", false);
        }
        else {
            const yaw = missile.getDynamicProperty("yaw");
            const pitch = -90;
            missile.setDynamicProperty("yaw", yaw);
            missile.setDynamicProperty("pitch", pitch);
            missile.setProperty("atomic:yaw", yaw);
            missile.setProperty("atomic:pitch", pitch);
            missile.setRotation({ x: pitch, y: yaw });
            const yawRad = (yaw * Math.PI) / 180;
            const pitchRad = (pitch * Math.PI) / 180;
            const vx = -Math.sin(yawRad) * Math.cos(pitchRad);
            const vy = -Math.sin(pitchRad);
            const vz = Math.cos(yawRad) * Math.cos(pitchRad);
            const speed = 1.2;
            const loc = missile.location;
            missile.teleport({
                x: loc.x + vx * speed,
                y: loc.y + vy * speed,
                z: loc.z + vz * speed,
            }, {
                dimension: missile.dimension,
                keepVelocity: false,
            });
            return payload;
        }
    }
    const guidePoint = waypoint >= 6 ? target.location : getGuidePoint(missile, target);
    const targetDx = target.location.x - pos.x;
    const targetDy = target.location.y - pos.y;
    const targetDz = target.location.z - pos.z;
    const targetDistance = Math.sqrt(targetDx * targetDx + targetDy * targetDy + targetDz * targetDz);
    const dx = guidePoint.x - pos.x;
    const dy = guidePoint.y - pos.y;
    const dz = guidePoint.z - pos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    //const back = missile.getViewDirection();
    //Me when blast particles
    if (waypoint <= 4) {
        missile.dimension.spawnParticle("atomic:icbm_trail_partcc", {
            x: missile.location.x,
            y: missile.location.y,
            z: missile.location.z,
        });
    }
    // Advance waypoint
    if (waypoint <= 4 && dist < 15) {
        missile.setDynamicProperty("waypoint", waypoint + 1);
        return payload;
    }
    //payload stage
    if (waypoint === 5 && dist < 15) {
        missile.setDynamicProperty("waypoint", 6);
        missile.setProperty("atomic:pay", true);
        const newPayLoad = missile.dimension.spawnEntity("atomic:payload_entity", missile.location);
        newPayLoad.dimension.spawnParticle("atomic:icbmunleash", {
            x: newPayLoad.location.x,
            y: newPayLoad.location.y,
            z: newPayLoad.location.z - 1
        });
        const yaw = missile.getDynamicProperty("yaw");
        const pitch = missile.getDynamicProperty("pitch");
        newPayLoad.setDynamicProperty("yaw", yaw);
        newPayLoad.setDynamicProperty("pitch", pitch);
        newPayLoad.setProperty("atomic:yaw", yaw);
        newPayLoad.setProperty("atomic:pitch", pitch);
        newPayLoad.setRotation({ x: pitch, y: yaw });
        system.runTimeout(() => {
            missile.remove();
        }, 40);
        return newPayLoad;
    }
    //Just marking it so it's easier to find
    const horizontal = Math.sqrt(dx * dx + dz * dz);
    let yaw = active.getDynamicProperty("yaw");
    let pitch = active.getDynamicProperty("pitch");
    let desiredYaw = -((Math.atan2(dx, dz) * 180) / Math.PI);
    let desiredPitch = -((Math.atan2(dy, horizontal) * 180) / Math.PI);
    // soften the pitch near the apex where horizontal distance gets tiny
    if (horizontal < 2) {
        desiredPitch = Math.max(-70, Math.min(70, desiredPitch));
        desiredPitch = pitch + Math.sign(desiredPitch - pitch) * Math.min(6, Math.abs(desiredPitch - pitch));
    }
    const yawRate = 8;
    let pitchRate;
    if (waypoint <= 1) {
        pitchRate = 3;
    }
    else if (waypoint <= 5) {
        pitchRate = 6;
    }
    else {
        pitchRate = 20;
    }
    yaw = moveTowardAngle(yaw, desiredYaw, yawRate);
    pitch = moveTowardAngle(pitch, desiredPitch, pitchRate);
    active.setDynamicProperty("yaw", yaw);
    active.setDynamicProperty("pitch", pitch);
    active.setProperty("atomic:yaw", yaw);
    active.setProperty("atomic:pitch", pitch);
    const yawRad = (yaw * Math.PI) / 180;
    const pitchRad = (pitch * Math.PI) / 180;
    const vx = -Math.sin(yawRad) * Math.cos(pitchRad);
    const vy = -Math.sin(pitchRad);
    const vz = Math.cos(yawRad) * Math.cos(pitchRad);
    let speed;
    if (waypoint <= 1) {
        speed = 0.8;
    }
    else if (waypoint <= 5) {
        speed = 1.5;
    }
    else {
        speed = 1.9;
    }
    active.setRotation({
        x: pitch,
        y: yaw,
    });
    const loc = active.location;
    active.teleport({
        x: loc.x + vx * speed,
        y: loc.y + vy * speed,
        z: loc.z + vz * speed,
    }, {
        dimension: active.dimension,
        keepVelocity: false,
    });
    try {
        const rot = active.getRotation();
        active.nameTag = `Wanted:
    ${Math.round(yaw)}
    ${Math.round(pitch)}
    
    Actual:
    ${Math.round(rot.y)}
    ${Math.round(rot.x)}`;
    }
    catch (e) {
        console.warn(`Missile error: ${e}`);
    }
    if (targetDistance < 10) {
        active.triggerEvent("atomic:exposi");
        world.tickingAreaManager.removeTickingArea(name);
        target.remove();
    }
    return payload;
}
export function btravelSystem(x, y, z, name, entity, player) {
    const launchPos = entity.location;
    const dx = x - launchPos.x;
    const dy = y - launchPos.y;
    const dz = z - launchPos.z;
    const maxDistance = 3000;
    const launchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (launchDistance > maxDistance) {
        new CustomForm(player, { translate: "blas.fail.name" })
            //Couldn't make it so this one uses a localization string cause of the needed math and distance parts
            .label(`Missile is out of range as it is ${Math.round(launchDistance)} blocks away, max distance is ${maxDistance} blocks`)
            .closeButton()
            .show();
        return;
    }
    const minY = Math.max(0, y - 30);
    const maxY = y + 30;
    let payload = null;
    world.tickingAreaManager
        .createTickingArea(name, {
        from: {
            x: x - 30,
            y: minY,
            z: z - 30,
        },
        to: {
            x: x + 30,
            y: maxY,
            z: z + 30,
        },
        dimension: entity.dimension,
    })
        .then(() => {
        const target = entity.dimension.spawnEntity("atomic:hate", { x, y, z });
        initializeMissile(entity, target.location);
        entity.setProperty("atomic:blastoff", true);
        entity.triggerEvent("atomic:onn");
        const missileLoop = system.runInterval(() => {
            if (!entity.isValid || !target.isValid) {
                system.clearRun(missileLoop);
                return;
            }
            payload = updateMissile(entity, target, payload, name);
        }, 1);
    });
}
// @lantern-links-entities ["atomic:ballistic_missile"]
world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target;
    const player = ev.player;
    if (entity.typeId === "atomic:ballistic_missile") {
        const xOb = new ObservableString("", { clientWritable: true });
        const zOb = new ObservableString("", { clientWritable: true });
        const cordMode = new ObservableNumber(0, { clientWritable: true });
        const launchBool = new ObservableBoolean(true, { clientWritable: true });
        const saveCordBool = new ObservableBoolean(false, { clientWritable: true });
        const useSaved = new ObservableBoolean(false, { clientWritable: true });
        cordMode.subscribe((mode) => {
            if (mode === 0) {
                launchBool.setData(true);
                saveCordBool.setData(false);
                useSaved.setData(false);
            }
            if (mode === 1) {
                launchBool.setData(false);
                if (entity.getDynamicProperty("saved") === true) {
                    useSaved.setData(true);
                }
                if (entity.getDynamicProperty("saved") === undefined ||
                    entity.getDynamicProperty("saved") === false) {
                    saveCordBool.setData(true);
                }
                else {
                    saveCordBool.setData(false);
                }
            }
        });
        const form = new CustomForm(player, { translate: "blas.menu.paneltitle.name" });
        form
            .dropdown({ translate: "blas.menu.dropdownname.name" }, cordMode, [
            {
                label: { translate: "blas.menu.dropdown.labelone.name" },
                value: 0,
            },
            {
                label: { translate: "blas.menu.dropdown.labeltwo.name" },
                value: 1,
            },
        ])
            .textField({ translate: "blas.menu.cord.x.name" }, xOb)
            .textField({ translate: "blas.menu.cord.z.name" }, zOb)
            .closeButton()
            .divider()
            .button({ translate: "blas.menu.button.launch.name" }, () => {
            let x = Number(xOb.getData());
            let z = Number(zOb.getData());
            let y = player.dimension.getTopmostBlock({ x: x, z: z })?.location.y;
            const nameId = `hate${x}${y}${z}`;
            let time = 10;
            const timer = system.runInterval(() => {
                if (time < 0) {
                    system.clearRun(timer);
                }
                if (time >= 4) {
                    player.onScreenDisplay.setActionBar(`${time}`);
                    entity.dimension.spawnParticle("atomic:ballistic_smoke", entity.location);
                }
                if (time < 4 && time >= 0) {
                    player.onScreenDisplay.setActionBar(`§4${time}`);
                    entity.dimension.spawnParticle("atomic:ballistic_smoke", entity.location);
                }
                time--;
            }, 20);
            system.runTimeout(() => {
                if (y)
                    btravelSystem(x, y, z, nameId, entity, player);
            }, 200);
            form.close();
        }, { visible: launchBool })
            .button({ translate: "blas.menu.button.savecord.name" }, () => {
            let x = Number(xOb.getData());
            let z = Number(zOb.getData());
            let y = player.dimension.getTopmostBlock({ x: x, z: z })?.location.y;
            if (y) {
                entity.setDynamicProperty("missileCord", { x: x, y: y, z: z });
                entity.setDynamicProperty("saved", true);
                form.close();
            }
            else {
                world.sendMessage("AHHHHHHHHHHHHH CONSOLE BROKE");
            }
        }, { visible: saveCordBool })
            .button({ translate: "blas.menu.button.firesave.name" }, () => {
            const location = entity.getDynamicProperty("missileCord");
            const nameId = `hate${location.x}${location.y}${location.z}`;
            let time = 10;
            const timer = system.runInterval(() => {
                if (time < 0) {
                    system.clearRun(timer);
                }
                if (time >= 4) {
                    player.onScreenDisplay.setActionBar(`${time}`);
                    entity.dimension.spawnParticle("atomic:ballistic_smoke", entity.location);
                }
                if (time < 4) {
                    player.onScreenDisplay.setActionBar(`§4${time}`);
                    entity.dimension.spawnParticle("atomic:ballistic_smoke", entity.location);
                }
                time--;
            }, 20);
            system.runTimeout(() => {
                if (location.y)
                    btravelSystem(location.x, location.y, location.z, nameId, entity, player);
            }, 200);
            form.close();
        }, { visible: useSaved })
            .show();
    }
});
world.afterEvents.entityHurt.subscribe((ev) => {
    const entity = ev.hurtEntity;
    const damageSource = ev.damageSource;
    if (entity.typeId === "atomic:ballistic_missile" &&
        damageSource.damagingEntity instanceof Player) {
        const damager = damageSource.damagingEntity;
        if (damager instanceof Player) {
            const invComp = damager.getComponent("minecraft:inventory");
            if (invComp && invComp.container)
                invComp.container.addItem(new ItemStack("atomic:blass", 1));
            entity.remove();
        }
    }
});
//# sourceMappingURL=ballisticCode.js.map