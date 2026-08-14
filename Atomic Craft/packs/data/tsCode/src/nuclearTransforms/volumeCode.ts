// https://tenor.com/view/far-cry-3-vass-montenegro-did-i-ever-tell-you-the-definition-of-insanity-insanity-gif-9162815073500878983
import {
  system,
  world,
  BlockVolume,
  Dimension,
  Vector3,
  Block,
  Player,
  Entity,
  TickingArea,
  TickingAreaOptions,
} from "@minecraft/server";
import { loadChunk } from "../chunkLoaders/chunky";
import { globalChunkFiller } from "../chunkLoaders/chunkFillerClass";
import { ChunkTicker } from "../chunkLoaders/ticking/chunkTickerClass";
import { updateChunkRadiation } from "../radiationSystem/chunkMorphs";
/* Inspired by gameza_src's chunk loader system, credit goes to them
gameza's code: https://github.com/gamezaSRC/ChunkLoader
link to gameza's github: https://github.com/gamezaSRC
discord: gameza_src */
system.run(() => {
  if(typeof world.getDynamicProperty("logs") !== "boolean") {
    world.setDynamicProperty("logs", false)
  }
})

export async function loadTickingAreaWithRetry(
  dimension: Dimension,
  nameId: string,
  location: Vector3,
  bounds: { from: Vector3; to: Vector3 },
  maxAttempts = 10,
  retryDelayTicks = 20
): Promise<TickingArea | null> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await new ChunkTicker(dimension, nameId).load(location, true, {
        dimension,
        from: bounds.from,
        to: bounds.to,
      });
    } catch (err) {
      if (world.getDynamicProperty("logs") === true)
        world.sendMessage(`§eTicking area ${nameId} attempt ${attempt}/${maxAttempts} failed: ${err}`);

      if (attempt === maxAttempts) return null;

      await new Promise<void>((resolve) => system.runTimeout(() => resolve(), retryDelayTicks));
    }
  }
  return null;
}
//TODO: Figure out how to make filler know when to switch to far out block effects

/**
 * manually iterates the generator across ticks, only way to stop several of them running at once
 */
async function fillGeneratorSequential(generator: Generator<void, void, unknown>, ticks: number): Promise<void> {
  return new Promise((resolve, reject) => {
    /**
     * processes a set number of yields per tick
     */
    const maxTicksPerFrame = ticks;

    const interval = system.runInterval(() => {
      let yielded = 0;
      while (yielded < maxTicksPerFrame) {
        let result;
        try {
          result = generator.next();
        } catch (err) {
          system.clearRun(interval);
          reject(err);
          return;
        }

        if (result.done) {
          system.clearRun(interval);
          resolve();
          return;
        }
        yielded++;
      }
    }, 1);
  });
}

export function chunkBoundsFromBlock(x: number, z: number, minY = 0, maxY = 255) {
  const chunkX = Math.floor(x / 16) * 16;
  const chunkZ = Math.floor(z / 16) * 16;
  return {
    from: { x: chunkX, y: minY, z: chunkZ },
    to:   { x: chunkX + 15, y: maxY, z: chunkZ + 15 },
  };
}
/**
 * @description A Function to fill the nuclear area.
 * Can be used for most if not all nuclear explosions
 * @param {string} dimensionid The dimension.id to use
 * @param {import("@minecraft/server").Vector3} location The location to use
 * @param {Block | Entity} blocky The block to use (useless)
 * @param {number} size Size of the nuclear area
 * @param {number} change Number of blocks out for when to change to lower scale damage
 */
export async function nuclearArea(dimensionid: string, location: Vector3, blocky: Block | Entity, size: number, change: number, radiationAmount: number, player?: Player, miny?: number, maxy?: number) {
  
  //Making sure tntexplode is on
  await new Promise<void>((resolve, reject) => {
    if(!world.gameRules.tntExplodes) {
      reject()
      return;
    }
    else {
      resolve()
    }
  }) 
  
  const dimension = world.getDimension(dimensionid);
  const startx = location.x - size;
  const endx = location.x + size;
  const startz = location.z - size;
  const endz = location.z + size;

  

  let chunkCount = 0;

  //loops go silly
  for (let x = startx; x <= endx; x += 16) {
    for (let z = startz; z <= endz; z += 16) {
      if(player) {
      if(player.isValid) {
        player.onScreenDisplay.setActionBar([{translate: "atomic.chunksdone.name"}, {text: `${chunkCount}`}])
      }
    }

      let currentPhase = 2
      const nameId = `NK_${x},${z},${dimension.id}`;

      const distanceFromCenter = Math.max(Math.abs(x - location.x), Math.abs(z - location.z));
      currentPhase = distanceFromCenter > change ? 1 : 2;
      const centerRad = change - 10

      let radLevel;
      if(currentPhase === 2) {
        radLevel = radiationAmount
      }
      if(currentPhase === 1) {
        radLevel = radiationAmount / 5
      }
      
      const bounds = chunkBoundsFromBlock(x, z, 0, 255);
      const tickingArea = await loadTickingAreaWithRetry(
  dimension,
  nameId,
  { x: x + 8, y: 64, z: z + 8 },
  bounds
);

      // waits until it's fully loaded, then fill
      if (tickingArea) {
        while (!tickingArea.isFullyLoaded) {
          await new Promise<void>((resolve) => {
            system.runTimeout(() => resolve(), 1);
            const chunkChecker = dimension.getBlock({ x: bounds.from.x + 8, y: 64, z: bounds.from.z + 8 })
            
            if(world.getDynamicProperty("logs") === true)
              world.sendMessage(`Chunk is loaded at ${JSON.stringify(chunkChecker?.location)}`)
          });
        }

            
        const generator = globalChunkFiller.request(
          tickingArea, 
          blocky, 
          `${nameId}_loader`,
          currentPhase,
          miny ?? undefined,
          maxy ?? undefined
        );
        await fillGeneratorSequential(generator, 50);
        if(radLevel)
        updateChunkRadiation(Math.floor(x / 16), Math.floor(z / 16), radLevel);
        if(world.getDynamicProperty("logs") === true)
          world.sendMessage(`Ticking area filled: ${nameId}`);

        world.tickingAreaManager.removeTickingArea(tickingArea)
      } else {
        if(world.getDynamicProperty("logs") === true)
          world.sendMessage(`Ticking area not returned: ${nameId}`);
      }
      chunkCount++;
    }
  }
}
