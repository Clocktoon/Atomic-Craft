import { world, } from "@minecraft/server";
/*
okay so I want to make a class way of doing ticking areas, here is what needs to be done:
1. I need some way of keeping track of when a chunk is done? I think
2. for it to actually work

*/
/* Inspired by gameza_src's chunk loader system and Coolbep's, credit goes to them
gameza's code: https://github.com/gamezaSRC/ChunkLoader
link to gameza's github: https://github.com/gamezaSRC
discord: gameza_src
website that Coolbep's code is on: https://bedrock-resources.vercel.app/ (can't link the exact thing)
 */
export let requests = [];
/**
 * @class chunkTicker
 * @description Manages ticking areas for the bombs of glory addon
 * @example itemUseTick.js
 * ```javascript
world.afterEvents.itemUse.subscribe((event) => {
  // Note, this chunk loading system is meant to tick one area at a time
  // it is not meant to tick more then one area at a time, if you need that rewrite it
  
    const entity = event.source;
    
    //tickingarea ID code
    const uuID = `${name}+${Math.floor(Math.random() * 101)}`;
    const nameID = `${uuID}`;

    x = Math.floor(entity.location.x / 16);
    z = Math.floor(entity.location.z / 16);
    location = { x: this.x * 16 + 8, y: 100, z: this.z * 16 + 8 }

    new chunkTicker(
      entity.dimension
      nameID
    )
    .load(
      location,
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
class ChunkTicker {
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
     * @param {import("@minecraft/server").TickingAreaOptions} options options for the ticking area
     * @returns {Promise<void>}
     * @throws Error if the ticking area manager is full
     */
    async load(locationVec, nuclear = false, options) {
        if (!this.#tickingarea.hasCapacity(options))
            throw new Error("Ticking area manager is full");
        //TODO: MAKE THE LOCATION STUFF AND JUST ALL THE CODE WORK
        //Figure out how to have the location work, does it need to be moved to a different class? Look at chunkLoader.js for help please
        const location = locationVec;
        if (this.#tickingarea.hasTickingArea(this.#name)) {
            this.#tickingarea.removeTickingArea(this.#name);
        }
        await this.#tickingarea.createTickingArea(this.#name, options);
        if (nuclear === true) {
            //WIP, will probably need changing, please look over
            //Look into using this https://stirante.com/script/server/2.7.0/classes/TickingAreaManager.html#getalltickingareas
            const key = `NK_${locationVec.x}${locationVec.z}${options.dimension.id}`;
            const savedVec = {
                x: options.from.x,
                x2: options.to.x,
                z: options.from.z,
                z2: options.to.z,
            };
            //Current idea, rather nested area or keep it like this and see if could use this instead
            const tickingArea = this.#tickingarea.getTickingArea(this.#name);
            if (tickingArea) {
                requests.push(tickingArea);
            }
            world.setDynamicProperty(key, {
                x: options.from.x,
                y: locationVec.y,
                z: options.from.z,
            });
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
            throw new Error("Ticking area in already doesn't exist or has more then one of it");
    }
    /**
     * Unloads all ticking areas created by the pack tickingmanager (same thing)
     * @throws Error if there are no ticking areas from the The pack tickingmanager
     */
    unloadall() {
        const tickArray = this.#tickingarea.getAllTickingAreas();
        if (tickArray === undefined || tickArray.length == 0)
            throw new Error("There are no ticking areas to get rid of from this TickingManager!");
        this.#tickingarea.removeAllTickingAreas();
    }
}
export { ChunkTicker };
