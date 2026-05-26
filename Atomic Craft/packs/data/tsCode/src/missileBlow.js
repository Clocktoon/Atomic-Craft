import { world } from "@minecraft/server"

world.afterEvents.entityDie.subscribe((Event) => {
    const entity = Event.deadEntity


    if (entity.typeId === "atomic:missile") {

        entity.dimension.createExplosion(entity.location, 16, { causesFire: true })
        entity.dimension.spawnParticle("atomic:explosion_missile", entity.location)
    }

})