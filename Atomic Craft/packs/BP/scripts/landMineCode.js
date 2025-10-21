import { system } from "@minecraft/server"


/** @type {import("@minecraft/server").BlockCustomComponent} */
const LandStep = {
    onStepOn(event) {
        const block = event.block

        block.dimension.createExplosion(block.location, 4,
            { causesFire: false, allowUnderwater: false })
    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:step_explode", LandStep)
})