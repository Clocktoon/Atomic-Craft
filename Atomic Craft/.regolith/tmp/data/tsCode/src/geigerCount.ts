import {
  world,
  system,
  ItemCustomComponent,
  ItemComponentUseEvent,
  BlockVolume,
} from "@minecraft/server";
import { getChunkRadiation } from "./chunkLoaders/chunkMorphs";

export const RadiationRegistry = new Map<string, number>([
  ["atomic:uranium_ore", 2],
  ["atomic:uranium_deepslate", 3],
]);

export const radioactiveTypes = [
            ...RadiationRegistry.keys()
        ];

        
class geiger implements ItemCustomComponent {
  onUse(event: ItemComponentUseEvent) {
    const player = event.source;
    const item = event.itemStack;
    let blockRadLevels = 0;
    

    const x = Math.floor(player.location.x / 16);
    const z = Math.floor(player.location.z / 16);

    const minX = x * 16;
    const minZ = z * 16;

    const maxX = minX + 15;
    const maxZ = minZ + 15;
    const from = {
        x: minX,
        y: player.location.y - 8,
        z: minZ,
    };

    const to = {
        x: maxX,
        y: player.location.y + 15,
        z: maxZ,
    };
    const chunkRadiation = getChunkRadiation(x, z);


    
    const blocks = player.dimension.getBlocks(
        new BlockVolume(from, to),
        {
            includeTypes: radioactiveTypes
        }
    );
    for (const location of blocks.getBlockLocationIterator()) {
      const block = player.dimension.getBlock(location);

      if (!block)
            continue

     const blockRadiation = RadiationRegistry.get(block.typeId);
        if (blockRadiation === undefined) 
            continue;
        const dx = block.location.x - player.location.x;
        const dy = block.location.y - player.location.y;
        const dz = block.location.z - player.location.z;

        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const contribution = blockRadiation / (distance + 1);

        blockRadLevels += contribution;
      
    }
    let currentBlock = `none`
    if(player.isOnGround) {
    const standingBlock = player.getBlockStandingOn()
    if(!standingBlock)
        return;
    const standingRad = RadiationRegistry.get(standingBlock.typeId)
    if(standingRad === undefined)
        return;
    currentBlock = `${standingRad}`
    }
    const playerRad = player.getDynamicProperty("atomic:radiation_level") ? player.getDynamicProperty("atomic:radiation_level") : 0
    player.sendMessage(`§gRadiation levels:
        Current chunk radiation: ${chunkRadiation},
        Blocks total radiation levels: ${blockRadLevels},
        Current standing on block level: ${currentBlock},
        Player radiation: ${playerRad}
        `)

  }
}
system.beforeEvents.startup.subscribe(({itemComponentRegistry})=> {
    itemComponentRegistry.registerCustomComponent("atomic:geiger", new geiger)
})
//TODO: Add something rather here or in another file to do the clicking cause it really shouldn't be only on press
