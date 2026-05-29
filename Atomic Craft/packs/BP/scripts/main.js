import { world } from "@minecraft/server";
/**
 * Main file for BOG (bombs of glory)
 * @author Abaddon
 * @license MIT
 * @version 2.0.0
 */
import("./nuclearBombs/nukeCode");
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
import("./rottenEat.js");
import("./devItem.js");
world.afterEvents.worldLoad.subscribe(() => {
    import("./explodeTnt.js");
    import("./projectileScript.js");
    import("./missileBlow.js");
    import("./sirenCode.js");
    import("./planeCode.js");
    import("./welcomeText");
    import("./icbmCode.js");
    import("./ballisticCode.js");
    import("./himarCode.js");
    import("./radEffect.js");
    import("./nuclearTransforms/crater.js");
    import("./aftermath.js");
    import("./nuclearTransforms/shockwave.js");
    import("./itempickups.js");
    //import("./smokePart.js")
    //import("./gasMaskCode.js")
    import("./setLore.js");
});
