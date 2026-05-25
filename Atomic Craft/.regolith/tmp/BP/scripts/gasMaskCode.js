import { world, system } from "@minecraft/server"

system.runInterval( () => { 
for (const player of world.getAllPlayers()) {
    const equippable = player.getComponent("equippable")
    const head = equippable.getEquipment("Head")

    if (head.typeId == "atomic:gas_mask") {
        player.addEffect("absorption", 1200, 1)

    }
}
}, 20)