import { Entity, Dimension, BlockVolume, Vector3 } from "@minecraft/server";
import { RadiationRegistry, radioactiveTypes } from "./radiationRegistery";

/**
 * Scans a block volume for registered radioactive blocks and returns the
 * total distance-weighted exposure, centered on `origin`.
 * Shared by blockRadiationComp.ts (dose calc) and geigerCount.ts (readout)
 * so the two never drift out of sync on the falloff formula or registry lookup.
 */
export function scanNearbyRadiation(
  dimension: Dimension,
  origin: Vector3,
  volume: BlockVolume
): number {
  let exposure = 0;

  const blocks = dimension.getBlocks(volume, { includeTypes: radioactiveTypes }, true);

  for (const location of blocks.getBlockLocationIterator()) {
    const block = dimension.getBlock(location);
    if (!block) continue;

    const blockRadiation = RadiationRegistry.get(block.typeId);
    if (blockRadiation === undefined) continue;

    const dx = block.location.x - origin.x;
    const dy = block.location.y - origin.y;
    const dz = block.location.z - origin.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    exposure += blockRadiation / (distance + 1);
  }

  return exposure;
}