import { Block, Vector3, world, system } from "@minecraft/server";

export function* createCrater(
  location: Vector3,
  dimensionId: string,
  blockID: string,
  radius: number,
  maxDepth: number,
  nameid: string
) {
  function* crater1(
     location: Vector3,
    dimensionId: string,
    blockID: string,
    radius: number,
    maxDepth: number
  ) {
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
          dim.setBlockType({ x: x, y: y, z: z }, blockID);
          yield
        }
      }
    }
  }
  
    system.runJob(
    (function* () {
      yield* crater1(
        location,
        dimensionId,
        blockID,
        radius,
        maxDepth,
      );
      world.tickingAreaManager.removeTickingArea(`nukearea${nameid}`);
    })(),
  );
    
  }

