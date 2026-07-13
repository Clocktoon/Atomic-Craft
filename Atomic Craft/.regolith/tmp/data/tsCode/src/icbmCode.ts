import {
  Dimension,
  ItemStack,
  Entity,
  Player,
  system,
  Vector3,
  world,
} from "@minecraft/server";
import { EquipmentSlot } from "@minecraft/server";
import { createCrater } from "./nuclearTransforms/crater.js";
import { nuclearArea } from "./nuclearTransforms/volumeCode.js";
import {
  CustomForm,
  ObservableBoolean,
  ObservableNumber,
  ObservableString,
} from "@minecraft/server-ui";

const distanceUiNumber = new ObservableNumber(0);
let fail = false;
let stopGoing = false;

function makeRandomId() {
  //Taken from a free to use script by Coolbep on https://bedrock-snippets.vercel.app/
  return `${Date.now()}+${Math.random() * 100}`;
}
function* nuclearExplosion(
  playerEntity: Player,
  entity: Entity,
  target: Entity,
) {
  if (!playerEntity) return;
  const randomMath = makeRandomId();
  const random = `${randomMath}`;

  const px = entity.location.x;
  const pz = entity.location.z;
  const py = entity.location.y;

  //Ticking area for the stuff close to the explosion
  world.tickingAreaManager
    .createTickingArea(`nukearea${random}`, {
      from: { x: px - 60, y: 0, z: pz - 60 },
      to: { x: px + 60, y: 0, z: pz + 60 },
      dimension: entity.dimension,
    })
    .then(() => {
      function* blockGen() {
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
          eny.setOnFire(64);
          if (
            eny.runCommand(
              `testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`,
            ).successCount <= 0 &&
            eny.typeId !== "atomic:gen_entity" &&
            eny.typeId != "minecraft:player"
          ) {
            eny.addTag("atomic:rad_effect");
          }
        }

        for (const playerRadi of players) {
          if (
            playerRadi
              .getComponent("minecraft:equippable")
              ?.getEquipment(EquipmentSlot.Head)?.typeId !== "atomic:gas_mask"
          ) {
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
        system.runJob(
          (function* () {
            yield* createCrater(
              entity.location,
              entity.dimension.id,
              "minecraft:air",
              50,
              30,
            );
            world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
          })(),
        );

        // Sound code by MapleStar // TC (discord)
        function playExplosionAudio(
          dimension: Dimension,
          center: Vector3,
          magnitude: number,
        ) {
          if (!center) return;

          const players = dimension.getPlayers();
          const explosionRadius = Math.min(
            Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)),
            60,
          );
          const maxHearingDistance = explosionRadius * 24;
          const shakeDistance = explosionRadius * 8;

          players.forEach((player) => {
            const playerLocation = player.location;
            const dx = playerLocation.x - center.x;
            const dy = playerLocation.y - center.y;
            const dz = playerLocation.z - center.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance > maxHearingDistance) return;

            player.sendMessage("test test 123");

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
                  const shakeIntensity = Math.max(
                    0.1,
                    1 - distance / shakeDistance,
                  );
                  dimension.runCommand(
                    `execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`,
                  );
                }
              } catch (err) {
                player.sendMessage("error with sound and shake code");
              }
            }, delayMs);
          });
        }
        if (!playerEntity) return;
        const playdi = playerEntity.dimension;

        //Explosion sound
        playExplosionAudio(playdi, entity.location, 260);
        yield;
        //Gets rid of ticking area and starts the real nuclear explosion code

        console.warn("Pre nuclear ICBM, aka explosion audio, done")
        //Nuke Code!!!
        nuclearArea(
          entity.dimension.id,
          entity.location,
          entity,
          224,
          70,
          playerEntity,
        ).then(() => {
          entity.remove();
          target.remove();
          console.warn("Nuclear code for ICBM done")
        });
        console.warn("Running nuclear code for ICBM")
      }

      system.runJob(blockGen());
    });
}

function initializeMissile(missile: Entity, targetPos: Vector3) {
  const launch = missile.location;

  const dx = targetPos.x - launch.x;
  const dz = targetPos.z - launch.z;

  const range = Math.sqrt(dx * dx + dz * dz);

  const apexHeight = Math.max(100, Math.min(120, range * 0.5));

  missile.setDynamicProperty("waypoint", 0);

  const yaw = -((Math.atan2(dx, dz) * 180) / Math.PI);

  missile.setDynamicProperty("yaw", yaw);

  missile.setDynamicProperty("pitch", -80);
  missile.setProperty("atomic:yaw", yaw);
  missile.setProperty("atomic:pitch", -80);
  missile.setRotation({ x: -80, y: yaw });

  const fractions = [0.15, 0.35, 0.5, 0.65, 0.75, 0.95];
  const heights = [0.25, 0.75, 0.85, 0.75, 0.55, 0.3];

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
function updateMissile(
  missile: Entity,
  target: Entity,
  warhead: Entity | null,
  player: Player,
): Entity | null {
  if (!missile.isValid || !target.isValid) {
    return warhead;
  }

  let waypoint = missile.getDynamicProperty("waypoint") as number;

  if (waypoint >= 6 && !warhead?.isValid) {
    console.warn("WARHEAD NOT VAILD");
    return null;
  }

  const active = waypoint >= 6 ? (warhead as Entity) : missile;
  const guidePoint =
    waypoint >= 6 ? target.location : getGuidePoint(missile, target);
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

  const back = missile.getViewDirection();

  //Me when blast particles
  if (waypoint <= 4) {
    missile.dimension.spawnParticle("atomic:icbm_trail_partcc", {
      x: missile.location.x + back.x * 1.5,
      y: missile.location.y,
      z: missile.location.z + back.z - 1,
    });
  }

  // Advance waypoint
  if (waypoint <= 4 && dist < 15) {
    missile.setDynamicProperty("waypoint", waypoint + 1);
    return warhead;
  }

  // Warhead stage
  if (waypoint === 5 && dist < 15) {
    missile.setDynamicProperty("waypoint", 6);

    missile.setProperty("atomic:warphase", true);
    const newWarhead = missile.dimension.spawnEntity(
      "atomic:warhead",
      missile.location,
    );
    newWarhead.dimension.spawnParticle("atomic:icbmunleash", {
      x: newWarhead.location.x,
      y: newWarhead.location.y,
      z: newWarhead.location.z - 1,
    });
    const yaw = missile.getDynamicProperty("yaw") as number;
    const pitch = missile.getDynamicProperty("pitch") as number;

    newWarhead.setDynamicProperty("yaw", yaw);
    newWarhead.setDynamicProperty("pitch", pitch);
    newWarhead.setProperty("atomic:yaw", yaw);
    newWarhead.setProperty("atomic:pitch", pitch);
    newWarhead.setRotation({ x: pitch, y: yaw });
    system.runTimeout(() => {
      missile.remove();
    }, 40);

    return newWarhead;
  }
  //Just marking it so it's easier to find

  const horizontal = Math.sqrt(dx * dx + dz * dz);

  let desiredYaw = -((Math.atan2(dx, dz) * 180) / Math.PI);
  let desiredPitch = -((Math.atan2(dy, horizontal) * 180) / Math.PI);

  let yaw = active.getDynamicProperty("yaw") as number;
  let pitch = active.getDynamicProperty("pitch") as number;

  if (horizontal < 2) {
    desiredPitch = Math.max(-70, Math.min(70, desiredPitch));
    const diff = desiredPitch - pitch;
    desiredPitch = pitch + Math.sign(diff) * Math.min(6, Math.abs(diff));
  }

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
    speed = 0.7;
  } else if (waypoint <= 5) {
    speed = 0.9;
  } else {
    speed = 1.7;
  }

  active.setRotation({
    x: pitch,
    y: yaw,
  });

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

  if (active.getProperty(`atomic:nuke`) === true || targetDistance < 10) {
    active.addEffect("invisibility", 2000000, { showParticles: false });
    target.addEffect("invisibility", 2000000, { showParticles: false });
    if (active.getProperty("atomic:nuclearphase") === false) {
      system.runJob(nuclearExplosion(player, active, target));
      console.warn("Nuclear explosion via ICBM went off")
      active.setProperty("atomic:nuclearphase", true)
    }
  }

  return warhead;
}

/**
 * Missile travel system
 *
 * @param {number} x x cord of target loctation
 * @param {number} y y cord of target location
 * @param {number} z z cord of target location
 * @param {string} name name to be used for ticking area
 * @param {Entity} entity
 * @param {Player} player
 */
export async function travelSystem(
  x: number,
  y: number,
  z: number,
  name: string,
  entity: Entity,
  player: Player,
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

  fail = false;
  const minY = Math.max(0, y - 30);
  const maxY = y + 30;

 
 
  let warhead: Entity | null = null;

  if (
    world.tickingAreaManager.hasCapacity({
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
  ) {
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

          warhead = updateMissile(entity, target, warhead, player);
        }, 1);

 })
  
} else {
    while(!world.tickingAreaManager.hasCapacity({
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
    })) {
    await new Promise<void>((resolve) => {
            system.runTimeout(() => resolve(), 1);            
              console.warn("ICBM ticking area made")
          });
        }
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

  initializeMissile(entity, target.location)

        entity.setProperty("atomic:blastoff", true);
        entity.triggerEvent("atomic:onn");
        const missileLoop = system.runInterval(() => {
          if (!entity.isValid || !target.isValid) {
            system.clearRun(missileLoop);

            return;
          }

          warhead = updateMissile(entity, target, warhead, player);
        }, 1);

  })
}
}
//@lantern-links-entities ["atomic:icbm"]
world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
  const entity = ev.target;
  const player = ev.player;

  if (entity.typeId === "atomic:icbm") {
    const xOb = new ObservableString("", { clientWritable: true });
    const zOb = new ObservableString("", { clientWritable: true });
    const cordMode = new ObservableNumber(0, { clientWritable: true });
    const launchBool = new ObservableBoolean(true, { clientWritable: true });
    const saveCordBool = new ObservableBoolean(false, { clientWritable: true });
    const useSaved = new ObservableBoolean(false, { clientWritable: true });

    cordMode.subscribe((mode: number) => {
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

        if (
          entity.getDynamicProperty("saved") === undefined ||
          entity.getDynamicProperty("saved") === false
        ) {
          saveCordBool.setData(true);
        } else {
          saveCordBool.setData(false);
        }
      }
    });
    const form = new CustomForm(player, "Missile Control Panel");
    form
      .dropdown("Mode", cordMode, [
        {
          label: "Launch now mode",
          value: 0,
        },
        {
          label: "Save coordinates for later mode",
          value: 1,
        },
      ])
      .textField("X", xOb)
      .textField("Z", zOb)
      .closeButton()
      .divider()
      .button(
        "Launch",
        () => {
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
              entity.dimension.spawnParticle(
                "atomic:ballistic_smoke",
                entity.location,
              );
            }
            if (time < 4 && time >= 0) {
              player.onScreenDisplay.setActionBar(`§4${time}`);
              entity.dimension.spawnParticle(
                "atomic:ballistic_smoke",
                entity.location,
              );
            }
            time--;
          }, 20);
          system.runTimeout(() => {
            if (y) 
              travelSystem(x, y, z, nameId, entity, player);
          }, 200);
          form.close();
        },
        { visible: launchBool },
      )

      .button(
        "Save coordinates",
        () => {
          let x = Number(xOb.getData());
          let z = Number(zOb.getData());
          let y = player.dimension.getTopmostBlock({ x: x, z: z })?.location.y;
          if (y) {
            entity.setDynamicProperty("missileCord", { x: x, y: y, z: z });
            entity.setDynamicProperty("saved", true);
            form.close();
          } else {
            world.sendMessage("AHHHHHHHHHHHHH CONSOLE BROKE");
          }
        },
        { visible: saveCordBool },
      )
      .button(
        "Fire at saved location",
        () => {
          const location: Vector3 = entity.getDynamicProperty(
            "missileCord",
          ) as Vector3;
          const nameId = `hate${location.x}${location.y}${location.z}`;
          let time = 10;
          const timer = system.runInterval(() => {
            if (time < 0) {
              system.clearRun(timer);
            }
            if (time >= 4) {
              player.onScreenDisplay.setActionBar(`${time}`);
              entity.dimension.spawnParticle(
                "atomic:ballistic_smoke",
                entity.location,
              );
            }
            if (time < 4) {
              player.onScreenDisplay.setActionBar(`§4${time}`);
              entity.dimension.spawnParticle(
                "atomic:ballistic_smoke",
                entity.location,
              );
            }
            time--;
          }, 20);
          system.runTimeout(() => {
            if (location.y)
              travelSystem(
                location.x,
                location.y,
                location.z,
                nameId,
                entity,
                player,
              );
          }, 200);
          form.close();
        },
        { visible: useSaved },
      )
      .show();
  }
});

world.afterEvents.entityHurt.subscribe((ev) => {
  const entity = ev.hurtEntity;
  const damageSource = ev.damageSource;
  if (
    entity.typeId === "atomic:icbm" &&
    damageSource.damagingEntity instanceof Player
  ) {
    const damager = damageSource.damagingEntity;
    if (damager instanceof Player) {
      const invComp = damager.getComponent("minecraft:inventory");
      if (invComp && invComp.container)
        invComp.container.addItem(new ItemStack("atomic:icbm_item", 1));
      entity.remove();
    }
  }
});
