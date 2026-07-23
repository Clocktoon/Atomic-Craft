/**
 * Radiation effects system - applies effects based on radiation level
 * Works with mobRadiationZones.ts which tracks radiation_level as dynamic property
 */
export function applyRadiationEffects(entity, dimension) {
    if (!entity.isValid)
        return;
    const radiationLevel = entity.getDynamicProperty("atomic:radiation_dose") || 0;
    if (radiationLevel === 0)
        return;
    // radiation intensity (0-10 scale)
    const shouldHaveWeakness = radiationLevel >= 2;
    const shouldHaveNausea = radiationLevel >= 3;
    const shouldHaveFatigue = radiationLevel >= 5;
    const shouldHaveSlowness = radiationLevel >= 5;
    const shouldHavePoison = radiationLevel >= 7;
    const shouldHaveBlindness = radiationLevel >= 8;
    // Apply effects
    if (shouldHaveWeakness) {
        entity.addEffect("weakness", 20000000, { amplifier: 1, showParticles: false });
    }
    else {
        entity.removeEffect("weakness");
    }
    if (shouldHaveNausea) {
        entity.addEffect("nausea", 20000000, { amplifier: 1, showParticles: false });
    }
    else {
        entity.removeEffect("nausea");
    }
    if (shouldHaveFatigue) {
        entity.addEffect("mining_fatigue", 20000000, { amplifier: 2, showParticles: false });
    }
    else {
        entity.removeEffect("mining_fatigue");
    }
    if (shouldHaveSlowness) {
        entity.addEffect("slowness", 20000000, { amplifier: 1, showParticles: false });
    }
    else {
        entity.removeEffect("slowness");
    }
    if (shouldHavePoison) {
        entity.addEffect("poison", 20000000, { amplifier: 1, showParticles: false });
    }
    else {
        entity.removeEffect("poison");
    }
    if (shouldHaveBlindness) {
        entity.addEffect("blindness", 20000000, { amplifier: 1, showParticles: false });
    }
    else {
        entity.removeEffect("blindness");
    }
}
//# sourceMappingURL=radEffect.js.map