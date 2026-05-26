import { BlockComponentPlayerInteractEvent, system, BlockComponentRegistry } from "@minecraft/server";
import {OnClick} from "../nuclearTransforms/nukeCode"


class AtomBomb extends OnClick{
    constructor() {
        super()
    }
    onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
        super.onPlayerInteract(event)
    }
}


system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("atomic:atom_bomb", new OnClick());
});