import { world } from "@minecraft/server";
export function* createCrater(location, dimensionId, block, radius, maxDepth) {
    if (!world.gameRules.tntExplodes)
        return;
    const dim = world.getDimension(dimensionId);
    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y);
    const cz = Math.floor(location.z);
    const r = Math.max(1, Math.ceil(radius));
    const r2 = r * r;
    const maxRise = Math.max(20, Math.ceil(radius * 1.5));
    let blocksSinceYield = 0;
    for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
            const dist2 = dx * dx + dz * dz;
            if (dist2 > r2)
                continue;
            const d = Math.sqrt(dist2);
            const t = d / Math.max(1, r);
            const depth = Math.floor(maxDepth * (1 - t * t));
            const rise = Math.max(2, Math.floor(maxRise * (1 - t * t)));
            if (depth <= 0 && rise <= 0)
                continue;
            const x = cx + dx;
            const z = cz + dz;
            const startY = cy + rise;
            const endY = cy - depth;
            for (let y = startY; y >= endY; y--) {
                if (dim.getBlock({ x, y, z })?.typeId === "minecraft:bedrock")
                    continue;
                dim.setBlockType({ x, y, z }, block);
                blocksSinceYield++;
                if (blocksSinceYield >= 32) {
                    blocksSinceYield = 0;
                    yield;
                }
            }
        }
    }
}
//# sourceMappingURL=crater.js.map