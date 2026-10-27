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
import { globalChunkFiller, runJobAsync, surfaceBandY, Phase } from "../chunkLoaders/chunkFillerClass";
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

  const chunkCoords: { x: number; z: number }[] = [];
  for (let x = location.x - size; x <= location.x + size; x += 16) {
    for (let z = location.z - size; z <= location.z + size; z += 16) {
      chunkCoords.push({ x, z });
    }
  }

  const distFromCenter = (x: number, z: number) =>
    Math.max(
      Math.abs(x - location.x),
      Math.abs(z - location.z),
    );

  chunkCoords.sort(
    (a, b) => distFromCenter(a.x, a.z) - distFromCenter(b.x, b.z),
  );


  const loadFor = (coord: { x: number; z: number }) => {
    const nameId = `NK_${coord.x},${coord.z},${dimension.id}`;
    const bounds = chunkBoundsFromBlock(coord.x, coord.z, 0, 255);
    return loadTickingAreaWithRetry(
      dimension,
      nameId,
      { x: coord.x + 8, y: 64, z: coord.z + 8 },
      bounds,
    );
  };

  const fillChunk = async (
    coord: { x: number; z: number },
    tickingArea: TickingArea,
  ) => {
    const nameId = `NK_${coord.x},${coord.z},${dimension.id}`;
    const logs = world.getDynamicProperty("logs") === true;

    while (!tickingArea.isFullyLoaded) {
      await new Promise<void>((resolve) => system.runTimeout(() => resolve(), 1));
    }

    const distanceFromCenter = Math.max(
      Math.abs(coord.x - location.x),
      Math.abs(coord.z - location.z),
    );
    const currentPhase: Phase = distanceFromCenter > change ? 1 : 2;
    const radLevel = currentPhase === 2 ? radiationAmount : radiationAmount / 5;

    let fillMinY = miny;
    let fillMaxY = maxy;
    if (currentPhase === 1 && miny === undefined && maxy === undefined) {
      const band = surfaceBandY(dimension, coord.x + 8, coord.z + 8);
      fillMinY = band.minY;
      fillMaxY = band.maxY;
    }

    const generator = globalChunkFiller.request(
      tickingArea,
      blocky,
      `${nameId}_loader`,
      currentPhase,
      fillMinY,
      fillMaxY,
    );
    await runJobAsync(generator);

    updateChunkRadiation(Math.floor(coord.x / 16), Math.floor(coord.z / 16), radLevel);
    if (logs) world.sendMessage(`Ticking area filled: ${nameId}`);

    world.tickingAreaManager.removeTickingArea(tickingArea);
  };

  let chunkCount = 0;
  let nextAreaPromise =
    chunkCoords.length > 0 ? loadFor(chunkCoords[0]) : null;

  for (let i = 0; i < chunkCoords.length; i++) {
    const coord = chunkCoords[i];
    const tickingArea = await nextAreaPromise;

    if (i + 1 < chunkCoords.length) {
      nextAreaPromise = loadFor(chunkCoords[i + 1]);
    }

    if (player?.isValid) {
      player.onScreenDisplay.setActionBar([
        { translate: "atomic.chunksdone.name" },
        { text: `${chunkCount}` },
      ]);
    }

    if (tickingArea) {
      await fillChunk(coord, tickingArea);
    } else {
      const retryArea = await loadFor(coord);
      if (retryArea) {
        await fillChunk(coord, retryArea);
      } else if (world.getDynamicProperty("logs") === true) {
        world.sendMessage(
          `Ticking area not returned after retry: NK_${coord.x},${coord.z},${dimension.id}`,
        );
      }
    }

    chunkCount++;
  }
}