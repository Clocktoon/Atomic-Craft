import { world, BlockComponentRegistry, system, ItemStack,  } from "@minecraft/server"
/**
 * Main file for BOG (bombs of glory)
 * @author Abaddon
 * @license MIT
 * @version 2.0.0
 */

//Custom slab code by https://discord.com/channels/523663022053392405/1495937194949349526 (Barred)
import { slabComponent, slabBlockComponent } from './slabComponent';
import { number } from "zod";

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("namespace:slab", new slabBlockComponent());
});
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent("namespace:slab", new slabComponent());
});



import("./nuclearBombs/nukeCode")

import("./scriptUI/settingsItem")
import("./modules/explosionEffects")
import("./onStep.js")
import("./spawnOrbs.js")
import("./missileSummon.js")
import("./remoteMissile.js")
import("./landMineCode.js")
import("./nuclearBombs/hBombCode.js")
import("./icbmComp.js")
import("./consoleCode.js")
// import("./nonComp.js")
import("./EatEffects.js")
import("./radiationSystem/cureSystem")
import("./devItem.js")
import("./nuclearBombs/redstoneHelpers")
import("./nuclearBombs/gadget")
import("./geigerCount")
import("./radiationSystem/radiationManger")
import("./nuclearBombs/voidBomb")
world.afterEvents.worldLoad.subscribe(() => {
  
  if(typeof world.getDynamicProperty("powerful") !== "boolean") {
    world.setDynamicProperty("powerful", true)
  }
  if(typeof world.getDynamicProperty("explosionEffect") !== "boolean") {
    world.setDynamicProperty("explosionEffect", true)
  }
  if(typeof world.getDynamicProperty("logs") !== "boolean") {
    world.setDynamicProperty("logs", false)
  }
    import("./explodeTnt.js")
    import("./projectileScript.js")
    import("./missileBlow.js")
    import("./sirenCode.js")
    import("./planeCode.js")
    import("./welcomeText")
    import("./icbmCode.js")
    import("./ballisticCode.js")
    import("./himarCode.js")
    //Will add radiation next update
    // import("./radiationSystem/radEffect.js")
    import("./nuclearTransforms/crater.js")
    import("./aftermath.js")
    import("./nuclearTransforms/shockwave.js")
    import("./mortar")
    import("./radiationSystem/oreBreakageRelease")
    //import("./itempickups.js")
    //import("./smokePart.js")
    //import("./gasMaskCode.js")

}
)

world.afterEvents.playerSpawn.subscribe((event) => {
  const player = event.player

  import("./setLore") //Fits here :]

  
  const inventory = player.getComponent('inventory')
  
  
  if(event.initialSpawn) {
    if(inventory) {
        const container = inventory.container
        const settingsItem = new ItemStack("atomic:atomic_settings", 1)
      
        if(!container.contains(settingsItem)) {
            if(container.emptySlotsCount > 0) {
              container.addItem(settingsItem) 
            }
            else {
              player.dimension.spawnEntity(settingsItem.typeId, player.location)
            }
        } 
    }
  }
  }
)