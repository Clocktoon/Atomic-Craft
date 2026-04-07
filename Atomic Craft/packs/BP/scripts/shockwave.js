import { world, system } from "@minecraft/server";

export function shockwaveBlast(dimensionid, center, strength, maxDist, upVec, shake) {
  let currentRadius = 0;
  const maxDis = center.location;
  const dimension = world.getDimension(dimensionid);

  const sir = system.runInterval(() => {
    let plus = maxDis + 1;
    currentRadius + 1
    const entities = dimension.getEntities({
      location: center,
      maxDistance: plus,
    });

    const players = dimension.getPlayers({
      location: center,
      maxDistance: plus,
    });
    for (const entity of entities) {
      entity.applyKnockback(upVec, strength);
    }
    for (const player of players) {
      player.runCommand(`camerashake add @s ${shake} 10`);
      player.applyKnockback(upVec, strength);
    }
    if (currentRadius >= maxDist) {
      system.clearRun(sir);
    }
  }, 20);
}
