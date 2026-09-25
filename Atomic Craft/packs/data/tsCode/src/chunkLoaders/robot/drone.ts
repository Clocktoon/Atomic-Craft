import {world, ItemCustomComponent, CustomComponentParameters, ItemComponentUseEvent, system, Player, ItemStack} from "@minecraft/server"

class droneController implements ItemCustomComponent {
    onUse(event: ItemComponentUseEvent) {
        const itemStack = event.itemStack
        const player = event.source
        if(!itemStack || typeof itemStack.getDynamicProperty("drone_control") !== "string")
            return;

        system.run(() => {
            const getMode = itemStack.getDynamicProperty("control_mode")
            if(getMode === undefined) {
                itemStack.setDynamicProperty("cotrolmode", "off")
            }
            if(player.isSneaking) {
                //TODO: Figure out how I want this to work
            }

        })
        
        
        
    }
}

function clearItem(player: Player, itemStack: ItemStack) {
    const inventory = player.getComponent("inventory")

    if(!inventory || !inventory.container)
        return;

    for(let i = 0; i < inventory.inventorySize; i++) {
        if(inventory.container.getSlot(i).typeId === itemStack.typeId) {
            inventory.container.getSlot(i).setItem()
            return
        }
    }
}

class droneSpawner implements ItemCustomComponent {
    onUse(ev: ItemComponentUseEvent) {
        const itemStack = ev.itemStack
        const player = ev.source
        if(!itemStack)
            return;

        system.run(() => {
            const getMode = itemStack.getDynamicProperty("control_mode")
            if(getMode === undefined) {
                itemStack.setDynamicProperty("control_mode", "off")
            }

        if(player.isSneaking) {
            
            if(getMode === "off") {
                itemStack.setDynamicProperty("control_mode", "fpv")
                return
            }
            if(getMode === "fpv") {
                itemStack.setDynamicProperty("control_mode", "controller")
                return
            }
            if(getMode === "controller") {
                itemStack.setDynamicProperty("control_mode", "off")
                return
            }
        } else {
           const entity = player.dimension.spawnEntity("atomic:quadcopter", player.location)
           if(getMode === "fpv") {
           entity.setProperty("drone_mode", "fpvmode")
           clearItem(player, itemStack)
           return
           }
           if(getMode === "controller") {
            entity.setProperty("drone_mode", "controllermode")
            clearItem(player, itemStack)
            return;
           }
        }
        })
    }
}


world.afterEvents.worldLoad.subscribe(() => {
    world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
        const entity = ev.target
        const itemStack = ev.itemStack
        const player = ev.player

        if(!itemStack || itemStack.typeId !== "atomic:drone_controller")
            return;

        if(entity.typeId === "atomic:quadcopter" && itemStack.getDynamicProperty("drone_control") === undefined) {
            const inventory = player.getComponent("inventory")
           if(!inventory || !inventory.container)
                return;
            itemStack.setDynamicProperty("drone_control",entity.id)
            for(let i = 0; i < inventory.inventorySize; i++) {
                const slot = inventory.container.getSlot(i)
                if(slot.typeId === "atomic:drone_controller") {
                    slot.setItem(itemStack.clone())
                    return
                }
            }
        }
    })
    world.afterEvents.entityDie.subscribe((event) => {
        const deadEntity = event.deadEntity
    })
})