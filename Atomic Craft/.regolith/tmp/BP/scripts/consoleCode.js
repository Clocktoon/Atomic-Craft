import { system } from "@minecraft/server";
import { CustomForm, ObservableString } from "@minecraft/server-ui";
import { travelSystem } from "./icbmCode";
/** @type {import("@minecraft/server").BlockCustomComponent} */
class ConsoleCode {
    constructor() {
        this.onPlayerInteract = this.onPlayerInteract.bind(this);
    }
    onPlayerInteract(ev) {
        const player = ev.player;
        const block = ev.block;
        const dimension = ev.dimension;
        //TODO: MAKE IT SO THAT IT CAN TAKE SAVED CORDS AND THEN USE THOSE TO LAUNCH MISSILES AT SAID CORDS
        if (!player)
            return;
        const missileString = new ObservableString(`Missiles under control in 30 block radius: 0`);
        const form = new CustomForm(player, "Missile launch console");
        const inter = system.runInterval(() => {
            const entities = block.dimension.getEntities({
                families: ["intermissile"],
                location: block.location,
                minDistance: 1,
                maxDistance: 30
            });
            missileString.setData(`Missiles under control in 30 block radius: ${entities.length}`);
        }, 1);
        form.label(missileString)
            .divider()
            .button("Launch missiles", () => {
            const entities = block.dimension.getEntities({
                families: ["intermissile"],
                location: block.location,
                minDistance: 1,
                maxDistance: 30
            });
            if (entities.length === 0)
                return;
            for (const entity of entities) {
                const location = entity.getDynamicProperty("missileCord");
                if (location) {
                    const nameId = `hate${location.x}${location.y}${location.z}`;
                    travelSystem(location.x, location.y, location.z, nameId, entity, player);
                }
            }
            player.playSound("atomic.console.click");
        })
            .show()
            .then(() => {
            system.clearRun(inter);
        })
            .catch((e) => {
            system.clearRun(inter);
            console.error(e);
        });
    }
}
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:console_code", new ConsoleCode());
});
//# sourceMappingURL=consoleCode.js.map