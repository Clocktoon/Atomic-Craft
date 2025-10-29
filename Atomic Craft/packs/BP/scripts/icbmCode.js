import {world} from "@minecraft/server"

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const player = ev.player
    const entity = ev.target
    const itemstack = ev.itemStack

    if(itemstack.typeId === "atomic:blue_chip" && entity.typeId === "atomic:icbm") {
            entity.setProperty("atomic:blue", true)
    }
    if(itemstack.typeId === "atomic:green_chip" && entity.typeId === "atomic:icbm") {
        entity.setProperty("atomic:green", true)
    }
    if(itemstack.typeId === "atomic:purple_chip" && entity.typeId === "atomic:icbm") {
        entity.setProperty("atomic:purple", true)
    }
    if(itemstack.typeId === "atomic:white_chip" && entity.typeId === "atomic:icbm") {
        entity.setProperty("atomic:white", true)
    }
    if(itemstack.typeId === "atomic:red_chip" && entity.typeId === "atomic:icbm") {
        entity.setProperty("atomic:red", true)
    }
    if(itemstack.typeId === "atomic:yellow_chip" && entity.typeId === "atomic:icbm") {
        entity.setProperty("atomic:yellow", true)
    }
})

world.afterEvents.entityDie.subscribe((ev) => {
    const entity = ev.deadEntity
    const damageSource = ev.damageSource

    if(entity.typeId === "atomic:icbm" && damageSource.cause !== "entityAttack") {
        const x = entity.location.x
        const y = entity.location.y
        const z = entity.location.z
        entity.runCommand(`tickingarea add 
                ${x - 70} 0 ${z - 70} ${x + 60} 0 ${z + 60} ic1`)
    }

})