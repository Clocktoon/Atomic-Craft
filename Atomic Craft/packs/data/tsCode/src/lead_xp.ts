
//TAKEN FROM BEDROCK ADDONS WIKI https://wiki.bedrock.dev/blocks/ore-loot-tables

import { system, EquipmentSlot, Block, Dimension, Player, BlockCustomComponent, BlockComponentPlayerBreakEvent, CustomComponentParameters } from "@minecraft/server";

/**
 * @param {number} min The minimum integer
 * @param {number} max The maximum integer
 * @returns {number} A random integer between the `min` and `max` parameters (inclusive)
 * */
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
type par = {
    min: number;
    max: number
}
class BlockExperienceRewardComponent implements BlockCustomComponent {
    onPlayerBreak(ev: BlockComponentPlayerBreakEvent, param: CustomComponentParameters ) {
        const {block, dimension, player} = ev
        const params = param.params as par
        // Check the tool in the player's hand
        const equippable = player?.getComponent("minecraft:equippable");
        if (!equippable) return; // Exit if the player or its equipment are undefined

        const itemStack = equippable.getEquipment(EquipmentSlot.Mainhand);
        if (
            !itemStack ||
            !itemStack.hasTag("minecraft:is_tool") ||
            !itemStack.hasTag("minecraft:is_pickaxe") ||
            (!itemStack.hasTag("minecraft:iron_tier") &&
                !itemStack.hasTag("minecraft:diamond_tier") &&
                !itemStack.hasTag("minecraft:netherite_tier"))
        )
            return; // Exit if the player isn't holding a suitable pickaxe

        // Specify enchantments
        const enchantable = itemStack.getComponent("minecraft:enchantable");
        const silkTouch = enchantable?.getEnchantment("silk_touch");
        if (silkTouch) return; // Exit if the iron pickaxe has the Silk Touch enchantment

        // Spawn the XP orbs
        const xpAmount = randomInt(params.min, params.max); // Number of XP orbs to spawn

        for (let i = 0; i < xpAmount; i++) {
            dimension.spawnEntity("minecraft:xp_orb", block.location);
        }
    }
};

// Register a custom component before the world is loaded
system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent(
        "atomic:experience_reward",
        new BlockExperienceRewardComponent
    );
});