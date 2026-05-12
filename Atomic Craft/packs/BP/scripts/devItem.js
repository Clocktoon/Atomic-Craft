import {world, system, ItemComponentRegistry} from "@minecraft/server"
import {chunkTicker} from "./chunkLoader"

/**@type {import("@minecraft/server").ItemCustomComponent} */
const Dev = {
    onUse(event) {
      const item = event.itemStack
      const entity = event.source
      
      if(!entity.isSneaking) {
      new chunkTicker(entity.location, entity.dimension).unloadall
      entity.onScreenDisplay.setActionBar("All pack chunks unloaded")
      }
      if(entity.isSneaking) {
        const allTickingAreas =  world.tickingAreaManager.getAllTickingAreas().
        entity.onScreenDisplay.setActionBar(`ticking areas: ${allTickingAreas}`)
      }
    }
}

system.beforeEvents.startup.subscribe( ({itemComponentRegistry})=> {
        itemComponentRegistry.registerCustomComponent("atomic:dev_component", Dev)
})