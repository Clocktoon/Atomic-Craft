import { world, system, BlockVolume, EquipmentSlot } from "@minecraft/server";
import { RadiationRegistry, radioactiveTypes } from "./geigerCount";
import { getChunkRadiation } from "./chunkLoaders/chunkMorphs";
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
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        if (!player)
            return;
        const item = player
            .getComponent("minecraft:equippable")
            ?.getEquipment(EquipmentSlot.Mainhand);
        if (item?.typeId === "atomic:geiger_item") {
            const x = Math.floor(player.location.x / 16);
            const z = Math.floor(player.location.z / 16);
            let clicks = 0;
            const chunkRadiation = getChunkRadiation(x, z);
            clicks += chunkRadiation * 0.25;
            const minX = x * 16;
            const minZ = z * 16;
            const maxX = minX + 15;
            const maxZ = minZ + 15;
            const from = {
                x: minX,
                y: -30,
                z: minZ,
            };
            const to = {
                x: maxX,
                y: 30,
                z: maxZ,
            };
            const blocks = player.dimension.getBlocks(new BlockVolume(from, to), {
                includeTypes: radioactiveTypes,
            });
            for (const location of blocks.getBlockLocationIterator()) {
                const block = player.dimension.getBlock(location);
                if (!block)
                    continue;
                const blockRadiation = RadiationRegistry.get(block.typeId);
                if (blockRadiation === undefined)
                    continue;
                const dx = block.location.x - player.location.x;
                const dy = block.location.y - player.location.y;
                const dz = block.location.z - player.location.z;
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                const contribution = blockRadiation / (distance + 1);
                clicks += contribution;
            }
            const updatesPerSecond = 4;
            if (item.getDynamicProperty("atomic:geigerAccumulator") === undefined) {
                item.setDynamicProperty("atomic:geigerAccumulator", 0);
            }
            let accumulator = item.getDynamicProperty("atomic:geigerAccumulator") ?? 0;
            accumulator += clicks / updatesPerSecond;
            while (accumulator >= 1) {
                accumulator--;
                system.runTimeout(() => {
                    player.playSound("atomic.geig");
                }, Math.floor(Math.random() * 5));
            }
            // Save the remainder
            item.setDynamicProperty("atomic:geigerAccumulator", accumulator);
        }
    }
}, 5);
//# sourceMappingURL=setLore.js.map