import { system, world } from "@minecraft/server";
system.runInterval(() => {
    const players = world.getPlayers();
    for (const player of players) {
        const value = player.getDynamicProperty("atomic:radiation_level");
        if (value >= 1) {
            player.onScreenDisplay.setActionBar(`Radiation level: ${JSON.stringify(value)}`);
        }
    }
}, 1);
//# sourceMappingURL=RadiDisplaySystem.js.map