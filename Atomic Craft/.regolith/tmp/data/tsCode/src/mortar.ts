import { system, TickingAreaOptions, world, Player, ItemStack } from "@minecraft/server";
import { ChunkTicker } from "./chunkLoaders/ticking/chunkTickerClass";

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const entity = event.target;
  const player = event.player;
  const item = event.itemStack;
  const queue: TickingAreaOptions[] = [];

  //TODO: Make it so it changes on roation, right now it always shots in postive no matter how the mortar is facing

  if (
    entity.typeId === "atomic:mortar" &&
    item?.typeId === "atomic:mortar_ammo" &&
    entity.getProperty("atomic:cooldown") === false
  ) {
    entity.setProperty("atomic:fired", true);
    const view = entity.getViewDirection()
    const headster = entity.getHeadLocation()
    const random = 3 + Math.floor((Math.random() + Math.random()) * 10); // 20ish blocks away
    let x = headster.x + view.x * 20
    let y = headster.y + view.y * 20
    let z = headster.z + view.z * 20
    x += random
    y += random
    const loc = {
      x: Math.floor(x),
      y: Math.floor(y),
      z: Math.floor(z),
    };
    new ChunkTicker(entity.dimension, `mortararea${loc.x}${loc.z}`).load(
      loc,
      false,
      {
        dimension: entity.dimension,
        from: { x: loc.x - 10, y: loc.y, z: loc.z - 10 },
        to: { x: loc.x + 10, y: loc.y, z: loc.z + 10 },
      },
    );
    const block = entity.dimension.getBlockFromRay(loc, {x: 0, y: -1, z: 0}, {
      maxDistance: 100, includeLiquidBlocks: false
    })?.block
    if (block) {
      entity.dimension.createExplosion(block.location, 3, {
        causesFire: true,
        breaksBlocks: true,
      });

      world.tickingAreaManager.removeTickingArea(`mortararea${loc.x}${loc.z}`);
      entity.setProperty("atomic:cooldown", true);
      const fired = system.runTimeout( () => {
        entity.setProperty("atomic:fired", false);
        system.clearRun(fired)
      }, 40)
      const cooldown = system.runTimeout(() => {
        entity.setProperty("atomic:cooldown", false);
        system.clearRun(cooldown);
      }, 200);
    }
  }
});

world.afterEvents.entityHurt.subscribe((ev) => {
  const entity = ev.hurtEntity;
  const damageSource = ev.damageSource;
  if (
    entity.typeId === "atomic:mortar" &&
    damageSource.damagingEntity instanceof Player
  ) {
    const damager = damageSource.damagingEntity;
    if (damager instanceof Player) {
      const invComp = damager.getComponent("minecraft:inventory");
      if (invComp && invComp.container)
        invComp.container.addItem(new ItemStack("atomic:mortar_item", 1));
        entity.remove()
    }
  }
});