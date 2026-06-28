import { world, system } from "@minecraft/server";
/**
 * Load chunks thingy
 * @param {import("@minecraft/server").Vector3} location location
 * @param {*} dimensionid
 */
export async function loadChunk(location, dimensionid) {
    const dimension = world.getDimension(dimensionid);
    if (world.tickingAreaManager.hasTickingArea("nkarea")) {
        world.tickingAreaManager.removeTickingArea("nkarea");
        console.warn("ticking area deleted");
        world.sendMessage("Ticking area removed!");
    }
    await world.tickingAreaManager.createTickingArea("nkarea", {
        dimension: dimension,
        from: location,
        to: location,
    });
}
//# sourceMappingURL=chunky.js.map