import { world } from "@minecraft/server"

world.afterEvents.playerSpawn.subscribe((ev) => {
    const initialspawn = ev.initialSpawn
    const player = ev.player

    if (initialspawn) {
        player.sendMessage("Thank you for playing bombs of glory")
    }
})