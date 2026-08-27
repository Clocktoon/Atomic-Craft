import { system, EntityComponentTypes, ItemStack } from "@minecraft/server";
import { CustomForm, ObservableNumber, ObservableString } from "@minecraft/server-ui";
/* Centrifuge beta code, might change once block entites come out, current idea is
to make it so you have to power it with redstone, then once given something to refine via a DDUI it will
output the result into the player's inventory */
//Change of plans, still powered by redstone but will probably have its own UI instead of using a chest
class EnricherComp {
    //Redstone part, starts smoke coming out and allows other things
    onRedstoneUpdate(event) {
        const block = event.block;
        const dimension = event.dimension;
        const level = event.powerLevel;
        if (level > 0) {
            block.setPermutation(block.permutation.withState("atomic:enrich_on", true));
        }
        if (level === 0) {
            block.setPermutation(block.permutation
                .withState("atomic:enrich_on", false));
        }
    }
    onPlayerInteract(event) {
        const { player, block, dimension } = event;
        if (!player) {
            return;
        }
        if (block.permutation.getState("atomic:enrich_on") !== true)
            return;
        let enrichNumberVar = 0;
        const enrichNumber = new ObservableNumber(0, { clientWritable: true });
        const enrichText = new ObservableString("0%", { clientWritable: true });
        enrichNumber.subscribe((p) => enrichText.setData(`${p}%`));
        const selectMenu = new CustomForm(player, { translate: "atomic.enrich.copper.title.name" });
        const loadingScreen = new CustomForm(player, { translate: "atomic.enrich.copper.loading.name" });
        selectMenu.label({ translate: "atomic.enrich.copper.label.name" });
        /**
         * Used to make my life easier in terms of doing the loading/enrich screen
         * @param item Item ID to use
         * @param time Time in ticks between actually updating the little loading count
         * @param form Form to close
         * @param slot Slot to place enriched version into
         * @param amount ItemStack size
         * @param invetory The invetory of the player
         */
        function enrichLoading(item, time, form, slot, invetory, amount) {
            form.close();
            system.run(() => {
                loadingScreen.label(enrichText);
                loadingScreen.show();
                const timeRun = system.runInterval(() => {
                    if (enrichNumber.getData() <= 100) {
                        enrichNumberVar++;
                        enrichNumber.setData(enrichNumberVar);
                    }
                    else {
                        const itemStack = new ItemStack(item, amount);
                        itemStack.setLore([{ translate: "atomic.low.lore.name" }]);
                        invetory.container.setItem(slot, itemStack);
                        system.clearRun(timeRun);
                        return;
                    }
                }, time);
            });
        }
        //Low Uranium Enrichment button
        selectMenu.button({ translate: "atomic.enrich.copper.low.name" }, () => {
            const invetory = player.getComponent(EntityComponentTypes.Inventory);
            if (!invetory || !invetory.container) {
                return;
            }
            for (let i = 0; i < invetory.inventorySize; i++) {
                const itemStack = invetory.container.getItem(i);
                if (itemStack && itemStack.typeId === "atomic:uranium_ingot") {
                    enrichLoading("atomic:uranium_low", 20, selectMenu, i, invetory, itemStack.amount);
                }
            }
        });
        //Medium uranium enrichment
        selectMenu.button({ translate: "atomic.enrich.copper.mid.name" }, () => {
            const invetory = player.getComponent(EntityComponentTypes.Inventory);
            if (!invetory || !invetory.container) {
                return;
            }
            for (let i = 0; i < invetory.inventorySize; i++) {
                const itemStack = invetory.container.getItem(i);
                if (itemStack && itemStack.typeId === "atomic:uranium_ingot") {
                    enrichLoading("atomic:uranium_mid", 40, selectMenu, i, invetory, itemStack.amount);
                }
            }
        });
        //High uranium enrichment
        selectMenu.button({ translate: "atomic.enrich.copper.high.name" }, () => {
            const invetory = player.getComponent(EntityComponentTypes.Inventory);
            if (!invetory || !invetory.container) {
                return;
            }
            for (let i = 0; i < invetory.inventorySize; i++) {
                const itemStack = invetory.container.getItem(i);
                if (itemStack && itemStack.typeId === "atomic:uranium_ingot") {
                    enrichLoading("atomic:uranium_high", 60, selectMenu, i, invetory, itemStack.amount);
                }
            }
        });
        selectMenu.show();
    }
}
system.beforeEvents.startup.subscribe((ev) => {
    ev.blockComponentRegistry.registerCustomComponent("atomic:enrich", new EnricherComp);
});
//# sourceMappingURL=enrichment.js.map