import { system, BlockVolume, world } from "@minecraft/server"
import { createCrater } from "./crater"

/** @type {import("@minecraft/server").BlockCustomComponent} */
const Clicky = {
    onPlayerInteract(ev) {
        const block = ev.block
        const player = ev.player
        const dimension = ev.dimension

        const px = block.location.x
        const pz = block.location.z
        const py = block.y

        /* block.dimension.runCommand(`tickingarea add 
                ${px - 70} 0 ${pz - 70} ${px + 60} 0 ${pz + 60} hb1`)
                */
        // Create multiple ticking areas to cover the large region (each under 255 chunks)
        const createTickingAreas = async () => {
            const areas = [
                { name: "hb1", from: { x: px - 100, y: -100, z: pz - 100 }, to: { x: px + 100, y: 100, z: pz + 100 } },
                { name: "hb2", from: { x: px + 80, y: -100, z: pz + 80 }, to: { x: px + 210, y: 100, z: pz + 210 } },
                { name: "hb3", from: { x: px - 80, y: -100, z: pz - 80 }, to: { x: px - 210, y: 100, z: pz - 210 } },
                { name: "hb4", from: { x: px + 195, y: -100, z: pz + 195 }, to: { x: px + 330, y: 100, z: pz + 330 } },
                { name: "hb5", from: { x: px - 195, y: -100, z: pz - 195 }, to: { x: px - 330, y: 100, z: pz - 330 } }
            ];

            for (const area of areas) {
                await world.tickingAreaManager.createTickingArea(area.name, {
                    from: area.from,
                    to: area.to,
                    dimension: block.dimension
                });
            }
        };

        createTickingAreas().then(() => {

        let seconds = 20
        player.sendMessage(`You have ${seconds} seconds to run`)


        const sys = system.runInterval(() => {
            if (seconds >= 1) {
                player.onScreenDisplay.setActionBar(`${seconds} seconds left`)
                seconds--
            }
            if (seconds <= 0) {
                system.clearRun(sys)
            }

        }, 20)
        block.dimension.playSound("atomic.beep", block.location)
        system.runTimeout(() => {
            function* blockGen() {

                for (const eny of block.dimension.getEntities({ location: block.location, maxDistance: 70 })) {
                    if (eny.typeId == "minecraft:player") {
                        eny.runCommand("camera @s fade time 1 3 1 color 255 255 255")
                        eny.runCommand("camerashake add @s 1 10")
                    }
                    eny.setOnFire(4)
                    eny.applyDamage(3)
                    if (eny.runCommand(`testfor @s[hasitem={item=atomic:gas_mask,location=slot.armor.head}]`).successCount <= 0 && eny.typeId !== "atomic:gen_entity") {
                    eny.addTag("atomic:rad_effect")
                    }
                }
                
                
                block.dimension.spawnParticle("atomic:nukepart2", 
                    {x: block.location.x, y: block.location.y - 26, z: block.location.z})
                block.dimension.createExplosion(block.location, 20,
                    { causesFire: true, allowUnderwater: false })
                // Crater code
                createCrater(block.location, block.dimension.id, "minecraft:air", 60, 30)
                

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
                const playdi = player.dimension

                playExplosionAudio(playdi, block.location, 30)

                yield
                const math = Math.floor(Math.random() * 10)

                const point1 = {
                    x: block.location.x - 2 + math,
                    y: block.location.y - 6,
                    z: block.location.z - 2 + math
                }
                const point2 = {
                    x: block.location.x + 2 + math,
                    y: block.location.y,
                    z: block.location.z + 2 + math
                }

                const vol = new BlockVolume(point1, point2)

                block.dimension.fillBlocks(vol, "minecraft:air", {
                    ignoreChunkBoundErrors: true,
                    blockFilter: { excludeTypes: ["minecraft:air"] }
                })
                yield

                const from = {
                    x: block.location.x - 200,
                    y: block.location.y - 20,
                    z: block.location.z - 200
                }

                const to = {
                    x: block.location.x + 200,
                    y: block.location.y + 30,
                    z: block.location.z + 200

                }

                yield
                const blockvol = new BlockVolume(from, to)
//TODO: Optimize entity spawning with fewer calls
                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 60, y: py, z: pz + 60 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 60, y: py, z: pz - 60 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 70, y: py, z: pz + 70 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 70, y: py, z: pz - 70 })

                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 100, y: py, z: pz + 100 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 100, y: py, z: pz - 100 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 140, y: py, z: pz + 140 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 140, y: py, z: pz - 140 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 170, y: py, z: pz + 170 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 170, y: py, z: pz - 170 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px + 200, y: py, z: pz + 200 })
                block.dimension.spawnEntity("atomic:gen_entity", { x: px - 200, y: py, z: pz - 200 })


                const blocklist = block.dimension.getBlocks(blockvol, {
                    excludeTypes: ["minecraft:air", "minecraft:water",
                        "minecraft:lava", "minecraft:flowing_lava", "minecraft:flowing_water", "minecraft:jungle_leaves",
                        "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                        "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:fire", "minecraft:glass",
                        "minecraft:coal_ore", "minecraft:iron_block", "minecraft:piston", "minecraft:sticky_piston",
                        "minecraft:iron_door", "minecraft:vine"], excludeTags: ["log"]
                }, true)

                for (const locy of blocklist.getBlockLocationIterator()) {
                    const blocc = dimension.getBlock(locy)
                    blocc.setType("atomic:radiation_block")
                    yield
                }
                const blockGet = block.dimension.getBlocks(blockvol, {
                    includeTypes: ["minecraft:jungle_leaves",
                        "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                        "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:glass", "minecraft:vine"]
                }, true);

                for (const location of blockGet.getBlockLocationIterator()) {
                    const blocks = dimension.getBlock(location)
                    blocks.setType("minecraft:air")
                    yield
                }
                const blockLeaves = block.dimension.getBlocks(blockvol, {
                    includeTags: ["log"]
                }, true)
                for (const loc of blockLeaves.getBlockLocationIterator()) {
                    const blocky = dimension.getBlock(loc)
                    blocky.setType("atomic:burned_log")
                    yield
                }
                yield
                const dim = block.dimension.getBlocks(blockvol, {
                    includeTypes: ["minecraft:coal_ore"]
                })
                for (const di of dim.getBlockLocationIterator()) {
                    const dima = dimension.getBlock(di)
                    dima.setType("atomic:radiation_diamond_block")
                    yield
                }
                yield
                const from2 = {
                    x: block.location.x - 500,
                    y: block.location.y - 70,
                    z: block.location.z - 500
                }

                const to2 = {
                    x: block.location.x + 500,
                    y: block.location.y + 60,
                    z: block.location.z + 500
                }

                const blockvol2 = new BlockVolume(from2, to2)
                // It is not a large enough size, some chunks are unloaded 
                yield
                const entity1 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 200, y: py, z: pz - 200 })
                const entity2 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 200, y: py, z: pz + 200 })
                const entity3 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 250, y: py, z: pz - 250 })
                const entity4 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 250, y: py, z: pz + 250 })
                const entity5 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 300, y: py, z: pz - 300 })
                const entity6 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 300, y: py, z: pz + 300 })
                const entity7 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 350, y: py, z: pz - 350 })
                yield
                const entity8 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 350, y: py, z: pz + 350 })
                const entity9 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 400, y: py, z: pz - 400 })
                const entity10 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 400, y: py, z: pz + 400 })
                const entity11 = block.dimension.spawnEntity("atomic:gen_entity", { x: px + 440, y: py, z: pz + 440 })
                const entity12 = block.dimension.spawnEntity("atomic:gen_entity", { x: px - 440, y: py, z: pz - 440 })
                // Spawning entities in a large area to prevent chunk unloading and ensure the explosion's effects are visible across the entire radius
                entity1
                entity2
                entity3
                entity4
                entity5
                entity6
                entity7
                yield
                entity8
                entity9
                entity10
                entity11
                entity12

                yield
                const getGrass = block.dimension.getBlocks(blockvol2,
                    { includeTypes: ["minecraft:grass"] })

                for (const location of getGrass.getBlockLocationIterator()) {
                    const blocks = dimension.getBlock(location)
                    blocks.setType("atomic:dead_grass")
                    yield
                }
                const getLeaves = block.dimension.getBlocks(blockvol2, {
                    includeTypes: ["minecraft:jungle_leaves",
                        "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                        "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves"]
                })
                for(const location of getLeaves.getBlockLocationIterator()) {
                    const blocks = dimension.getBlock(location)
                    blocks.setType("atomic:radi_leave")
                    yield
                }
                yield;

                // Removing ticking areas and kill entities after the explosion
                world.tickingAreaManager.removeTickingArea("hb1")
                world.tickingAreaManager.removeTickingArea("hb2")
                world.tickingAreaManager.removeTickingArea("hb3")
                world.tickingAreaManager.removeTickingArea("hb4")
                world.tickingAreaManager.removeTickingArea("hb5")
                entity1.kill()
                entity2.kill()
                entity3.kill() 
                entity4.kill()
                entity5.kill()
                entity6.kill()
                entity7.kill()
                entity8.kill()
                entity9.kill()
                entity10.kill()
                entity11.kill()
                entity12.kill()
            }
            system.runJob(blockGen())
            // this is it
            
        }, 400)
        })
    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:hb_explode", Clicky)
})