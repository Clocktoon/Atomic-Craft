import {
  system,
  world,
  BlockVolume,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  CustomComponentParameters,
  Block,
  Dimension,
  Vector3,
  BlockPermutation,
  EntityDamageCause,
} from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater";
import { chunkBoundsFromBlock, fillGeneratorSequential } from "../nuclearTransforms/volumeCode";
import { loadTickingAreaWithRetry } from "../nuclearTransforms/volumeCode";
import { MessageBox } from "@minecraft/server-ui";


//Re used alot from nuclearArea since well it just works for the VOID part of the well.. void explosion
async function voidCrater(block: Block, dimension: Dimension, maxDepth: number, maxHeight: number) {
  const location = block.location;

  const startx = location.x - 200;
  const endx = location.x + 200;
  const startz = location.z - 200;
  const endz = location.z + 200;

  //INSANEEEEEEEEEE
  for (let x = startx; x <= endx; x += 16) {
    for (let z = startz; z <= endz; z += 16) {
      const nameId = `VOID_${x},${z},${dimension.id}`;

      const bounds = chunkBoundsFromBlock(x, z, 0, 255);
      const tickingArea = await loadTickingAreaWithRetry(
        dimension,
        nameId,
        { x: x + 8, y: 64, z: z + 8 },
        bounds,
      );

      // waits until it's fully loaded, then fill
      if (tickingArea) {
        while (!tickingArea.isFullyLoaded) {
          await new Promise<void>((resolve) => {
            system.runTimeout(() => resolve(), 1);
            const chunkChecker = dimension.getBlock({
              x: bounds.from.x + 8,
              y: 64,
              z: bounds.from.z + 8,
            });

            if (world.getDynamicProperty("logs") === true)
              world.sendMessage(
                `Chunk is loaded at ${JSON.stringify(chunkChecker?.location)}`,
              );
          });
        }

        const bbox = tickingArea.boundingBox;
      
        function* fillVoid() {

          for(let y = maxHeight; y > maxDepth; y--) {
            const min: Vector3 = {
            x: bbox.min.x,
            y: y - 10,
            z: bbox.min.z,
          };
          const max: Vector3 = {
            x: bbox.max.x,
            y: y,
            z: bbox.max.z,
          };
          yield

          dimension.fillBlocks(new BlockVolume(min,max), "minecraft:air", {
            blockFilter: {
              excludeTypes: ["minecraft:bedrock","minecraft:air"]
            },
            ignoreChunkBoundErrors: true
          });
          yield;
      }
      yield;
        }

       await fillGeneratorSequential(fillVoid(),50,)
       if (world.getDynamicProperty("logs") === true)
        world.sendMessage("Just before ticking area remove")
       world.tickingAreaManager.removeTickingArea(tickingArea)
       if (world.getDynamicProperty("logs") === true)
        world.sendMessage("ticking area removed")
      } else {
        if (world.getDynamicProperty("logs") === true)
          world.sendMessage(`Ticking area not returned: ${nameId}`);
      }
    }
  }
}

class VoidBomb implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }
  onPlayerInteract(event: BlockComponentPlayerInteractEvent) {
    const block = event.block;
    const dimension = event.dimension;
    const player = event.player
    
    if(!player)
      return;

    if (!world.gameRules.tntExplodes) return;
    
    const confirmForm = new MessageBox(player,{translate: "atomic.void.menu.name"})
    confirmForm.button1({translate: "atomic.void.menu.yes.name"})
    .button2({translate: "atomic.void.menu.no.name"})
    .show().then((rep) => {
      
      if(rep.selection === 1) {
        const location = block.location
      dimension.spawnParticle("atomic:void_center", {x: block.location.x, y: block.location.y + 1, z: block.location.z})
      block.setType("minecraft:air")
      const entities = dimension.getEntities({location: location, minDistance: 1, maxDistance: 30, excludeTypes: ["minecraft:player"]})
      const players = dimension.getPlayers({location: location, minDistance: 1, maxDistance: 30})
      for(const entity of entities) {
        entity.addEffect("minecraft:levitation", 40)
      }
      for(const playerEffect of players) {
        playerEffect.addEffect("minecraft:levitation", 20),
        playerEffect.applyDamage(4, {cause: EntityDamageCause.void})
      }
      voidCrater(block, dimension, block.y - 70, block.y + 100);
      }
  
  })

    
    
  }
}

system.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("atomic:void", new VoidBomb);
})
