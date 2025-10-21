import { world } from "@minecraft/server"

for (const player of world.getAllPlayers()) {
    const equippable = player.getComponent("equippable")
    const head = equippable.getEquipment("head")

    if (head.typeId === "atomic:gas_mask") {
        player.addEffect("absorption", 1200, 1)
    }
}