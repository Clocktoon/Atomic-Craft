// https://tenor.com/view/far-cry-3-vass-montenegro-did-i-ever-tell-you-the-definition-of-insanity-insanity-gif-9162815073500878983
import {
  system,
  world,
  BlockVolume,
  Dimension,
  Vector3,
  Block,
} from "@minecraft/server";
import { loadChunk } from "../chunkLoaders/chunky";

//TODO: MAKE CODE RUN, ISN'T RUNNING ANYMORE FOR SOME REASON

/**
 * @deprecated This function is being scrapped, leaving around incase of needed use, use the chunkTicker class instead
 * @description A Function to fill the nuclear area.
 * Can be used for most if not all nuclear explosions
 * @param {string} dimensionid The dimension.id to use
 * @param {import("@minecraft/server").Vector3} location The location to use
 * @param {Block} blocky The block to use (useless)
 * @param {number} size Size of the nuclear area
 * @param {number} change Number of blocks out for when to change to lower scale damage
 */
export async function nuclearArea(dimensionid, location, blocky, size, change) {
  const dimension = world.getDimension(dimensionid);
  let startx = location.x - size;
  let startz = location.z - size;
  // Could make this start at the center chunks and go out maybe, might work better
  for (let x = startx; x < size; x += 16) {
    for (let z = startz; z < size; z += 16) {
      if (!dimension.isChunkLoaded({ x, y: 64, z })) {
        // Uses the loadChunk function
        await loadChunk({ x, y: 64, z }, dimensionid);
        console.warn("ticking area made!");
        world.sendMessage("Ticking area loaded!");
      }

      let split = size - change;

      /**
       * Gets all the blocks in a chunk and fills them
       * @param {import("@minecraft/server").Block} blockw
       */
      //IT WORKED, NOW IT JUST DOESNT!!!
      // GUESS IT WORKS AT RANDOM CAUSE IT'S THE SAME CODE THAT WORKED
        const from = {
          x: x,
          y: location.y - 20,
          z: z,
        };

        const to = {
          x: x + 15,
          y: location.y + 30,
          z: z + 15,
        };

        const blockvolum = new BlockVolume(from, to);

        const blocklist = dimension.getBlocks(
          blockvolum,
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

        for (const locationblock of blocklist.getBlockLocationIterator()) {
          const block = dimension.getBlock(locationblock);
          // keeps being undefined
          block.setType("atomic:radiation_block");
        }
        const blockGet = dimension.getBlocks(
          blockvolum,
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
        // Leaves into air
        for (const location of blockGet.getBlockLocationIterator()) {
          const blocks = dimension.getBlock(location);
          if (blocks.isValid) {
            blocks.setType("minecraft:air");
          }
        }
        console.warn("Area filled!");

    }
  }
}
