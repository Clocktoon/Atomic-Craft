import { system, world, BlockVolume, EquipmentSlot } from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater.js";
import { nuclearArea } from "../nuclearTransforms/volumeCode.js";
function makeRandomId() {
    //Taken from a free to use script by Coolbep on https://bedrock-snippets.vercel.app/
    return `${Date.now()}+${Math.random()}`;
}
class RedNuclear {
    constructor() {
        this.onRedstoneUpdate = this.onRedstoneUpdate.bind(this);
    }
    onRedstoneUpdate(event, p) {
        const block = event.block;
        const dimension = event.dimension;
        const params = p.params;
        if (event.powerLevel >= 3) {
            if (params.atom == true) {
                const randomMath = makeRandomId();
                const random = `${randomMath}`;
                const px = block.location.x;
                const pz = block.location.z;
                const py = block.y;
                world.tickingAreaManager
                    .createTickingArea("nukearea", {
                    from: { x: px - 60, y: 0, z: pz - 60 },
                    to: { x: px + 60, y: 0, z: pz + 60 },
                    dimension: block.dimension,
                })
                    .then(() => {
                    block.dimension.playSound("atomic.beep", block.location);
                    function* blockGen() {
                        let radius = 30;
                        //Radiation and burning of mobs
                        const players = block.dimension.getPlayers({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 100,
                        });
                        for (const eny of block.dimension.getEntities({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 100,
                        })) {
                            eny.setOnFire(20);
                            if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 &&
                                eny.typeId !== "atomic:gen_entity" &&
                                eny.typeId != "minecraft:player") {
                                eny.addTag("atomic:rad_effect");
                            }
                        }
                        for (const playerRadi of players) {
                            if (playerRadi.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId !== "atomic:gas_mask") {
                                playerRadi.setDynamicProperty("radiation", 100);
                            }
                            //TODO: Make gas mask worth with players
                            playerRadi.camera.fade({
                                fadeColor: { red: 1, blue: 1, green: 1 },
                                fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                            });
                        }
                        block.dimension.spawnParticle("atomic:nukepart", {
                            x: block.location.x,
                            y: block.location.y - 20,
                            z: block.location.z,
                        });
                        block.dimension.createExplosion(block.location, 15, {
                            causesFire: true,
                            allowUnderwater: false,
                        });
                        // Crater code
                        const randomMath = Math.floor(Math.random() * 20);
                        system.runJob((function* () {
                            yield* createCrater(block.location, block.dimension.id, "minecraft:air", 50, 30);
                            world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
                        })());
                        // Sound code by MapleStar // TC (discord)
                        function playExplosionAudio(dimension, center, magnitude) {
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
                                            pitch: boomPitch
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
                        //Shockwave and explosion sound
                        playExplosionAudio(block.dimension, block.location, 260);
                        // shockwaveBlast(
                        //   dimension,
                        //   block.location,
                        //   3,
                        //   50,
                        //   { x: 6, z: 4 },
                        //   1,
                        // );
                        yield;
                        //Gets rid of ticking area and starts the real nuclear explosion code
                        //Nuke Code!!!
                        nuclearArea(block.dimension.id, block.location, block, 272, 70, 100);
                        const volume = new BlockVolume({
                            x: block.location.x - 20,
                            y: block.location.y - 20,
                            z: block.location.z - 20,
                        }, {
                            x: block.location.x + 20,
                            y: block.location.y + 20,
                            z: block.location.z + 20,
                        });
                        // LATER UPDATE THING
                        // aftermath(
                        //   dimension.id,
                        //   radius,
                        //   volume,
                        //   Math.floor(Math.random() * 4),
                        // );
                    }
                    system.runJob(blockGen());
                });
            }
            if (params.gadget == true) {
                const randomMath = makeRandomId();
                const random = `${randomMath}`;
                const px = block.location.x;
                const pz = block.location.z;
                const py = block.y;
                //Ticking area for the stuff close to the explosion
                world.tickingAreaManager
                    .createTickingArea(`nukearea${random}`, {
                    from: { x: px - 70, y: 0, z: pz - 70 },
                    to: { x: px + 70, y: 0, z: pz + 70 },
                    dimension: block.dimension,
                })
                    .then(() => {
                    function* blockGen() {
                        let radius = 20;
                        //Radiation and burning of mobs
                        const players = block.dimension.getPlayers({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 70,
                        });
                        for (const eny of block.dimension.getEntities({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 70,
                        })) {
                            eny.setOnFire(20);
                            if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 &&
                                eny.typeId !== "atomic:gen_entity" &&
                                eny.typeId != "minecraft:player") {
                                eny.addTag("atomic:rad_effect");
                            }
                        }
                        for (const playerRadi of players) {
                            if (playerRadi.dimension.getBlockAbove(playerRadi.location)?.typeId === "minecraft:air") {
                                playerRadi.setOnFire(10, true);
                            }
                            if (playerRadi.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Head)?.typeId !== "atomic:gas_mask") {
                                playerRadi.setDynamicProperty("radiation", 100);
                            }
                            //TODO: Make gas mask worth with players
                            playerRadi.camera.fade({
                                fadeColor: { red: 1, blue: 1, green: 1 },
                                fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                            });
                        }
                        block.dimension.spawnParticle("atomic:gadgetparticle", {
                            x: block.location.x,
                            y: block.location.y - 20,
                            z: block.location.z,
                        });
                        // Crater code
                        const randomMath = Math.floor(Math.random() * 20);
                        system.runJob((function* () {
                            yield* createCrater(block.location, block.dimension.id, "minecraft:air", 30, 30);
                            world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
                        })());
                        yield;
                        // Sound code by MapleStar // TC (discord)
                        function playExplosionAudio(dimension, center, magnitude) {
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
                                            pitch: boomPitch
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
                        const playdi = block.dimension;
                        //Shockwave and explosion sound
                        playExplosionAudio(playdi, block.location, 120);
                        // shockwaveBlast(
                        //   dimension,
                        //   block.location,
                        //   3,
                        //   50,
                        //   { x: 6, z: 4 },
                        //   1,
                        // );
                        yield;
                        //Gets rid of ticking area and starts the real nuclear explosion code
                        //Nuke Code!!!
                        nuclearArea(block.dimension.id, block.location, block, 112, 40, 50
                        //   40,
                        //   40
                        );
                        const volume = new BlockVolume({
                            x: block.location.x - 20,
                            y: block.location.y - 20,
                            z: block.location.z - 20,
                        }, {
                            x: block.location.x + 20,
                            y: block.location.y + 20,
                            z: block.location.z + 20,
                        });
                        // GOING TO BE ADDED IN A LATER UPDATE
                        // aftermath(
                        //   dimension.id,
                        //   radius,
                        //   volume,
                        //   Math.floor(Math.random() * 4),
                        // );
                    }
                    system.runJob(blockGen());
                });
            }
            if (params.hbomb == true) {
                const randomMath = makeRandomId();
                const random = `${randomMath}`;
                const px = block.location.x;
                const pz = block.location.z;
                const py = block.y;
                //Ticking area for the stuff close to the explosion
                world.tickingAreaManager
                    .createTickingArea(`nukearea${random}`, {
                    from: { x: px - 71, y: py - 70, z: pz - 71 },
                    to: { x: px + 71, y: py + 10, z: pz + 71 },
                    dimension: block.dimension,
                })
                    .then(() => {
                    function* blockGen() {
                        let radius = 30;
                        //Radiation and burning of mobs
                        const players = block.dimension.getPlayers({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 100,
                        });
                        for (const eny of block.dimension.getEntities({
                            location: block.location,
                            minDistance: 1,
                            maxDistance: 100,
                        })) {
                            if (eny.typeId !== "minecraft:player") {
                                eny.kill();
                            }
                        }
                        for (const eny of block.dimension.getEntities({
                            location: block.location,
                            minDistance: 101,
                            maxDistance: 200,
                        })) {
                            eny.setOnFire(20);
                            if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 &&
                                eny.typeId !== "atomic:gen_entity" &&
                                eny.typeId != "minecraft:player") {
                                eny.addTag("atomic:rad_effect");
                            }
                        }
                        for (const playerRadi of players) {
                            playerRadi.setDynamicProperty("radiation", 100);
                            //TODO: Make gas mask worth with players
                            playerRadi.camera.fade({
                                fadeColor: { red: 1, blue: 1, green: 1 },
                                fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                            });
                        }
                        block.dimension.spawnParticle("atomic:nukepart2", {
                            x: block.location.x,
                            y: block.location.y - 26,
                            z: block.location.z,
                        });
                        // Crater code
                        function* createCrater(location, dimensionId, block, radius, maxDepth) {
                            if (!world.gameRules.tntExplodes)
                                return;
                            const dim = world.getDimension(dimensionId);
                            const cx = Math.floor(location.x);
                            const cy = Math.floor(location.y + 10);
                            const cz = Math.floor(location.z);
                            const r = Math.max(1, Math.ceil(radius));
                            const r2 = r * r;
                            for (let dx = -r; dx <= r; dx++) {
                                for (let dz = -r; dz <= r; dz++) {
                                    const dist2 = dx * dx + dz * dz;
                                    if (dist2 > r2)
                                        continue;
                                    const d = Math.sqrt(dist2);
                                    const t = d / radius;
                                    const depth = Math.floor(maxDepth * (1 - t * t));
                                    if (depth <= 0)
                                        continue;
                                    const x = cx + dx;
                                    const z = cz + dz;
                                    for (let dy = 0; dy <= depth; dy++) {
                                        const y = cy - dy;
                                        dim.setBlockType({ x: x, y: y, z: z }, block);
                                        yield;
                                    }
                                }
                            }
                        }
                        system.runJob((function* () {
                            yield* createCrater(block.location, block.dimension.id, "minecraft:air", 70, 70);
                            world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
                        })());
                        // Sound code by MapleStar // TC (discord)
                        function playExplosionAudio(dimension, center, magnitude) {
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
                                            const shakeIntensity = Math.max(0.2, 1 - distance / shakeDistance);
                                            dimension.runCommand(`execute as "${player.name}" at @s run camerashake add @s ${shakeIntensity.toFixed(2)} 1 rotational`);
                                        }
                                    }
                                    catch (err) {
                                        player.sendMessage("error with sound and shake code");
                                    }
                                }, delayMs);
                            });
                        }
                        const playdi = block.dimension;
                        //Shockwave and explosion sound
                        playExplosionAudio(playdi, block.location, 400);
                        // shockwaveBlast(
                        //   dimension,
                        //   block.location,
                        //   3,
                        //   50,
                        //   { x: 6, z: 4 },
                        //   1,
                        // );
                        //Nuke Code!!!
                        nuclearArea(block.dimension.id, block.location, block, 352, 208, 250);
                        const volume = new BlockVolume({
                            x: block.location.x - 20,
                            y: block.location.y - 20,
                            z: block.location.z - 20,
                        }, {
                            x: block.location.x + 20,
                            y: block.location.y + 20,
                            z: block.location.z + 20,
                        });
                        //WILL BE ADDED IN LATER UPDATE
                        // aftermath(
                        //   dimension.id,
                        //   radius,
                        //   volume,
                        //   Math.floor(Math.random() * 4),
                        // );
                    }
                    system.runJob(blockGen());
                });
            }
        }
    }
}
system.beforeEvents.startup.subscribe((blockComponentRegistry) => {
    blockComponentRegistry.blockComponentRegistry.registerCustomComponent("atomic:redstone_nuke", new RedNuclear);
});
//# sourceMappingURL=redstoneHelpers.js.map