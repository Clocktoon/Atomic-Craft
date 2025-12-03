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

//Missile system, needs changing


function createLaunchingSmokeTrails(center, dimension, count = 15, launchPower = 0.5) {
  const actualCount = Math.min(Math.max(1, count), 20);
  const actualPower = Math.max(0.1, launchPower);

  let attempts = 0;
  let successfulTrails = 0;
  const maxAttempts = actualCount * 3;

  while (successfulTrails < actualCount && attempts < maxAttempts) {
    attempts++;

    const angle = Math.random() * Math.PI * 2;

    const verticalVariation = Math.random();
    let verticalAngle;

    if (verticalVariation < 0.7) {
      verticalAngle = (Math.random() - 0.5) * 0.7;
    } else if (verticalVariation < 0.9) {
      verticalAngle = Math.random() * 0.6 + 0.17;
    } else {
      verticalAngle = (Math.random() * 1.2) - 0.17;
    }

    const baseDistance = 3.0 + (actualPower * 2.0);
    const distanceRandomness = 5.0;
    const distance = baseDistance + (Math.random() * distanceRandomness * actualPower);

    const baseHeight = 1.0 + (actualPower * 0.5);
    const heightRandomness = 3.0;
    const height = baseHeight + (Math.random() * heightRandomness * actualPower * Math.abs(verticalAngle + 0.3));

    const endX = center.x + Math.cos(angle) * distance;
    const endZ = center.z + Math.sin(angle) * distance;
    const endY = center.y + height;

    const endPos = { x: endX, y: endY, z: endZ };

    if (isPathClear(center, endPos, dimension)) {
      spawnSmokeTrajectory(center, dimension, angle, verticalAngle, distance, height, actualPower);
      successfulTrails++;

      system.runTimeout(() => { }, successfulTrails * 1);
    }
  }
};

function spawnSmokeTrajectory(center, dimension, angle, verticalAngle, maxDistance, maxHeight, power) {
  const points = 3 + Math.floor(power * 3);

  for (let j = 0; j < points; j++) {
    const progress = j / points;
    const curve = Math.sin(progress * Math.PI) * 0.8;

    const horizontalProgress = progress;
    const verticalProgress = progress * (1 + verticalAngle * 0.5); // Angle affects progression

    const x = center.x + Math.cos(angle) * maxDistance * horizontalProgress;
    const z = center.z + Math.sin(angle) * maxDistance * horizontalProgress;

    const baseY = center.y + (maxHeight * curve);
    const angleY = verticalAngle * maxDistance * horizontalProgress * 0.7;
    const y = baseY + angleY;

    const particleLocation = { x, y, z };

    if (!isPathClear(center, particleLocation, dimension)) {
      break;
    }

    const timingJitter = (Math.random() - 0.5) * 0.4;

    system.runTimeout(() => {
      dimension.spawnParticle(smoketrailparticles, particleLocation);

      if (power > 1.2 && j % Math.floor(2 + Math.random() * 3) === 0) {
        dimension.spawnParticle(smoketrailparticles, particleLocation);
      }
    }, j * 2 + timingJitter);
  }
};

