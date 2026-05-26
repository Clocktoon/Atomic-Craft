import { world, system } from "@minecraft/server"

world.afterEvents.projectileHitBlock.subscribe((Event) => {
    const projectile = Event.projectile

    if (projectile.typeId === "atomic:grenade_entity") {

        system.runTimeout(() => {
            projectile.dimension.createExplosion(projectile.location, 5)
        }, 30)
    }
})

world.afterEvents.projectileHitEntity.subscribe((Event) => {
    const projectile = Event.projectile

    if (projectile.typeId === "atomic:grenade_entity") {
        system.runTimeout(() => {
            projectile.dimension.createExplosion(projectile.location, 6)
        }, 20)
    }
})