import { world, system, Dimension, } from "@minecraft/server";

// Radiation effect script

//TODO:Add DynamicProperty system that has levels of radiation for player



const runny = system.runInterval( () => {


    /**
     * Function to apply the radiation effect to players
     */
    function radiationPlayer() {
       const players = world.getAllPlayers()
       for(const player of players) {
        const getRadi = player.getDynamicProperty("radiation")
        if(getRadi == undefined) {
            console.warn(player.name + " has no radiation")
        }
        else if(typeof getRadi === "number" && getRadi >= 2) {

        }

       }
       
    }

    const dimensionIds = ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"];
    for (const dimId of dimensionIds) {
    const dimension = world.getDimension(dimId)
    const entities = dimension.getEntities({ tags: ["atomic:rad_effect"] })

    for (const entity of entities) {
        
        if(!entity.isValid)
            return;


        // if(entity.typeId == "minecraft:player") {
        //     entity.runCommand("title @s actionbar §cYou feel off...")
        // }

       const sys1 = system.runTimeout(() => {
            if(entity.isValid && !entity.hasTag("atomic:rad_effect")) {
                for(const effect of entity.getEffects()) {
                entity.removeEffect(effect.typeId)
            }
            system.clearRun(sys1)
            }
            entity.addEffect("weakness", 20000000, { amplifier: 1, showParticles: false });
            entity.applyDamage(2);
        }, 4800);

       const sys2 = system.runTimeout(() => {
            system.runInterval( () => {
                if(entity.isValid && !entity.hasTag("atomic:rad_effect")) {
                for(const effect of entity.getEffects()) {
                entity.removeEffect(effect.typeId)
            }
            system.clearRun(sys2)
            }
            entity.addEffect("nausea", 20000000, { amplifier: 1, showParticles: false });
        }, )
        }, 8400);

        const sys3 = system.runTimeout(() => {
            system.runInterval( () => {
                if(entity.isValid && !entity.hasTag("atomic:rad_effect")) {
                for(const effect of entity.getEffects()) {
                entity.removeEffect(effect.typeId)
            }
            system.clearRun(sys3)
            }
            entity.addEffect("mining_fatigue", 20000000, { amplifier: 2, showParticles: false });
            entity.addEffect("slowness", 20000000, { amplifier: 1, showParticles: false})
        }, 20)
        }, 15600);


       const sys4 = system.runTimeout(() => {
            if(entity.isValid && !entity.hasTag("atomic:rad_effect")) {
                for(const effect of entity.getEffects()) {
                entity.removeEffect(effect.typeId)
            }
            system.clearRun(sys4);
            }
            entity.addEffect("poison", 20000000, { amplifier: 1, showParticles: false });
            entity.addEffect("blindness", 20000000, {amplifier: 1, showParticles: false} );
        }, 19200);


        //Backup for getting rid of the effect (hopefully q-q)
        if(entity.isValid && !entity.hasTag("atomic:rad_effect"))
        {
            for(const effect of entity.getEffects()) {
                entity.removeEffect(effect.typeId)
            }
            entity.addEffect("regeneration", 10, {
                showParticles: false
            })
            system.clearRun(sys1)
            system.clearRun(sys2)
            system.clearRun(sys3)
            system.clearRun(sys4)
        }
        
    }
};

}, 600)
