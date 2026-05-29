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
import { ChunkFiller } from "../chunkLoaders/chunkFillerClass";
import { ChunkTicker } from "../chunkLoaders/ticking/chunkTickerClass";

/* Inspired by gameza_src's chunk loader system, credit goes to them
gameza's code: https://github.com/gamezaSRC/ChunkLoader
link to gameza's github: https://github.com/gamezaSRC
discord: gameza_src */
//TODO: MAKE CODE RUN, ISN'T RUNNING ANYMORE FOR SOME REASON

/**
 * @description A Function to fill the nuclear area.
 * Can be used for most if not all nuclear explosions
 * @param {string} dimensionid The dimension.id to use
 * @param {import("@minecraft/server").Vector3} location The location to use
 * @param {Block} blocky The block to use (useless)
 * @param {number} size Size of the nuclear area
 * @param {number} change Number of blocks out for when to change to lower scale damage
 */
export async function nuclearArea(dimensionid: string, location: Vector3, blocky: Block, size: number, change: number) {
  const dimension = world.getDimension(dimensionid);
  let startx = location.x - size;
  let startz = location.z - size;
  // Could make this start at the center chunks and go out maybe, might work better
  for (let x = startx; x < size; x += 16) {
    for (let z = startz; z < size; z += 16) {
      const nameId = `NK_${x},${z},${dimension.id}`;
        // Uses the chunkTicker class
       new ChunkTicker(dimension, nameId).load({x: x, y: 64, z: z},
           true, {
              dimension: dimension,
              from: location,
              to: location
           })
        new ChunkFiller(blocky, nameId).generator();

        console.warn("ticking area made!");
        world.sendMessage("Ticking area loaded!");
    

    }
  }
}
