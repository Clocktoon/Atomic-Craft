import { world, system, Entity } from "@minecraft/server";
import { getChunkRadiation } from "../chunkLoaders/chunkMorphs";


function getChunkCoords(x: number, z: number): { chunkX: number; chunkZ: number } {
  return {
    chunkX: Math.floor(x / 16),
    chunkZ: Math.floor(z / 16),
  };
}

/**
 * Calculate radiation exposure for an entity based on chunk radiation
 */
function getChunkExposure(entity: Entity): number {
    const { chunkX, chunkZ } = getChunkCoords(
        entity.location.x,
        entity.location.z
    );

    return getChunkRadiation(chunkX, chunkZ);
}

/**
 * Main radiation system loop for entities
 */
// system.runInterval(() => {
//   const dimensions = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

//   for (const dimId of dimensions) {
//     try {
//       const dimension = world.getDimension(dimId);
//       const allEntities = dimension.getEntities();

//       for (const entity of allEntities) {
//         if (!entity.isValid) continue;

//         const radiationExposure = calculateRadiationExposure(entity);
//         let currentRadiation = entity.getDynamicProperty("atomic:radiation_level") as number || 0;

//         if (radiationExposure > 0) {
//           currentRadiation += radiationExposure;
//           entity.applyDamage(radiationExposure * 0.1);
//         } else if (currentRadiation > 0) {
//           currentRadiation = Math.max(0, currentRadiation - 0.5);
//         }

//         if (currentRadiation > 0) {
//           entity.setDynamicProperty("atomic:radiation_level", currentRadiation);
//         } else {
//           entity.setDynamicProperty("atomic:radiation_level", 0);
//         }
//       }
//     } catch (err) {
//       console.warn(`Mob radiation error ${err}`)
//     }
//   }
// }, 1);

// /** Main radiation loop for players */
// //Yes I did just copy and paste the other one because I'm a lazy chud <3

// system.runInterval(() => {
//   const dimensions = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];

//   for (const dimId of dimensions) {
//     try {
//       const dimension = world.getDimension(dimId);
//       const allPlayers = world.getAllPlayers();

//       for (const player of allPlayers) {
//         if (!player.isValid) continue;

//         const radiationExposure = calculateRadiationExposure(player);
//         let currentRadiation = player.getDynamicProperty("atomic:radiation_level") as number || 0;

//         if (radiationExposure > 0) {
//           currentRadiation += radiationExposure;
//           player.applyDamage(radiationExposure * 0.1);
//         } else if (currentRadiation > 0) {
//           currentRadiation = Math.max(0, currentRadiation - 0.5);
//         }

//         if (currentRadiation > 0) {
//           player.setDynamicProperty("atomic:radiation_level", currentRadiation);
//         } else {
//           player.setDynamicProperty("atomic:radiation_level", 0);
//         }
//       }
//     } catch (err) {
//       continue;
//     }
//   }
// }, 1);


export { getChunkCoords, getChunkExposure};
