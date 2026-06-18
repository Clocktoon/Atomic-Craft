import {
  world,
  system,
  ItemCustomComponent,
  ItemComponentUseEvent,
} from "@minecraft/server";
import { CustomForm, ObservableBoolean } from "@minecraft/server-ui";

class RadiSettings implements ItemCustomComponent {
  onUse(e: ItemComponentUseEvent): void {
    const yielding = new ObservableBoolean(true, {clientWritable: true});
    const explosionEffects = new ObservableBoolean(true, {clientWritable: true});

    const currentPower = world.getDynamicProperty("powerful");
    const exEffect = world.getDynamicProperty("explosionEffect");

    if (typeof currentPower === "boolean") {
      yielding.setData(currentPower);
    } else {
      world.setDynamicProperty("powerful", true);
      yielding.setData(true);
    }

    if (typeof exEffect === "boolean") {
      explosionEffects.setData(exEffect);
    } else {
      world.setDynamicProperty("explosionEffect", true);
      explosionEffects.setData(true);
    }

    
    yielding.subscribe((v: boolean) => world.setDynamicProperty("powerful", v));
    explosionEffects.subscribe((v: boolean) => world.setDynamicProperty("explosionEffect", v));

   new CustomForm(e.source, "Bombs of glory settings")
    .label("Use this to change the settings of the world")
    .toggle("Slower mode", yielding, { description: "Turning this off will probably crash your game with the bigger nukes"})
    .toggle("Explsion effects", explosionEffects)
    .closeButton()
    .show()
  }
}

system.beforeEvents.startup.subscribe(({itemComponentRegistry}) => {
    itemComponentRegistry.registerCustomComponent("atomic:settings_comp", new RadiSettings)
})
