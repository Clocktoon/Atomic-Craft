import {system} from "@minecraft/server"

/** @type {import("@minecraft/server").ItemCustomComponent} */
const Spawning = {
    onUseOn(ev) {
        const block = ev.block
        const location = {
            x: block.location.x,
            y: block.location.y + 1,
            z: block.location.z
        }

        block.dimension.spawnEntity("atomic:non_icbm_code", location)
    }
}

system.beforeEvents.startup.subscribe(({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:non_icbm_compi", Spawning)
})