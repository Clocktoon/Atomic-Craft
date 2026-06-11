import { Block, BlockType, BlockTypes, BlockVolume, TickingArea, Vector3, world } from "@minecraft/server";

export interface ChunkFillRequest {
  area: TickingArea;
  block: Block;
  name: string;
  minY?: number;
  maxY?: number;
}

export type pha = 1 | 2

/**
 * Does the chunk filling for the nuclear bombs
 *
 * @class ChunkFiller
 * @typedef {ChunkFiller}
 */
class ChunkFiller {
  requests: ChunkFillRequest[] = [];
  #currentGenerator?: Generator<void, void, unknown>;

  enqueue(request: ChunkFillRequest) {
    this.requests.push(request);
  }

  request(
    area: TickingArea,
    block: Block,
    name: string,
    phase: pha,
    minY?: number,
    maxY?: number,
  ) {
    this.enqueue({ area, block, name, minY, maxY });
    if (!this.#currentGenerator) {
      this.#currentGenerator = this.generator(phase);
    }
    return this.#currentGenerator;
  }

  *generator(phase: pha) {
    while (this.requests.length > 0) {
      const request = this.requests[0];

      if (!request.area.isFullyLoaded) {
        yield;
        continue;
      }

      const bbox = request.area.boundingBox;
      if (!bbox || !bbox.min || !bbox.max) {
        world.sendMessage(
          `§4TickingArea ${request.area.identifier || "unknown"} missing boundingBox`,
        );
        this.requests.shift();
        continue;
      }

      const spanX = bbox.max.x - bbox.min.x;
      const spanZ = bbox.max.z - bbox.min.z;
      if (spanX < 15 || spanZ < 15) {
        world.sendMessage(
          `§4Warning: small boundingBox for ${request.area.identifier}: ${JSON.stringify({ min: bbox.min, max: bbox.max })}`,
        );
      }

      const min: Vector3 = {
        x: bbox.min.x,
        y: request.minY ?? request.block.location.y - 30,
        z: bbox.min.z,
      };
      const max: Vector3 = {
        x: bbox.max.x,
        y: request.maxY ?? request.block.location.y + 30,
        z: bbox.max.z,
      };

      const volume = new BlockVolume(min, max);
      const blockList = request.area.dimension.getBlocks(
        volume,
        {
          excludeTypes: [
            "minecraft:air",
            "minecraft:water",
            "minecraft:lava",
            "minecraft:flowing_lava",
            "minecraft:flowing_water",
            "minecraft:jungle_leaves",
            "minecraft:azalea_leaves",
            "minecraft:oak_leaves",
            "minecraft:birch_leaves",
            "minecraft:spruce_leaves",
            "minecraft:acacia_leaves",
            "minecraft:dark_oak_leaves",
            "minecraft:azalea_leaves_flowered",
            "minecraft:cherry_leaves",
            "minecraft:pale_oak_leaves",
            "minecraft:fire",
            "minecraft:glass",
            "minecraft:iron_block",
            "minecraft:piston",
            "minecraft:sticky_piston",
            "minecraft:iron_door",
            "minecraft:vine",
            "minecraft:bamboo",
            "minecraft:short_grass",
            "minecraft:tall_grass",
            "minecraft:short_dry_grass",
            "minecraft:tall_dry_grass",
          ],
          excludeTags: ["log"],
        },
        true,
      );

      const blockLeaves = request.area.dimension.getBlocks(
              volume,
              {
                includeTypes: [
                  "minecraft:jungle_leaves",
                  "minecraft:azalea_leaves",
                  "minecraft:oak_leaves",
                  "minecraft:birch_leaves",
                  "minecraft:spruce_leaves",
                  "minecraft:acacia_leaves",
                  "minecraft:dark_oak_leaves",
                  "minecraft:azalea_leaves_flowered",
                  "minecraft:cherry_leaves",
                  "minecraft:pale_oak_leaves",
                  "minecraft:glass",
                  "minecraft:vine",
                ],
              },
              true,
            );
            const blockLogs = request.area.dimension.getBlocks(
              volume,
              {
                includeTags: ["log"],
              },
              true,
            );

      const glassBlocks = request.area.dimension.getBlocks(
        volume,
            {
              includeTypes: [
                "minecraft:glass"
              ]
            }
      );

      let any = false;

      for (const loc of blockList.getBlockLocationIterator()) {
        any = true;
        const block1 = request.area.dimension.getBlock(loc);
        if (block1) {
          block1.setType("atomic:radiation_block");
          yield;
        }
      }
      for(const loc of blockLeaves.getBlockLocationIterator()) {
        any = true;
        const leaveBlock = request.area.dimension.getBlock(loc);
        if(leaveBlock) {
          leaveBlock.setType("atomic:radi_leave");
          yield
        }
      }
      
      for(const loc of blockLogs.getBlockLocationIterator()) {
          any = true;
          const logBlocks = request.area.dimension.getBlock(loc);
          if(logBlocks) {
            logBlocks.setType("atomic:burned_log");
            yield
          }
      }

      for(const loc of glassBlocks.getBlockLocationIterator()) {
          any = true;
          const vanishBlocks = request.area.dimension.getBlock(loc)
          if(vanishBlocks) {
            vanishBlocks.setType("minecraft:air");
            yield
          }
      }

      if (!any) {
        world.sendMessage(`No blocks found in volume for ${request.name}`);
      }

      this.requests.shift();
    }

    world.sendMessage("ChunkFiller queue drained");
    this.#currentGenerator = undefined;
  }
}

export const globalChunkFiller = new ChunkFiller();
export { ChunkFiller };
