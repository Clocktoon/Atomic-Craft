import {
  world,
  system,
  ItemCustomComponent,
  ItemComponentUseEvent,
  CustomCommandRegistry,
  CommandPermissionLevel,
  StartupEvent,
  CustomCommand,
  CustomCommandOrigin,
  CustomCommandResult,
  CustomCommandStatus,
  ItemStack
} from "@minecraft/server";
import {
  CustomForm,
  ObservableBoolean,
  ObservableNumber,
  ObservableString,
  uiManager,
} from "@minecraft/server-ui";

// @lantern-links-items ["atomic:atomic_settings"]
class RadiSettings implements ItemCustomComponent {
  onUse(e: ItemComponentUseEvent): void {
    const yielding = new ObservableBoolean(true, { clientWritable: true });
    const explosionEffects = new ObservableBoolean(true, {
      clientWritable: true,
    });
    const logsBool = new ObservableBoolean(false, { clientWritable: true });
    const radiWaitTime = new ObservableNumber(20, {clientWritable: true});

    //in case pages in different sections are ever needed
    // const page = new ObservableNumber(0, { clientWritable: true})

    const currentPower = world.getDynamicProperty("powerful");
    const exEffect = world.getDynamicProperty("explosionEffect");
    const logsOn = world.getDynamicProperty("logs");
    const radiTime = world.getDynamicProperty("atomic:raditime")

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
    if (typeof logsOn === "boolean") {
      logsBool.setData(logsOn);
    } else {
      world.setDynamicProperty("logs", false);
      logsBool.setData(false);
    }
    if (typeof radiTime === "number") {
      radiWaitTime.setData(radiTime);
    } else {
      world.setDynamicProperty("atomic:raditime", 20);
      radiWaitTime.setData(20);
    }

    yielding.subscribe((v: boolean) => world.setDynamicProperty("powerful", v));
    explosionEffects.subscribe((v: boolean) =>
      world.setDynamicProperty("explosionEffect", v),
    );
    logsBool.subscribe((v: boolean) => world.setDynamicProperty("logs", v));

    //#region Pages
    const uranDrop = new ObservableNumber(0, { clientWritable: true });
    const uranText = new ObservableString("Pick section", {
      clientWritable: true,
    });
    uranDrop.subscribe((nu: number) => {
      if (nu === 0) {
        uranText.setData(`Uranium is the main ore of this addon, 
          it's used to make all of the nuclear bombs. It can be found from the Y cords -47 to 62, 
          with more heavy amounts in the middle of the non negative cords. Uranium has a green look, making it somewhat like emeralds.

          Uranium can also be gotten from the uranium vita, a new mob that spawns in dark areas, being the living weird version of uranium itself.
          
          The raw uranium can be cooked in a furnace to make its cooked form, which is the item that is actually useful.
          Once you reach the nether, you can combine cooked uranium with quartz to make nethernuim, more on that in the useage section`);
      }
      if (nu === 1) {
        uranText.setData(`The main useage of uranium is making nuclear bombs, 
        uranium is used in both versions of the nuclear bomb cores, the first atomic core used for the first two nuke tiers is made 
        via putting iron around cooked uranium, while the thermonuclear is made using nethernium around the first atomic core.
        
        Uranium can also be used to make enhanced tnt, which is a more powerful version of normal tnt, which is used later on for missiles and other things.`);
      }
    });
    const uranium = new CustomForm(e.source, "Uranium")
      .dropdown("Section", uranDrop, [
        {
          label: "Ore block info",
          value: 0,
        },
        {
          label: "Ore usage",
          value: 1,
        },
      ])
      .label(uranText)
      .button("Back", () => {
        uranium.close();
        system.run(() => {
          wikiScreen.show();
        });
      });

    const bombDrop = new ObservableNumber(0, { clientWritable: true });
    const bombText = new ObservableString("Pick section", {
      clientWritable: true,
    });
    bombDrop.subscribe(() => {
      if (bombDrop.getData() === 0) {
        bombText.setData(`Bombs of glory has many types of bombs, the recipes for each can be unlocked via getting ores and gunpowder in most cases, below is a list of each and some basic info on them.
          
          
          Grenade: Can be thrown, explodes after a few seconds on the ground.
          
          Enhanced tnt: A more powerful version of normal tnt made with uranium, explodes a pretty big area.
          
          Mortar: A type of cannon that fires a bomb at a nearby location, it requires ammo to fire, click on it with ammo to shoot.
          
          Plane bombs: A plane entity can be made. The plane can drop down a bomb that explodes the ground below it.
          
          Himar missiles: A himar can be made, this entity fires out missiles that head to a set location via UI, missile explodes on impact.
          
          Missile button + Remote missile: Fires down a missile at a location by rather holding down on for the button, or looking at a block for the remote.
          
          Ballistic missiles: Made with iron blocks, enhanced tnt and an observer, these are the none nuclear form of ballistic missiles, they sit in place until given cords and fired,
           at which point they head towards the target location and explode on impact.

          ICBM: These are made via steel blocks and an atomic bomb + an observer, they sit in place until given cords to head to, in which case they fire off towards the cords, once hitting target they cause a nuclear explosion.

          Nuclear bombs: Each of the nuclear bombs work roughly the same, 
          they will create a crater, and will change the area around it in a scaling size.
          The first one, the gadget is made with iron, the second one is made with netherite, and last one with steel.`);
      }
      if (bombDrop.getData() === 1) {
        bombText.setData(`Nuclear explosions will turn the area around it into a toxic place, the ground becomes dangerous to walk on and
          it becomes a bad idea to try and live there, in a future update radiation will also be added thus making these places truly dangerous forever.
          The effects of death from these blocks can be avoided by wearing a gas mask, craft one to save yourself from the pain!
          `);
      }
    });

    const bombs = new CustomForm(e.source, "Bombs and Nuclear")
      .dropdown("Section", bombDrop, [
        {
          label: "List of bombs and basic info",
          value: 0,
        },
        {
          label: "Nuclear details",
          value: 1,
        },
      ])
      .label(bombText)
      .button("Back", () => {
        bombs.close();
        system.run(() => {
          wikiScreen.show();
        });
      });

    const steelDrop = new ObservableNumber(0, { clientWritable: true });
    const steelText = new ObservableString("Pick section", {
      clientWritable: true,
    });
    steelDrop.subscribe((v: number) => {
      if (v === 0) {
        steelText.setData(`Steel is made via putting 2 netherite scrap, 
          and 4 iron ingots in a crafting table`);
      }
      if (v === 1) {
        steelText.setData(`Steel ingots are used to make several bomb types, such as missiles. 
          Get a ton of it as you'll likely need a lot of it, for instance the ballistic missiles need steel blocks to be made`);
      }
    });
    const steel = new CustomForm(e.source, "Steel Ore")
      .dropdown("Section", steelDrop, [
        {
          label: "How to get Steel",
          value: 0,
        },
        {
          label: "Steel useage",
          value: 1,
        },
      ])
      .label(steelText)
      .button("Back", () => {
        steel.close();
        system.run(() => {
          wikiScreen.show();
        });
      });

    const credits = new CustomForm(e.source, "Credits")
      .label(
        `Sound + shockwave system by MapleStar

Bits for ticking system inspired by code by Coolbep and gameza_src's chunk loader systems

Concept for chunk filling system by Conmaster

Updated textures for several items by Clean38 (Massive thank you on this one)

Thank you to people from the BOA discord for all their help as well with coding issues`,
      )
      .button("Back", () => {
        credits.close();
        system.run(() => {
          mainScreen.show();
        });
      });

    //#endregion

    //The main screen
    const mainScreen = new CustomForm(e.source, "Bombs of glory manage");
    mainScreen
      .button("Settings", () => {
        mainScreen.close();
        system.run(() => {
          settingsScreen.show();
        });
      })
      .button("Wiki", () => {
        mainScreen.close();
        system.run(() => {
          wikiScreen.show();
        });
      })
      .button("Credits", () => {
        mainScreen.close();
        system.run(() => {
          credits.show();
        });
      })
      .show();

    //Look at recipes, scripts, and use that to make the wiki pages
    const wikiScreen = new CustomForm(e.source, "Bombs of glory wiki").button(
      "Back",
      () => {
        wikiScreen.close();
        system.run(() => {
          mainScreen.show();
        });
      },
    );
    wikiScreen
      .button("Uranium", () => {
        wikiScreen.close();
        system.run(() => {
          uranium.show();
        });
      })
      .button("Bombs + Nuclear details", () => {
        wikiScreen.close();
        system.run(() => {
          bombs.show();
        });
      })
      .button("Steel", () => {
        wikiScreen.close();
        system.run(() => {
          steel.show();
        });
      });
    //TODO: PAGES TO DO: 1. STEEL, 2. BUILDINGS, 3. RECIPES, 4. CREDITS

    //Settings menu
    const settingsScreen = new CustomForm(e.source, "Bombs of glory settings")
      .label("Use this to change the settings of the world")
      .toggle("Slower mode", yielding, {
        description:
          "Turning this off will probably crash your game with the bigger nukes",
      })
      .toggle("Explsion effects", explosionEffects, {
        description:
          "Turns off general explosion effects (ex. booms after any explosion goes off), does not count for nuclear bombs or nuclear missiles",
      })
      .toggle("Log chat messages", logsBool, {
        description:
          "Turns on or off progress messages during certain things, like nukes",
      })
      .slider("Radiation wait tick time", radiWaitTime, 1, 60, {description: "20 ticks is one second", step: 1})
      .button("Back", () => {
        settingsScreen.close();
        system.run(() => {
          mainScreen.show();
        });
      })
      .closeButton();
  }
}

system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
  itemComponentRegistry.registerCustomComponent(
    "atomic:settings_comp",
    new RadiSettings(),
  );
});

system.beforeEvents.startup.subscribe((init: StartupEvent) => {
  function settingsItem(origin: CustomCommandOrigin, dimensionId: string): CustomCommandResult {
      const entity = origin.sourceEntity
      if(!entity) 
        return {
      status: CustomCommandStatus.Failure
    }

    system.run(() => {
      const inventory = entity.getComponent('inventory')
              
          if(inventory) {
              const container = inventory.container
              const settingsItem = new ItemStack("atomic:atomic_settings", 1)
            
              if(!container.contains(settingsItem)) {
                  if(container.emptySlotsCount > 0) {
                    container.addItem(settingsItem) 
                  }
                  else {
                    entity.dimension.spawnEntity(settingsItem.typeId, entity.location)
                  }
              } 
          }
    });

      return {
        status: CustomCommandStatus.Success,
        message: "Settings item given!"
      }
  }
  const settingsItemCommand: CustomCommand = {
    name: "atomic:settingsitem",
    description: "Gives settings item",
    permissionLevel: CommandPermissionLevel.Admin,   
  }
  init.customCommandRegistry.registerCommand(settingsItemCommand, settingsItem)
})