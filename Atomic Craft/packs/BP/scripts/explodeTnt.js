import { world, system, Dimension, BlockVolume, BlockVolumeBase } from "@minecraft/server"


world.afterEvents.playerInteractWithBlock.subscribe((Event) => {

     const block = Event.block
     const itemstack = Event.itemStack

     if (block.typeId === "atomic:enhanced_tnt" && itemstack.typeId === "minecraft:flint_and_steel" && block.permutation.getState("atomic:on") == false) {
          block.dimension.playSound("entity.tnt.primed", block.location)
          block.setPermutation(block.permutation.withState("atomic:on", true))
          system.runTimeout(() => {
               block.dimension.createExplosion(block.location, 16, { allowUnderwater: true })
          }, 240)
     }
})
