import { system, } from "@minecraft/server";
import { globalChunkFiller } from "../chunkLoaders/chunkFillerClass";
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
export function enqueueChunkFill(area, block, name, phase, minY, maxY) {
    return globalChunkFiller.request(area, block, name, phase, minY, maxY);
}
function fillGeneratorSequential(generator, ticks) {
    return new Promise((resolve, reject) => {
        const interval = system.runInterval(() => {
            let yielded = 0;
            while (yielded < ticks) {
                let result;
                try {
                    result = generator.next();
                }
                catch (err) {
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
export async function enqueueChunkFillAndRun(area, block, name, phase, minY, maxY, ticksPerFrame = 50) {
    const generator = enqueueChunkFill(area, block, name, phase, minY, maxY);
    await fillGeneratorSequential(generator, ticksPerFrame);
}
export function enqueueChunkFillWithGenerator(area, block, name, phase, minY, maxY) {
    return enqueueChunkFill(area, block, name, phase, minY, maxY);
}
//# sourceMappingURL=requestFunction.js.map