import {system} from "@minecraft/server"
import {ModalFormData} from "@minecraft/server-ui"

/** @type {import("@minecraft/server").BlockCustomComponent} */

const ConsoleCode = {
    onPlayerInteract(ev) {
        const player = ev.player
        const block = ev.block
        const dimension = ev.dimension

        let form = new ModalFormData()

        form.title("Put in coordinates")
        form.textField("Countdown till launch","10")
        form.textField("X","Put x cord")
        form.textField("Z","Put z cord")
        .submitButton("Launch")

        form.show(player).then((r => {

            const [countdown,xY,zY] = r.formValues
            const x = new Number(xY)
            const z = new Number(zY)
            const y = block.dimension.getTopmostBlock({x: x, z: z}).location.y
            
         const time = new Number(countdown)

            system.runTimeout(() => {
          const entityGet =  block.dimension.getEntities({location: block.location, maxDistance: 20})
                
                for(let entity of entityGet) {
                    if(entity.typeId === "atomic:icbm" || entity.typeId === "atomic:non_icbm") {
                    entity.runCommand(`tickingarea add ${x - 20} ${z - 20} ${x + 20} ${z + 20} spawnarea`)

                    if(entity.getProperty("atomic:blue") === true) {
                        dimension.spawnEntity("atomic:blue_mark",{x: x,y: y,z: z})
                        
                    }
                    if(entity.getProperty("atomic:green") === true) {
                        dimension.spawnEntity("atomic:purple_mark",{x: x,y: y,z: z})
                    }
                    if(entity.getProperty("atomic:white") === true) {
                        dimension.spawnEntity("atomic:white_mark",{x: x,y: y,z: z})
                    }
                    if(entity.getProperty("atomic:yellow") === true) {
                        dimension.spawnEntity("atomic:yellow_mark",{x: x,y: y,z: z})
                    }
                    if(entity.getProperty("atomic:purple") === true) {
                        dimension.spawnEntity("atomic:purple_mark",{x: x,y: y,z: z})
                    }
                    if(entity.getProperty("atomic:red") === true) {
                        dimension.spawnEntity("atomic:red_mark",{x: x,y: y,z: z})
                    }
                    entity.runCommand("tickingarea remove spawnarea")
                }
                }
                },time)
        })).catch(e => {
            console.error(e,e.stack)
        })

    }
}

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
    blockComponentRegistry.registerCustomComponent("atomic:console_code", ConsoleCode)
})