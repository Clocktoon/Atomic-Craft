import { system, world } from "@minecraft/server";
import { CustomForm, ObservableString, ObservableBoolean, } from "@minecraft/server-ui";
import { ChunkTicker } from "./chunkLoaders/ticking/chunkTickerClass";
world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target;
    const player = ev.player;
    const xText = new ObservableString("", { clientWritable: true });
    const zText = new ObservableString("", { clientWritable: true });
    const showFireButton = new ObservableBoolean(false, { clientWritable: true });
    const form = new CustomForm(player, "Himar Missile Panel");
    if (entity.typeId === "atomic:himar" && entity.getProperty("atomic:riderhas") === true) {
        form.textField("X", xText).textField("Z", zText);
        if (zText.getData() !== "" && xText.getData() !== "") {
            showFireButton.setData(true);
        }
        form
            .button("Fire at cords", () => {
            let x = Number(xText.getData());
            let z = Number(zText.getData());
            let y = player.dimension.getTopmostBlock({ x: x, z: z })?.location.y;
            const nameId = `NK_${x},${z},${player.dimension.id}`;
            let tickingQueue = [];
            if (y) {
                entity.setProperty("atomic:launching", true);
                const target = entity.dimension.spawnEntity("atomic:hate", {
                    x: x,
                    y: y,
                    z: z,
                });
                target;
                new ChunkTicker(player.dimension, nameId).load(target.location, false, {
                    from: { x: x - 20, y: 0, z: z - 20 },
                    to: { x: x + 20, y: 0, z: z + 20 },
                    dimension: target.dimension,
                });
                const missile = entity.dimension.spawnEntity("atomic:himar_missile", {
                    x: entity.location.x,
                    y: entity.location.y + 10,
                    z: entity.location.z,
                });
                missile;
                system.runTimeout(() => {
                    entity.setProperty("atomic:launching", false);
                }, 300);
                const sys = system.runInterval(() => {
                    if (!missile.isValid) {
                        target.remove();
                        system.clearRun(sys);
                        world.tickingAreaManager.removeTickingArea(nameId);
                    }
                });
            }
        }, { disabled: showFireButton, tooltip: "Put in cords to use button" })
            .closeButton()
            .show();
    }
});
//# sourceMappingURL=himarCode.js.map