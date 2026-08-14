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
} from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater";
import { chunkBoundsFromBlock } from "../nuclearTransforms/volumeCode";
import { loadTickingAreaWithRetry } from "../nuclearTransforms/volumeCode";

//Re used alot from nuclearArea since well it just works for the VOID part of the well.. void explosion
async function voidCrater(block: Block, dimension: Dimension) {
  const location = block.location;

  const startx = location.x - 500;
  const endx = location.x + 500;
  const startz = location.z - 500;
  const endz = location.z + 500;

  //loops go silly
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

        const min: Vector3 = {
          x: bbox.min.x,
          y: block.y - 100,
          z: bbox.min.z,
        };
        const max: Vector3 = {
          x: bbox.max.x,
          y: block.y + 100,
          z: bbox.max.z,
        };

        function* fillVoid() {
        const blocks = dimension.getBlocks(new BlockVolume(min,max), {excludeTypes: [
          "minecraft:bedrock",
          "minecraft:air"
         ]})

         for(const locationOfBlock of blocks.getBlockLocationIterator()) {
            const block = dimension.getBlock(locationOfBlock)
            if(!block)
              continue;

            block.setPermutation(BlockPermutation.resolve("minecraft:air"))
            yield;
         }
        }
        system.runJob(fillVoid());
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

    if (!world.gameRules.tntExplodes) return;

    voidCrater(block, dimension);
    
  }
}

system.beforeEvents.startup.subscribe((event) => {
  event.blockComponentRegistry.registerCustomComponent("atomic:void", new VoidBomb);
})
