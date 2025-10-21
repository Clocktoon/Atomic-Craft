import { world } from "@minecraft/server"
//WIP
world.beforeEvents.explosion.subscribe((Event) => {

    const source = Event.source
    const dimension = Event.dimension


    dimension.spawnParticle("atomic:smoke", source.location)
    dimension.playSound("atomic.explosions", source.location)


})