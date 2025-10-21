import { system, world, BlockVolume } from "@minecraft/server"


/** @type {import("@minecraft/server").BlockCustomComponent} */
const OnClick = {
    onPlayerInteract(event) {
        const block = event.block
        const player = event.player
        const dimension = event.dimension

        player.sendMessage("You have 20 seconds to run")
        let seconds = 20

        const sys = system.runInterval(() => {
            if (seconds >= 1) {
                player.runCommand(`title @s actionbar ${seconds}`)
                seconds--
            }
            if (seconds <= 0) {
                system.clearRun(sys)
            }

        }, 20)
        block.dimension.playSound("atomic.beep", block.location)
        system.runTimeout(() => {
            function* blockGen() {

                block.dimension.spawnParticle("atomic:nukepart", block.location)
                block.dimension.createExplosion(block.location, 15,
                    { causesFire: true, allowUnderwater: false })
                block.dimension.playSound("atomic.nukesoundd", block.location)
                player.runCommand("camerashake add @a 1 10")
                yield
                const math = Math.floor(Math.random() * 9)

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
                    x: block.location.x - 60,
                    y: block.location.y - 20,
                    z: block.location.z - 60
                }

                const to = {
                    x: block.location.x + 60,
                    y: block.location.y + 30,
                    z: block.location.z + 60

                }

                const blockvol = new BlockVolume(from, to)

                const blocklist = block.dimension.getBlocks(blockvol, {
                    excludeTypes: ["minecraft:air", "minecraft:water",
                        "minecraft:lava", "minecraft:flowing_lava", "minecraft:flowing_water", "minecraft:jungle_leaves",
                        "minecraft:azalea_leaves", "minecraft:oak_leaves", "minecraft:birch_leaves", "minecraft:spruce_leaves",
                        "minecraft:acacia_leaves", "minecraft:dark_oak_leaves", "minecraft:azalea_leaves_flowered",
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:fire", "minecraft:glass",
                        "minecraft:coal_ore", "minecraft:iron_block", "minecraft:piston", "minecraft:sticky_piston",
                        "minecraft:iron_door"], excludeTags: ["log"]
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
                        "minecraft:cherry_leaves", "minecraft:pale_oak_leaves", "minecraft:glass"]
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
                    x: block.location.x - 100,
                    y: block.location.y - 20,
                    z: block.location.z - 100
                }

                const to2 = {
                    x: block.location.x + 100,
                    y: block.location.y + 30,
                    z: block.location.z + 100
                }

                const blockvol2 = new BlockVolume(from2, to2)

                yield
                const getGrass = block.dimension.getBlocks(blockvol2,
                    { includeTypes: ["minecraft:grass"] })

                for (const location of getGrass.getBlockLocationIterator()) {
                    const blocks = dimension.getBlock(location)
                    blocks.setType("atomic:dead_grass")
                    yield
                }
                yield;

            }
            system.runJob(blockGen())
        }, 400)
    }
}


system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:blow", OnClick)
})