import { system } from "@minecraft/server"

/** @type {import("@minecraft/server").BlockCustomComponent} */
const OnStep = {
    onStepOn(event) {
        const entity = event.entity

        if (entity.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 && entity.typeId !== "atomic:gen_entity") {
            entity.addEffect("poison", 600, { amplifier: 2 })
            entity.applyDamage(3)
            if (entity.isValid && entity.hasTag("atomic:rad_effect") == false) {
                entity.addTag("atomic:rad_effect")
            }
        }

    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:step", OnStep)
})