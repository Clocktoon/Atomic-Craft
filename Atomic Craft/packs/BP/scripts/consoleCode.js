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
        form.textField("Coordinates","Like: 0 0 0")
        

        form.show(player).then((r => {

            const textField = r.formValues
          const entityGet =  block.dimension.getEntities({location: block.location, maxDistance: 40})
            
                for(let entity of entityGet) {
                    if(entity.typeId == "atomic:icbm" && entity.getProperty("atomic:blue") === true || NaN) {
                        dimension.spawnEntity("atomic:blue_mark", textField)
                        
                    }
                }

        })).catch(e => {
            console.error(e,e.stack)
        })

    }
}