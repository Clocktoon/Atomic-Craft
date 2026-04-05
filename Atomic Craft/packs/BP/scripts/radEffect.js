import { world, system, Dimension, } from "@minecraft/server";

// Radiation effect script

//TODO:Add DynamicProperty system that has levels of radiation for player

world.setDynamicProperty("")

const runny = system.runInterval( () => {

const dimensionIds = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
for (const dimId of dimensionIds) {
    const dimension = world.getDimension(dimId)
    const entities = dimension.getEntities({ tags: ["atomic:rad_effect"] })

function applyRadiationEffect() {

    for (const entity of entities) {
        
        if(entity.typeId == "minecraft:player") {
            entity.runCommand("title @s actionbar §cYou feel off...")
        }
        system.runTimeout(() => {
            entity.addEffect("weakness", 20000000, { amplifier: 1, showParticles: false });
            entity.applyDamage(2);
        }, 4800);

        system.runTimeout(() => {
            system.runInterval( () => {
            entity.addEffect("nausea", 20000000, { amplifier: 1, showParticles: false });
        }, )
        }, 8400);

         system.runTimeout(() => {
            system.runInterval( () => {
            entity.addEffect("mining_fatigue", 20000000, { amplifier: 2, showParticles: false });
            entity.addEffect("slowness", 20000000, { amplifier: 1, showParticles: false})
        }, 20)
        }, 15600);


        system.runTimeout(() => {
            entity.addEffect("poison", 20000000, { amplifier: 1, showParticles: false });
            entity.addEffect("blindness", 20000000, {amplifier: 1, showParticles: false} );
        }, 19200);
        
    }
};
for (const entity of entities) {
    
    if(entity.isValid && entity.hasTag("atomic:rad_effect")) {
    applyRadiationEffect();
    }
}
}
}, 600)



world.afterEvents.itemUse.subscribe( (event) => {
    const item = event.itemStack
    const entity = event.source
    
    if(item.typeId == "minecraft:milk_bucket" && entity.hasTag("atomic:rad_effect")) {
            entity.removeTag("atomic:rad_effect")
    }
})