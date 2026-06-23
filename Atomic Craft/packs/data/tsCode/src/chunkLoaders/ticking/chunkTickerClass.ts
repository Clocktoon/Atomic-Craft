import {
  system,
  world,
  BlockVolume,
  Vector3,
  Dimension,
  TickingAreaOptions,
  TickingArea,
} from "@minecraft/server";


/*Heavily inspired by gameza_src's chunk loader system and Coolbep's, credit goes to them
gameza's code: https://github.com/gamezaSRC/ChunkLoader
link to gameza's github: https://github.com/gamezaSRC
discord: gameza_src
website that Coolbep's code is on: https://bedrock-resources.vercel.app/ (can't link the exact thing)
 */


interface tickingAreaQueue {
  tickingArea: TickingArea | null,
  tickingOptions: TickingAreaOptions | null

}

function nameMaker(x: number, z: number, dimension: Dimension) {
  return `NK_${x},${z},${dimension.id}`;
}

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
  constructor(dimensionOf: Dimension, nameID: string) {
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

  async load(
    locationVec: Vector3,
    nuclear = false,
    options: TickingAreaOptions,
    queue: TickingAreaOptions[]
  ): Promise<TickingArea> {

    
    if (!this.#tickingarea.hasCapacity(options)) {
        queue.push(options)
      throw new Error("Ticking area manager became full");
    }

    //TODO: MAKE THE LOCATION STUFF AND JUST ALL THE CODE WORK
    //Figure out how to have the location work, does it need to be moved to a different class? Look at chunkLoader.js for help please


    if (this.#tickingarea.hasTickingArea(this.#name)) {
      world.sendMessage("ticking area " + this.#name + " is loaded")
    }
    try {
    await this.#tickingarea.createTickingArea(this.#name, options);
    world.sendMessage("the §3ticking area " + this.#name + " has been created")
    } catch(err) {
      world.sendMessage(`ticking area creation §cfailed§r, name ${this.#name}`)
      throw err
    }

    system.runInterval( () => {
      queue = queue.filter(async are => {
        const tickingOptions = are
        if(world.tickingAreaManager.hasCapacity(tickingOptions)) {
          const namdeGen = nameMaker(tickingOptions.from.x, tickingOptions.to.z, tickingOptions.dimension)
          const nameUse = `${namdeGen}`
         const ticking = await world.tickingAreaManager.createTickingArea(
            nameUse,
            tickingOptions
          )
          return ticking
        }
      })
    })
      //WIP, will probably need changing, please look over
      //Look into using this https://stirante.com/script/server/2.7.0/classes/TickingAreaManager.html#getalltickingareas
      const key = `NK_${locationVec.x}${locationVec.z}${options.dimension.id}`;

      
      const tickingArea = this.#tickingarea.getTickingArea(this.#name);
        if (!tickingArea) {
          throw new Error(`TickingArea ${this.#name} not found after creation`)
        } else {
          world.sendMessage(`§lTickingArea ${this.#name} created, bbox=${JSON.stringify(tickingArea.boundingBox)}`);
        }

      return tickingArea;
    
  }
  /**
   * Unloads the ticking area
   * @throws Error if ticking area doesn't exist, doesn't have a name, or has more then one instance of it
   */
  async unload() {
    if (this.#tickingarea.hasTickingArea(this.#name)) {
      this.#tickingarea.removeTickingArea(this.#name);
    } else
      throw new Error(
        "§4Ticking area in already doesn't exist or has more then one of it",
      );
  }
  /**
   * Unloads all ticking areas created by the pack tickingmanager (same thing)
   * @throws Error if there are no ticking areas from the The pack tickingmanager
   */
  unloadall() {
    const tickArray = this.#tickingarea.getAllTickingAreas();
    if (tickArray === undefined || tickArray.length == 0)
      throw new Error(
        "§4There are no ticking areas to get rid of from this TickingManager!",
      );
    this.#tickingarea.removeAllTickingAreas();
  }
}

export { ChunkTicker };
