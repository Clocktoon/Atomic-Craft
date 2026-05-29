import { BlockVolume } from "@minecraft/server";
import { requests } from "./ticking/chunkTickerClass";
/**
 * Parts taken from https://bedrock-snippets.vercel.app/ (script by Coolbep),
 * And
 */
// Define the request shape for chunks to fill
/*TODO: MAKE A REQUEST TO THE CHUNK FILLER CLASS SYSTEM,
 THIS MAY REPLACE THE CHUNK TICKER CLASS FOR NUCLEAR BOMB USEAGE
*/
class ChunkFiller {
    Chunksrequests = []; // Queue of requests
    #blockID;
    #name;
    constructor(block, tickingName) {
        this.Chunksrequests = [];
        this.Chunksrequests.push(...requests);
        this.#blockID = block;
        this.#name = tickingName;
    }
    //TODO: HAVE LOADED CHUNKS GO INTO THE REQUEST PROPERTY
    *generator() {
        for (const request of this.Chunksrequests) {
            if (request.isFullyLoaded) {
                const volume = new BlockVolume(request.boundingBox.min, request.boundingBox.max);
                const blockList = this.#blockID.dimension.getBlocks(volume, {
                    // #region types
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
                    //#endregion
                }, true);
                for (const blockLocations of blockList.getBlockLocationIterator()) {
                    const block1 = this.#blockID.dimension.getBlock(blockLocations);
                    if (block1) {
                        block1.setType("atomic:radiation_block");
                        yield;
                    }
                }
            }
        }
    } //generator to yield and fill all these global requests
}
export { ChunkFiller };
