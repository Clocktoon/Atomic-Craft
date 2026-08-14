import { system, ItemCustomComponent, ItemComponentUseEvent } from "@minecraft/server"

/** @type {import("@minecraft/server").ItemCustomComponent} */
class MissileSummon implements ItemCustomComponent {
    
    onUse(event: ItemComponentUseEvent) {
        const player = event.source
        const blockhit = player.getBlockFromViewDirection()
        
        if(!blockhit)
            return;

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
    itemComponentRegistry.registerCustomComponent("atomic:missile_summon", new MissileSummon)
})