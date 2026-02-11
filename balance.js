
export const LEVEL_BALANCING = [
  100, // Level 1 -> 2
  150, // Level 2 -> 3
  200, // Level 3 -> 4
  250, // Level 4 -> 5
  300, // Level 5 -> 6
  350, // Level 6 -> 7
  400, // Level 7 -> 8
  450, // Level 8 -> 9
  500, // Level 9 -> 10
  550, // Level 10 -> 11
  600, // Level 11 -> 12
  650, // Level 12 -> 13
  700, // Level 13 -> 14
  750, // Level 14 -> 15
  800, // Level 15 -> 16
  850, // Level 16 -> 17
  900, // Level 17 -> 18
  950, // Level 18 -> 19
  1000  // Level 19 -> 20
];

export const DYNAMIC_SONG_CONFIG = {
  initialCoinCost: 100,
  coinCostIncreasePerStep: 50,
  songPurchasesPerStep: 2,
  maxCoinCost: 500
};

export function getXpRequired(level) {
  const index = Math.min(level - 1, LEVEL_BALANCING.length - 1);
  return LEVEL_BALANCING[index];
}

export function setXpRequired(levelIndex, value) {
  if (levelIndex >= 0 && levelIndex < LEVEL_BALANCING.length) {
    LEVEL_BALANCING[levelIndex] = value;
  }
}
