import { world, system, BlockVolume, EquipmentSlot } from "@minecraft/server";
import { getChunkRadiation } from "./radiationSystem/chunkMorphs";
import { scanNearbyRadiation } from "./radiationSystem/radiationScanBlocks";
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player)
            return;
        const inventory = player.getComponent("inventory")?.container;
        if (inventory)
            for (let i = 0; i < inventory.size; i++) {
                const item = inventory.getItem(i);
                if (item)
                    if (item.typeId == "atomic:dev_item" && item.getLore().length == 0) {
                        item.setLore([
                            "§g This item is meant for dev testing. " +
                                "§8When Sneaking you can test particles," +
                                "§h When not Sneaking you unload all ticking areas",
                        ]);
                    }
            }
    }
}, 1);
const GEIGER_ITEM_ID = "atomic:geiger_item";
const SCAN_INTERVAL_TICKS = 10; //Tune if lag be bad lol
const FULL_RESCAN_EVERY = 6; // force a full block rescan every N loop passes (~3s), even without movement
const geigerCache = new Map();
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        if (!player.isValid)
            continue;
        const equippable = player.getComponent("minecraft:equippable");
        const mainhand = equippable?.getEquipment(EquipmentSlot.Mainhand);
        if (!mainhand || mainhand.typeId !== GEIGER_ITEM_ID) {
            geigerCache.delete(player.id); // stop tracking once they stop holding it
            continue;
        }
        const chunkX = Math.floor(player.location.x / 16);
        const chunkZ = Math.floor(player.location.z / 16);
        const chunkRadiation = getChunkRadiation(chunkX, chunkZ);
        let cache = geigerCache.get(player.id);
        const movedChunk = !cache || cache.chunkX !== chunkX || cache.chunkZ !== chunkZ;
        const dueForRescan = !cache || cache.passesSinceRescan >= FULL_RESCAN_EVERY;
        if (movedChunk || dueForRescan) {
            const from = { x: player.location.x - 5, y: player.location.y - 10, z: player.location.z - 5 };
            const to = { x: player.location.x + 5, y: player.location.y + 10, z: player.location.z + 5 };
            const blockRadLevels = scanNearbyRadiation(player.dimension, player.location, new BlockVolume(from, to));
            cache = { chunkX, chunkZ, blockRadLevels, passesSinceRescan: 0 };
            geigerCache.set(player.id, cache);
        }
        else {
            if (cache)
                cache.passesSinceRescan++;
        }
        if (!cache)
            return console.warn("Geiger handheld code broke cause of cache");
        const total = chunkRadiation + cache.blockRadLevels;
        player.onScreenDisplay.setActionBar(`§7☢ Radiation: §f${total.toFixed(2)}`);
        if (total > 0.1) {
            const intensity = Math.min(total / 10, 1);
            player.playSound("atomic.geig", {
                pitch: 0.8 + intensity * 1.5,
                volume: 0.6 + intensity * 0.4,
            });
        }
    }
}, SCAN_INTERVAL_TICKS);
//# sourceMappingURL=setLore.js.map