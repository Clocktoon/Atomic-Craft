import { world, system, Dimension, GameMode } from "@minecraft/server";

/**
 * Causes a shockwave to hit players
 * @function shockwaveBlast 
 * @param {Dimension} dimensionid Dimension.id to use
 * @param {Location} center The center location to start from
 * @param {Number} strength Strength of the shockwave for players
 * @param {Number} maxDist Max distance of the shockwave
 * @param {Number} upVec Force backwards of the shockwave
 * @param {Number} shake How hard the shake of the screen from the shockwave is
 */
export async function shockwaveBlast(
  dimensionid,
  center,
  strength,
  maxDist,
  upVec,
  shake,
) {
  const dimension = world.getDimension(dimensionid);
  let currentRadiusmax = 1;
  let currentRadiusmin = 1;
  let m = maxDist;

  for (let max = currentRadiusmax; max < maxDist; currentRadiusmax++) {
    for (let min = currentRadiusmin; min < maxDist; currentRadiusmin++) {
      
          const entities = dimension.getEntities({
          location: center,
          maxDistance: currentRadiusmax,
          minDistance: currentRadiusmin,
          excludeTypes: "minecraft:item",
        });

        const players = dimension.getPlayers({
          location: center,
          maxDistance: currentRadiusmax,
          minDistance: currentRadiusmin,
        });
        for (const entity of entities) {
          entity.applyImpulse(upVec);
        }
        for (const player of players) {
          player.runCommand(`camerashake add @s ${shake} 10`);
          player.applyKnockback(upVec, strength);
        }

    }
  }
}
