import { world, system, Dimension, BlockVolume, BlockVolumeBase } from "@minecraft/server"


const dimension = world.getDimension('overworld')

world.afterEvents.playerInteractWithBlock.subscribe((Event) => {

     const block = Event.block
     const itemstack = Event.itemStack

     if (block.typeId === "atomic:enhanced_tnt" && itemstack.typeId === "minecraft:flint_and_steel") {
          block.dimension.playSound("entity.tnt.primed", block.location)
          system.runTimeout(() => {
               block.dimension.createExplosion(block.location, 16, { allowUnderwater: true })
          }, 240)
     }
})
