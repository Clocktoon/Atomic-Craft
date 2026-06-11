import { system, world } from "@minecraft/server";
system.runInterval(() => {
    const players = world.getPlayers();
    for (const player of players) {
        const value = player.getDynamicProperty("radiation");
        player.onScreenDisplay.setActionBar(`Radiation level: ${JSON.stringify(value)}`);
    }
}, 20);
