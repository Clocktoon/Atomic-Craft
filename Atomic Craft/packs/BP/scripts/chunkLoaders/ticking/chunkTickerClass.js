import { system, world, BlockVolume, Vector3, Dimension } from "@minecraft/server";
/*
okay so I want to make a class way of doing ticking areas, here is what needs to be done:
1. I need some way of keeping track of when a chunk is done? I thinl
2. I need autocomplte for this
3. for it to actually work

*/
/* Inspired by gameza_src's chunk loader system, credit goes to them
where code is from: https://github.com/gamezaSRC/ChunkLoader
link to their github: https://github.com/gamezaSRC
discord: gameza_src
 */
/**
 * @class chunkTicker
 * @description Manages ticking areas from nuclear bombs
 * @example itemUseTick.js
 * ```javascript
world.afterEvents.itemUse.subscribe((event) => {
  // Note, this chunk loading system is meant to tick one area at a time
  // it is not meant to tick more then one area at a time, if you need that rewrite it
  
    const entity = event.source;
    
    //tickingarea ID code
    const uuID = `${name}+${Math.floor(Math.random() * 101)}`;
    const nameID = `${uuID}`;

    new chunkTicker(
      entity.dimension
      nameID
    )
    .load(
      entity.location,
      nameID
    );

    if(entity.isSneaking) {
      new chunkTicker(
        entity.dimension,
        nameID)
        .unload();
      }
})
 */
class chunkTicker {
    #name;
    #tickingarea;
    #dimension;
    /**
     * Requires location and dimension to do the ticking area process
     * @param {Dimension} dimensionOf Dimension
     * @param {string} nameID name of the ticking area (will have an ID version added via script)
     */
    constructor(dimensionOf, nameID) {
        this.#name = nameID;
        this.#tickingarea = world.tickingAreaManager;
        this.#dimension = dimensionOf;
    }
    /**
     * Loads a ticking area at the set location
     * @param {Vector3} locationVec - The location of the ticking area
     * @param {Boolean} nuclear - Whether to put this in the nuclear array, defaults to false
     * @returns {Promise<void>}
     * @throws Error if the ticking area manager is full
     */
    async load(locationVec, nuclear = false) {
        if (!this.#tickingarea.hasCapacity)
            throw new Error("Ticking area manager is full");
        //TODO: MAKE THE LOCATION STUFF AND JUST ALL THE CODE WORK
        //Figure out how to have the location work, does it need to be moved to a different class? Look at chunkLoader.js for help please
        const x = Math.floor(locationVec.x / 16);
        const z = Math.floor(locationVec.z / 16);
        const location = { x: this.x * 16 + 8, y: 100, z: this.z * 16 + 8 };
        if (this.#tickingarea.hasTickingArea(nameID)) {
            this.#tickingarea.removeTickingArea(nameID);
        }
        await this.#tickingarea.createTickingArea(this.#name, {
            dimension: this.#dimension,
            from: location,
            to: location
        });
        if (nuclear === true) {
            const area = this.#tickingarea.getTickingArea().boundingBox;
            world.setDynamicProperty(this.#name, { x: area.max, z: area.max });
        }
    }
    /**
     * Unloads the ticking area
     * @throws Error if ticking area doesn't exist, doesn't have a name, or has more then one instance of it
     */
    async unload() {
        if (this.#tickingarea.hasTickingArea(this.#name)) {
            this.#tickingarea.removeTickingArea(this.#name);
        }
        else
            throw new Error("Ticking area already doesn't exist or has more then one of it");
    }
    /**
     * Unloads all ticking areas created by the pack/this tickingmanager (same thing)
     * @throws Error if there are no ticking areas from the TickingManager/The pack
     */
    unloadall() {
        const tickArray = this.#tickingarea.getAllTickingAreas();
        if (tickArray === undefined || tickArray.length == 0)
            throw new Error("There are no ticking areas to get rid of from this TickingManager!");
        this.#tickingarea.removeAllTickingAreas();
    }
}
export { chunkTicker };
