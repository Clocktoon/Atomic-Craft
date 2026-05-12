// https://tenor.com/view/far-cry-3-vass-montenegro-did-i-ever-tell-you-the-definition-of-insanity-insanity-gif-9162815073500878983    
import {
  system,
  world,
  BlockVolume,
  Dimension,
  Vector3,
  Block,
} from "@minecraft/server";
import { loadChunk } from "./chunky";

/**
 * @description A Function to fill the nuclear area.
 * 
 * Can be used for most if not all nuclear explosions
 * @param {import("@minecraft/server").DimensionType} dimensionid The dimension.id to use
 * @param {import("@minecraft/server").Vector3} location The location to use
 * @param {Block} blocky The block to use (useless)
 * @param {number} size Size of the nuclear area
 * @param {number} change Number of blocks out for when to change to lower scale damage
 */
export async function nuclearArea(dimensionid, location, blocky, size, change) {
  const dimension = world.getDimension(dimensionid);
  let loadedChunks = 0;
  let startx = location.x - size;
  let endx = location.x + size;
  let startz = location.z - size;
  let endz = location.z + size;
  for (let x = startx; x < endx; x += 16) {
    for (let z = startz; z < endz; z += 16) {
      if (!dimension.isChunkLoaded({ x, y: 64,z })) {
        // Uses the chunkticker
        await loadChunk({ x, y: 64, z },"atomic:nucleararea", dimensionid);
      }
      let split = size - change
            
      /**
       * Gets all the blocks in a chunk and fills them
       * @param {import("@minecraft/server").Block} blockw
       */
      function get(blockw) {
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
            
        const blop = blockw
    
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

          for (const locationblock of blocklist.getBlockLocationIterator()) {
            const block = dimension.getBlock(locationblock);
            // keeps being undefined
            if(block.isValid) {
            block.setType("atomic:radiation_block");
            }
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

          for (const location of blockGet.getBlockLocationIterator()) {
            const blocks = dimension.getBlock(location);
            if(blocks.isValid) {
            blocks.setType("minecraft:air");
            }
          }

          const dim = dimension.getBlocks(blockvolum, {
            includeTypes: ["minecraft:coal_ore"],
          });

          for (const di of dim.getBlockLocationIterator()) {
            const dima = dimension.getBlock(di);
            if(dima.isValid) {
             dima.setType("atomic:radiation_diamond_block");
            }
            
          }
    
      }
      //Run jobs the get function
     await get(blocky)
    }
  }
}

