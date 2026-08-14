import { BlockComponentStepOnEvent, system } from "@minecraft/server"

/** @type {import("@minecraft/server").BlockCustomComponent} */
const OnStep = {
    onStepOn(event: BlockComponentStepOnEvent) {
        const entity = event.entity

        if(!entity)
            return;
        
        if (entity.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 && entity.typeId !== "atomic:gen_entity") {
            entity.addEffect("poison", 600, { amplifier: 2 })
            entity.applyDamage(3)
        }

    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:step", OnStep)
})