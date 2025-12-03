import {system} from "@minecraft/server"

/** @type {import("@minecraft/server").ItemCustomComponent} */
const Spawn = {
    onUseOn(ev) {
        const block = ev.block
        const location = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z
        }

        block.dimension.spawnEntity("atomic:icbm", location)
    }
}

system.beforeEvents.startup.subscribe(({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:icbm_code", Spawn)
})