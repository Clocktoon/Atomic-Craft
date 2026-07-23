//TODO: General comp that can be used by any block that has radiation
import { BlockVolume } from "@minecraft/server";
import { RadiationRegistry, radioactiveTypes } from "../geigerCount";
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
export function nearbyRadiationBlocks(entity) {
    const x = entity.location.x;
    const z = entity.location.z;
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
    const blocks = entity.dimension.getBlocks(new BlockVolume(from, to), {
        includeTypes: radioactiveTypes
    });
    let exposure = 0;
    for (const location of blocks.getBlockLocationIterator()) {
        const block = entity.dimension.getBlock(location);
        if (!block)
            continue;
        const blockRadiation = RadiationRegistry.get(block.typeId);
        if (blockRadiation === undefined)
            continue;
        const dx = block.location.x - entity.location.x;
        const dy = block.location.y - entity.location.y;
        const dz = block.location.z - entity.location.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const contribution = blockRadiation / (distance + 1);
        exposure += contribution;
    }
    return exposure;
}
//# sourceMappingURL=blockRadiationComp.js.map