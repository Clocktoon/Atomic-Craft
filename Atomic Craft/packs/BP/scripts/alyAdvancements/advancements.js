import { world, system, ItemTypes } from "@minecraft/server";
var advancementsEnabled = false;
system.runTimeout(() => {
    for (const type of ItemTypes.getAll())
        if (type.id == "adv:alyadvancementsareon")
            advancementsEnabled = true;
});
export { advancementsEnabled }; //we can use this to stop code from running if we dont actually have the advancements addon on
export function grantAdvancement(player, advancement) {
    if (player.isValid)
        player.runCommand(`scriptevent alylicasadvancements:grant ${advancement}`);
}
world.afterEvents.playerSpawn.subscribe((e) => {
    let player = e.player;
    if (e.initialSpawn === false)
        return;
    system.runTimeout(() => {
        player.addTag("aly:examplepack_enabled"); //used by the advancements addon to get a list of relevant packs
    }, 10);
    // Aly advancements compatibility
});
//now, import the script files here that would manage your advancements.
import "./advancements/uraniumFever";
//# sourceMappingURL=advancements.js.map