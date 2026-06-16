import {
  system,
  Block,
  TickingArea,
} from "@minecraft/server";
import { globalChunkFiller, pha } from "../chunkLoaders/chunkFillerClass";
/**
 * UNUSED FOR NOW, MAY SWITCH OUT CURRENT SYSTEM WITH THIS IF I FEEL LIKE IT, 
 * WORKS MOSTLY THE SAME BESIDES BEING EASIER TO USE
 */



/**
 * helper for pushing
 *
 * @export
 * @param {TickingArea} area 
 * @param {Block} block 
 * @param {string} name 
 * @param {?number} [minY] 
 * @param {?number} [maxY] 
 * @returns {Generator<void, void, unknown>} 
 */
export function enqueueChunkFill(
  area: TickingArea,
  block: Block,
  name: string,
  phase: pha,
  minY?: number,
  maxY?: number,
) {
  return globalChunkFiller.request(area, block, name, phase, minY, maxY);
}

function fillGeneratorSequential(
  generator: Generator<void, void, unknown>,
  ticks: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const interval = system.runInterval(() => {
      let yielded = 0;
      while (yielded < ticks) {
        let result;
        try {
          result = generator.next();
        } catch (err) {
          system.clearRun(interval);
          reject(err);
          return;
        }

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

export async function enqueueChunkFillAndRun(
  area: TickingArea,
  block: Block,
  name: string,
  phase: pha,
  minY?: number,
  maxY?: number,
  ticksPerFrame = 50,
) {
  const generator = enqueueChunkFill(area, block, name, phase, minY, maxY);
 
    await fillGeneratorSequential(generator, ticksPerFrame);

}

export function enqueueChunkFillWithGenerator(
  area: TickingArea,
  block: Block,
  name: string,
  phase: pha,
  minY?: number,
  maxY?: number,
) {
  return enqueueChunkFill(area, block, name, phase, minY, maxY);
}
