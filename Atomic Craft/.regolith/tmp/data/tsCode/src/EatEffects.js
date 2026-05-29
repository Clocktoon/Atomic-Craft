//script that will cure the player of radi when they eat rotten soup
import {system} from "@minecraft/server"

/**@type {import("@minecraft/server").ItemCustomComponent}*/

const EatEffect = {
    onConsume({source}, {params}) {
        
        for(const {name, duration, amplifier} of params) {
            source.addEffect(name,duration,{amplifier: amplifier})
        }

    }
}

system.beforeEvents.startup.subscribe(({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:eat_effect", EatEffect)
})