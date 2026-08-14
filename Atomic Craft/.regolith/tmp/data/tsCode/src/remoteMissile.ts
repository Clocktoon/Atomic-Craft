import { ItemCustomComponent, system, ItemComponentUseEvent, CustomComponentParameters, ItemComponentUseOnEvent, Player, world, Vector3, EntityComponentTypes, ItemStack } from "@minecraft/server"
import { nuclearBombFisson } from "./nuclearBombs/nukeCode";
import { hBombFusion } from "./nuclearBombs/hBombCode";
import { gadgetCode } from "./nuclearBombs/gadget";

/** @type {import("@minecraft/server").ItemCustomComponent} */
class Remote implements ItemCustomComponent {
    nukeList: string[];
    constructor() {
        this.onUseOn = this.onUseOn.bind(this)
        this.onUse = this.onUse.bind(this)
        this.nukeList = ["atomic:atom_bomb","atomic:hydrogen_bomb", "atomic:gadget_bomb"]
    }
    onUseOn(ev: ItemComponentUseOnEvent) {
        const block = ev.block
        const item = ev.itemStack
        const player = ev.source as Player
        player.sendMessage("OnUseOn running")
        if(typeof item.getDynamicProperty("in_use") === "undefined")
            item.setDynamicProperty("in_use", false)

         const inv = player.getComponent(EntityComponentTypes.Inventory)
            if(inv === undefined || inv.container === undefined) {
                player.sendMessage("error with inventory when clicking")
                return;
            }

        
        if(ev.source.isSneaking) {
            player.sendMessage("1")
        if(this.nukeList.includes(block.typeId) && item.getDynamicProperty("in_use") === false) {
           
           const location = item.setDynamicProperty("location", block.location);
            item.setDynamicProperty("in_use", true);
            
            item.setLore(["Location at",`${JSON.stringify(location)}`])
           
            player.sendMessage("item type id is: " + item.typeId)
            const itemSlot = inv.container.find(item.clone())

            player.sendMessage("2" + " and also ItemSlot output: " + itemSlot)

            for(let slot = 0; slot < inv.inventorySize; slot++) {
                const itemStack = inv.container.getItem(slot)
                if(itemStack) {
                    if(itemStack.typeId === "atomic:tablet") {
                        inv.container.setItem(slot, item.clone())
                        world.sendMessage("Should have worked")
                    }
                }
            }
            
            
        }
        if(!this.nukeList.includes(block.typeId) && typeof item.getDynamicProperty("location") !== "undefined") {
            item.setDynamicProperty("location", undefined);
            item.setLore(undefined)

            for(let slot = 0; slot < inv.inventorySize; slot++) {
                const itemStack = inv.container.getItem(slot)
                if(itemStack) {
                    if(itemStack.typeId === "atomic:tablet") {
                        inv.container.setItem(slot, item.clone())
                        world.sendMessage("Should have worked")
                    }
                }
            }
        }
    }
    }

      onUse(event: ItemComponentUseEvent) {
        const item = event.itemStack
        const source = event.source

        source.sendMessage("OnUse running")

        if(source.isSneaking)
            return;

        if(!item)
            return;

        source.sendMessage("OnUse still running")
        if(typeof item.getDynamicProperty("in_use") === "undefined")
            item.setDynamicProperty("in_use", false)

        if(item.getDynamicProperty("in_use") === false || typeof item.getDynamicProperty("location") === "undefined")
            return;

        const location = item.getDynamicProperty("location") as Vector3

        if(source.typeId !== "minecraft:player")
            return;
        const random = Math.floor(Math.random() * 10)
        world.tickingAreaManager.createTickingArea(`remote_${random}`, {
            dimension: source.dimension,
            from: {
                x: location.x - 15,
                y: location.y,
                z: location.z - 15
            },
            to: {
                x: location.x + 15,
                y: location.y + 1,
                z: location.z + 15
            }
        }).then(() => {
            const block = source.dimension.getBlock(location)
            world.tickingAreaManager.removeTickingArea(`remote_${random}`)
            if(!block)
                return;

            if(block.typeId === "atomic:atom_bomb") {
                nuclearBombFisson(block, source as Player, block.dimension, false)
                item.setDynamicProperty("location", undefined);
                item.setLore(undefined)
                const inv = source.getComponent(EntityComponentTypes.Inventory)
            if(inv === undefined || inv.container === undefined) {
                return;
            }
            for(let slot = 0; slot < inv.inventorySize; slot++) {
                const itemStack = inv.container.getItem(slot)
                if(itemStack) {
                    if(itemStack.typeId === "atomic:tablet") {
                        inv.container.setItem(slot, item.clone())
                        world.sendMessage("Should have worked")
                    }
                }
            }
            }
            if(block.typeId === "atomic:hydrogen_bomb") {
                hBombFusion(block, source as Player, block.dimension, false)
                item.setDynamicProperty("location", undefined);
                item.setLore(undefined)
                const inv = source.getComponent(EntityComponentTypes.Inventory)
            if(inv === undefined || inv.container === undefined) {
                return;
            }
            for(let slot = 0; slot < inv.inventorySize; slot++) {
                const itemStack = inv.container.getItem(slot)
                if(itemStack) {
                    if(itemStack.typeId === "atomic:tablet") {
                        inv.container.setItem(slot, item.clone())
                        world.sendMessage("Should have worked")
                    }
                }
            }
            }

            if(block.typeId === "atomic:gadget_bomb") {
                gadgetCode(block, source as Player, block.dimension, false)
                item.setDynamicProperty("location", undefined);
                item.setLore(undefined)
                
                const inv = source.getComponent(EntityComponentTypes.Inventory)
                
            if(inv === undefined || inv.container === undefined) {
                return;
            }
            for(let slot = 0; slot < inv.inventorySize; slot++) {
                const itemStack = inv.container.getItem(slot)
                if(itemStack) {
                    if(itemStack.typeId === "atomic:tablet") {
                        inv.container.setItem(slot, item.clone())
                        world.sendMessage("Should have worked")
                    }
                }
            }
            }

        })
    }
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:remote", new Remote)
})