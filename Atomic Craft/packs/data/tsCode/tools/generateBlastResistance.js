import fs from "node:fs";
import groups from "./resistanceGroups.js";

const blastResistance = {};

for (const [resistance, blockIds] of Object.entries(groups)) {
    for (const blockId of blockIds) {
        blastResistance[blockId] = Number(resistance);
    }
}

const output = `
// DO NOT EDIT, ANY EDITS WILL BE DELETED, EDIT generateBlastResistance.js INSTEAD

export const BlastResistance =
${JSON.stringify(blastResistance, null, 4)};

export function getBlastResistance(block) {
    return BlastResistance[block?.typeId] ?? 0;
}

export function getBlastResistanceById(blockId) {
    return BlastResistance[blockId] ?? 0;
}
`;

fs.writeFileSync(
    "../src/generated/blastResistance.js",
    output
);

console.log("Generated blastResistance.js into the src");