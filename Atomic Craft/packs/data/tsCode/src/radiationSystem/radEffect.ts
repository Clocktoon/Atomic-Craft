import { Entity, Dimension } from "@minecraft/server";

/**
 * Radiation effects system - single source of truth for dose -> effect mapping.
 * Dose lives on "atomic:radiation_dose", written by radiationManger.ts.
 */
export function applyRadiationEffects(entity: Entity, dimension: Dimension) {
    if (!entity.isValid) return;

    const dose = entity.getDynamicProperty("atomic:radiation_dose") as number ?? 0;

    // Fully recovered - strip everything and bail
    if (dose < 5) {
        entity.removeEffect("nausea");
        entity.removeEffect("weakness");
        entity.removeEffect("mining_fatigue");
        entity.removeEffect("slowness");
        entity.removeEffect("poison");
        entity.removeEffect("blindness");
        return;
    }

    applyOrRemove(entity, "nausea", dose >= 5, 0);
    applyOrRemove(entity, "weakness", dose >= 25, 0);
    applyOrRemove(entity, "mining_fatigue", dose >= 50, 1);
    applyOrRemove(entity, "slowness", dose >= 75, 0);
    applyOrRemove(entity, "poison", dose >= 75, 0);
    applyOrRemove(entity, "blindness", dose >= 150, 0);

    // Escalating damage the deeper into radiation sickness - else-if so it
    // doesn't stack (old code applied 1+2+4=7 dmg/tick once dose hit 400)
    if (dose >= 400) {
        entity.applyDamage(4);
    } else if (dose >= 200) {
        entity.applyDamage(2);
    } else if (dose >= 150) {
        entity.applyDamage(1);
    }
}

function applyOrRemove(entity: Entity, effect: string, should: boolean, amplifier: number) {
    if (should) {
        entity.addEffect(effect, 60, { amplifier, showParticles: false });
    } else {
        entity.removeEffect(effect);
    }
}