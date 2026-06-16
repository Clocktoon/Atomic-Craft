import { world, system, } from "@minecraft/server";
import { CustomForm, Observable } from "@minecraft/server-ui";
class RadiSettings {
    onUse(e) {
        const yielding = Observable.create(true, { clientWritable: true });
        const explosionEffects = Observable.create(true, { clientWritable: true });
        const currentPower = world.getDynamicProperty("powerful");
        const exEffect = world.getDynamicProperty("explosionEffect");
        if (typeof currentPower === "boolean") {
            yielding.setData(currentPower);
        }
        else {
            world.setDynamicProperty("powerful", true);
            yielding.setData(true);
        }
        if (typeof exEffect === "boolean") {
            explosionEffects.setData(exEffect);
        }
        else {
            world.setDynamicProperty("explosionEffect", true);
            explosionEffects.setData(true);
        }
        yielding.subscribe((v) => world.setDynamicProperty("powerful", v));
        explosionEffects.subscribe((v) => world.setDynamicProperty("explosionEffect", v));
        CustomForm.create(e.source, "Bombs of glory settings")
            .label("Use this to change the settings of the world")
            .toggle("Slower mode", yielding)
            .toggle("Explsion effects", explosionEffects)
            .closeButton()
            .show();
    }
}
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:settings_comp", new RadiSettings);
});
