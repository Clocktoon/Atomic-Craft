import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
import groups from "./resistanceGroups.js";

const assigned = new Set();

for (const blocks of Object.values(groups)) {
    for (const block of blocks) {
        assigned.add(block);
    }
}

const missing = [];

for (const blockId of Object.values(MinecraftBlockTypes)) {
    if (!assigned.has(blockId)) {
        missing.push(blockId);
    }
}

console.log(
    `${missing.length} blocks missing`
);

console.log(missing);