import {world, system} from "@minecraft/server"


/**@type {import("@minecraft/server").ItemCustomComponent} */

const Rotten = {
    onConsume(ev) {
        const source = ev.source

        if(source.hasTag("atomic:rad_effect") == true) {
            source.removeTag("atomic:rad_effect")
            source.runCommand("title @s actionbar §2 You feel better")
            source.removeEffect("weakness")
            source.removeEffect("nausea")
            source.removeEffect("mining_fatigue")
            source.removeEffect("slowness")
            source.removeEffect("poison")
            source.removeEffect("blindness")
        }
    }
}

system.beforeEvents.startup.subscribe( ({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:rotten", Rotten)
})