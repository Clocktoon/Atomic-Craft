
import {world, system, ItemComponentConsumeEvent} from "@minecraft/server"
import { number } from "zod"




function Rotten (ev: ItemComponentConsumeEvent) {
        const source = ev.source

        if(source.getDynamicProperty("atomic:radiation_dose") as number > 0) {
            source.setDynamicProperty("atomic:radiation_dose", 0)
            source.runCommand("title @s actionbar §2 You feel better")
            source.removeEffect("weakness")
            source.removeEffect("nausea")
            source.removeEffect("mining_fatigue")
            source.removeEffect("slowness")
            source.removeEffect("poison")
            source.removeEffect("blindness")
        }

}

system.beforeEvents.startup.subscribe( ({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:rotten", {onConsume: Rotten})
})


world.afterEvents.worldLoad.subscribe(() => {
    world.afterEvents.entityDie.subscribe((event) => {
        if(typeof event.deadEntity.getDynamicProperty("atomic:radiation_dose") !== "number")
            return;
        event.deadEntity.setDynamicProperty("atomic:radiation_dose", 0);
    })
})