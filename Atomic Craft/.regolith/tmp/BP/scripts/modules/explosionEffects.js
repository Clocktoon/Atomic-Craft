import { system, world } from "@minecraft/server";
function spawnExplosionSmoke(dimension, center, magnitude) {
    const explosionRadius = Math.cbrt(magnitude) * 1.5;
    const waves = Math.ceil(magnitude / 5);
    for (let wave = 0; wave < waves; wave++) {
        system.runTimeout(() => {
            const particlesThisWave = Math.floor(magnitude * 0.4);
            for (let i = 0; i < particlesThisWave; i++) {
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * explosionRadius * (1 + wave * 0.5);
                const random = Math.random() * 3;
                dimension.spawnParticle("atomic:explosion_out_smoke", {
                    x: center.x + Math.cos(angle) * distance,
                    y: center.y + Math.random() * explosionRadius,
                    z: center.z + Math.sin(angle) * distance,
                });
                dimension.spawnParticle("atomic:explosioncustom2", {
                    x: center.x + Math.random() * 1,
                    y: center.y,
                    z: center.z + Math.random() * 1
                });
            }
            console.warn("Explosion particles spawned");
        }, wave * 5);
    }
}
/**
 * Gets the center of the explosion
 * @param blocks
 * @returns
 */
function getApproxExplosionCenter(blocks) {
    if (blocks.length === 0)
        return null;
    const sum = blocks.reduce((acc, block) => {
        acc.x += block.location.x;
        acc.y += block.location.y;
        acc.z += block.location.z;
        return acc;
    }, { x: 0, y: 0, z: 0 });
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
function getExplosionSound(sounds, soundCount) {
    const random = Math.floor(Math.random() * soundCount);
    const sound = sounds[random];
    return sound;
}
// Sound code by MapleStar // TC (discord)
function playExplosionAudio(dimension, center, magnitude) {
    if (!center)
        return;
    const players = dimension.getPlayers();
    const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
    const maxHearingDistance = explosionRadius * 24;
    const shakeDistance = explosionRadius * 8;
    const explosionSounds = ["atomic.explosionone", "atomic.explosiontwo",
        "atomic.explosionthree", "atomic.explosionfour",
        "atomic.explosionfive", "atomic.explosionsix"];
    const explosionSound = getExplosionSound(explosionSounds, 6);
    players.forEach((player) => {
        const playerLocation = player.location;
        const dx = playerLocation.x - center.x;
        const dy = playerLocation.y - center.y;
        const dz = playerLocation.z - center.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (distance > maxHearingDistance)
            return;
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
                    dimension.runCommand(`execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`);
                }
            }
            catch (err) {
                player.sendMessage("error with sound and shake code");
            }
        }, delayMs);
    });
}
world.beforeEvents.explosion.subscribe((event) => {
    system.run(() => {
        const blocks = event.getImpactedBlocks();
        const source = event.source;
        const blockCount = blocks.length;
        const mag = blockCount / 15;
        const soundMag = mag - 10;
        const center = getApproxExplosionCenter(blocks);
        const dim = event.dimension;
        if (world.getDynamicProperty("explosionEffect") === false)
            return;
        if (center) {
            if (source?.typeId === "atomic:missile") {
                return;
            }
            if (source?.typeId === "atomic:payload_entity") {
                playExplosionAudio(dim, center, soundMag);
                event.dimension.spawnParticle("atomic:explosioncloud", center);
                return;
            }
            if (source?.typeId === "atomic:enhanced_mob") {
                dim.spawnParticle("atomic:explosioncloud", { x: center.x, y: center.y - 3, z: center.z });
                playExplosionAudio(dim, center, 70);
                return;
            }
            playExplosionAudio(dim, center, soundMag);
            spawnExplosionSmoke(event.dimension, center, mag);
            console.warn("Explosion went off");
        }
    });
});
//# sourceMappingURL=explosionEffects.js.map