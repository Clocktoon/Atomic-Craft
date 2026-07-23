import { system } from "@minecraft/server";
function Rotten(ev) {
    const source = ev.source;
    if (source.getDynamicProperty("atomic:radiation_level") > 0) {
        source.setDynamicProperty("atomic:radiation_level", 0);
        source.runCommand("title @s actionbar §2 You feel better");
        source.removeEffect("weakness");
        source.removeEffect("nausea");
        source.removeEffect("mining_fatigue");
        source.removeEffect("slowness");
        source.removeEffect("poison");
        source.removeEffect("blindness");
    }
}
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:rotten", { onConsume: Rotten });
});
//# sourceMappingURL=cureSystem.js.map