import {
  world,
  ItemCustomComponent,
  ItemComponentUseEvent,
  system,
  Player,
  ItemStack,
  InputPermissionCategory,
  Vector3,
  EquipmentSlot,
  EntityInventoryComponent,
  CustomCommandOrigin,
  CustomCommand,
  CustomCommandStatus,
  CustomCommandResult,
  Entity,
  CommandPermissionLevel,
  CustomComponentParameters
} from "@minecraft/server";


const CONTROLLER_ID = "atomic:drone_controller";
const DRONE_ENTITY_ID = "atomic:quadcopter";

function scaleVector(vec: Vector3, scalar: number) {
  return { x: vec.x * scalar, y: vec.y * scalar, z: vec.z * scalar };
}

function normalize(vec: Vector3) {
  const length = Math.sqrt(vec.x ** 2 + vec.y ** 2 + vec.z ** 2);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return { x: vec.x / length, y: vec.y / length, z: vec.z / length };
}

function syncControllerItem(inventory: EntityInventoryComponent, itemStack: ItemStack, mode: string) {
  for (let i = 0; i < inventory.inventorySize; i++) {
    const slot = inventory.container.getSlot(i);
    if (slot.isValid && slot.hasItem() && slot.typeId === CONTROLLER_ID) {
      itemStack.setLore([mode.toUpperCase()]);
      slot.setItem(itemStack.clone());
      return;
    }
  }
}

function unlockDrone(player: Player, mode: string, entity?: Entity) {
  player.setDynamicProperty("drone_locked", false);
  player.setDynamicProperty("atomic:drone_weapon", false)
  player.camera.clear();
  player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, true);
  player.inputPermissions.setPermissionCategory(InputPermissionCategory.Mount, true);
  player.inputPermissions.setPermissionCategory(InputPermissionCategory.Dismount, true);
  if(entity && entity.getProperty("atomic:drone_on") === true) {
    entity.setProperty("atomic:drone_on", false)
    if(mode === "fpv") {
      entity.triggerEvent("atomic:fpv_off")
      const inventory = player.getComponent("inventory")
      if(!inventory) {
        return
      }
      
      for(let i = 0; i < inventory.inventorySize; i++) {
              const slot = inventory.container.getSlot(i)
              if(slot.isValid &&  slot.typeId === "atomic:drone_bomber") {
                slot.setItem()
              }
            }
    }
  }
}

class droneController implements ItemCustomComponent {
  onUse(event: ItemComponentUseEvent) {
    const itemStack = event.itemStack;
    const player = event.source;
    const inventory = player.getComponent("inventory");

    if (!itemStack || !inventory || !inventory.container) return;

    if (typeof itemStack.getDynamicProperty("drone_control") !== "string") return;

    system.run(() => {
      const currentMode = (itemStack.getDynamicProperty("control_mode") as string | undefined) ?? "off";
      const allowedModes = new Set(["off", "fpv", "controller"]);

      if (!allowedModes.has(currentMode)) {
        itemStack.setDynamicProperty("control_mode", "off");
      }

      if (player.isSneaking && player.getDynamicProperty("drone_locked") === true) {
        unlockDrone(player, currentMode);
        return;
      }

      if (player.isSneaking) {
        const nextMode = currentMode === "off" ? "fpv" : currentMode === "fpv" ? "controller" : "off";
        itemStack.setDynamicProperty("control_mode", nextMode);
        syncControllerItem(inventory, itemStack, nextMode);
        return;
      }

      const droneId = itemStack.getDynamicProperty("drone_control");
      if (typeof droneId !== "string") return;

      const entity = world.getEntity(droneId);
      if (!entity || entity.id !== droneId) return;

      const controlMode = itemStack.getDynamicProperty("control_mode");
      if (controlMode !== "fpv" && controlMode !== "controller") return;

      player.setDynamicProperty("drone_locked", true);

      const droneLoop = system.runInterval(() => {
        if (!entity.isValid || !player.isValid || player.getDynamicProperty("drone_locked") !== true) {
          if(entity.isValid && controlMode === "fpv") {
            entity.triggerEvent("atomic:fpv_off")
            entity.setProperty("atomic:drone_on", false)
          }
          unlockDrone(player, currentMode);
          system.clearRun(droneLoop);
          return;
        }

        // const checkItem = player.getComponent("equippable")?.getEquipment(EquipmentSlot.Mainhand);
        // if (checkItem && checkItem.typeId !== CONTROLLER_ID) {
        //   if(controlMode === "fpv") {
        //     entity.triggerEvent("atomic:fpv_off")
        //     entity.setProperty("atomic:drone_on", false)
        //   }
        //   unlockDrone(player, currentMode);
        //   system.clearRun(droneLoop);
        //   return;
        // }

        const droneLocation = entity.location;
        entity.setRotation({x: 0, y: player.getRotation().y})
        const direction = entity.getViewDirection();
        const lookDistance = 10;

        const facingLocation = {
          x: droneLocation.x + direction.x * lookDistance,
          y: droneLocation.y + direction.y * lookDistance,
          z: droneLocation.z + direction.z * lookDistance,
        };
          //FPV MODE CODE STARTS HERE BTW
          if (controlMode === "fpv") {

            if(player.getDynamicProperty("atomic:drone_weapon") === false) {

            for(let i = 0; i < inventory.inventorySize; i++) {
              const slot = inventory.container.getSlot(i)
              if (slot.isValid && !slot.hasItem()) {
                const droneBomberItem = new ItemStack("atomic:drone_bomber", 1)
                droneBomberItem.setDynamicProperty("atomic:drone_bomb",entity.id)
                slot.setItem(droneBomberItem)
                player.setDynamicProperty("atomic:drone_weapon", true)
                break
              }
            }
          }
            

            entity.triggerEvent("atomic:fpv");
            entity.setProperty("atomic:drone_on", true);
            player.camera.setCamera("minecraft:free", {
              location: {
                x: droneLocation.x,
                y: droneLocation.y + 0.2,
                z: droneLocation.z,
              },
              facingLocation: facingLocation,
            });

            player.inputPermissions.setPermissionCategory(InputPermissionCategory.LateralMovement, false);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Mount, false);
            player.inputPermissions.setPermissionCategory(InputPermissionCategory.Dismount, false);

            const move = player.inputInfo.getMovementVector();
            const view = player.getViewDirection();

            const forward = { x: view.x, y: 0, z: view.z };
            const right = { x: -forward.z, y: 0, z: forward.x };

            let thrust = {
              x: forward.x * move.y + right.x * move.x,
              y: 0,
              z: forward.z * move.y + right.z * move.x,
            };

            if (player.isJumping) thrust.y += 0.7;
            if (player.isSneaking) thrust.y -= 0.7;

            const inputStrength =
              Math.abs(thrust.x) + Math.abs(thrust.y) + Math.abs(thrust.z);

            if (inputStrength <= 0.0001) return;

            const maxImpulse = 0.030;
            const length = Math.sqrt(thrust.x ** 2 + thrust.y ** 2 + thrust.z ** 2);

            const limited = {
              x: (thrust.x / length) * Math.min(length, maxImpulse),
              y: (thrust.y / length) * Math.min(length, maxImpulse),
              z: (thrust.z / length) * Math.min(length, maxImpulse),
            };

            entity.applyImpulse(limited);
            // entity.teleport(limited)
          } 
          else if (controlMode === "controller") {
            player.sendMessage("Controller mode, which will allow you to send")
            unlockDrone(player, currentMode);
            system.clearRun(droneLoop);
          }
      }, 1);
    });
  }
}

class DroneBomberComponent implements ItemCustomComponent {
  onUse(ev: ItemComponentUseEvent) {
    const itemStack = ev.itemStack
    system.run(() => {
    if(itemStack) {
      const id = itemStack.getDynamicProperty("atomic:drone_bomb")
      if(typeof id === "string") {
      const entity = world.getEntity(id)
      if(entity) {
        const block = entity.dimension.getBlockFromRay(entity.location, {x: 0, y: -1, z: 0})?.block
        if(block) {
          entity.dimension.createExplosion(block.location, 3)
        }
      } else {
        ev.source.sendMessage({translate: "drone.atomic:drone_bomber_warning.name"})
      }
      }
    }
    })
  }
}


world.afterEvents.worldLoad.subscribe(() => {
  world.afterEvents.playerInteractWithEntity.subscribe((ev) => {
    const entity = ev.target;
    const itemStack = ev.itemStack;
    const player = ev.player;

    if (!itemStack || itemStack.typeId !== CONTROLLER_ID) return;

    if (
      entity.typeId === DRONE_ENTITY_ID &&
      itemStack.getDynamicProperty("drone_control") === undefined
    ) {
      console.warn("Drone Connecting")
      const inventory = player.getComponent("inventory");
      if (!inventory || !inventory.container) return;
      itemStack.setDynamicProperty("drone_control", entity.id);
      for (let i = 0; i < inventory.inventorySize; i++) {
        const slot = inventory.container.getSlot(i);
        if (slot.hasItem() && slot.typeId === CONTROLLER_ID) {
          slot.setItem(itemStack.clone());
          return;
        }
      }
    } else {
      player.sendMessage({translate: "drone.message.name"})
    }
  });
  
});

system.beforeEvents.startup.subscribe((ev) => {
  ev.itemComponentRegistry.registerCustomComponent(CONTROLLER_ID, new droneController())
  ev.itemComponentRegistry.registerCustomComponent("atomic:drone_bomb", new DroneBomberComponent())

  function droneUnlock(origin: CustomCommandOrigin, dimensionId: string): CustomCommandResult {
        const entity = origin.sourceEntity
        if(!entity || entity.typeId !== "minecraft:player") 
          return {
        status: CustomCommandStatus.Failure
      }
  
      system.run(() => {
        const player = entity as Player
        unlockDrone(player, "")
      });
  
        return {
          status: CustomCommandStatus.Success,
          message: "Player unlocked!"
        }
    }
    const droneCommand: CustomCommand = {
      name: "atomic:drone_unlock",
      description: "Will unlock your camera and allow you to move, use if drone makes you stuck",
      permissionLevel: CommandPermissionLevel.Any, 
      cheatsRequired: false 
    }
  ev.customCommandRegistry.registerCommand(droneCommand, droneUnlock)
})