import { world } from "@minecraft/server";
function getChunkKey(chunkX, chunkZ) {
    return `rad:${chunkX},${chunkZ}`;
}
/**
 * General chunk info loader, look at radiation functions for example on how to use it
 * @param chunkX
 * @param chunkZ
 * @returns
 */
function loadChunk(chunkX, chunkZ) {
    const key = getChunkKey(chunkX, chunkZ);
    const raw = world.getDynamicProperty(key);
    if (!raw) {
        return {
            version: 1,
            radiation: 0,
            lastRadiationTick: world.getAbsoluteTime()
        };
    }
    return JSON.parse(raw);
}
/**
 * Saves stuff to a dynamic property for a chunk, radiation file is an example on how to use it
 * @param chunkX
 * @param chunkZ
 * @param data
 * @returns
 */
function saveChunk(chunkX, chunkZ, data) {
    const key = getChunkKey(chunkX, chunkZ);
    if (data.radiation <= 0) {
        world.setDynamicProperty(key, undefined);
        return;
    }
    world.setDynamicProperty(key, JSON.stringify(data));
}
/**
 * Does most of the logic for radiation and other stuff (if needed)
 * @param chunkX
 * @param chunkZ
 * @returns
 */
function getChunk(chunkX, chunkZ) {
    const chunk = loadChunk(chunkX, chunkZ);
    const decayRate = 0.02;
    const currentTick = world.getAbsoluteTime();
    const elapsed = currentTick - chunk.lastRadiationTick;
    chunk.radiation = Math.max(0, chunk.radiation - elapsed * decayRate);
    chunk.lastRadiationTick = currentTick;
    return chunk;
}
/**
 * Chunk radiation system, is used to check on and make a chunk toxic
 * @param chunkX
 * @param chunkZ
 * @param addedRadiation
 */
function updateChunkRadiation(chunkX, chunkZ, addedRadiation) {
    const data = getChunk(chunkX, chunkZ);
    data.radiation += addedRadiation;
    saveChunk(chunkX, chunkZ, data);
}
/**
 * Gets radiation :P
 * @param chunkX takes in a number to use as the x of a chunk
 * @param chunkZ takes in a number to use as the z of a chunk
 * @returns
 */
function getChunkRadiation(chunkX, chunkZ) {
    const chunk = getChunk(chunkX, chunkZ);
    saveChunk(chunkX, chunkZ, chunk);
    return chunk.radiation;
}
export { updateChunkRadiation };
export { getChunkRadiation };
export { getChunk };
export { saveChunk };
//# sourceMappingURL=chunkMorphs.js.map