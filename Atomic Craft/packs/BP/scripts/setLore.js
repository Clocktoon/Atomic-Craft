import { itemStack, world, system } from "@minecraft/server";
system.runInterval(() => {
    for (const player of world.getPlayers()) {
        const inventory = player.getComponent("inventory").container;
        for (let i = 0; i < inventory.size; i++) {
            const item = inventory.getItem(i);
            if (item.typeId == "atomic:dev_item" && item.getLore().length == 0) {
                item.setLore(["§g This item is meant for dev testing. " + "§8When Sneaking you can test particles," + "§h When not Sneaking you unload all ticking areas"]);
            }
        }
    }
});
//# sourceMappingURL=setLore.js.map