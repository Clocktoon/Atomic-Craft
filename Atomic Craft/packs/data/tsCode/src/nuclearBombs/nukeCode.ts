import {
  system,
  world,
  BlockVolume,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  Dimension,
  Vector3,
  CustomComponentParameters,
} from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater.js";
import { shockwaveBlast } from "../nuclearTransforms/shockwave.js";
import { aftermath } from "../aftermath.js";
import { nuclearArea } from "../nuclearTransforms/volumeCode.js";

class OnClick implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
    const block = event.block;
    const playerEntity = event.player;
    const playerMain = playerEntity;
    const dimension = event.dimension;

    // guard: player may be undefined in some event contexts
    if (!playerMain) return;

    const px = block.location.x;
    const pz = block.location.z;
    const py = block.y;

    //Ticking area for the stuff close to the explosion
    world.tickingAreaManager
      .createTickingArea("nukearea", {
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
            let radius = 100;

            
            //Radiation and burning of mobs

            const players = block.dimension.getPlayers({
              location: block.location,
              minDistance: 1,
              maxDistance: 100,
            })

            for (const eny of block.dimension.getEntities({
              location: block.location,
              minDistance: 1,
              maxDistance: 100,
            })) {
             
              eny.setOnFire(20);
              if (
                eny.runCommand(
                  `testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`,).successCount <= 0 &&
                eny.typeId !== "atomic:gen_entity" && eny.typeId != "minecraft:player") 
                {
                  eny.addTag("atomic:rad_effect");
                }
            }

             for (const playerRadi of players) {
                  playerRadi.setDynamicProperty("radiation", 100)
                  //TODO: Make gas mask worth with players
                
                  playerRadi.camera.fade({fadeColor: {red: 1, blue: 1, green: 1}, 
                    fadeTime: {fadeInTime: 1, holdTime: 3, fadeOutTime: 1}});
                  
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
            createCrater(
              block.location,
              block.dimension.id,
              "minecraft:air",
              30,
              30,
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

              players.forEach((player) => {
                const playerLocation = player.location;
                const dx = playerLocation.x - center.x;
                const dy = playerLocation.y - center.y;
                const dz = playerLocation.z - center.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance > maxHearingDistance) return;

                const maxEffectRadius = explosionRadius * 2;
                const intensity = Math.max(0, 1.0 - distance / maxEffectRadius);

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
                    dimension.runCommand(
                      `playsound atomic.nukesound ${player.name} ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} ${boomVolume} ${boomPitch}`,
                    );
                    dimension.runCommand(
                      `camerashake ${player.name} 0.24 5 rotational`
                    );
                  } catch (err) {}
                }, delayMs);
              });
            }
            if (!playerMain) return;
            const playdi = playerMain.dimension;

            //Shockwave and explosion sound
            playExplosionAudio(playdi, block.location, 160);
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
            nuclearArea(block.dimension.id, block.location, block, 100, 30);

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

export { OnClick };

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "atomic:atom_bomb",
    new OnClick(),
  );
});
