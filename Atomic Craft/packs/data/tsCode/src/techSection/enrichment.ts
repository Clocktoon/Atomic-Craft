import {BlockCustomComponent, system, BlockComponentRedstoneUpdateEvent, BlockComponentTickEvent, CustomComponentParameters} from "@minecraft/server"
import { BlockStateSuperset } from "@minecraft/vanilla-data"

/* Centrifuge beta code, might change once block entites come out, current idea is
to make it so you have to power it with redstone, then once given something to refine it will
output the result in a nearby chest/other storage block */

//Change of plans, still powered by redstone but will probably have its own UI instead of using a chest


class EnricherComp implements BlockCustomComponent {
    //Redstone part, starts smoke coming out and allows other things
    onRedstoneUpdate(event: BlockComponentRedstoneUpdateEvent) {
        const block = event.block
        const dimension = event.dimension
        const level = event.powerLevel

        if(level > 0) {
        block.setPermutation(block.permutation.withState("atomic:enrich_on" as keyof BlockStateSuperset,true))
        const particleSpawn = system.runInterval(() => {
            if(level < 0 || !block.isValid) {
                system.clearRun(particleSpawn)
                return;
            }
            dimension.spawnParticle("atomic:cent_part", block.location)
        },40)
        }
        else {
              block.setPermutation(block.permutation
                .withState("atomic:enrich_on" as keyof BlockStateSuperset,false))
        }
    }

}