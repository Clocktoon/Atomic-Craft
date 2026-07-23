import {world, system, Dimension, Entity} from "@minecraft/server"
import { getChunkExposure } from "./mobRadiationZones";
import { applyRadiationEffects } from "./radEffect";
import { nearbyRadiationBlocks } from "./blockRadiationComp";

function calculateExposure(entity: Entity): number {

    let exposure = 0;

    exposure += getChunkExposure(entity);
    exposure += nearbyRadiationBlocks(entity)


    return exposure;
}

function updateDose(entity: Entity, exposure: number) {

    let dose =
        entity.getDynamicProperty("atomic:radiation_dose") as number ?? 0;

    dose += exposure * 0.2;

    dose -= 0.05;

    if (dose < 0)
        dose = 0;

    entity.setDynamicProperty(
        "atomic:radiation_dose",
        dose
    );
}

function updateRadiationState(entity: Entity) {

    const dose =
        entity.getDynamicProperty("atomic:radiation_dose") as number ?? 0;

    let stage = 0;

    if (dose >= 5) stage = 1;
    if (dose >= 25) stage = 2;
    if (dose >= 75) stage = 3;
    if (dose >= 150) stage = 4;
    

    // Remove all radiation effects if mostly healed
    if (dose < 5) {
        stage = 0;
        entity.removeEffect("nausea");
        entity.removeEffect("weakness");
        entity.removeEffect("poison");
        return;
    }

    switch(stage) {
        // Mild radiation sickness
        case 1:
            
            entity.addEffect("minecraft:nausea", 60, {
            amplifier: 0,
            showParticles: false
        });
        break;

        // Moderate radiation sickness
        case 2:
            entity.addEffect("minecraft:weakness", 60, {
            amplifier: 0,
            showParticles: false
        });
        entity.addEffect("minecraft:nausea", 60, {
            amplifier: 0,
            showParticles: false
        });
        break;

        // Severe radiation sickness
        case 3:
            entity.addEffect("minecraft:poison", 60, {
            amplifier: 0,
            showParticles: false
        });
        entity.addEffect("minecraft:weakness", 60, {
            amplifier: 0,
            showParticles: false
        });
        entity.addEffect("minecraft:nausea", 60, {
            amplifier: 0,
            showParticles: false
        });
        break;

        //Pretty much dead T_T
        case 4:
            entity.addEffect("minecraft:poison", 60, {
            amplifier: 0,
            showParticles: false
        });
        entity.addEffect("minecraft:weakness", 60, {
            amplifier: 0,
            showParticles: false
        });
        entity.addEffect("minecraft:nausea", 60, {
            amplifier: 0,
            showParticles: false
        });
        if (dose >= 100) {
        entity.applyDamage(1);
    }

    if (dose >= 200) {
        entity.applyDamage(2);
    }

    if (dose >= 400) {
        entity.applyDamage(4);
    }
    break;

    }

}

system.runInterval(() => {

    for (const player of world.getAllPlayers()) {

        const exposure = calculateExposure(player);

        player.setDynamicProperty(
            "atomic:radiation_exposure",
            exposure
        );

        updateDose(player, exposure);

        updateRadiationState(player);

    }
    const dimensions = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
    for(const dimId of dimensions) {
        const dimension = world.getDimension(dimId)
        const entities = dimension.getEntities()
        
        for(const entity of entities) {
            const exposure = calculateExposure(entity);

        entity.setDynamicProperty(
            "atomic:radiation_exposure",
            exposure
        );

        updateDose(entity, exposure);

        updateRadiationState(entity);
        }
    }

}, 20);
