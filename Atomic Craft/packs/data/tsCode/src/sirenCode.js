import { world, system, BlockVolume, Dimension } from "@minecraft/server"

world.afterEvents.entitySpawn.subscribe((ev) => {
    const entity = ev.entity

    if (entity === "atomic.siren") {

        ev.entity.runCommand("title @p actionbar Click to scan for nukes")
    }

})


world.afterEvents.playerInteractWithEntity.subscribe((e) => {
    const player = e.player
    const target = e.target
    const playerDimension = player.dimension.id.toString()
    const dimension = world.getDimension(playerDimension)



    const from = {
        x: target.location.x - 10,
        y: target.location.y - 10,
        z: target.location.z - 10
    }

    const to = {
        x: target.location.x + 10,
        y: target.location.y + 10,
        z: target.location.z + 10

    }

    const blockVolume = new BlockVolume(from, to)

    if (!player.isSneaking && target.typeId === "atomic:siren") {
        const blockGet = target.dimension.getBlocks(blockVolume, { includeTypes: ["atomic:atom_bomb"] })
        for (const location of blockGet.getBlockLocationIterator()) {
            const block = dimension.getBlock(location)
            block.dimension.playSound("atomic.siren", target.location)

        }
    }


})

world.afterEvents.playerInteractWithEntity.subscribe((Event) => {
    const player = Event.player
    const target = Event.target

    if (player.isSneaking && target.typeId === "atomic:siren") {
        player.runCommand("stopsound @a atomic.siren")
    }
})

world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity

    if (entity.typeId === "atomic:siren") {
        entity.runCommand("stopsound @a atomic.siren")
    }
})