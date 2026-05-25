import { world } from "@minecraft/server";

//#region src/main.ts
world.afterEvents.worldLoad.subscribe(() => {
	console.log("Hello world!");
});

//#endregion
//# sourceMappingURL=main.js.map