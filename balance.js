
export const LEVEL_BALANCING = [
  { xpRequired: 200, reward: { type: 'coin', amount: 250 } }, // Level 1 -> 2
  { xpRequired: 200, reward: { type: 'song', amount: 1 } }, // Level 2 -> 3
  { xpRequired: 300, reward: { type: 'coin', amount: 500 } }, // Level 3 -> 4
  { xpRequired: 300, reward: { type: 'themeSet', amount: 1 } }, // Level 4 -> 5
  { xpRequired: 400, reward: { type: 'coin', amount: 500 } }, // Level 5 -> 6
  { xpRequired: 400, reward: { type: 'song', amount: 1 } }, // Level 6 -> 7
  { xpRequired: 500, reward: { type: 'coin', amount: 500 } }, // Level 7 -> 8
  { xpRequired: 500, reward: { type: 'song', amount: 1 } }, // Level 8 -> 9
  { xpRequired: 650, reward: { type: 'noteSkin', amount: 1 } }, // Level 9 -> 10
  { xpRequired: 650, reward: { type: 'coin', amount: 500 } }, // Level 10 -> 11
  { xpRequired: 800, reward: { type: 'song', amount: 1 } }, // Level 11 -> 12
  { xpRequired: 800, reward: { type: 'coin', amount: 500 } }, // Level 12 -> 13
  { xpRequired: 1000, reward: { type: 'song', amount: 1 } }, // Level 13 -> 14
  { xpRequired: 1000, reward: { type: 'themeSet', amount: 1 } }, // Level 14 -> 15
  { xpRequired: 1300, reward: { type: 'coin', amount: 500 } }, // Level 15 -> 16
  { xpRequired: 1300, reward: { type: 'song', amount: 1 } }, // Level 16 -> 17
  { xpRequired: 1600, reward: { type: 'coin', amount: 500 } }, // Level 17 -> 18
  { xpRequired: 1600, reward: { type: 'song', amount: 1 } }, // Level 18 -> 19
  { xpRequired: 2000, reward: { type: 'noteSkin', amount: 500 } }  // Level 19 -> 20
];

export const DYNAMIC_SONG_CONFIG = {
  initialCoinCost: 100,
  coinCostIncreasePerStep: 50,
  songPurchasesPerStep: 2,
  maxCoinCost: 500
};

export function getXpRequired(level) {
  const index = Math.min(level - 1, LEVEL_BALANCING.length - 1);
  return LEVEL_BALANCING[index].xpRequired;
}

export function getLevelReward(level) {
  const index = Math.max(0, Math.min(level - 2, LEVEL_BALANCING.length - 1));
  return LEVEL_BALANCING[index].reward;
}

export function setXpRequired(levelIndex, value) {
  if (levelIndex >= 0 && levelIndex < LEVEL_BALANCING.length) {
    LEVEL_BALANCING[levelIndex].xpRequired = value;
  }
}

export function setLevelReward(levelIndex, type, amount, songId) {
  if (levelIndex >= 0 && levelIndex < LEVEL_BALANCING.length) {
    LEVEL_BALANCING[levelIndex].reward = { type, amount: parseInt(amount), songId };
  }
}

export function setAllLevelBalancing(newData) {
  if (Array.isArray(newData)) {
    LEVEL_BALANCING.splice(0, LEVEL_BALANCING.length, ...newData);
  }
}

export const PLAY_STAT = {
  starConfig: {
    weightForStars: [0.2, 2, 4, 3, 0.2, 0.3, 0.4], // weights for each star level (0 to 6)
    coinForNewStar: [30, 30, 30, 30, 30, 30], // coins rewarded for each new star gained
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
  guaranteedXpPerPlay: [0, 0], // guaranteed XP reward (min/max) for each play regardless of stars
  songDifficultyXpBonus: [0, 0.1, 0.2, 0.3, 0.4, 0.5], // multiplier added for XP based on song difficulty (1 to 6)
  songDeluxeXpBonus: 0.5, // multiplier added as bonus XP if the song is deluxe version
  songOfTheDayXpBonus: 1.0, // multiplier added as bonus XP if the song is sotd
};
