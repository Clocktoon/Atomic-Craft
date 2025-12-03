import { system } from "@minecraft/server"

/** @type {import("@minecraft/server").ItemCustomComponent} */
const Remote = {
    onUse(event) {
        const player = event.source
        const blockhit = player.getBlockFromViewDirection()
        const block = blockhit.block

        const location = {
            x: block.location.x,
            y: block.location.y + 35,
            z: block.location.z
        }
        try {
            if (blockhit) {
                block.dimension.spawnEntity("atomic:missile", location)
            }
        } catch {
            player.runCommand("title @s actionbar Look at a nearby block")
        }
    }
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:remote", Remote)
})