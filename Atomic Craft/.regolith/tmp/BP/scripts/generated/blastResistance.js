/**
 * A list of blocks blast resistance
 */
export const BlastResistance = {
    "minecraft:oak_planks": 3,
    "minecraft:spruce_planks": 3,
    "minecraft:birch_planks": 3,
    "minecraft:jungle_planks": 3,
    "minecraft:stone": 6,
    "minecraft:granite": 6,
    "minecraft:diorite": 6,
    "minecraft:andesite": 6,
    "minecraft:cobblestone": 6,
    "minecraft:deepslate": 6,
    "minecraft:ender_chest": 600,
    "minecraft:obsidian": 1200,
    "minecraft:crying_obsidian": 1200,
    "minecraft:ancient_debris": 1200,
    "minecraft:netherite_block": 1200,
    "minecraft:reinforced_deepslate": 1200,
    "minecraft:bedrock": 3600000,
    "minecraft:command_block": 3600000,
    "minecraft:chain_command_block": 3600000,
    "minecraft:repeating_command_block": 3600000,
    "minecraft:dirt": 0.5,
    "minecraft:sand": 0.5,
    "minecraft:mud": 0.5
};
/**
 * Blast thingy
 *
 * @export
 * @param {*} block
 * @returns {*}
 */
export function getBlastResistance(block) {
    return BlastResistance[block?.typeId] ?? 0;
}
export function getBlastResistanceById(blockId) {
    return BlastResistance[blockId] ?? 0;
}
