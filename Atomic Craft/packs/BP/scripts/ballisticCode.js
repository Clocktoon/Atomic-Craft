import { Player, world, Dimension } from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
  const entity = ev.target;
  const player = ev.player;

  if (entity.typeId === "atomic:ballistic_missile") {
    let form = new ModalFormData();
    form.title("Put in coordinates");
    form.textField("X", "Put x cord");
    form.textField("Z", "Put z cord").submitButton("Launch");

    form
      .show(player)
      .then((r) => {
        if (r.canceled) return;

        let [xO, zO] = r.formValues;
        let x = Number(xO);
        let z = Number(zO);

        const y = player.dimension.getTopmostBlock({ x: x, z: z }, 0).location
          .y;

        /* entity.dimension.runCommand(
        `tickingarea add ${x - 30} 0 ${z - 30} ${x + 30} 0 ${z + 30} spawnarea`,
      ); */
        if (player.dimension.isChunkLoaded({ x: x, y: y, z: z }) === false) {
          world.tickingAreaManager.createTickingArea("spawnarea", {
            from: { x: x - 30, y: 0, z: z - 30 },
            to: { x: x + 30, y: 0, z: z + 30 },
            dimension: entity.dimension,
          });

          entity.dimension.spawnEntity("atomic:hate", { x: x, y: y, z: z });
          entity.runCommand("say spawned hate at " + x + " " + y + " " + z);

          world.tickingAreaManager.removeTickingArea("spawnarea");
        } else {
          entity.dimension.spawnEntity("atomic:hate", { x: x, y: y, z: z });
          entity.runCommand("say spawned hate at " + x + " " + y + " " + z);
        }
      })
      .catch((e) => {
        console.error(e, e.stack);
      });
  }
});

world.afterEvents.entityHurt.subscribe((ev) => {
  const entity = ev.hurtEntity;
  const damageSource = ev.damageSource;
  if (
    entity.typeId === "atomic:ballistic_missile" &&
    damageSource.damagingEntity instanceof Player
  ) {
    damageSource.damagingEntity
      .getComponent("minecraft:inventory")
      .container.addItem("atomic:blass");
  }
});
