
export const LEVEL_BALANCING = Array.from({ length: 19 }, (_, i) => 100 + (i * 50));

export function getXpRequired(level) {
  // level 1 is index 0
  const index = Math.min(level - 1, LEVEL_BALANCING.length - 1);
  return LEVEL_BALANCING[index];
}
