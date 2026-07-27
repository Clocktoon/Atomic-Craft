import {
  world,
  system,
  ItemCustomComponent,
  ItemComponentUseEvent,
  BlockVolume,
} from "@minecraft/server";
import { getChunkRadiation } from "./chunkLoaders/chunkMorphs";
import { RadiationRegistry, radioactiveTypes } from "./radiationSystem/radiationRegistery";
import { scanNearbyRadiation } from "./radiationSystem/radiationScanBlocks";
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
        x: player.location.x - 5,
        y: player.location.y - 10,
        z: player.location.z - 5,
    };

    const to = {
        x: player.location.x + 5,
        y: player.location.y + 10,
        z: player.location.z + 5,
    };
    
    const chunkRadiation = getChunkRadiation(x, z);


    
    blockRadLevels = scanNearbyRadiation(
        player.dimension,
        player.location,
        new BlockVolume(from, to)
    );
    let currentBlock = `none`
    if (player.isOnGround) {
    const standingBlock = player.getBlockStandingOn();
    if (standingBlock) {
        const standingRad = RadiationRegistry.get(standingBlock.typeId);
        if (standingRad !== undefined) {
            currentBlock = `${standingRad}`;
        }
    }
}
    const playerRad = player.getDynamicProperty("atomic:radiation_dose") ? player.getDynamicProperty("atomic:radiation_dose") : 0
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
