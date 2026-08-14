import { world, system, CommandPermissionLevel, CustomCommandStatus, ItemStack } from "@minecraft/server";
import { CustomForm, ObservableBoolean, ObservableNumber, ObservableUIRawMessage, } from "@minecraft/server-ui";
// @lantern-links-items ["atomic:atomic_settings"]
class RadiSettings {
    onUse(e) {
        const yielding = new ObservableBoolean(true, { clientWritable: true });
        const explosionEffects = new ObservableBoolean(true, {
            clientWritable: true,
        });
        const logsBool = new ObservableBoolean(false, { clientWritable: true });
        //in case pages in different sections are ever needed
        // const page = new ObservableNumber(0, { clientWritable: true})
        const currentPower = world.getDynamicProperty("powerful");
        const exEffect = world.getDynamicProperty("explosionEffect");
        const logsOn = world.getDynamicProperty("logs");
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
        if (typeof logsOn === "boolean") {
            logsBool.setData(logsOn);
        }
        else {
            world.setDynamicProperty("logs", false);
            logsBool.setData(false);
        }
        yielding.subscribe((v) => world.setDynamicProperty("powerful", v));
        explosionEffects.subscribe((v) => world.setDynamicProperty("explosionEffect", v));
        logsBool.subscribe((v) => world.setDynamicProperty("logs", v));
        //#region Pages
        const uranDrop = new ObservableNumber(0, { clientWritable: true });
        const uranText = new ObservableUIRawMessage({ translate: "atomic.picksection.name" }, {
            clientWritable: true,
        });
        uranDrop.subscribe((nu) => {
            if (nu === 0) {
                uranText.setData({ translate: "uranium.pageone.name" });
            }
            if (nu === 1) {
                uranText.setData({ translate: "uranium.pagetwo.name" });
            }
        });
        const uranium = new CustomForm(e.source, "uranium.title.name")
            .dropdown("uranium.section.name", uranDrop, [
            {
                label: "uranium.section.one.name",
                value: 0,
            },
            {
                label: "uranium.section.two.name",
                value: 1,
            },
        ])
            .label(uranText)
            .button({ translate: "atomic.back.button.name" }, () => {
            uranium.close();
            system.run(() => {
                wikiScreen.show();
            });
        });
        const bombDrop = new ObservableNumber(0, { clientWritable: true });
        const bombText = new ObservableUIRawMessage({ translate: "atomic.picksection.name" }, {
            clientWritable: true,
        });
        bombDrop.subscribe(() => {
            if (bombDrop.getData() === 0) {
                bombText.setData({ translate: "bombs.pageone.name" });
            }
            if (bombDrop.getData() === 1) {
                bombText.setData({ translate: "bombs.pagetwo.name" });
            }
        });
        const bombs = new CustomForm(e.source, { translate: "bombs.title.name" })
            .dropdown({ translate: "bombs.section.name" }, bombDrop, [
            {
                label: { translate: "bombs.section.one.name" },
                value: 0,
            },
            {
                label: { translate: "bombs.section.two.name" },
                value: 1,
            },
        ])
            .label(bombText)
            .button({ translate: "atomic.back.button.name" }, () => {
            bombs.close();
            system.run(() => {
                wikiScreen.show();
            });
        });
        const steelDrop = new ObservableNumber(0, { clientWritable: true });
        const steelText = new ObservableUIRawMessage({ translate: "atomic.picksection.name" }, {
            clientWritable: true,
        });
        steelDrop.subscribe((v) => {
            if (v === 0) {
                steelText.setData({ translate: "steel.pageone.name" });
            }
            if (v === 1) {
                steelText.setData({ translate: "steel.pagetwo.name" });
            }
        });
        const steel = new CustomForm(e.source, { translate: "steel.title.name" })
            .dropdown({ translate: "steel.section.name" }, steelDrop, [
            {
                label: { translate: "steel.section.one.name" },
                value: 0,
            },
            {
                label: { translate: "steel.section.two.name" },
                value: 1,
            },
        ])
            .label(steelText)
            .button({ translate: "atomic.back.button.name" }, () => {
            steel.close();
            system.run(() => {
                wikiScreen.show();
            });
        });
        const credits = new CustomForm(e.source, { translate: "atomic.credits.title.name" })
            .label({ translate: "atomic.credits.text.name" })
            .button({ translate: "atomic.back.button.name" }, () => {
            credits.close();
            system.run(() => {
                mainScreen.show();
            });
        });
        //#endregion
        //The main screen
        const mainScreen = new CustomForm(e.source, { translate: "manage.menu.title.name" });
        mainScreen
            .button({ translate: "manage.menu.button.settings.name" }, () => {
            mainScreen.close();
            system.run(() => {
                settingsScreen.show();
            });
        })
            .button({ translate: "manage.menu.button.wiki.name" }, () => {
            mainScreen.close();
            system.run(() => {
                wikiScreen.show();
            });
        })
            .button({ translate: "manage.menu.button.credits.name" }, () => {
            mainScreen.close();
            system.run(() => {
                credits.show();
            });
        })
            .show();
        //Look at recipes, scripts, and use that to make the wiki pages
        const wikiScreen = new CustomForm(e.source, { translate: "atomic.wiki.title.name" }).button({ translate: "atomic.back.button.name" }, () => {
            wikiScreen.close();
            system.run(() => {
                mainScreen.show();
            });
        });
        wikiScreen
            .button({ translate: "atomic.wiki.button.uranium.name" }, () => {
            wikiScreen.close();
            system.run(() => {
                uranium.show();
            });
        })
            .button({ translate: "atomic.wiki.button.bombs.name" }, () => {
            wikiScreen.close();
            system.run(() => {
                bombs.show();
            });
        })
            .button({ translate: "atomic.wiki.button.steel.name" }, () => {
            wikiScreen.close();
            system.run(() => {
                steel.show();
            });
        });
        //TODO: PAGES TO DO: 1. STEEL, 2. BUILDINGS, 3. RECIPES, 4. CREDITS
        //Settings menu
        const settingsScreen = new CustomForm(e.source, { translate: "atomicsettings.title.name=Bombs of glory settings" })
            .label({ translate: "atomicsettings.label.name" })
            .toggle({ translate: "atomicsettings.slow.name" }, yielding, {
            description: { translate: "atomicsettings.slow.des.name" },
        })
            .toggle({ translate: "atomicsettings.explosion.name" }, explosionEffects, {
            description: { translate: "atomicsettings.explosion.des.name" },
        })
            .toggle({ translate: "atomicsettings.log.name" }, logsBool, {
            description: { translate: "atomicsettings.log.des.name" },
        })
            .button({ translate: "atomic.back.button.name" }, () => {
            settingsScreen.close();
            system.run(() => {
                mainScreen.show();
            });
        })
            .closeButton();
    }
}
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("atomic:settings_comp", new RadiSettings());
});
system.beforeEvents.startup.subscribe((init) => {
    function settingsItem(origin, dimensionId) {
        const entity = origin.sourceEntity;
        if (!entity)
            return {
                status: CustomCommandStatus.Failure
            };
        system.run(() => {
            const inventory = entity.getComponent('inventory');
            if (inventory) {
                const container = inventory.container;
                const settingsItem = new ItemStack("atomic:atomic_settings", 1);
                if (!container.contains(settingsItem)) {
                    if (container.emptySlotsCount > 0) {
                        container.addItem(settingsItem);
                    }
                    else {
                        entity.dimension.spawnEntity(settingsItem.typeId, entity.location);
                    }
                }
            }
        });
        return {
            status: CustomCommandStatus.Success,
            message: "Settings item given!"
        };
    }
    const settingsItemCommand = {
        name: "atomic:settingsitem",
        description: "Gives settings item",
        permissionLevel: CommandPermissionLevel.Admin,
    };
    init.customCommandRegistry.registerCommand(settingsItemCommand, settingsItem);
});
//# sourceMappingURL=settingsItem.js.map