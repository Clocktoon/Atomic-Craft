import { system } from "@minecraft/server"

/** @type {import("@minecraft/server").ItemCustomComponent} */
const MissileSummon = {
    onCompleteUse(event) {
        const player = event.source
        const location = {
            x: player.location.x,
            y: player.location.y + 20,
            z: player.location.z
        }

        player.dimension.spawnEntity("atomic:missile", location)

    }
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:missile_summon", MissileSummon)
})