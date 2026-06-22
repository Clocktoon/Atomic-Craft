import {
  system,
  world,
  BlockVolume,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  Dimension,
  Vector3,
  EquipmentSlot,
} from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater.js";
import { shockwaveBlast } from "../nuclearTransforms/shockwave.js";
import { aftermath } from "../aftermath.js";
import { nuclearArea } from "../nuclearTransforms/volumeCode.js";
import { MessageBox } from "@minecraft/server-ui";

function makeRandomId() {
  //Taken from a free to use script by Coolbep on https://bedrock-snippets.vercel.app/
  return `${Date.now()}+${Math.random()}`;
}

class OnClick implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
    const randomMath = makeRandomId();
    const random = `${randomMath}`;

    const block = event.block;
    const playerEntity = event.player;
    const playerMain = playerEntity;
    const dimension = event.dimension;
  
    
     
      if(playerEntity)
    new MessageBox(playerEntity, "Confirm")
    .body("Are you sure you want to activate the nuclear bomb?")
    .button1("Yes", "this will start the nuclear bomb, it can not be stopped")
    .button2("No", "this will close the menu")
    .show()
    .then((rep) => {

      if(rep.selection === 1) {
      nuclearBomb()
      }

    }).catch(e => {
      playerEntity?.sendMessage(`${e}`)
    });

    function nuclearBomb(): void {
    if (!playerMain) return;

    const px = block.location.x;
    const pz = block.location.z;
    const py = block.y;

    //Ticking area for the stuff close to the explosion
    world.tickingAreaManager
      .createTickingArea(`nukearea${random}`, {
        from: { x: px - 60, y: 0, z: pz - 60 },
        to: { x: px + 60, y: 0, z: pz + 60 },
        dimension: block.dimension,
      })
      .then(() => {
        let seconds: number = 20;
        playerMain.sendMessage(`You have ${seconds} seconds to run`);

        const sys = system.runInterval(() => {
          if (seconds >= 1) {
            playerMain.onScreenDisplay.setActionBar(`${seconds} seconds left`);
            seconds--;
          }
          if (seconds <= 0) {
            system.clearRun(sys);
          }
        }, 20);
        block.dimension.playSound("atomic.beep", block.location);

        system.runTimeout(() => {
          function* blockGen() {

            let radius = 30;

            //Radiation and burning of mobs

            const players = block.dimension.getPlayers({
              location: block.location,
              minDistance: 1,
              maxDistance: 100,
            });

            for (const eny of block.dimension.getEntities({
              location: block.location,
              minDistance: 1,
              maxDistance: 100,
            })) {
              eny.setOnFire(20);
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
             if (playerRadi.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId !== "atomic:gas_mask") {
                playerRadi.setDynamicProperty("radiation", 100);
             }
              
              //TODO: Make gas mask worth with players

              playerRadi.camera.fade({
                fadeColor: { red: 1, blue: 1, green: 1 },
                fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
              });
            }

            block.dimension.spawnParticle("atomic:nukepart", {
              x: block.location.x,
              y: block.location.y - 20,
              z: block.location.z,
            });
            block.dimension.createExplosion(block.location, 15, {
              causesFire: true,
              allowUnderwater: false,
            });
            // Crater code
            const randomMath = Math.floor(Math.random() * 20)
            system.runJob((function* () {
                yield* createCrater(
                  block.location,
                  block.dimension.id,
                  "minecraft:air",
                  50,
                  30,
                );
                world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
              })());

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

                const distanceRatio = Math.min(
                  1,
                  distance / maxHearingDistance,
                );
                const boomVolume = Math.max(
                  0.2,
                  2.5 * (1 - distanceRatio * 0.8),
                );
                const boomPitch =
                  0.8 + Math.random() * 0.2 - distanceRatio * 0.1;

                const delayTicks = Math.min(100, Math.floor(distance / 17));
                const delayMs = delayTicks * 50;

                system.runTimeout(() => {
                  try {
                    player.playSound("atomic.nukesound", {
                      volume: boomVolume,
                      pitch: boomPitch
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
            if (!playerMain) return;
            const playdi = playerMain.dimension;

            //Shockwave and explosion sound
            playExplosionAudio(playdi, block.location, 260);
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
            world.tickingAreaManager.removeTickingArea("nukearea");

            //Nuke Code!!!
            nuclearArea(
              block.dimension.id,
              block.location,
              block,
              224,
              70,
              playerEntity,
            );

            const volume = new BlockVolume(
              {
                x: block.location.x - 20,
                y: block.location.y - 20,
                z: block.location.z - 20,
              },
              {
                x: block.location.x + 20,
                y: block.location.y + 20,
                z: block.location.z + 20,
              },
            );

            aftermath(
              dimension.id,
              radius,
              volume,
              Math.floor(Math.random() * 4),
            );
          }

          system.runJob(blockGen());
        }, 400);
      });
    }
  }
}

export { OnClick };

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "atomic:atom_bomb",
    new OnClick(),
  );
});
