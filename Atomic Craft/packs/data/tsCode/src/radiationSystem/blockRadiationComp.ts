//TODO: General comp that can be used by any block that has radiation
import {BlockComponentTickEvent, BlockCustomComponent, CustomComponentParameters, Entity, system, BlockVolume} from "@minecraft/server"
import { RadiationRegistry, radioactiveTypes } from "./radiationRegistery"
import {scanNearbyRadiation} from "./radiationScanBlocks"

// interface Options {
//     strength: number;
//     radius: number
// }
// //Make sure the block that uses this has the tick comp
// class Radiation implements BlockCustomComponent {
//     constructor() {
//         this.onTick = this.onTick.bind(this)
//     }
//     onTick(event: BlockComponentTickEvent, p: CustomComponentParameters) {
//         const parms = p.params as Options
//         const dim = event.dimension
//         const block = event.block

//         const entitys = dim.getentitys({location: block.location, maxDistance: parms.radius})
//         for(const entity of entitys) {

//             const dx = entity.location.x - block.center().x;
//             const dy = entity.location.y - block.center().y;
//             const dz = entity.location.z - block.center().z;

//             const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

//             const radiation = parms.strength / (distance + 1);
//             entity.setDynamicProperty("atomic:radiation_level", radiation)
//         }
//         const entities = dim.getEntities({location: block.location, maxDistance: parms.radius})
        
//         for(const entity of entities) {
//             const dx = entity.location.x - block.center().x;
//             const dy = entity.location.y - block.center().y;
//             const dz = entity.location.z - block.center().z;

//             const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

//             const radiation = parms.strength / (distance + 1);
//             entity.setDynamicProperty("atomic:radiation_level", radiation)
//         }
//     }
// }
// system.beforeEvents.startup.subscribe(({blockComponentRegistry}) => {
//     blockComponentRegistry.registerCustomComponent("atomic:radiation", new Radiation)
// })

export function nearbyRadiationBlocks(entity: Entity): number {
    
    const x = entity.location.x
    const z = entity.location.z

    const from = {
        x: x - 5,
        y: entity.location.y - 10,
        z: z - 5,
    };

    const to = {
        x: x + 5,
        y: entity.location.y + 10,
        z: z + 5,
    };
    return scanNearbyRadiation(
        entity.dimension,
        entity.location,
        new BlockVolume(from, to)
    );
}