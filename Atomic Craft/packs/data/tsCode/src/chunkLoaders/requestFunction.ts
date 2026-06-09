import {
  system,
  Block,
  TickingArea,
} from "@minecraft/server";
import { globalChunkFiller } from "./chunkFillerClass";

export function enqueueChunkFill(
  area: TickingArea,
  block: Block,
  name: string,
  minY?: number,
  maxY?: number,
) {
  return globalChunkFiller.request(area, block, name, minY, maxY);
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
  minY?: number,
  maxY?: number,
  ticksPerFrame = 50,
) {
  const generator = enqueueChunkFill(area, block, name, minY, maxY);
  await fillGeneratorSequential(generator, ticksPerFrame);
}

export function enqueueChunkFillWithGenerator(
  area: TickingArea,
  block: Block,
  name: string,
  minY?: number,
  maxY?: number,
) {
  return enqueueChunkFill(area, block, name, minY, maxY);
}
