import { system, world, Dimension, Vector3, Block } from "@minecraft/server";

function getApproxExplosionCenter(blocks: Block[]): Vector3 | null {
  if (blocks.length === 0) return null;

  const sum = blocks.reduce(
    (acc, block) => {
      acc.x += block.location.x;
      acc.y += block.location.y;
      acc.z += block.location.z;
      return acc;
    },
    { x: 0, y: 0, z: 0 },
  );

  const count = blocks.length;
  return {
    x: sum.x / count,
    y: sum.y / count,
    z: sum.z / count,
  };
}
function getExplosionSound() {
  
}

// Sound code by MapleStar // TC (discord)
function playExplosionAudio(
  dimension: Dimension,
  center: Vector3,
  magnitude: number,
) {
  if (!center) return;

  const players = dimension.getPlayers();
  const explosionRadius = Math.min(
    Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)),
    60,
  );
  const maxHearingDistance = explosionRadius * 24;
  const shakeDistance = explosionRadius * 8;

  players.forEach((player) => {
    const playerLocation = player.location;
    const dx = playerLocation.x - center.x;
    const dy = playerLocation.y - center.y;
    const dz = playerLocation.z - center.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > maxHearingDistance) return;

    player.sendMessage("test test 123");

    const maxEffectRadius = explosionRadius * 2;

    const distanceRatio = Math.min(1, distance / maxHearingDistance);
    const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
    const boomPitch = 0.8 + Math.random() * 0.2 - distanceRatio * 0.1;

    const delayTicks = Math.min(100, Math.floor(distance / 17));
    const delayMs = delayTicks * 50;

    system.runTimeout(() => {
      try {
        player.playSound("atomic.nukesound", {
          volume: boomVolume,
          pitch: boomPitch,
        });

        if (distance <= shakeDistance) {
          const shakeIntensity = Math.max(0.1, 1 - distance / shakeDistance);
          dimension.runCommand(
            `execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`,
          );
        }
      } catch (err) {
        player.sendMessage("error with sound and shake code");
      }
    }, delayMs);
  });
}

world.beforeEvents.explosion.subscribe((event) => {
  const blocks = event.getImpactedBlocks();
  const center = getApproxExplosionCenter(blocks);
  const dim = event.dimension;

  if (center) {
    playExplosionAudio(dim, center, 160);
  }
});
