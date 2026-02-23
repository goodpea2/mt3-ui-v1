
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

export const PLAY_STAT = {
  starConfig: {
    weightForStars: [1, 2, 4, 3, 0.2, 0.3, 0.4], // weights for each star level (0 to 6)
    coinForNewStar: [50, 50, 50, 50, 50, 50], // coins rewarded for each new star gained
    coinForRepeatedStar: [20, 20, 20, 20, 20, 20], // coins rewarded for repeated stars at each level
  },
  guaranteedCoins: [60, 70], // guaranteed coin reward (min/max) for each play regardless of stars
  songDuration: [90, 150], // duration range (min/max)
  adDuration: [30, 75], // duration range (min/max)
  idleDuration: [15, 30], // duration range (min/max)

  noteConfig: {
    noteCountMin: [0, 30, 60, 90, 135, 180, 270], // minimum note count for each star level (0 to 6)
    noteCountMax: [0, 70, 140, 210, 315, 420, 630], // maximum note count for each star level (0 to 6)
    weightForAccuracy: [10, 15, 10], // weights for Perfect, Great, Good accuracy levels
    xpPerAccuracy: [2, 1, 1], // XP rewarded for each note hit at Perfect, Great, Good accuracy levels
  },
  guaranteedXpPerPlay: 25, // guaranteed XP reward for each play regardless of stars
};
