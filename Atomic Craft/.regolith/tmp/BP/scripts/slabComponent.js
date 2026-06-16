import { ItemStack, system, BlockPermutation, Direction } from '@minecraft/server';
import { itemInteract, decrementStack, permutation } from './utils.js';
export class slabComponent {
    onUseOn(event) {
        const { source: player, block, blockFace } = event;
        const belowBlock = block.below(1);
        const aboveBlock = block.above(1);
        const northBlock = block.north(1);
        const southBlock = block.south(1);
        const eastBlock = block.east(1);
        const westBlock = block.west(1);
        const blockId = {
            blockk: block.typeId,
            aboveBlockId: aboveBlock.typeId,
            belowBlockId: belowBlock.typeId,
            northBlockId: northBlock.typeId,
            southBlockId: southBlock.typeId,
            eastBlockId: eastBlock.typeId,
            westBlockId: westBlock.typeId,
        };
        const states = {
            state: block.permutation.getState('minecraft:vertical_half'),
            belowState: belowBlock.permutation.getState('minecraft:vertical_half'),
            aboveState: aboveBlock.permutation.getState('minecraft:vertical_half'),
        };
        const blockedStates = {
            nbState: northBlock.permutation.getState('namespace:blocked'),
            sbState: southBlock.permutation.getState('namespace:blocked'),
            ebState: eastBlock.permutation.getState('namespace:blocked'),
            wbState: westBlock.permutation.getState('namespace:blocked'),
        };
        const mainhand = itemInteract(player);
        if (!mainhand.hasItem())
            return;
        if (mainhand.typeId == blockId.blockk) {
            if (blockFace == "Up" && states.state == "bottom") {
                const playerLocation = player.location;
                const blockLocation = block.location;
                if (Math.floor(playerLocation.x) === blockLocation.x && Math.floor(playerLocation.z) === blockLocation.z && Math.floor(playerLocation.y) === blockLocation.y) {
                    return;
                }
                let doubleId = blockId.blockk.replace('slab', 'double_slab');
                block.setType(doubleId);
                block.dimension.playSound('use.wood', block.center());
                decrementStack(player, mainhand);
            }
            if (blockFace == "Down" && states.state == "top") {
                let doubleId = blockId.blockk.replace('slab', 'double_slab');
                block.setType(doubleId);
                block.dimension.playSound('use.wood', block.center());
                decrementStack(player, mainhand);
            }
        }
        //down
        if (mainhand.typeId == blockId.belowBlockId && blockFace == "Down" && states.belowState == "bottom") {
            let doubleId = blockId.belowBlockId.replace('slab', 'double_slab');
            belowBlock.setType(doubleId);
            belowBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
        //up
        if (mainhand.typeId == blockId.aboveBlockId && blockFace == "Up" && states.aboveState == "top") {
            let doubleId = blockId.aboveBlockId.replace('slab', 'double_slab');
            aboveBlock.setType(doubleId);
            aboveBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
        //north
        if (mainhand.typeId == blockId.northBlockId && blockFace == "North" && !blockedStates.nbState) {
            let doubleId = blockId.northBlockId.replace('slab', 'double_slab');
            northBlock.setType(doubleId);
            northBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
        //south
        if (mainhand.typeId == blockId.southBlockId && blockFace == "South" && !blockedStates.sbState) {
            let doubleId = blockId.southBlockId.replace('slab', 'double_slab');
            southBlock.setType(doubleId);
            southBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
        //east
        if (mainhand.typeId == blockId.eastBlockId && blockFace == "East" && !blockedStates.ebState) {
            let doubleId = blockId.eastBlockId.replace('slab', 'double_slab');
            eastBlock.setType(doubleId);
            eastBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
        //west
        if (mainhand.typeId == blockId.westBlockId && blockFace == "West" && !blockedStates.wbState) {
            let doubleId = blockId.westBlockId.replace('slab', 'double_slab');
            westBlock.setType(doubleId);
            westBlock.dimension.playSound('use.wood', block.center());
            decrementStack(player, mainhand);
        }
    }
}
export class slabBlockComponent {
    onPlace({ block }) {
        let id = system.runInterval(() => {
            permutation(block, 'namespace:blocked', false);
            return system.clearRun(id);
        }, 1);
    }
    beforeOnPlayerPlace(event) {
        const { player, block, face } = event;
        const belowBlock = block.below(1);
        const aboveBlock = block.above(1);
        const slabBelow = belowBlock.typeId;
        const slabAbove = aboveBlock.typeId;
        const verticalStateA = aboveBlock.permutation.getState('minecraft:vertical_half');
        const verticalStateB = belowBlock.permutation.getState('minecraft:vertical_half');
        const mainhand = itemInteract(player);
        if (!mainhand.hasItem())
            return;
        if (mainhand.typeId == slabBelow && verticalStateB == "bottom" && face == Direction.Up) {
            event.cancel = true;
        }
        if (mainhand.typeId == slabAbove && verticalStateA == "top" && face == Direction.Down) {
            event.cancel = true;
        }
    }
}
