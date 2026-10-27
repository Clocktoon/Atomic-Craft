import { world } from "@minecraft/server";
import { advancementsEnabled, grantAdvancement } from "../advancements";
const advancementId = "atomic:uranium_fever";
world.afterEvents.playerBreakBlock.subscribe((ev) => {
    const block = ev.block;
    const player = ev.player;
    if (!advancementsEnabled)
        return;
    if (block.typeId === "atomic:uranium_block" || block.typeId === "atomic:uranium_deepslate") {
        grantAdvancement(player, advancementId);
    }
});
//# sourceMappingURL=uraniumFever.js.map