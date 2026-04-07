import { system, world, BlockVolume } from "@minecraft/server";
import { createCrater } from "./crater.js";
import { shockwaveBlast } from "./shockwave.js"
import { aftermath } from "./aftermath.js"

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
            player.onScreenDisplay.setActionBar(`${seconds} seconds left`)
            seconds--;
          }
          if (seconds <= 0) {
            system.clearRun(sys);
          }
        }, 20);
        block.dimension.playSound("atomic.beep", block.location);
        
        system.runTimeout(() => {

          async function* blockGen() {
            for (const eny of block.dimension.getEntities({
              location: block.location,
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
              y: block.location.y - 23,
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
            await shockwaveBlast(block.dimension.id, block.location, 3, 50, { x: 6, z: 4 }, 1)
            
            yield;
            const math = Math.floor(Math.random() * 9);
            // No clue what this was for, lowk forgot
            const point1 = {
              x: block.location.x - 2 + math,
              y: block.location.y - 6,
              z: block.location.z - 2 + math,
            };
            const point2 = {
              x: block.location.x + 2 + math,
              y: block.location.y,
              z: block.location.z + 2 + math,
            };

            const vol = new BlockVolume(point1, point2);

            yield;
            // Sets area for nuclear effects
            const from = {
              x: block.location.x - 80,
              y: block.location.y - 20,
              z: block.location.z - 80,
            };

            const to = {
              x: block.location.x + 80,
              y: block.location.y + 30,
              z: block.location.z + 80,
            };

            yield;
            const blockvol = new BlockVolume(from, to);

            const blocklist = block.dimension.getBlocks(
              blockvol,
              {
                excludeTypes: [
                  "minecraft:air",
                  "minecraft:water",
                  "minecraft:lava",
                  "minecraft:flowing_lava",
                  "minecraft:flowing_water",
                  "minecraft:jungle_leaves",
                  "minecraft:azalea_leaves",
                  "minecraft:oak_leaves",
                  "minecraft:birch_leaves",
                  "minecraft:spruce_leaves",
                  "minecraft:acacia_leaves",
                  "minecraft:dark_oak_leaves",
                  "minecraft:azalea_leaves_flowered",
                  "minecraft:cherry_leaves",
                  "minecraft:pale_oak_leaves",
                  "minecraft:fire",
                  "minecraft:glass",
                  "minecraft:coal_ore",
                  "minecraft:iron_block",
                  "minecraft:piston",
                  "minecraft:sticky_piston",
                  "minecraft:iron_door",
                  "minecraft:vine",
                  "minecraft:bamboo",
                  "minecraft:short_grass",
                  "minecraft:tall_grass",
                  "minecraft:short_dry_grass",
                  "minecraft:tall_dry_grass",
                ],
                excludeTags: ["log"],
              },
              true,
            );

            for (const locy of blocklist.getBlockLocationIterator()) {
              const blocc = dimension.getBlock(locy);
              blocc.setType("atomic:radiation_block");
              yield;
            }
            const blockGet = block.dimension.getBlocks(
              blockvol,
              {
                includeTypes: [
                  "minecraft:jungle_leaves",
                  "minecraft:azalea_leaves",
                  "minecraft:oak_leaves",
                  "minecraft:birch_leaves",
                  "minecraft:spruce_leaves",
                  "minecraft:acacia_leaves",
                  "minecraft:dark_oak_leaves",
                  "minecraft:azalea_leaves_flowered",
                  "minecraft:cherry_leaves",
                  "minecraft:pale_oak_leaves",
                  "minecraft:glass",
                  "minecraft:vine",
                ],
              },
              true,
            );

            for (const location of blockGet.getBlockLocationIterator()) {
              const blocks = dimension.getBlock(location);
              blocks.setType("minecraft:air");
              yield;
            }
            const blockLeaves = block.dimension.getBlocks(
              blockvol,
              {
                includeTags: ["log"],
              },
              true,
            );
            for (const loc of blockLeaves.getBlockLocationIterator()) {
              const blocky = dimension.getBlock(loc);
              blocky.setType("atomic:burned_log");
              yield;
            }
            yield;
            const dim = block.dimension.getBlocks(blockvol, {
              includeTypes: ["minecraft:coal_ore"],
            });
            for (const di of dim.getBlockLocationIterator()) {
              const dima = dimension.getBlock(di);
              dima.setType("atomic:radiation_diamond_block");
              yield;
            }
            // second row
            yield;
            const from2 = {
              x: block.location.x + 80,
              y: block.location.y + 40,
              z: block.location.z + 80,
            };

            const to2 = {
              x: block.location.x + 100,
              y: block.location.y + 40,
              z: block.location.z + 100,
            };
            const from3 = {
              x: block.location.x - 80,
              y: block.location.y - 20,
              z: block.location.z - 80,
            };
            //third-ish, more so just the otherside of the second row
            const to3 = {
              x: block.location.x - 100,
              y: block.location.y - 20,
              z: block.location.z - 100,
            };
          //Kills the og ticking area and creates 2 new ones on each side
          world.tickingAreaManager.removeTickingArea("nukearea")
          await world.tickingAreaManager.createTickingArea(
            "nukearea2", {
              dimension: block.dimension,
              from: from2,
              to: to2
            }
          )
          await world.tickingAreaManager.createTickingArea("nukearea3",
            {
              dimension: block.dimension,
              from: from3,
              to: to3
            }
          )

            const blockvol2 = new BlockVolume(from2, to2);
            // It is not a large enough size, some chunks are unloaded

            /* block.dimension.runCommand(`tickingarea add 
                ${px + 80} 0 ${pz + 80} ${px + 210} 0 ${pz + 210} nukearea2`)
                

                block.dimension.runCommand(`tickingarea add 
                ${px - 80} 0 ${pz - 80} ${px - 210} 0 ${pz - 210} nukearea3`)

                block.dimension.runCommand(`tickingarea add 
                ${px + 195} 0 ${pz + 195} ${px + 330} 0 ${pz + 330} nukearea4`)
                */

            yield;
            const getGrass = block.dimension.getBlocks(blockvol2, {
              includeTypes: [
                "minecraft:grass",
                "minecraft:podzol",
                "minecraft:mycelium",
                "minecraft:grass_path",
              ],
            });

            for (const location of getGrass.getBlockLocationIterator()) {
              const blocks = dimension.getBlock(location);
              blocks.setType("atomic:dead_grass");
              yield;
            }
            const getLeaves = block.dimension.getBlocks(blockvol2, {
              includeTypes: [
                "minecraft:jungle_leaves",
                "minecraft:azalea_leaves",
                "minecraft:oak_leaves",
                "minecraft:birch_leaves",
                "minecraft:spruce_leaves",
                "minecraft:acacia_leaves",
                "minecraft:dark_oak_leaves",
                "minecraft:azalea_leaves_flowered",
                "minecraft:cherry_leaves",
                "minecraft:pale_oak_leaves",
              ],
            });
            for (const location of getLeaves.getBlockLocationIterator()) {
              const blocks = dimension.getBlock(location);
              blocks.setType("atomic:radi_leave");
              yield;
            }
            yield;
            aftermath(block.dimension.id, 40, block.location, 5)
            /*
                block.dimension.runCommand("tickingarea remove nukearea")
                block.dimension.runCommand("tickingarea remove nukearea2")
                block.dimension.runCommand("tickingarea remove nukearea3")
                block.dimension.runCommand("tickingarea remove nukearea4")
                block.dimension.runCommand("tickingarea remove nukearea5")
                block.dimension.runCommand("kill @e[type=atomic:gen_entity]")
                */
            
                world.tickingAreaManager.removeTickingArea("nukearea2");
                world.tickingAreaManager.removeTickingArea("nukearea3");
          }
          system.runJob(blockGen());
        }, 400);
      });
  },
};

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("atomic:blow", OnClick);
});
