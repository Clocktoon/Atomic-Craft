import { BlockVolume, system, world, } from "@minecraft/server";
/** Flowers / crops / loose ground clutter. Removed in both phases. */
const PLANTS = [
    "minecraft:dandelion",
    "minecraft:poppy",
    "minecraft:blue_orchid",
    "minecraft:allium",
    "minecraft:azure_bluet",
    "minecraft:red_tulip",
    "minecraft:orange_tulip",
    "minecraft:white_tulip",
    "minecraft:pink_tulip",
    "minecraft:oxeye_daisy",
    "minecraft:cornflower",
    "minecraft:lily_of_the_valley",
    "minecraft:torchflower",
    "minecraft:wither_rose",
    "minecraft:sunflower",
    "minecraft:lilac",
    "minecraft:rose_bush",
    "minecraft:peony",
    "minecraft:pitcher_plant",
    "minecraft:closed_eyeblossom",
    "minecraft:open_eyeblossom",
    "minecraft:golden_dandelion",
    "minecraft:glass",
    "minecraft:vine",
    "minecraft:leaf_litter",
    "minecraft:bamboo",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:short_dry_grass",
    "minecraft:tall_dry_grass",
];
const LEAVES = [
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
];
/** Logs/stems that are NOT covered by the "log" tag. */
const UNTAGGED_LOGS = [
    "minecraft:mangrove_log",
    "minecraft:cherry_log",
    "minecraft:pale_oak_log",
    "minecraft:crimson_stem",
    "minecraft:warped_stem",
];
/** Vaporised outright at ground zero. */
const VAPORISED = [
    ...LEAVES,
    "minecraft:glass",
    "minecraft:vine",
    "minecraft:bamboo",
    "minecraft:short_grass",
    "minecraft:tall_grass",
    "minecraft:short_dry_grass",
    "minecraft:tall_dry_grass",
    "minecraft:torch",
    "minecraft:soul_torch",
    "minecraft:copper_torch",
    "minecraft:redstone_torch",
    "minecraft:cactus",
    "atomic:radi_leave",
    "minecraft:yellow_poplar_leaves",
    "minecraft:orange_poplar_leaves",
    "minecraft:red_poplar_leaves"
];
const DIAMOND_ORE = ["minecraft:diamond_ore", "minecraft:deepslate_diamond_ore"];
const GROUND_COVER = [
    "minecraft:grass_block",
    "minecraft:podzol",
    "minecraft:mycelium",
    "minecraft:grass_path",
    "minecraft:coarse_dirt",
    "minecraft:farmland",
    "minecraft:moss_block",
];
/**
 * Everything the bulk radiation fill must leave alone: indestructibles,
 * fluids, and anything handled by its own targeted pass above it.
 */
const BULK_EXCLUDE = [
    "minecraft:obsidian",
    "minecraft:air",
    "minecraft:bedrock",
    "minecraft:water",
    "minecraft:lava",
    "minecraft:flowing_lava",
    "minecraft:flowing_water",
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
    "minecraft:snow_layer",
    "minecraft:planks",
    "minecraft:wooden_slab",
    ...LEAVES,
    ...UNTAGGED_LOGS,
    // placed by the diamond pass, which now runs BEFORE the bulk fill
    "atomic:radiation_diamond_block",
];
system.run(() => {
    if (typeof world.getDynamicProperty("powerful") !== "boolean")
        world.setDynamicProperty("powerful", true);
    if (typeof world.getDynamicProperty("logs") !== "boolean")
        world.setDynamicProperty("logs", false);
});
/**
 * Awaitable wrapper around system.runJob. runJob hands the generator a
 * time slice each tick sized against actual server load, instead of a
 * hard-coded iteration count.
 */
export function runJobAsync(gen) {
    return new Promise((resolve) => {
        system.runJob((function* () {
            yield* gen;
            resolve();
        })());
    });
}
/**
 * Finds the terrain surface so a phase-1 (scorch) pass can work a thin
 * band instead of scanning a 121-block column.
 */
export function surfaceBandY(dimension, x, z, below = 8, above = 12) {
    const top = dimension.getTopmostBlock({ x, z })?.y ?? 64;
    const { min, max } = dimension.heightRange;
    return {
        minY: Math.max(min, top - below),
        maxY: Math.min(max, top + above),
    };
}
/**
 * @class ChunkFiller
 * @description Applies nuclear damage to one chunk column at a time.
 *
 * The work is expressed as fillBlocks() calls with a blockFilter rather
 * than getBlocks() + per-location setType(). fillBlocks does the query
 * and the write in a single native call, so a pass that used to be
 * ~3 boundary crossings per block is now one per Y slab.
 *
 * fillBlocks is synchronous and is not time-sliced by the engine, so
 * each column is cut into Y slabs and the generator yields between
 * them. That is what keeps a big fill from becoming a one-tick spike.
 */
class ChunkFiller {
    requests = [];
    #currentGenerator;
    enqueue(request) {
        this.requests.push(request);
    }
    /**
     * Queues a chunk and returns the shared draining generator. Hand it
     * to runJobAsync().
     */
    request(area, block, name, phase, minY, maxY) {
        this.enqueue({ area, block, name, phase, minY, maxY });
        if (!this.#currentGenerator)
            this.#currentGenerator = this.generator();
        return this.#currentGenerator;
    }
    *generator() {
        // Read once per drain, not once per block. These were previously
        // native property reads inside the innermost loop.
        const logs = world.getDynamicProperty("logs") === true;
        const powerful = world.getDynamicProperty("powerful") === true;
        // "powerful" now controls how finely the work is sliced: smaller
        // slabs mean more yields, smoother frame times, slower wall clock.
        const slab = powerful ? 16 : 64;
        const log = (msg) => {
            if (logs)
                world.sendMessage(msg);
        };
        while (this.requests.length > 0) {
            const request = this.requests[0];
            if (!request.area.isFullyLoaded) {
                yield;
                continue;
            }
            const bbox = request.area.boundingBox;
            if (!bbox?.min || !bbox?.max) {
                log(`§4TickingArea ${request.area.identifier ?? "unknown"} missing boundingBox`);
                this.requests.shift();
                continue;
            }
            const dim = request.area.dimension;
            const range = dim.heightRange;
            const min = {
                x: bbox.min.x,
                y: Math.max(range.min, request.minY ?? request.block.location.y - 60),
                z: bbox.min.z,
            };
            const max = {
                x: bbox.max.x,
                y: Math.min(range.max, request.maxY ?? request.block.location.y + 60),
                z: bbox.max.z,
            };
            let touched = 0;
            if (request.phase === 2) {
                // ORDER MATTERS. The diamond pass has to run before the bulk
                // radiation fill, or the ore is already gone by the time we
                // look for it. (That was the old dead-code bug.)
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:radiation_diamond_block", { includeTypes: DIAMOND_ORE });
                touched += yield* fillSliced(dim, min, max, slab, log, "minecraft:air", { includeTypes: [...PLANTS, ...VAPORISED] });
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:burned_log", { includeTypes: UNTAGGED_LOGS, includeTags: ["log"] });
                // Split by type, so wooden slabs actually convert. The old
                // typeId.includes("slabs") test never matched "wooden_slab".
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:radiation_plank", { includeTypes: ["minecraft:planks"] });
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:radiation_slab", { includeTypes: ["minecraft:wooden_slab"] });
                // Bulk pass last: everything still standing becomes slag.
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:radiation_block", { excludeTypes: BULK_EXCLUDE, excludeTags: ["log"] });
            }
            else {
                touched += yield* fillSliced(dim, min, max, slab, log, "minecraft:air", { includeTypes: PLANTS, includeTags: ["minecraft:crop", "plant"] });
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:radi_leave", { includeTypes: LEAVES });
                touched += yield* fillSliced(dim, min, max, slab, log, "atomic:dead_grass", { includeTypes: GROUND_COVER });
                // The only pass that genuinely needs per-block logic: ~20% of
                // exposed woodwork catches fire. The candidate set is sparse,
                // so a loop here is cheap.
                touched += yield* scatterFire(dim, min, max, log);
            }
            if (touched === 0)
                log(`No blocks found in volume for ${request.name}`);
            else
                log(`§a${request.name}: ${touched} blocks changed (phase ${request.phase})`);
            this.requests.shift();
        }
        log("ChunkFiller queue drained");
        this.#currentGenerator = undefined;
    }
}
/**
 * Runs one fillBlocks pass over [min, max], cut into Y slabs, yielding
 * between slabs. Returns the number of blocks placed.
 */
function* fillSliced(dim, min, max, slab, log, blockType, filter) {
    let placed = 0;
    for (let y = min.y; y <= max.y; y += slab) {
        const top = Math.min(y + slab - 1, max.y);
        const volume = new BlockVolume({ x: min.x, y, z: min.z }, { x: max.x, y: top, z: max.z });
        try {
            // fillBlocks returns a ListBlockVolume of everything it placed,
            // so the count is free.
            placed += dim.fillBlocks(volume, blockType, { blockFilter: filter }).getCapacity();
        }
        catch (err) {
            log(`§4fill ${blockType} failed at y=${y}..${top}: ${err}`);
        }
        yield;
    }
    return placed;
}
/** Sets roughly 1 in 5 wooden blocks alight. */
function* scatterFire(dim, min, max, log) {
    let lit = 0;
    try {
        const wood = dim.getBlocks(new BlockVolume(min, max), { includeTypes: ["minecraft:planks", "minecraft:wooden_slab"] }, true);
        for (const loc of wood.getBlockLocationIterator()) {
            if (Math.random() > 0.2)
                continue;
            dim.getBlock(loc)?.setType("minecraft:fire");
            lit++;
            if ((lit & 31) === 0)
                yield; // yield every 32 placements, not every one
        }
    }
    catch (err) {
        log(`§4scatterFire failed: ${err}`);
    }
    return lit;
}
export const globalChunkFiller = new ChunkFiller();
export { ChunkFiller };
//# sourceMappingURL=chunkFillerClass.js.map