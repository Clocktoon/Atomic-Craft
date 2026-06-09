import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

export default {
    3600000: [
        MinecraftBlockTypes.Bedrock,
        MinecraftBlockTypes.CommandBlock,
        MinecraftBlockTypes.ChainCommandBlock,
        MinecraftBlockTypes.RepeatingCommandBlock
    ],

    1200: [
        MinecraftBlockTypes.Obsidian,
        MinecraftBlockTypes.CryingObsidian,
        MinecraftBlockTypes.AncientDebris,
        MinecraftBlockTypes.NetheriteBlock,
        MinecraftBlockTypes.ReinforcedDeepslate
    ],

    600: [
        MinecraftBlockTypes.EnderChest
    ],

    6: [
        MinecraftBlockTypes.Stone,
        MinecraftBlockTypes.Granite,
        MinecraftBlockTypes.Diorite,
        MinecraftBlockTypes.Andesite,
        MinecraftBlockTypes.Cobblestone,
        MinecraftBlockTypes.Deepslate
    ],

    3: [
        MinecraftBlockTypes.OakPlanks,
        MinecraftBlockTypes.SprucePlanks,
        MinecraftBlockTypes.BirchPlanks,
        MinecraftBlockTypes.JunglePlanks
    ],

    0.5: [
        MinecraftBlockTypes.Dirt,
        MinecraftBlockTypes.Sand,
        MinecraftBlockTypes.Mud
    ]
};