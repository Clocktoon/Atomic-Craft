import { world, system, BlockVolume } from "@minecraft/server";
import { CustomForm, ObservableBoolean } from "@minecraft/server-ui";
world.afterEvents.entitySpawn.subscribe((ev) => {
    const entity = ev.entity;
    if (entity.typeId === "atomic.siren") {
        ev.entity.runCommand("title @p actionbar Click to scan for nukes");
    }
});
world.afterEvents.playerInteractWithEntity.subscribe((e) => {
    const player = e.player;
    const target = e.target;
    const playerDimension = player.dimension.id;
    const dimension = world.getDimension(playerDimension);
    const tog = new ObservableBoolean(false, { clientWritable: true });
    const form = new CustomForm(player, "Siren");
    tog.subscribe((v) => {
        if (v === true) {
            const sy = system.runInterval(() => {
                let sound = true;
                const getMissiles = target.dimension.getEntities({
                    families: ["bmissile", "tmissile"]
                });
                for (const entity of getMissiles) {
                    if (entity) {
                        if (sound)
                            target.dimension.playSound("atomic.siren", target.location);
                        player.sendMessage(`Missiles nearby!`);
                        sound = false;
                    }
                }
                const blockGet = target.dimension.getBlocks(blockVolume, { includeTypes: ["atomic:atom_bomb"] });
                for (const location of blockGet.getBlockLocationIterator()) {
                    const block = dimension.getBlock(location);
                    if (block) {
                        if (sound)
                            target.dimension.playSound("atomic.siren", target.location);
                        sound = false;
                        player.sendMessage(`Nuclear bomb at ${JSON.stringify(block.location)}`);
                    }
                }
            }, 1);
            if (!form.isShowing()) {
                system.clearRun(sy);
            }
        }
        if (v === false) {
            player.runCommand("stopsound @a atomic.siren");
        }
    });
    const from = {
        x: target.location.x - 10,
        y: target.location.y - 10,
        z: target.location.z - 10
    };
    const to = {
        x: target.location.x + 10,
        y: target.location.y + 10,
        z: target.location.z + 10
    };
    const blockVolume = new BlockVolume(from, to);
    if (target.typeId === "atomic:siren") {
        form.label("Siren")
            .divider()
            .toggle("On/Off", tog)
            .show();
    }
    if (player.isSneaking && target.typeId === "atomic:siren") {
        player.runCommand("stopsound @a atomic.siren");
    }
});
world.afterEvents.entityDie.subscribe((event) => {
    const entity = event.deadEntity;
    if (entity.typeId === "atomic:siren") {
        entity.runCommand("stopsound @a atomic.siren");
    }
});
//# sourceMappingURL=sirenCode.js.map