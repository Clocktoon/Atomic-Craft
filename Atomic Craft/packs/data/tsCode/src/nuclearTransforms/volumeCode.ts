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
 * manually iterates the generator across ticks, only way to stop several of them running at once
 */
async function fillGeneratorSequential(generator: Generator<void, void, unknown>): Promise<void> {
  return new Promise((resolve) => {
    /**
     * processes a set number of yields per tick
     */
    const maxTicksPerFrame = 50; 
    
    const interval = system.runInterval(() => {
      let yielded = 0;
      while (yielded < maxTicksPerFrame) {
        const result = generator.next();
        if (result.done) {
          system.clearRun(interval);
          resolve();
          return;
        }
        yielded++;
      }
    }, 1);
  });
}
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
  const startx = location.x - size;
  const endx = location.x + size;
  const startz = location.z - size;
  const endz = location.z + size;

  //loops go silly
  for (let x = startx; x <= endx; x += 16) {
    for (let z = startz; z <= endz; z += 16) {
      
      const nameId = `NK_${x},${z},${dimension.id}`;

      
      await new ChunkTicker(dimension, nameId).load({ x: x, y: 64, z: z }, true, {
        dimension: dimension,
        from: location,
        to: location,
      });

      // iteration (DO NOT GET RID OF)
      const filler = new ChunkFiller(blocky, nameId);
      
      // Wait for this generator to complete before moving to next chunk
      await fillGeneratorSequential(filler.generator());

      world.sendMessage(`Ticking area filled: ${nameId}`);
    }
  }
}
