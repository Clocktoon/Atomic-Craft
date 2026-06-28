import { world, system } from "@minecraft/server";
import { ChunkTicker } from "./chunkLoaders/ticking/chunkTickerClass";
/**@type {import("@minecraft/server").ItemCustomComponent} */
const Dev = {
    onUse(event) {
        const item = event.itemStack;
        const entity = event.source;
        if (!entity.isSneaking) {
            new ChunkTicker(entity.dimension, "null").unloadall;
            entity.onScreenDisplay.setActionBar("All pack chunks unloaded");
        }
        if (entity.isSneaking) {
            const allTickingAreas = world.tickingAreaManager.getAllTickingAreas();
            const tickingList = allTickingAreas.forEach(s => s.identifier);
            entity.onScreenDisplay.setActionBar(`ticking areas: ${tickingList}`);
        }
        if (!entity.isOnGround) {
            const players = world.getAllPlayers();
            for (const player of players) {
                if (player.getTags().includes("atomic:rad_effect")) {
                    player.removeTag("atomic:rad_effect");
                }
            }
        }
    }
};
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:dev_component", Dev);
});
//# sourceMappingURL=devItem.js.map