import { world } from "@minecraft/server"
//WIP
world.afterEvents.explosion.subscribe((event) => {

    const dimension = event.dimension
    const source = event.source


    dimension.spawnParticle("atomic:smoke", source.location)
   // dimension.playSound("atomic.explosions", source.location)


})