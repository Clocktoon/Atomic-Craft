import {world, system, Entity, ItemStack} from "@minecraft/server"


//TODO: Make thing so that it looks for nearby missiles, then uses tnt from inventory to attack


function tntLoader(entity: Entity, amount: number) {
    const inventory = entity.getComponent("inventory")

    if(!inventory || !inventory.container) return;

    for(let i = 0; i < inventory.inventorySize; i++) {
        const item = inventory.container.getItem(i)

        if(item && item.typeId === "minecraft:tnt") {
            const tnt = new ItemStack("minecraft:tnt", item.amount - amount)
            
            inventory.container.setItem(i, tnt);
            console.warn("tnt used by anti missile system");
            return;
        } else {
            continue;
        }
    }
}

function tntChecker(entity: Entity) {
    const inventory = entity.getComponent("inventory")

    if(!inventory || !inventory.container) return false;

    let totalTnt = 0;
    for(let i = 0; i < inventory.inventorySize; i++) {
        const item = inventory.container.getItem(i)

        if(item && item.typeId === "minecraft:tnt") {
            totalTnt++
        } else {
            continue;
        }
    }
    if(totalTnt > 0) {
        return true;
    }
    else {
        return false;
    }
}
//Put here as it's easier to see in case of need to change cause yk, lag
const ticksTime = 10

world.afterEvents.entitySpawn.subscribe((ev) => {
    const entity = ev.entity
    if(entity.typeId === "atomic:anti_missile") {
        console.warn("Anti missile system up")
    const tracker = system.runInterval(() => {
        if(!entity.isValid) {
            system.clearRun(tracker)
            return;
        }
        const missiles = entity.dimension.getEntities({
        families: ["bogmissile"],
        location: entity.location,
        minDistance: 1,
        maxDistance: 100,
    });
    for(const missile of missiles) {
        if(tntChecker(entity) === true) {
        tntLoader(entity,1)
        
        missile.kill();
        }
        
    }
    }, ticksTime)
}
})

    
