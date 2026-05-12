import { world } from "@minecraft/server"
//WIP
world.afterEvents.explosion.subscribe((event) => {

    const dimension = event.dimension
    const source = event.source
    const blocks = event.getImpactedBlocks()
    
    for(const block of blocks) {
        dimension.spawnParticle("atomic:smoke", block.location)
    }
   // dimension.playSound("atomic.explosions", source.location)


})