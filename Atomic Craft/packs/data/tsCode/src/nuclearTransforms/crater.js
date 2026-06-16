import { world } from "@minecraft/server";


export function *createCrater(location, dimensionId, block, radius, maxDepth, yiel) {
    const dim = world.getDimension(dimensionId);

    const cx = Math.floor(location.x);
    const cy = Math.floor(location.y + 10);
    const cz = Math.floor(location.z);

    const r = Math.max(1, Math.ceil(radius));
    const r2 = r * r;

    for (let dx = -r; dx <= r; dx++) {
        for (let dz = -r; dz <= r; dz++) {
            const dist2 = dx * dx + dz * dz;
            if (dist2 > r2) continue;

            const d = Math.sqrt(dist2);
            const t = d / radius;
            const depth = Math.floor(maxDepth * (1 - t * t));

            if (depth <= 0) continue;

            const x = cx + dx;
            const z = cz + dz;

            for (let dy = 0; dy <= depth; dy++) {
                const y = cy - dy;
                
                    if(!dim.isChunkLoaded({ x: x, y: y, z: z })) {
                        world.tickingAreaManager.createTickingArea(
                            "craterloader",
                            {
                                dimension: dim,
                                from: {x: x, y: y, z: z},
                                to: {x: x, y: y, z: z}
                            }
                        ).then()
                    }
                    dim.setBlockType({ x: x, y: y, z: z }, block);
                    if(yiel === true) {
                        yield
                    }
                
                
                
            }
        }
    }
}
