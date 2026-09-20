import { CameraShakeType, system } from "@minecraft/server";
// Sound code by MapleStar // TC (discord)
export function playExplosionAudio(dimension, center, magnitude) {
    if (!center)
        return;
    const players = dimension.getPlayers();
    const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
    const maxHearingDistance = explosionRadius * 24;
    const shakeDistance = explosionRadius * 8;
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
                player.playSound("atomic.nukesound", {
                    volume: boomVolume,
                    pitch: boomPitch,
                });
                if (distance <= shakeDistance) {
                    const shakeIntensity = Math.max(0.1, 1 - distance / shakeDistance);
                    player.camera.addShake({ duration: 1, intensity: shakeIntensity, type: CameraShakeType.Rotational });
                }
            }
            catch (err) {
                player.sendMessage("error with sound and shake code");
            }
        }, delayMs);
    });
}
//# sourceMappingURL=nuclearSound.js.map