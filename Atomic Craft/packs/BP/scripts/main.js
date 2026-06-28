import { world, system, } from "@minecraft/server";
/**
 * Main file for BOG (bombs of glory)
 * @author Abaddon
 * @license MIT
 * @version 2.0.0
 */
//Custom slab code by https://discord.com/channels/523663022053392405/1495937194949349526 (Barred)
import { slabComponent, slabBlockComponent } from './slabComponent';
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("namespace:slab", new slabBlockComponent());
});
system.beforeEvents.startup.subscribe(({ itemComponentRegistry }) => {
    itemComponentRegistry.registerCustomComponent("namespace:slab", new slabComponent());
});
import("./nuclearBombs/nukeCode");
import("./scriptUI/settingsItem");
import("./modules/explosionEffects");
import("./onStep.js");
import("./spawnOrbs.js");
import("./missileSummon.js");
import("./remoteMissile.js");
import("./landMineCode.js");
import("./nuclearBombs/hBombCode.js");
import("./icbmComp.js");
import("./consoleCode.js");
import("./nonComp.js");
import("./EatEffects.js");
import("./radiationSystem/cureSystem");
import("./devItem.js");
import("./nuclearBombs/redstoneHelpers");
import("./nuclearBombs/gadget");
world.afterEvents.worldLoad.subscribe(() => {
    if (typeof world.getDynamicProperty("powerful") !== "boolean") {
        world.setDynamicProperty("powerful", true);
    }
    import("./explodeTnt.js");
    import("./projectileScript.js");
    import("./missileBlow.js");
    import("./sirenCode.js");
    import("./planeCode.js");
    import("./welcomeText");
    import("./icbmCode.js");
    import("./ballisticCode.js");
    import("./himarCode.js");
    //Will add radiation next update
    // import("./radiationSystem/radEffect.js")
    import("./nuclearTransforms/crater.js");
    import("./aftermath.js");
    import("./nuclearTransforms/shockwave.js");
    import("./mortar");
    //import("./itempickups.js")
    //import("./smokePart.js")
    //import("./gasMaskCode.js")
    //import("./setLore.js")
});
//# sourceMappingURL=main.js.map