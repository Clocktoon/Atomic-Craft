import { world, system, EquipmentSlot } from "@minecraft/server";
import { getChunkExposure } from "./mobRadiationZones";
import { applyRadiationEffects } from "./radEffect";
import { nearbyRadiationBlocks } from "./blockRadiationComp";
function calculateExposure(entity) {
    let exposure = 0;
    try {
        exposure += getChunkExposure(entity);
        exposure += nearbyRadiationBlocks(entity);
    }
    catch (err) {
        console.warn(`Radiation exposure calc failed for ${entity.typeId}: ${err}`);
    }
    return exposure;
}
export function addRadiationDose(entity, amount) {
    let dose = entity.getDynamicProperty("atomic:radiation_dose") ?? 0;
    dose += amount;
    entity.setDynamicProperty("atomic:radiation_dose", dose);
}
function updateDose(entity, exposure) {
    let dose = entity.getDynamicProperty("atomic:radiation_dose") ?? 0;
    dose += exposure * 0.2;
    dose -= 0.05;
    if (dose < 0)
        dose = 0;
    entity.setDynamicProperty("atomic:radiation_dose", dose);
}
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const equip = player.getComponent("minecraft:equippable");
        if (equip?.getEquipment(EquipmentSlot.Head)?.typeId === "atomic:gas_mask")
            continue;
        let exposure = calculateExposure(player);
        if (equip) {
            exposure - equip.totalArmor * 5;
        }
        player.setDynamicProperty("atomic:radiation_exposure", exposure);
        updateDose(player, exposure);
        applyRadiationEffects(player, player.dimension);
    }
    const dimensions = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
    for (const dimId of dimensions) {
        const dimension = world.getDimension(dimId);
        const entities = dimension.getEntities().filter(e => e.typeId !== "minecraft:player");
        for (const entity of entities) {
            const family = entity.getComponent("minecraft:type_family");
            if (family && family.hasTypeFamily("bogmissile") || entity.typeId === "atomic:hate")
                continue;
            const exposure = calculateExposure(entity);
            entity.setDynamicProperty("atomic:radiation_exposure", exposure);
            updateDose(entity, exposure);
            applyRadiationEffects(entity, dimension);
        }
    }
}, 20);
world.afterEvents.worldLoad.subscribe(() => {
    world.afterEvents.playerSpawn.subscribe((ev) => {
        const player = ev.player;
        const radiation = player.getDynamicProperty("atomic:radiation_exposure");
        const dose = player.getDynamicProperty("atomic:radiation_exposure");
        if (player && typeof radiation === "number" && typeof dose === "number") {
            if (radiation >= 2 || dose >= 1) {
                player.setDynamicProperty("atomic:radiation_exposure", undefined);
                player.setDynamicProperty("atomic:radiation_dose", undefined);
                console.warn("player radiation cleared");
            }
        }
    });
});
//# sourceMappingURL=radiationManger.js.map