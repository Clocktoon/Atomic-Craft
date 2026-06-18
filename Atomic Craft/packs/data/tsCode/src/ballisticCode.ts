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
  ModalFormData,
  ObservableString,
} from "@minecraft/server-ui";

function initializeMissile(missile: Entity, targetPos: Vector3) {
  const launch = missile.location;

  const dx = targetPos.x - launch.x;
  const dz = targetPos.z - launch.z;

  const range = Math.sqrt(dx * dx + dz * dz);

  const apexHeight = Math.max(150, Math.min(450, range * 0.6));

  missile.setDynamicProperty("waypoint", 0);

  const yaw = -((Math.atan2(dx, dz) * 180) / Math.PI);

  missile.setDynamicProperty("yaw", yaw);

  missile.setDynamicProperty("pitch", -80);

  const fractions = [0.15, 0.35, 0.5, 0.65, 0.85];

  const heights = [0.25, 0.75, 1.00, 0.75, 0.30];

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

  const pos = missile.location;

  const guidePoint = getGuidePoint(missile, target);

  const dx = guidePoint.x - pos.x;

  const dy = guidePoint.y - pos.y;

  const dz = guidePoint.z - pos.z;

  const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

  let waypoint = missile.getDynamicProperty("waypoint") as number;

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
    speed = 0.3;
  } else if (waypoint <= 4) {
    speed = 0.8;
  } else {
    speed = 1.2;
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
  const targetDx = target.location.x - missile.location.x;

  const targetDy = target.location.y - missile.location.y;

  const targetDz = target.location.z - missile.location.z;

  const targetDistance = Math.sqrt(
    targetDx * targetDx + targetDy * targetDy + targetDz * targetDz,
  );

  if (targetDistance < 5) {
    missile.triggerEvent("atomic:exposi");

    target.remove();
  }
}

function travelSystem(
  x: number,
  y: number,
  z: number,
  name: string,
  entity: Entity,
) {
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
        travelSystem(x, y, z, nameId, entity);
        form.close();
      })
      .show();

    // let form = new ModalFormData();
    // form.title("Put in coordinates");
    // form.textField("X", "Put x cord");
    // form.textField("Z", "Put z cord").submitButton("Launch");

    // form
    //   .show(player)
    //   .then((r) => {
    //     if (r.canceled) return;

    //     let [xO, zO] = r.formValues;
    //     let x = Number(xO);
    //     let z = Number(zO);

    //     const y = player.dimension.getTopmostBlock({ x: x, z: z }, 0).location
    //       .y;

    //     /* entity.dimension.runCommand(
    //     `tickingarea add ${x - 30} 0 ${z - 30} ${x + 30} 0 ${z + 30} spawnarea`,
    //   ); */
    //       world.tickingAreaManager.createTickingArea("spawnarea", {
    //         from: { x: x - 30, y: 0, z: z - 30 },
    //         to: { x: x + 30, y: 0, z: z + 30 },
    //         dimension: entity.dimension,
    //       }).then(() => {

    //       entity.dimension.spawnEntity("atomic:hate", { x: x, y: y, z: z });
    //       entity.runCommand("say spawned hate at " + x + " " + y + " " + z);

    //       world.tickingAreaManager.removeTickingArea("spawnarea");
    //   },)})
    //   .catch((e) => {
    //     console.error(e, e.stack);
    //   });
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
    }
  }
});
