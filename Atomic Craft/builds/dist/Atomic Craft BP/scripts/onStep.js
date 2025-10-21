import { system } from "@minecraft/server"

/** @type {import("@minecraft/server").BlockCustomComponent} */
const OnStep = {
    onStepOn(event) {
        const entity = event.entity

        if (entity.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0) {
            entity.addEffect("poison", 600, { amplifier: 2 })
            entity.applyDamage(3)
        }

    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:step", OnStep)
})