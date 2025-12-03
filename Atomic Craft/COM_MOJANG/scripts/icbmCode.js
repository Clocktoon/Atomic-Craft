import {world, system, BlockVolume, InputInfo} from "@minecraft/server"

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const player = ev.player
    const entity = ev.target
    const itemstack = ev.itemStack

    if(itemstack.typeId === "atomic:blue_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
            entity.setProperty("atomic:blue", true)
    }
    if(itemstack.typeId === "atomic:green_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
        entity.setProperty("atomic:green", true)
    }
    if(itemstack.typeId === "atomic:purple_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
        entity.setProperty("atomic:purple", true)
    }
    if(itemstack.typeId === "atomic:white_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
        entity.setProperty("atomic:white", true)
    }
    if(itemstack.typeId === "atomic:red_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
        entity.setProperty("atomic:red", true)
    }
    if(itemstack.typeId === "atomic:yellow_chip" && entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
        entity.setProperty("atomic:yellow", true)
    }
})


world.afterEvents.entityDie.subscribe((ev) => {
    const entity = ev.deadEntity

    if(entity.typeId === "atomic:icbm" && entity.getProperty("atomic:ex") === true) {
        function* exlposion() {
        const x = entity.location.x
        const z = entity.location.z
        const px = entity.location.x
        const pz = entity.location.z
        const py = entity.location.y

             block.dimension.runCommand(`tickingarea add 
                ${x - 70} 0 ${z - 70} ${x + 60} 0 ${z + 60} i1`)
        
                        for (const eny of entity.dimension.getEntities({ location: entity.location, maxDistance: 100 })) {
                            if (eny.typeId == "minecraft:player") {
                                eny.runCommand("camera @s fade time 1 3 1 color 255 255 255")
                                eny.runCommand("camerashake add @s 1 10")
                            }
                            eny.setOnFire(10)
                        }
        
                        entity.dimension.spawnParticle("atomic:nukepart2", entity.location)
                        entity.dimension.createExplosion(block.location, 20,
                            { causesFire: true, allowUnderwater: false })
        
                        // Sound code by MapleStar // TC (discord)
                        function playExplosionAudio(dimension, center, magnitude) {
                            if (!center) return;
        
                            const players = dimension.getPlayers();
                            const explosionRadius = Math.min(Math.max(8, Math.floor(Math.cbrt(magnitude) * 3)), 60);
                            const maxHearingDistance = explosionRadius * 24;
        
                            players.forEach(player => {
                                const playerLocation = player.location;
                                const dx = playerLocation.x - center.x;
                                const dy = playerLocation.y - center.y;
                                const dz = playerLocation.z - center.z;
                                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
                                if (distance > maxHearingDistance) return;
        
                                const maxEffectRadius = explosionRadius * 2;
                                const intensity = Math.max(0, 1.0 - (distance / maxEffectRadius));
        
                                const distanceRatio = Math.min(1, distance / maxHearingDistance);
                                const boomVolume = Math.max(0.2, 2.5 * (1 - distanceRatio * 0.8));
                                const boomPitch = 0.8 + (Math.random() * 0.2) - (distanceRatio * 0.1);
        
                                const delayTicks = Math.min(100, Math.floor(distance / 17));
                                const delayMs = delayTicks * 50;
        
                                system.runTimeout(() => {
                                    try {
                                        dimension.runCommand(
                                            `playsound "atomic.nukesound" ${player.name} ${playerLocation.x} ${playerLocation.y} ${playerLocation.z} ${boomVolume} ${boomPitch}`
                                        );
        
                                    } catch (err) { }
                                }, delayMs);
                            });
                        };
                        const playdi = entity.dimension
        
                        playExplosionAudio(playdi, block.location, 30)
        
                        yield
                        const math = Math.floor(Math.random() * 10)
        
                        const point1 = {
                            x: entity.location.x - 2 + math,
                            y: entity.location.y - 6,
                            z: entity.location.z - 2 + math
                        }
                        const point2 = {
                            x: entity.location.x + 2 + math,
                            y: entity.location.y,
                            z: entity.location.z + 2 + math
                        }
        
                        const vol = new BlockVolume(point1, point2)
        
                        entity.dimension.fillBlocks(vol, "minecraft:air", {
                            ignoreChunkBoundErrors: true,
                            blockFilter: { excludeTypes: ["minecraft:air"] }
                        })
                        yield
        
                        const from = {
                            x: entity.location.x - 150,
                            y: entity.location.y - 20,
                            z: entity.location.z - 150
                        }
        
                        const to = {
                            x: entity.location.x + 150,
                            y: entity.location.y + 30,
                            z: entity.location.z + 150
        
                        }
        
                        yield
                        const blockvol = new BlockVolume(from, to)
        
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 60, y: py, z: pz + 60 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 60, y: py, z: pz - 60 })
        
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 80, y: py, z: pz + 80 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 80, y: py, z: pz - 80 })
        
        
                        const blocklist = entity.dimension.getBlocks(blockvol, {
                            excludeTypes: ["minecraft:air", "minecraft:water",
                                "minecraft:lava", "minecraft:flowing_lava", "minecraft:flowing_water", "minecraft:jungle_leaves",
                                "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                                "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                                "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:fire", "minecraft:glass",
                                "minecraft:coal_ore", "minecraft:iron_block", "minecraft:piston", "minecraft:sticky_piston",
                                "minecraft:iron_door", "minecraft:vine"], excludeTags: ["log"]
                        }, true)
        
                        for (const locy of blocklist.getBlockLocationIterator()) {
                            const blocc = entity.dimension.getBlock(locy)
                            blocc.setType("atomic:radiation_block")
                            yield
                        }
                        const blockGet = entity.dimension.getBlocks(blockvol, {
                            includeTypes: ["minecraft:jungle_leaves",
                                "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                                "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                                "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:glass", "minecraft:vine"]
                        }, true);
        
                        for (const location of blockGet.getBlockLocationIterator()) {
                            const blocks = entity.dimension.getBlock(location)
                            blocks.setType("minecraft:air")
                            yield
                        }
                        const blockLeaves = entity.dimension.getBlocks(blockvol, {
                            includeTags: ["log"]
                        }, true)
                        for (const loc of blockLeaves.getBlockLocationIterator()) {
                            const blocky = entity.dimension.getBlock(loc)
                            blocky.setType("atomic:burned_log")
                            yield
                        }
                        yield
                        const dim = entity.dimension.getBlocks(blockvol, {
                            includeTypes: ["minecraft:coal_ore"]
                        })
                        for (const di of dim.getBlockLocationIterator()) {
                            const dima = entity.dimension.getBlock(di)
                            dima.setType("atomic:radiation_diamond_block")
                            yield
                        }
                        yield
                        const from2 = {
                            x: entity.location.x - 400,
                            y: entity.location.y - 40,
                            z: entity.location.z - 400
                        }
        
                        const to2 = {
                            x: entity.location.x + 400,
                            y: entity.location.y + 60,
                            z: entity.location.z + 400
                        }
        
                        const blockvol2 = new BlockVolume(from2, to2)
                        // It is not a large enough size, some chunks are unloaded 
                        entity.dimension.runCommand(`tickingarea add 
                        ${px + 80} 0 ${pz + 80} ${px + 210} 0 ${pz + 210} i2`)
        
                        entity.dimension.runCommand(`tickingarea add 
                        ${px - 80} 0 ${pz - 80} ${px - 210} 0 ${pz - 210} i3`)
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 140, y: py, z: pz + 140 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 140, y: py, z: pz - 140 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 170, y: py, z: pz + 170 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 170, y: py, z: pz - 170 })
                         entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 200, y: py, z: pz - 200 })
                         entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 200, y: py, z: pz + 200 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 260, y: py, z: pz - 260 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 330, y: py, z: pz + 330 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px - 400, y: py, z: pz - 400 })
                        entity.dimension.spawnEntity("atomic:gen_entity", { x: px + 400, y: py, z: pz + 400 })
        
        
                        yield
                        const getGrass = entity.dimension.getBlocks(blockvol2,
                            { includeTypes: ["minecraft:grass"] })
        
                        for (const location of getGrass.getBlockLocationIterator()) {
                            const blocks = entity.dimension.getBlock(location)
                            blocks.setType("atomic:dead_grass")
                            yield
                        }
                        const lostLeaves = entity.dimension.getBlocks(blockvol, {
                            includeTags: ["log"]
                        }, true)
                        for (const loc of lostLeaves.getBlockLocationIterator()) {
                            const blocky = entity.dimension.getBlock(loc)
                            blocky.setType("atomic:burned_log")
                            yield
                            }
                    const getLeaves = entity.dimension.getBlocks(blockvol2, {
                    includeTypes: ["minecraft:jungle_leaves",
                        "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                        "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves"]
                })
                for(const location of getLeaves.getBlockLocationIterator()) {
                    const blocks = entity.dimension.getBlock(location)
                    blocks.setType("atomic:radi_leave")
                    yield
                }
                yield;
                            
                        entity.dimension.runCommand("tickingarea remove i1")
                        entity.dimension.runCommand("tickingarea remove i2")
                        entity.dimension.runCommand("tickngarea remove i3")
                        entity.dimension.runCommand("kill @e[type=atomic:gen_entity]")
}
system.runJob(exlposion())

    }
}
)
