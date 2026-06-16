import { world, EquipmentSlot, ItemStack, Player, BlockPermutation, Block, system, GameMode } from '@minecraft/server';
export function itemInteract(player) {
  const equippable = player?.getComponent("minecraft:equippable");
  if (!equippable) return;
  const mainhand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
  return mainhand;
}
export const decrementStack = (player, mainhand) => {
  if (player.getGameMode() !== GameMode.Creative) {
    if (mainhand.amount > 1) mainhand.amount--;
    else mainhand.setItem(undefined);
  }
}
export const permutation = (block, state, value) => {
  block.setPermutation(block.permutation.withState(state, value));
}