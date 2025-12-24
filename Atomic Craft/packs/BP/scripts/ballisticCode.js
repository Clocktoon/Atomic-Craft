import { world } from "@minecraft/server";
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
        const y = player.dimension.getTopmostBlock({ x: x, z: z }, -59).location.y;

        entity.dimension.runCommand(
          `tickingarea add ${x - 20} 0 ${z - 20} ${x + 20} 0 ${z + 20} spawnarea`,
        );
        entity.dimension.spawnEntity("atomic:hate", { x: x, y: y, z: z });

        entity.runCommand("tickingarea remove spawnarea");
      })
      .catch((e) => {
        console.error(e, e.stack);
      });
  }
});
