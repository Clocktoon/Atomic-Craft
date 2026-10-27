import { world } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe((ev) => {
    const initialspawn = ev.initialSpawn
    const player = ev.player

    if (initialspawn) {
        player.sendMessage("§6Thank you for playing §jbombs of glory")
        player.sendMessage("§2Also play Bombs of Glory (the unofficial) remake!")
    }
})