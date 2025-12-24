import {world} from "@minecraft/server"
import { ActionFormData, ModalFormData } from "@minecraft/server-ui"

     let form = new ModalFormData()

        form.title("Put in coordinates")
        form.textField("X","Put x cord")
        form.textField("Z","Put z cord")
        .submitButton("Launch")

world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target
    const player = ev.player

    if(entity.typeId === "atomic:himar") {

        form.show(player)
        .then((r) => {
            if(r.canceled) return;

            let [xO,zO] = r.formValues
            let x = Number(xO)
            let z = Number(zO)
            const y = player.dimension.getTopmostBlock({x: x, z: z}).location.y

            entity.setProperty("atomic:launching",true)
            
            entity.dimension.runCommand(`tickingarea add ${x - 20} ${z - 20} ${x + 20} ${z + 20} spawnarea`)
            entity.dimension.spawnEntity("atomic:hate",{x: x, y: y, z: z})
            entity.dimension.spawnEntity("atomic:himar_missile",{x: entity.location.x, y: entity.location.y + 4, z: entity.location.z})

            entity.runCommand("tickingarea remove spawnarea")
            entity.setProperty("atomic:launching",false)
        }).catch(e => {
            console.error(e, e.stack)
        })
    }
})