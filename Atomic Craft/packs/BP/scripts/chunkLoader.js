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
    
    new chunkTicker(
      entity.location,
      entity.dimension
    )
    .load(
      entity.location,
      "temp:tickingareaname"
    );

    if(entity.isSneaking) {
      new chunkTicker(
        entity.location, 
        entity.dimension)
        .unload("temp:tickingareaname");
      }
})
 */
class chunkTicker {
  /**
   * Requires location and dimension to do the ticking area process
   * @param {Vector3} ticklocation location to ticking area
   * @param {Dimension} dimensioni Dimension
   */
  constructor(ticklocation, dimensioni) {
    this.tickingarea = world.tickingAreaManager;
    /**@type {Vector3} */
    this.ticklocation = ticklocation
    /**@type {Dimension} */
    this.dimensioni = dimensioni
    /**@type {string} */
    this.name = name
  }
  /**
   * Loads a ticking area at the set location
   * @param {Vector3} location - The location of the ticking area
   * @param {string} name - The name of the ticking area
   * @returns {Promise<void>}
   * @throws Error if the ticking area manager is full or if the ticking area already exist.
   */
  async load(location, name) {
    if (!this.tickingarea.hasCapacity)
      throw new Error("Ticking area manager is full");
    if(this.tickingarea.hasTickingArea(name))
      throw new Error("Ticking area already exist")
    else {
      await this.tickingarea.createTickingArea(name, {
        dimension: this.dimensioni,
        from: this.location,
        to: this.location

      });
    }
  }
  /**
   * Unloads the ticking area
   * @param {string} name - The name of the ticking area
   * @throws Error if ticking area doesn't exist, doesn't have a name, or has more then one instance of it
   */
  async unload(name) {
        if(this.tickingarea.hasTickingArea(name)) {
            this.tickingarea.removeTickingArea(name)
        }
        else 
          throw new Error("Ticking area already doesn't exist or has more then one of it")
  }
  /**
   * Unloads all ticking areas created by the pack/this tickingmanager (same thing)
   * @throws Error if there are no ticking areas from the TickingManager/The pack
   */
  unloadall() {
    const tickArray = this.tickingarea.getAllTickingAreas()
    if(tickArray === undefined ||tickArray.length == 0)
        throw new Error("There are no ticking areas to get rid of from this TickingManager!")
    this.tickingarea.removeAllTickingAreas()
  }
  
}

export {chunkTicker}