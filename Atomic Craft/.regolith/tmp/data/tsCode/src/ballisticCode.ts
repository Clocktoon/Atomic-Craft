import {
  Dimension,
  Entity,
  ItemStack,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import {
  CustomForm,
  ObservableNumber,
  ObservableString,
} from "@minecraft/server-ui";

const distanceUiNumber = new ObservableNumber(0)
let fail = false

function initializeMissile(missile: Entity, targetPos: Vector3) {
  const launch = missile.location;

  const dx = targetPos.x - launch.x;
  const dz = targetPos.z - launch.z;

  const range = Math.sqrt(dx * dx + dz * dz);

  const apexHeight = Math.max(100, Math.min(100, range * 0.4));

  missile.setDynamicProperty("waypoint", 0);

  const yaw = -((Math.atan2(dx, dz) * 180) / Math.PI);

  missile.setDynamicProperty("yaw", yaw);

  missile.setDynamicProperty("pitch", -80);

    const fractions = [0.15, 0.35, 0.5, 0.65, 0.75, 0.95];
    const heights = [0.25, 0.75, 0.90, 0.75, 0.65, 0.30];

  for (let i = 0; i < 6; i++) {
    missile.setDynamicProperty(`wp${i}x`, launch.x + dx * fractions[i]);

    missile.setDynamicProperty(`wp${i}y`, launch.y + apexHeight * heights[i]);

    missile.setDynamicProperty(`wp${i}z`, launch.z + dz * fractions[i]);
  }
}

function moveTowardAngle(current: number, target: number, maxTurn: number) {
  let diff = target - current;

  while (diff > 180) diff -= 360;
  while (diff < -180) diff += 360;

  if (Math.abs(diff) <= maxTurn) {
    return target;
  }

  return current + Math.sign(diff) * maxTurn;
}

function getGuidePoint(missile: Entity, target: Entity) {
  const waypoint = missile.getDynamicProperty("waypoint") as number;

  if (waypoint <= 5) {
    return {
      x: missile.getDynamicProperty(`wp${waypoint}x`) as number,

      y: missile.getDynamicProperty(`wp${waypoint}y`) as number,

      z: missile.getDynamicProperty(`wp${waypoint}z`) as number,
    };
  }

  return target.location;
}

//THIS IS THE IMPORTANT ONE, HAS COMMENTS TO HELP (KINDA)
function updateMissile(missile: Entity, target: Entity, payload: Entity | null): Entity | null {
   if (!missile.isValid || !target.isValid) {
      return payload;
    }
  
    let waypoint = missile.getDynamicProperty("waypoint") as number;
  
    if (waypoint >= 6 && !payload?.isValid) {
      world.sendMessage("PAYLOAD NOT VAILD")
      return null;
    }
  
    const active = waypoint >= 6 ? (payload as Entity) : missile;
    const guidePoint = waypoint >= 6 ? target.location : getGuidePoint(missile, target);
    const pos = active.location;
  
    const targetDx = target.location.x - pos.x;
    const targetDy = target.location.y - pos.y;
    const targetDz = target.location.z - pos.z;
  
    const targetDistance = Math.sqrt(
      targetDx * targetDx + targetDy * targetDy + targetDz * targetDz,
    );
  
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
    if (waypoint <= 5 && dist < 15) {
      missile.setDynamicProperty("waypoint", waypoint + 1);
      return payload;
    }
  
    // payload stage
    // if (waypoint === 5) {
    //   world.sendMessage("TEST 1")
    //   missile.setDynamicProperty("waypoint", 6);
    //   world.sendMessage("TEST 2")
    //   missile.setProperty("atomic:pay", true)
    //   world.sendMessage("TEST 3")
    //   const newPayLoad = missile.dimension.spawnEntity("atomic:payload_entity", missile.location);
    //   world.sendMessage("PAYLOAD PHASE STARTED")
    //   newPayLoad
    //   newPayLoad.dimension.spawnParticle("atomic:icbmunleash", {
    //     x: newPayLoad.location.x,
    //     y: newPayLoad.location.y,
    //     z: newPayLoad.location.z - 1
    //   })
    //   const yaw = missile.getDynamicProperty("yaw") as number;
    //   const pitch = missile.getDynamicProperty("pitch") as number;
  
    //   newPayLoad.setDynamicProperty("yaw", yaw);
    //   newPayLoad.setDynamicProperty("pitch", pitch);
    //   newPayLoad.setProperty("atomic:yaw", yaw);
    //   newPayLoad.setProperty("atomic:pitch", pitch);
    //   system.runTimeout( () => {
    //     missile.remove()
    //   }, 40)
  
    //   return newPayLoad;
    // }
    if (waypoint === 5 && dist < 15) {
    missile.setDynamicProperty("waypoint", 6);

    missile.setProperty("atomic:atomic:pay", true)
    const newPayLoad = missile.dimension.spawnEntity("atomic:payload_entity", missile.location);
    newPayLoad.dimension.spawnParticle("atomic:icbmunleash", {
      x: newPayLoad.location.x,
      y: newPayLoad.location.y,
      z: newPayLoad.location.z - 1
    })
    const yaw = missile.getDynamicProperty("yaw") as number;
    const pitch = missile.getDynamicProperty("pitch") as number;

    newPayLoad.setDynamicProperty("yaw", yaw);
    newPayLoad.setDynamicProperty("pitch", pitch);
    newPayLoad.setProperty("atomic:yaw", yaw);
    newPayLoad.setProperty("atomic:pitch", pitch);
    system.runTimeout( () => {
      missile.remove()
    }, 40)

    return newPayLoad;
  }
    //Just marking it so it's easier to find
  
    const horizontal = Math.sqrt(dx * dx + dz * dz);
  
    const desiredYaw = -((Math.atan2(dx, dz) * 180) / Math.PI);
    const desiredPitch = -((Math.atan2(dy, horizontal) * 180) / Math.PI);
  
    let yaw = active.getDynamicProperty("yaw") as number;
    let pitch = active.getDynamicProperty("pitch") as number;
  
    const yawRate = 8;
    let pitchRate;
  
    if (waypoint <= 1) {
      pitchRate = 3;
    } else if (waypoint <= 5) {
      pitchRate = 6;
    } else {
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
      speed = 0.4;
    } else if (waypoint <= 5) {
      speed = 0.9;
    } else {
      speed = 1.6;
    }
  
    const loc = active.location;
  
    active.teleport(
      {
        x: loc.x + vx * speed,
        y: loc.y + vy * speed,
        z: loc.z + vz * speed,
      },
      {
        dimension: active.dimension,
        keepVelocity: false,
      },
    );
  
    try {
      active.setRotation({
        x: pitch,
        y: yaw,
      });
  
      const rot = active.getRotation();
  
      active.nameTag = `Wanted:
  ${Math.round(yaw)}
  ${Math.round(pitch)}
  
  Actual:
  ${Math.round(rot.y)}
  ${Math.round(rot.x)}`;
    } catch (e) {
      console.warn(`Missile error: ${e}`);
    }


  if (targetDistance < 5) {
    active.triggerEvent("atomic:exposi");
    target.dimension.spawnParticle("atomic:explosioncloud", 
      {x: target.location.x, y: target.location.y - 6, z: target.location.z})

    target.remove();
    
  }
  return payload
}

function travelSystem(
  x: number,
  y: number,
  z: number,
  name: string,
  entity: Entity,
  player: Player
) {
  const launchPos = entity.location;
  const dx = x - launchPos.x;
  const dy = y - launchPos.y;
  const dz = z - launchPos.z;

  const maxDistance = 3000;
  const launchDistance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (launchDistance > maxDistance) {
    new CustomForm(player, "Missile Fail")
      .label(
        `Missile is out of range as it is ${Math.round(
          launchDistance,
        )} blocks away, max distance is ${maxDistance} blocks`,
      )
      .closeButton()
      .show();
    return;
  }
  const minY = Math.max(0, y - 30);
  const maxY = y + 30;

  let payload: Entity | null = null;

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

      entity.setProperty("atomic:blastoff", true)
      entity.triggerEvent("atomic:onn");
      const missileLoop = system.runInterval(() => {
        if (!entity.isValid || !target.isValid) {
          system.clearRun(missileLoop);

          return;
        }

       payload = updateMissile(entity, target, payload);
      
      }, 1);
    });
}

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
  const entity = ev.target;
  const player = ev.player;

  if (entity.typeId === "atomic:ballistic_missile") {
    const xOb = new ObservableString("", { clientWritable: true });
    const yOb = new ObservableString("", { clientWritable: true });
    const zOb = new ObservableString("", { clientWritable: true });
    const form = new CustomForm(player, "Missile Control Panel");
    form
      .textField("X", xOb)
      .textField("Y", yOb)
      .textField("Z", zOb)
      .closeButton()
      .divider()
      .button("Launch", () => {
        let x = Number(xOb.getData());
        let y = Number(yOb.getData());
        let z = Number(zOb.getData());
        const nameId = `hate${x}${y}${z}`;
        //TODO: Add a wait period and have smoke blast out
        //TODO: Make it so missile wobbles a bit
        //TODO:Have missile blast staright up before heading towards target
        //TODO:Change way Y cord is gotten
        //TODO: ANTI MISSILE SYSTEM?
        travelSystem(x, y, z, nameId, entity, player);
        form.close();
      })
      .show();
  }
});

world.afterEvents.entityHurt.subscribe((ev) => {
  const entity = ev.hurtEntity;
  const damageSource = ev.damageSource;
  if (
    entity.typeId === "atomic:ballistic_missile" &&
    damageSource.damagingEntity instanceof Player
  ) {
    const damager = damageSource.damagingEntity;
    if (damager instanceof Player) {
      const invComp = damager.getComponent("minecraft:inventory");
      if (invComp && invComp.container)
        invComp.container.addItem(new ItemStack("atomic:blass", 1));
        entity.remove()
    }
  }
});
