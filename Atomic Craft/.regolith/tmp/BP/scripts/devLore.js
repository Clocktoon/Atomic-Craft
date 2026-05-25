import {world} from "@minecraft/server"


world.afterEvents.playerInventoryItemChange.subscribe( (event) => {
    const item = event.itemStack
    const slot = event.slot
    const player = event.player

    if(item.typeId == "atomic:dev_item") {
        item.setLore(["§g This item is meant for dev testing. " + "§8When Sneaking you can test particles," + "§h When not Sneaking you unload all ticking areas"])
    }
})