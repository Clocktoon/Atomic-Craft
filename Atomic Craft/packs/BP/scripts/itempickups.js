//script that will give player radi if they pickup certain blocks or items
import {world} from "@minecraft/server"


world.afterEvents.entityItemPickup.subscribe( (event) => {
    const entity = event.entity
    const items = event.items[]
    const blocks = ["atomic:radiation_block","atomic:radiation_diamond_block"]
        for(const block of blocks) {

        if(items.typeId == block && entity.runCommand(
            `testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`)
            .successCount <= 0) {
            entity.addTag("atomic:rad_effect")
            items.setLore('§4This block is toxic with radiation', '§o By holding this you are slowly dying')
        }
    }
})