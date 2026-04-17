import {
  system,
  world,
  BlockVolume,
  Dimension,
  Vector3,
  Block,
} from "@minecraft/server";
import { chunkLoad } from "./chunkLoad";
import { chunkTicker } from "./chunkLoader";

/**
 * @description Function to fill the nuclear area, is reuseable
 * @param {Dimension} dimensionid The dimension.id to use
 * @param {Vector3} location The location to use
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
      if (!dimension.isChunkLoaded({ x: x, y: 64, z: z })) {
        // Uses the chunkticker
        await new chunkTicker({x: x, y: 64, z: z}, dimension)
          .load({ x: x, y: 64, z: z }, "atomic:nucleararea");
        // do I need this? I think it's a console log in the smokey code but I also can't tell, might be important
        console.log(loadedChunks++);
      }
      const blockvolume = new BlockVolume(
        {
          x: x,
          y: 40,
          z: z,
        },
        {
          x: x + 15,
          y: 20,
          z: z + 15,
        },
      );
      /**
       * Gets all the blocks in a chunk and fills them
       * @param {block} block
       */
      function* get(block) {
        if (x < size - change) {
          const blocklist = dimension.getBlocks(
            blockvolume,
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

          const blockGet = dimension.getBlocks(
            blockvolume,
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
          yield;
          const dim = dimension.getBlocks(blockvol, {
            includeTypes: ["minecraft:coal_ore"],
          });
          for (const di of dim.getBlockLocationIterator()) {
            const dima = dimension.getBlock(di);
            dima.setType("atomic:radiation_diamond_block");
            yield;
          }
        }
        
        //checks if in the otherer ranges
        if (x >= size - change) {
          // code for grass and dirt and maybe more

          //Grass
          const getGrass = dimension.getBlocks(blockvolume, {
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
          //Leaves
          const getLeaves = dimension.getBlocks(blockvolume, {
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
        };
        //Unload chunk
        new chunkTicker({ x: x, y: 64, z: z }, dimension)
        .unload("atomic:nucleararea");
      }
      //Run jobs the get function
      system.runJob(get(blocky));
    }
  }
}

