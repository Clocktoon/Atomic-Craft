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

  const apexHeight = Math.max(150, Math.min(170, range * 0.6));

  missile.setDynamicProperty("waypoint", 0);

  const yaw = -((Math.atan2(dx, dz) * 180) / Math.PI);

  missile.setDynamicProperty("yaw", yaw);

  missile.setDynamicProperty("pitch", -80);

    const fractions = [0.15, 0.35, 0.5, 0.65, 0.75, 0.95];
    const heights = [0.25, 0.75, 1.0, 0.75, 0.55, 0.30];

  for (let i = 0; i < 5; i++) {
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

  if (waypoint <= 4) {
    return {
      x: missile.getDynamicProperty(`wp${waypoint}x`) as number,

      y: missile.getDynamicProperty(`wp${waypoint}y`) as number,

      z: missile.getDynamicProperty(`wp${waypoint}z`) as number,
    };
  }

  return target.location;
}

//THIS IS THE IMPORTANT ONE, HAS COMMENTS TO HELP (KINDA)
function updateMissile(missile: Entity, target: Entity) {
  if (!missile.isValid || !target.isValid) {
    return;
  }

  const targetDx = target.location.x - missile.location.x;

  const targetDy = target.location.y - missile.location.y;

  const targetDz = target.location.z - missile.location.z;

  const targetDistance = Math.sqrt(
    targetDx * targetDx + targetDy * targetDy + targetDz * targetDz,
  );

  const pos = missile.location;

  const guidePoint = getGuidePoint(missile, target);

  const dx = guidePoint.x - pos.x;

  const dy = guidePoint.y - pos.y;

  const dz = guidePoint.z - pos.z;

  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  const back = missile.getViewDirection()


  let waypoint = missile.getDynamicProperty("waypoint") as number;

  //Me when blast particles

   missile.dimension.spawnParticle("atomic:icbm_trail_partcc", {
    x: pos.x + back.x,
    y: pos.y - 1 + back.y,
    z: pos.z + back.z
  })

  // Advance waypoint
  if (waypoint <= 4 && dist < 15) {
    missile.setDynamicProperty("waypoint", waypoint + 1);

    return;
  }

  // Desired angles
  const horizontal = Math.sqrt(dx * dx + dz * dz);

  const desiredYaw = -((Math.atan2(dx, dz) * 180) / Math.PI);

  const desiredPitch = -((Math.atan2(dy, horizontal) * 180) / Math.PI);

  // Current angles
  let yaw = missile.getDynamicProperty("yaw") as number;

  let pitch = missile.getDynamicProperty("pitch") as number;

  const yawRate = 8;

  let pitchRate;

  if (waypoint <= 1) {
    pitchRate = 3;
  } else if (waypoint <= 4) {
    pitchRate = 6;
  } else {
    pitchRate = 20;
  }

  yaw = moveTowardAngle(yaw, desiredYaw, yawRate);
  pitch = moveTowardAngle(pitch, desiredPitch, pitchRate);

  missile.setDynamicProperty("yaw", yaw);

  missile.setDynamicProperty("pitch", pitch);

  missile.setProperty("atomic:yaw", yaw);
  missile.setProperty("atomic:pitch", pitch);

  // Forward vector

  const yawRad = (yaw * Math.PI) / 180;

  const pitchRad = (pitch * Math.PI) / 180;

  const vx = -Math.sin(yawRad) * Math.cos(pitchRad);
  const vy = -Math.sin(pitchRad);
  const vz = Math.cos(yawRad) * Math.cos(pitchRad);
  let speed;

  if (waypoint <= 1) {
    speed = 0.4;
  } else if (waypoint <= 4) {
    speed = 0.9;
  } else {
    speed = 1.6;
  }

  //Custom movement

  const loc = missile.location;

  missile.teleport(
    {
      x: loc.x + vx * speed,
      y: loc.y + vy * speed,
      z: loc.z + vz * speed,
    },
    {
      dimension: missile.dimension,
      keepVelocity: false,
    },
  );

  // Rotation
  try {
    missile.setRotation({
      x: pitch,
      y: yaw,
    });

    const rot = missile.getRotation();

    missile.nameTag = `Wanted:
${Math.round(yaw)}
${Math.round(pitch)}

Actual:
${Math.round(rot.y)}
${Math.round(rot.x)}`;
  } catch (e) {
    console.warn(`Missile error: ${e}`);
  }


  if (targetDistance < 5) {
    missile.triggerEvent("atomic:exposi");
    target.dimension.spawnParticle("atomic:explosioncloud", 
      {x: target.location.x, y: target.location.y - 6, z: target.location.z})

    target.remove();
  }
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

        updateMissile(entity, target);
      
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
