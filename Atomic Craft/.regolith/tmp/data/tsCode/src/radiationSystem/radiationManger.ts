import { world, system, Entity } from "@minecraft/server"
import { getChunkExposure } from "./mobRadiationZones";
import { applyRadiationEffects } from "./radEffect";
import { nearbyRadiationBlocks } from "./blockRadiationComp";

function calculateExposure(entity: Entity): number {
    let exposure = 0;
    try {
        exposure += getChunkExposure(entity);
        exposure += nearbyRadiationBlocks(entity);
    } catch (err) {
        console.warn(`Radiation exposure calc failed for ${entity.typeId}: ${err}`);
    }
    return exposure;
}

function updateDose(entity: Entity, exposure: number) {
    let dose = entity.getDynamicProperty("atomic:radiation_dose") as number ?? 0;
    dose += exposure * 0.2;
    dose -= 0.05;
    if (dose < 0) dose = 0;
    entity.setDynamicProperty("atomic:radiation_dose", dose);
}

system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        const exposure = calculateExposure(player);
        player.setDynamicProperty("atomic:radiation_exposure", exposure);
        updateDose(player, exposure);
        applyRadiationEffects(player, player.dimension);
    }

    const dimensions = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
    for (const dimId of dimensions) {
        const dimension = world.getDimension(dimId);
        // players are already handled above - don't double-dip them here
        const entities = dimension.getEntities().filter(e => e.typeId !== "minecraft:player");

        for (const entity of entities) {
            const exposure = calculateExposure(entity);
            entity.setDynamicProperty("atomic:radiation_exposure", exposure);
            updateDose(entity, exposure);
            applyRadiationEffects(entity, dimension);
        }
    }
}, 20);