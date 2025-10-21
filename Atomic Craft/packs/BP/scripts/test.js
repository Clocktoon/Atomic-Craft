import { world, system, Dimension } from "@minecraft/server"


// Sound code by MapleStar // TC (discord)
const dimension = world.getDimension("overworld", "nether")
dimension.spawnParticle()
function playExplosionAudio(dimension, center, magnitude) {
    if (!center) return;

    const players = dimension.getPlayers();
    const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
    const maxHearingDistance = explosionRadius * 24;
    const shakeDistance = explosionRadius * 8;

    players.forEach(player => {
        const playerLocation = player.location;
        const dx = playerLocation.x - center.x;
        const dy = playerLocation.y - center.y;
        const dz = playerLocation.z - center.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance > maxHearingDistance) return;

        const maxEffectRadius = explosionRadius * 2;
        const intensity = Math.max(0, 1.0 - (distance / maxEffectRadius));

        if (intensity > 0.1) {
            const fadeOutTime = Math.max(2, Math.floor((0.1 + (intensity * 0.4)) * 20));

            try {
                dimension.runCommand(`title "${player.name}" times 0 0 ${fadeOutTime}`);
                dimension.runCommand(`titleraw "${player.name}" title {"rawtext":[{"text":"A"}]}`);

                system.runTimeout(() => {
                    try {
                        dimension.runCommand(`title "${player.name}" clear`);
                    } catch (e) { }
                }, fadeOutTime * 50);
            } catch (e) { }
        }

        const distanceRatio = Math.min(1, distance / maxHearingDistance);
        const boomSound = getRandomSound(CUSTOM_SOUNDS.distantBooms);
        const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
        const boomPitch = 0.8 + (Math.random() * 0.2) - (distanceRatio * 0.1);

        const delayTicks = Math.min(100, Math.floor(distance / 17));
        const delayMs = delayTicks * 50;

        system.runTimeout(() => {
            try {
                dimension.runCommand(
                    `playsound ${boomSound} ${player.name} ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} ${boomVolume} ${boomPitch}`
                );

                if (distance <= shakeDistance) {
                    const shakeIntensity = Math.max(0.1, 1 - (distance / shakeDistance));
                    dimension.runCommand(
                        `execute as ${player.name} at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 positional`
                    );
                }
            } catch (err) { }
        }, delayMs);
    });
};

