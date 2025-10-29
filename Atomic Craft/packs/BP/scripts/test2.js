import {system} from "@minecraft/server"

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

