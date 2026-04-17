import { system, world, BlockVolume, GameMode } from "@minecraft/server";
import { createCrater } from "./crater.js";
import { shockwaveBlast } from "./shockwave.js";
import { aftermath } from "./aftermath.js";
import { nuclearArea } from "./volumeCode.js";

/** @type {import("@minecraft/server").BlockCustomComponent} */
const OnClick = {
  onPlayerInteract(event) {
    const block = event.block;
    const player = event.player;
    const dimension = event.dimension;
    

    const px = block.location.x;
    const pz = block.location.z;
    const py = block.y;

    /* block.dimension.runCommand(`tickingarea add 
                ${px - 70} 0 ${pz - 70} ${px + 60} 0 ${pz + 60} nukearea`) */
    world.tickingAreaManager
      .createTickingArea("nukearea", {
        from: { x: px - 80, y: 0, z: pz - 80 },
        to: { x: px + 80, y: 0, z: pz + 80 },
        dimension: block.dimension,
      })
      .then(() => {
        let seconds = 20;
        player.sendMessage(`You have ${seconds} seconds to run`);

        const sys = system.runInterval(() => {
          if (seconds >= 1) {
            player.onScreenDisplay.setActionBar(`${seconds} seconds left`);
            seconds--;
          }
          if (seconds <= 0) {
            system.clearRun(sys);
          }
        }, 20);
        block.dimension.playSound("atomic.beep", block.location);

        system.runTimeout(() => {
          function* blockGen() {
            for (const eny of block.dimension.getEntities({
              location: block.location,
              minDistance: 1,
              maxDistance: 100,
            })) {
              if (eny.typeId == "minecraft:player") {
                eny.runCommand("camera @s fade time 1 3 1 color 255 255 255");
              }
              eny.setOnFire(20);
              if (
                eny.runCommand(
                  `testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`,
                ).successCount <= 0 &&
                eny.typeId !== "atomic:gen_entity"
              ) {
                eny.addTag("atomic:rad_effect");
              }
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
              20,
            );

            // Sound code by MapleStar // TC (discord)
            function playExplosionAudio(dimension, center, magnitude) {
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
                      `playsound "atomic.nukesound" ${player.name} ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} ${boomVolume} ${boomPitch}`,
                    );
                  } catch (err) {}
                }, delayMs);
              });
            }
            const playdi = player.dimension;

            playExplosionAudio(playdi, block.location, 19);
            shockwaveBlast(
              block.dimension.id,
              block.location,
              3,
              50,
              { x: 6, z: 4 },
              1,
            );

            yield;
            nuclearArea(
              block.dimension.id, 
              block.location, 
              block, 
              100, 
              30);
          }
          system.runJob(blockGen());
        }, 400);
      });
  },
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("atomic:blow", OnClick);
});
