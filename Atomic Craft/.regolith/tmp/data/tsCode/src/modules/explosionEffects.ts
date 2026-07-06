import { system, world, Dimension, Vector3, Block } from "@minecraft/server";


/**
 * Gets the center of the explosion
 * @param blocks 
 * @returns 
 */
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

/**
 * Custom sound function, inspired by a little thing I saw in MapleStar's given code. 
 * Gets a random sound from an array
 * @param sounds Sounds to parse through
 * @param soundCount Number of sounds, must be plus one from the actual number (remember that if you're using an array that the start is 0)
 */
function getExplosionSound(sounds: string[], soundCount: number): string {
  const random = Math.floor(Math.random() * soundCount)

  const sound = sounds[random]
  return sound
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

  const explosionSounds = ["atomic.explosionone","atomic.explosiontwo",
    "atomic.explosionthree","atomic.explosionfour",
    "atomic.explosionfive", "atomic.explosionsix"]

    const explosionSound = getExplosionSound(explosionSounds, 6)

  players.forEach((player) => {
    const playerLocation = player.location;
    const dx = playerLocation.x - center.x;
    const dy = playerLocation.y - center.y;
    const dz = playerLocation.z - center.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if (distance > maxHearingDistance) return;

    const maxEffectRadius = explosionRadius * 2;

    const distanceRatio = Math.min(1, distance / maxHearingDistance);
    const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
    const boomPitch = 0.8 + Math.random() * 0.2 - distanceRatio * 0.1;

    const delayTicks = Math.min(100, Math.floor(distance / 17));
    const delayMs = delayTicks * 50;

    system.runTimeout(() => {
      try {
        player.playSound(explosionSound, {
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
  system.run( () => {
     const blocks = event.getImpactedBlocks();
  const center = getApproxExplosionCenter(blocks);
  const dim = event.dimension;
  if(world.getDynamicProperty("explosionEffect") === false)
    return;
  
  if (center) {
    if(event.source?.typeId === "atomic:enhanced_mob") {
      dim.spawnParticle("atomic:explosioncloud", {x: center.x, y: center.y - 3, z: center.z})
      playExplosionAudio(dim, center, 70);
      for(const block of blocks) {
        const random = Math.floor(Math.random() * 10)
        if(random === 1 && block.typeId !== "minecraft:air") {
          block.setType("minecraft:magma")
        }
      }
      return;
    }
    playExplosionAudio(dim, center, 30);
    dim.spawnParticle("atomic:explosioncustom2", center)
  }
})
});
