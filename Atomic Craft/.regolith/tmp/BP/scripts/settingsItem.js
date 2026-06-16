import { world, system, } from "@minecraft/server";
import { CustomForm, Observable } from "@minecraft/server-ui";
class RadiSettings {
    onUse(e) {
        const yielding = Observable.create(true);
        const explosionEffects = Observable.create(true);
        const currentPower = world.getDynamicProperty("powerful");
        const exEffect = world.getDynamicProperty("explosionEffect");
        if (typeof currentPower === "boolean")
            yielding.setData(currentPower);
        if (typeof exEffect === "boolean")
            explosionEffects.setData(exEffect);
        CustomForm.create(e.source, "Bombs of glory settings")
            .label("Use this to change the settings of the world")
            .toggle("Quicker nuke times", yielding)
            .toggle("Explsion effects", explosionEffects);
    }
}
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:settings_comp", new RadiSettings);
});
