import {world} from "@minecraft/server"

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const player = ev.player
    const entity = ev.target

    if(entity.typeId == "atomic:icbm" && player.isSneaking) {
        entity.kill
    }
})

world.afterEvents.entityDie.subscribe((ev) => {
    const entity = ev.deadEntity
    const damageSource = ev.damageSource

})