/**
 * Radiation effects system - single source of truth for dose -> effect mapping.
 * Dose lives on "atomic:radiation_dose", written by radiationManger.ts.
 */
export function applyRadiationEffects(entity, dimension) {
    if (!entity.isValid)
        return;
    const dose = entity.getDynamicProperty("atomic:radiation_dose") ?? 0;
    // Fully recovered
    if (dose < 10) {
        entity.removeEffect("nausea");
        entity.removeEffect("weakness");
        entity.removeEffect("mining_fatigue");
        entity.removeEffect("slowness");
        entity.removeEffect("poison");
        entity.removeEffect("blindness");
        return;
    }
    applyOrRemove(entity, "nausea", dose >= 10, 0);
    applyOrRemove(entity, "weakness", dose >= 25, 0);
    applyOrRemove(entity, "mining_fatigue", dose >= 50, 1);
    applyOrRemove(entity, "slowness", dose >= 75, 0);
    applyOrRemove(entity, "poison", dose >= 75, 0);
    applyOrRemove(entity, "blindness", dose >= 150, 0);
    applyOrRemove(entity, "wither", dose >= 500, 3);
    // Escalating damage if deeper into radiation sickness
    if (dose >= 400) {
        entity.applyDamage(4);
    }
    else if (dose >= 200) {
        entity.applyDamage(2);
    }
    else if (dose >= 150) {
        entity.applyDamage(1);
    }
    //Other effects :P
    if (dose >= 160 && entity.typeId === "minecraft:cow") {
        const location = entity.getBlockStandingOn()?.location;
        if (location) {
            entity.remove();
            dimension.spawnEntity("minecraft:mooshroom", { x: location.x, y: location.y + 1, z: location.z });
        }
    }
}
function applyOrRemove(entity, effect, should, amplifier) {
    if (should) {
        entity.addEffect(effect, 60, { amplifier, showParticles: false });
    }
    else {
        entity.removeEffect(effect);
    }
}
//# sourceMappingURL=radEffect.js.map