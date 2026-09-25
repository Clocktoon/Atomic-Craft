import {
  system,
  world,
  BlockVolume,
  BlockCustomComponent,
  BlockComponentPlayerInteractEvent,
  Dimension,
  Vector3,
  EquipmentSlot,
  Block,
  Player
} from "@minecraft/server";
import { createCrater } from "../nuclearTransforms/crater.js";
import { shockwaveBlast } from "../nuclearTransforms/shockwave.js";
import { aftermath } from "../aftermath.js";
import { nuclearArea } from "../nuclearTransforms/volumeCode.js";
import { MessageBox } from "@minecraft/server-ui";
import { getBlastResistance } from "../generated/blastResistance.js";
import { addRadiationDose } from "../radiationSystem/radiationManger.js";
import { distance, directionTo } from "./gadget.js";
import { BlockStateSuperset } from "@minecraft/vanilla-data";
import { playExplosionAudio } from "./nuclearSound.js";

function makeRandomId() {
  //Taken from a free to use script by Coolbep on https://bedrock-snippets.vercel.app/
  return `${Date.now()}+${Math.random()}`;
}

export function nuclearBombFisson(block: Block, playerEntity: Player, dimension: Dimension, doMenu: boolean) {
  const randomMath = makeRandomId();
  const random = `${randomMath}`;

  const playerMain = playerEntity;
  
   if(doMenu) {

      if(!playerEntity)
        return;
      
    new MessageBox(playerEntity, "Confirm")
    .body({translate: "nuke.menu.body.name"})
      .button1({translate: "nuke.menu.buttonone.name"}, {translate: "nuke.menu.tooltipone.name"})
      .button2({translate: "nuke.menu.buttontwo.name"}, {translate: "nuke.menu.tooltiptwo.name"})
    .show()
    .then((rep) => {

      if(rep.selection === 1) {
        if(block.typeId === "atomic:atom_bomb") {
            block.setPermutation(block.permutation.withState("atomic:activated" as keyof BlockStateSuperset, true))
          }
      nuclearBomb()
      }

    }).catch(e => {
      playerEntity?.sendMessage(`${e}`)
    });
  }
  if(!doMenu) {
    nuclearBomb()
  }

    function nuclearBomb(): void {
    if (!playerMain) return;

    const px = block.location.x;
    const pz = block.location.z;
    const py = block.location.y;

    const ran = `nukearea${random}`
    //Ticking area for the stuff close to the explosion
    world.tickingAreaManager.createTickingArea(ran, {
        from: { x: px - 60, y: 0, z: pz - 60 },
        to: { x: px + 60, y: 0, z: pz + 60 },
        dimension: block.dimension,
      })
      .then(() => {
        let seconds: number = 20;
        playerMain.sendMessage(`You have ${seconds} seconds to run`);

        const sys = system.runInterval(() => {
          if (seconds >= 1) {
            playerMain.onScreenDisplay.setActionBar(`${seconds} seconds left`);
            seconds--;
          }
          if (seconds <= 0) {
            system.clearRun(sys);
          }
        }, 20);
        block.dimension.playSound("atomic.beep", block.location);

        system.runTimeout(() => {
          function* blockGen() {

            let radius = 30;

            //Dead mobs
            const deadZoneArea = block.dimension.getEntities({
              location: block.location,
              minDistance: 1,
              maxDistance: 50,
            });

            for (const die of deadZoneArea) {
              die.kill();
            }
            //Radiation and burning of mobs
            const players = block.dimension.getPlayers({
              location: block.location,
              minDistance: 50,
              maxDistance: 120,
            });

            for (const eny of block.dimension.getEntities({
              location: block.location,
              minDistance: 50,
              maxDistance: 120,
            })) {
              if (eny.typeId === "atomic:plane") continue;

              const dist = distance(block.location, eny.location);
                eny.setOnFire(20);
                addRadiationDose(eny, 150);
              }

            for (const playerRadi of players) {
              const dist = distance(block.location, playerRadi.location);

              const hit = dimension.getBlockFromRay(
                playerRadi.location,
                directionTo(block.location, playerRadi.location),
                { maxDistance: dist },
              );

              if (hit) {
                const shielding = getBlastResistance(hit.block);
                if (shielding >= 1200) {
                  continue;
                } else {
                  const resistance = shielding * 2;
                  addRadiationDose(playerRadi, 40 - resistance);
                }
              } else {
                playerRadi.camera.fade({
                  fadeColor: { red: 1, blue: 1, green: 1 },
                  fadeTime: { fadeInTime: 1, holdTime: 3, fadeOutTime: 1 },
                });
                playerRadi.setOnFire(20);
                if (
                  playerRadi
                    .getComponent("minecraft:equippable")
                    ?.getEquipment(EquipmentSlot.Head)?.typeId !==
                  "atomic:gas_mask"
                ) {
                  addRadiationDose(playerRadi, 150);
                }
              }
            }

            block.dimension.spawnParticle("atomic:nukepart", {
              x: block.location.x,
              y: block.location.y - 10,
              z: block.location.z,
            });
           
            // Crater code
            const randomMath = Math.floor(Math.random() * 20)
            system.runJob((function* () {
                yield* createCrater(
                  block.location,
                  block.dimension.id,
                  "minecraft:air",
                  50,
                  30,
                );
                world.tickingAreaManager.removeTickingArea(`nukearea${random}`);
              })());
           

            
            if (!playerMain) return;
            const playdi = playerMain.dimension;

            //Shockwave and explosion sound
            playExplosionAudio(playdi, block.location, 260);
            // shockwaveBlast(
            //   dimension,
            //   block.location,
            //   3,
            //   50,
            //   { x: 6, z: 4 },
            //   1,
            // );

            yield;
            //Gets rid of ticking area and starts the real nuclear explosion code
            

            //Nuke Code!!!
            nuclearArea(
              block.dimension.id,
              block.location,
              block,
              224,
              70,
              100,
              playerEntity,
            );

            const volume = new BlockVolume(
              {
                x: block.location.x - 20,
                y: block.location.y - 20,
                z: block.location.z - 20,
              },
              {
                x: block.location.x + 20,
                y: block.location.y + 20,
                z: block.location.z + 20,
              },
            );

            // FOR LATER UPDATE
            // aftermath(
            //   dimension.id,
            //   radius,
            //   volume,
            //   Math.floor(Math.random() * 4),
            // );
          }

          system.runJob(blockGen());
        }, 400);
      });
    }
}

class OnClick implements BlockCustomComponent {
  constructor() {
    this.onPlayerInteract = this.onPlayerInteract.bind(this);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent): void {
    if(!event.player)
        return;

    nuclearBombFisson(event.block,event.player,event.dimension, true)
  }
}

export { OnClick };

system.beforeEvents.startup.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent(
    "atomic:atom_bomb",
    new OnClick(),
  );
});
