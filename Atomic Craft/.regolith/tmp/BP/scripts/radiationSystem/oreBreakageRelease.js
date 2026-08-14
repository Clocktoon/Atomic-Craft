import { EntityComponentTypes, EquipmentSlot, world } from "@minecraft/server";
import { addRadiationDose } from "./radiationManger";
world.afterEvents.playerBreakBlock.subscribe((event) => {
    const block = event.brokenBlockPermutation.type.id;
    const dimension = event.dimension;
    if (block === "atomic:uranium_block" || block === "atomic:uranium_deepslate") {
        const players = world.getPlayers({ location: event.block.location, minDistance: 1, maxDistance: 5 });
        dimension.spawnParticle("atomic:radiation_gas", event.block.location);
        for (const player of players) {
            if (player.getComponent(EntityComponentTypes.Equippable)?.
                getEquipment(EquipmentSlot.Head)?.typeId === "atomic:gas_mask") {
                continue;
            }
            addRadiationDose(player, 6);
        }
    }
});
world.afterEvents.blockExplode.subscribe((event) => {
    const id = event.explodedBlockPermutation.type.id;
    const dimension = event.dimension;
    if (id === "atomic:uranium_block" || id === "atomic:uranium_deepslate") {
        const players = world.getPlayers({ location: event.block.location, minDistance: 1, maxDistance: 5 });
        dimension.spawnParticle("atomic:radiation_gas", event.block.location);
        for (const player of players) {
            if (player.getComponent(EntityComponentTypes.Equippable)?.
                getEquipment(EquipmentSlot.Head)?.typeId === "atomic:gas_mask") {
                continue;
            }
            addRadiationDose(player, 6);
        }
    }
});
//# sourceMappingURL=oreBreakageRelease.js.map