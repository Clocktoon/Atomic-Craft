import { world, system } from "@minecraft/server"


world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target
    const player = ev.player

    if (entity.typeId === "atomic:plane" && !entity.isOnGround) {
        const size = {
            x: entity.location.x,
            y: entity.location.y - 3,
            z: entity.location.z
        }
        const test = entity.dimension.spawnEntity("atomic:plane_bomb", size)
        test
        test.dimension.playSound("atomic.plane.missile", test.location)
        let time = 7
        const sy = system.runInterval(() => {
            if (time >= 0) {
                player.runCommand(`title @s actionbar ${time} seconds on cooldown`)
                time--
            }
            if (time <= 0) {
                system.clearRun(sy)
            }

        }, 20)
    }

})

world.afterEvents.entityDie.subscribe((ev) => {
    const entity = ev.deadEntity

    if (entity.typeId === "atomic:plane_bomb") {
        entity.dimension.createExplosion(entity.location, 6, { causesFire: true })

    }

})

