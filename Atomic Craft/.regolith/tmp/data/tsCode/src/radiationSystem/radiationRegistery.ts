

export const RadiationRegistry = new Map<string, number>([
  ["atomic:radiation_block", 4],
  ["atomic:uranium_block", 6],
  ["atomic:radiation_diamond_block", 5],
  ["atomic:radiation_plank", 1],
  ["atomic:radiation_slab", 1],
  ["atomic:burned_log", 1],
]);

export const radioactiveTypes = [
            ...RadiationRegistry.keys()
        ];