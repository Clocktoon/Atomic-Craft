import {world, system, Dimension} from "@minecraft/server"

//Nuclear Aftermath Script

/* Things to add: 
Local toxic rain via getting mobs around ground zero
Toxic area
Other cool nuclear shit I can't think of, just stuff you'd see after a real nuclear explsion all in a
function file */

    export function aftermath(dimensionid, radius, location, chance) {
        let time = 24000
        const dimension = world.getDimension(dimensionid);
        const ran = Math.floor(Math.random() * chance);
        if (ran === 1) {
            dimension.setWeather('rain', 24000);
            const entities = dimension.getEntities({
                location: {x: location.x, y: location.y, z: location.z},
                maxDistance: radius
            });
            const sy = system.runInterval( () => {

            if(time >= 1) {
                    time--
            // put all logic aka aftermath code below besides rain
            for(const entity of entities) {
                
                if(entity.hasTag("atomic:rad_effect") == false) {
                    entity.addTag("atomic:rad_effect")
                }
            } 
        }
        //checks if the rain is over
            if(time <= 0) {
                system.clearRun(sy)
            }
            
            }, 20)
        }
    }