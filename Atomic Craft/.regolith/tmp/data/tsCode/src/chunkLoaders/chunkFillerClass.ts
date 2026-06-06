import { Block, BlockVolume, TickingArea, world } from "@minecraft/server";
import { requests } from "./ticking/chunkTickerClass";
import { never } from "zod";
/**
 * Parts taken from https://bedrock-snippets.vercel.app/ (script by Coolbep),
 * And
 */

// Define the request shape for chunks to fill

/*TODO: MAKE A REQUEST TO THE CHUNK FILLER CLASS SYSTEM,
 THIS MAY REPLACE THE CHUNK TICKER CLASS FOR NUCLEAR BOMB USEAGE
*/

class ChunkFiller {
  Chunksrequests: TickingArea[] = []; // Queue of requests
  #blockID;
  #name;
  constructor(block: Block, tickingArea?: TickingArea) {
    this.Chunksrequests = [];

    if (tickingArea) {
      this.Chunksrequests.push(tickingArea);
    }
    this.#blockID = block;
    this.#name = tickingArea ? tickingArea.identifier : "";
  }
  //TODO: HAVE LOADED CHUNKS GO INTO THE REQUEST PROPERTY

  *generator() {
    for (const request of this.Chunksrequests) {
      if (request.isFullyLoaded) {
        continue;
      }

      const bbox = request.boundingBox;
      if (!bbox || !bbox.min || !bbox.max) {
        world.sendMessage(
          `§4TickingArea ${request.identifier || "unknown"} missing boundingBox`,
        );
        continue;
      }
      // me when I check to make sure it be a chunk large
      const spanX = bbox.max.x - bbox.min.x;
      const spanZ = bbox.max.z - bbox.min.z;
      if (spanX < 15 || spanZ < 15) {
        world.sendMessage(
          `§4Warning: small boundingBox for ${request.identifier}: ${JSON.stringify({ min: bbox.min, max: bbox.max })}`,
        );
      }

      const volume = new BlockVolume(bbox.min, bbox.max);
      const blockList = request.dimension.getBlocks(
        volume,
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

      
      let any = false;
      for (const loc of blockList.getBlockLocationIterator()) {
        any = true;
        const block1 = request.dimension.getBlock(loc);
        if (block1) {
          block1.setType("atomic:radiation_block");
          yield;
        }
      }
      if (!any)
        world.sendMessage(`No blocks found in volume for ${this.#name}`);
    }
    world.sendMessage(`Filling for ${this.#name}`);
  } //generator to yield and fill all these global requests
}
export { ChunkFiller };
