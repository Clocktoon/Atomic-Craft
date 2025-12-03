import { world } from "@minecraft/server"

import("./nukeCode.js")
import("./onStep.js")
import("./spawnOrbs.js")
import("./missileSummon.js")
import("./remoteMissile.js")
import("./landMineCode.js")
import("./hBombCode.js")
import("./icbmComp.js")
import("./consoleCode.js")
import("./nonComp.js")
world.afterEvents.worldLoad.subscribe(() => {
    import("./explodeTnt.js")
    import("./projectileScript.js")
    import("./missileBlow.js")
    import("./sirenCode.js")
    import("./planeCode.js")
    import("./welcomeText")
    import("./icbmCode.js")
    import("./ballisticCode.js")
    import("./himarCode.js")
    //import("./smokePart.js")
    //import("./gasMaskCode.js")

}
)