
export const LEVEL_BALANCING = [
  200, // Level 1 -> 2
  200, // Level 2 -> 3
  300, // Level 3 -> 4
  300, // Level 4 -> 5
  400, // Level 5 -> 6
  400, // Level 6 -> 7
  500, // Level 7 -> 8
  500, // Level 8 -> 9
  650, // Level 9 -> 10
  650, // Level 10 -> 11
  800, // Level 11 -> 12
  800, // Level 12 -> 13
  1000, // Level 13 -> 14
  1000, // Level 14 -> 15
  1300, // Level 15 -> 16
  1300, // Level 16 -> 17
  1600, // Level 17 -> 18
  1600, // Level 18 -> 19
  2000  // Level 19 -> 20
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
