import { world} from "@minecraft/server"


world.afterEvents.playerInteractWithBlock.subscribe((Event) => {

     const block = Event.block
     const itemstack = Event.itemStack

     if (block.typeId === "atomic:enhanced_tnt" && itemstack.typeId === "minecraft:flint_and_steel" && block.permutation.getState("atomic:on") == false) {
          block.dimension.playSound("entity.tnt.primed", block.location)
          block.dimension.spawnEntity("atomic:enhanced_mob",{x: block.location.x, y: block.location.y + 1, z: block.location.z})
     }
})
