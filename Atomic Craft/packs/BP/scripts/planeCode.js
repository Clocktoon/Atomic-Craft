import { world, system, ItemStack, BlockVolume, EquipmentSlot } from "@minecraft/server";
import { createCrater } from "./nuclearTransforms/crater";
import { nuclearArea } from "./nuclearTransforms/volumeCode";
function makeRandomId() {
    //Taken from a free to use script by Coolbep on https://bedrock-snippets.vercel.app/
    return `${Date.now()}+${Math.random()}`;
}
function fission(entity, dimension) {
    const randomMath = makeRandomId();
    const random = `${randomMath}`;
    function nuclearBomb() {
        const px = entity.location.x;
        const pz = entity.location.z;
        const py = entity.location.y;
        const ran = `nukearea${random}`;
        //Ticking area for the stuff close to the explosion
        world.tickingAreaManager.createTickingArea(ran, {
            from: { x: px - 60, y: 0, z: pz - 60 },
            to: { x: px + 60, y: 0, z: pz + 60 },
            dimension: entity.dimension,
        })
            .then(() => {
            entity.dimension.playSound("atomic.beep", entity.location);
            function* blockGen() {
                let radius = 30;
                //Radiation and burning of mobs
                const players = entity.dimension.getPlayers({
                    location: entity.location,
                    minDistance: 1,
                    maxDistance: 100,
                });
                for (const eny of entity.dimension.getEntities({
                    location: entity.location,
                    minDistance: 1,
                    maxDistance: 100,
                })) {
                    if (eny.typeId === "atomic:plane")
                        continue;
                    eny.setOnFire(20);
                    if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 &&
                        eny.typeId !== "atomic:gen_entity" &&
                        eny.typeId != "minecraft:player") {
                        eny.addTag("atomic:rad_effect");
                    }
                }
                for (const playerRadi of players) {
                    if (playerRadi.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId !== "atomic:gas_mask") {
                        playerRadi.setDynamicProperty("radiation", 100);
                    }
                    //TODO: Make gas mask worth with players
                    playerRadi.camera.fade({
                        fadeColor: { red: 1, blue: 1, green: 1 },
                        fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                    });
                }
                entity.dimension.spawnParticle("atomic:nukepart", {
                    x: entity.location.x,
                    y: entity.location.y - 20,
                    z: entity.location.z,
                });
                // Crater code
                const randomMath = Math.floor(Math.random() * 20);
                system.runJob((function* () {
                    yield* createCrater(entity.location, entity.dimension.id, "minecraft:air", 50, 30);
                    world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
                })());
                // Sound code by MapleStar // TC (discord)
                function playExplosionAudio(dimension, center, magnitude) {
                    if (!center)
                        return;
                    const players = dimension.getPlayers();
                    const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
                    const maxHearingDistance = explosionRadius * 24;
                    const shakeDistance = explosionRadius * 8;
                    players.forEach((player) => {
                        const playerLocation = player.location;
                        const dx = playerLocation.x - center.x;
                        const dy = playerLocation.y - center.y;
                        const dz = playerLocation.z - center.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance > maxHearingDistance)
                            return;
                        const maxEffectRadius = explosionRadius * 2;
                        const distanceRatio = Math.min(1, distance / maxHearingDistance);
                        const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
                        const boomPitch = 0.8 + Math.random() * 0.2 - distanceRatio * 0.1;
                        const delayTicks = Math.min(100, Math.floor(distance / 17));
                        const delayMs = delayTicks * 50;
                        system.runTimeout(() => {
                            try {
                                player.playSound("atomic.nukesound", {
                                    volume: boomVolume,
                                    pitch: boomPitch
                                });
                                if (distance <= shakeDistance) {
                                    const shakeIntensity = Math.max(0.1, 1 - distance / shakeDistance);
                                    dimension.runCommand(`execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`);
                                }
                            }
                            catch (err) {
                                player.sendMessage("error with sound and shake code");
                            }
                        }, delayMs);
                    });
                }
                //Shockwave and explosion sound
                playExplosionAudio(dimension, entity.location, 260);
                // shockwaveBlast(
                //   dimension,
                //   block.location,
                //   3,
                //   50,
                //   { x: 6, z: 4 },
                //   1,
                // );
                yield;
                //Gets rid of ticking area and starts the real nuclear explosion code
                //Nuke Code!!!
                nuclearArea(entity.dimension.id, entity.location, entity, 224, 70, 100);
                const volume = new BlockVolume({
                    x: entity.location.x - 20,
                    y: entity.location.y - 20,
                    z: entity.location.z - 20,
                }, {
                    x: entity.location.x + 20,
                    y: entity.location.y + 20,
                    z: entity.location.z + 20,
                });
                // FOR LATER UPDATE
                // aftermath(
                //   dimension.id,
                //   radius,
                //   volume,
                //   Math.floor(Math.random() * 4),
                // );
            }
            system.runJob(blockGen());
        });
    }
    nuclearBomb();
}
function fusion(entity, dimension) {
    const randomMath = makeRandomId();
    const random = `${randomMath}`;
    function nuclearBomb() {
        const px = entity.location.x;
        const pz = entity.location.z;
        const py = entity.location.y;
        //Ticking area for the stuff close to the explosion
        world.tickingAreaManager
            .createTickingArea(`nukearea${random}`, {
            from: { x: px - 71, y: py - 70, z: pz - 71 },
            to: { x: px + 71, y: py + 10, z: pz + 71 },
            dimension: entity.dimension,
        })
            .then(() => {
            function* blockGen() {
                let radius = 30;
                //Radiation and burning of mobs
                const players = entity.dimension.getPlayers({
                    location: entity.location,
                    minDistance: 1,
                    maxDistance: 100,
                });
                for (const eny of entity.dimension.getEntities({
                    location: entity.location,
                    minDistance: 1,
                    maxDistance: 100,
                })) {
                    if (eny.typeId !== "minecraft:player") {
                        eny.kill();
                    }
                }
                for (const eny of entity.dimension.getEntities({
                    location: entity.location,
                    minDistance: 101,
                    maxDistance: 200,
                })) {
                    if (eny.typeId === "atomic:plane")
                        continue;
                    eny.setOnFire(20);
                    if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 &&
                        eny.typeId !== "atomic:gen_entity" &&
                        eny.typeId != "minecraft:player") {
                        eny.addTag("atomic:rad_effect");
                    }
                }
                for (const playerRadi of players) {
                    playerRadi.setDynamicProperty("radiation", 100);
                    //TODO: Make gas mask worth with players
                    playerRadi.camera.fade({
                        fadeColor: { red: 1, blue: 1, green: 1 },
                        fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                    });
                }
                entity.dimension.spawnParticle("atomic:nukepart2", {
                    x: entity.location.x,
                    y: entity.location.y - 26,
                    z: entity.location.z,
                });
                // Crater code
                function* createCrater(location, dimensionId, block, radius, maxDepth) {
                    if (!world.gameRules.tntExplodes)
                        return;
                    const dim = world.getDimension(dimensionId);
                    const cx = Math.floor(location.x);
                    const cy = Math.floor(location.y + 60);
                    const cz = Math.floor(location.z);
                    const r = Math.max(1, Math.ceil(radius));
                    const r2 = r * r;
                    for (let dx = -r; dx <= r; dx++) {
                        for (let dz = -r; dz <= r; dz++) {
                            const dist2 = dx * dx + dz * dz;
                            if (dist2 > r2)
                                continue;
                            const d = Math.sqrt(dist2);
                            const t = d / radius;
                            const depth = Math.floor(maxDepth * (1 - t * t));
                            if (depth <= 0)
                                continue;
                            const x = cx + dx;
                            const z = cz + dz;
                            for (let dy = 0; dy <= depth; dy++) {
                                const y = cy - dy;
                                dim.setBlockType({ x: x, y: y, z: z }, block);
                                yield;
                            }
                        }
                    }
                }
                system.runJob((function* () {
                    yield* createCrater(entity.location, entity.dimension.id, "minecraft:air", 70, 70);
                    world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
                })());
                // Sound code by MapleStar // TC (discord)
                function playExplosionAudio(dimension, center, magnitude) {
                    if (!center)
                        return;
                    const players = dimension.getPlayers();
                    const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
                    const maxHearingDistance = explosionRadius * 24;
                    const shakeDistance = explosionRadius * 8;
                    players.forEach((player) => {
                        const playerLocation = player.location;
                        const dx = playerLocation.x - center.x;
                        const dy = playerLocation.y - center.y;
                        const dz = playerLocation.z - center.z;
                        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                        if (distance > maxHearingDistance)
                            return;
                        const maxEffectRadius = explosionRadius * 2;
                        const distanceRatio = Math.min(1, distance / maxHearingDistance);
                        const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
                        const boomPitch = 0.8 + Math.random() * 0.2 - distanceRatio * 0.1;
                        const delayTicks = Math.min(100, Math.floor(distance / 17));
                        const delayMs = delayTicks * 50;
                        system.runTimeout(() => {
                            try {
                                player.playSound("atomic.nukesound", {
                                    volume: boomVolume,
                                    pitch: boomPitch,
                                });
                                if (distance <= shakeDistance) {
                                    const shakeIntensity = Math.max(0.2, 1 - distance / shakeDistance);
                                    dimension.runCommand(`execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`);
                                }
                            }
                            catch (err) {
                                player.sendMessage("error with sound and shake code");
                            }
                        }, delayMs);
                    });
                }
                //Shockwave and explosion sound
                playExplosionAudio(dimension, entity.location, 400);
                // shockwaveBlast(
                //   dimension,
                //   block.location,
                //   3,
                //   50,
                //   { x: 6, z: 4 },
                //   1,
                // );
                //Nuke Code!!!
                nuclearArea(entity.dimension.id, entity.location, entity, 352, 208, 250);
                const volume = new BlockVolume({
                    x: entity.location.x - 20,
                    y: entity.location.y - 20,
                    z: entity.location.z - 20,
                }, {
                    x: entity.location.x + 20,
                    y: entity.location.y + 20,
                    z: entity.location.z + 20,
                });
                //WILL BE ADDED IN LATER UPDATE
                // aftermath(
                //   dimension.id,
                //   radius,
                //   volume,
                //   Math.floor(Math.random() * 4),
                // );
            }
            system.runJob(blockGen());
        });
    }
    nuclearBomb();
}
world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target;
    const player = ev.player;
    if (entity.typeId === "atomic:plane" && !entity.isOnGround) {
        const size = {
            x: entity.location.x,
            y: entity.location.y - 3,
            z: entity.location.z,
        };
        const inventory = entity.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container)
            return;
        for (let i = 0; i < inventory.inventorySize; i++) {
            const item = inventory.container.getItem(i);
            if (item) {
                //tnt mode
                if (item.typeId === "minecraft:tnt") {
                    const itemStack = new ItemStack("minecraft:tnt", item.amount - 1);
                    if (item.amount > 1) {
                        inventory.container.setItem(i, itemStack);
                    }
                    if (item.amount <= 1) {
                        inventory.container.setItem(i);
                    }
                    const test = entity.dimension.spawnEntity("atomic:plane_bomb", size);
                    test.setDynamicProperty("type", "tnt");
                    test.dimension.playSound("atomic.plane.missile", test.location);
                    let time = 7;
                    const sy = system.runInterval(() => {
                        if (time >= 0) {
                            player.onScreenDisplay.setActionBar(`${time} seconds on cooldown`);
                            time--;
                        }
                        if (time <= 0) {
                            system.clearRun(sy);
                        }
                    }, 20);
                    return;
                }
                //Fission mode
                if (item.typeId === "atomic:atom_bomb") {
                    const itemStack = new ItemStack("atomic:atom_bomb", item.amount - 1);
                    if (item.amount > 1) {
                        inventory.container.setItem(i, itemStack);
                    }
                    if (item.amount <= 1) {
                        inventory.container.setItem(i);
                    }
                    const test = entity.dimension.spawnEntity("atomic:plane_bomb", size);
                    test.setDynamicProperty("type", "fission");
                    test.dimension.playSound("atomic.plane.missile", test.location);
                    let time = 7;
                    const sy = system.runInterval(() => {
                        if (time >= 0) {
                            player.onScreenDisplay.setActionBar(`${time} seconds on cooldown`);
                            time--;
                        }
                        if (time <= 0) {
                            system.clearRun(sy);
                        }
                    }, 20);
                    return;
                }
                //Fusion mode
                if (item.typeId === "atomic:hydrogen_bomb") {
                    const itemStack = new ItemStack("atomic:hydrogen_bomb", item.amount - 1);
                    if (item.amount > 1) {
                        inventory.container.setItem(i, itemStack);
                    }
                    if (item.amount <= 1) {
                        inventory.container.setItem(i);
                    }
                    const test = entity.dimension.spawnEntity("atomic:plane_bomb", size);
                    test.setDynamicProperty("type", "fusion");
                    test.dimension.playSound("atomic.plane.missile", test.location);
                    let time = 7;
                    const sy = system.runInterval(() => {
                        if (time >= 0) {
                            player.onScreenDisplay.setActionBar(`${time} seconds on cooldown`);
                            time--;
                        }
                        if (time <= 0) {
                            system.clearRun(sy);
                        }
                    }, 20);
                    return;
                }
            }
        }
    }
});
world.afterEvents.entityDie.subscribe((ev) => {
    const entity = ev.deadEntity;
    if (entity.typeId === "atomic:plane_bomb") {
        entity.dimension.createExplosion(entity.location, 6, { causesFire: true });
        entity.dimension.spawnParticle("atomic:explosioncloud", entity.location);
    }
});
world.afterEvents.entitySpawn.subscribe((event) => {
    const entity = event.entity;
    if (entity.typeId === "atomic:plane_bomb") {
        system.run(() => {
            const sy = system.runInterval(() => {
                if (!entity.isValid) {
                    system.clearRun(sy);
                    return;
                }
                if (entity.isOnGround && entity.getDynamicProperty("type") === "tnt") {
                    entity.dimension.createExplosion(entity.location, 6, { causesFire: true });
                    entity.dimension.spawnParticle("atomic:explosioncloud", entity.location);
                    system.clearRun(sy);
                }
                if (entity.isOnGround && entity.getDynamicProperty("type") === "fission") {
                    fission(entity, entity.dimension);
                }
                if (entity.isOnGround && entity.getDynamicProperty("type") === "fusion") {
                    fusion(entity, entity.dimension);
                }
            }, 1);
        });
    }
});
//# sourceMappingURL=planeCode.js.map