import { world, system } from "@minecraft/server";


export async function loadChunk(location, name, dimensionid) {
  const dimension = world.getDimension(dimensionid);
  if (world.tickingAreaManager.hasTickingArea(name)) {
    world.tickingAreaManager.removeTickingArea(name);
  }

  await world.tickingAreaManager.createTickingArea(name, {
    dimension: dimension,
    from: location,
    to: location,
  });
}