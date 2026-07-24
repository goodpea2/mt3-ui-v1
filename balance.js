
export const LEVEL_BALANCING = [
  { level: 2, reward: { type: 'coin', amount: 500 } }, // unlock spin gacha
  { level: 3, reward: { type: 'pet', petId: 1 } }, // unlock pet
  { level: 4, reward: { type: 'coin', amount: 500 } }, // unlock daily challenge
  { level: 5, reward: { type: 'pet', petId: 2 } },
  { level: 6, reward: { type: 'coin', amount: 500 } }, // unlock figures
  { level: 7, reward: { type: 'coin', amount: 500 } }, // unlock boosters
  { level: 8, reward: { type: 'pet', petId: 3 } },
  { level: 9, reward: { type: 'coin', amount: 500 } },
  { level: 10, reward: { type: 'pet', petId: 4 } },
  { level: 11, reward: { type: 'coin', amount: 500 } },
  { level: 12, reward: { type: 'pet', petId: 5 } },
  { level: 13, reward: { type: 'coin', amount: 500 } },
  { level: 14, reward: { type: 'item', name: 'Extra Pet Slot' } },
  { level: 15, reward: { type: 'pet', petId: 6 } },
  { level: 16, reward: { type: 'coin', amount: 500 } },
  { level: 17, reward: { type: 'pet', petId: 7 } },
  { level: 18, reward: { type: 'coin', amount: 500 } },
  { level: 19, reward: { type: 'coin', amount: 500 } },
  { level: 20, reward: { type: 'pet', petId: 8 } },
  { level: 21, reward: { type: 'coin', amount: 500 } },
  { level: 22, reward: { type: 'pet', petId: 9 } },
  { level: 23, reward: { type: 'coin', amount: 500 } },
  { level: 24, reward: { type: 'item', name: 'Extra Pet Slot' } },
  { level: 25, reward: { type: 'pet', petId: 10 } },
  { level: 26, reward: { type: 'coin', amount: 500 } },
  { level: 27, reward: { type: 'pet', petId: 11 } },
  { level: 28, reward: { type: 'coin', amount: 500 } },
  { level: 29, reward: { type: 'coin', amount: 500 } },
  { level: 30, reward: { type: 'pet', petId: 12 } },
  { level: 31, reward: { type: 'coin', amount: 500 } },
  { level: 32, reward: { type: 'coin', amount: 500 } }
];

export function getCarrySlotsCount(playerLevel) {
  if (playerLevel >= 24) return 5;
  if (playerLevel >= 14) return 4;
  return 3;
}

export const STAR_JOURNEY_REQUIREMENTS = [3, 3, 5, 5, 5, 9, 7, 7, 7, 9, 9, 9, 9, 9, 11, 11, 11, 11, 12, 15, 18, 21, 24, 27, 30, 36, 45, 60, 90];

export function getStarJourneyLevelAndProgress(totalStars) {
  let level = 1;
  let tempStars = totalStars;
  let progressInCurrentLevel = totalStars;
  let starsRequiredForNext = 3;

  for (let i = 0; i < STAR_JOURNEY_REQUIREMENTS.length; i++) {
    const req = STAR_JOURNEY_REQUIREMENTS[i];
    if (tempStars >= req) {
      tempStars -= req;
      level++;
    } else {
      progressInCurrentLevel = tempStars;
      starsRequiredForNext = req;
      break;
    }
  }

  if (level > STAR_JOURNEY_REQUIREMENTS.length + 1) {
    level = STAR_JOURNEY_REQUIREMENTS.length + 1; // max level is 30
    progressInCurrentLevel = STAR_JOURNEY_REQUIREMENTS[STAR_JOURNEY_REQUIREMENTS.length - 1];
    starsRequiredForNext = progressInCurrentLevel;
  }

  return {
    level,
    progress: progressInCurrentLevel,
    required: starsRequiredForNext,
    totalStars
  };
}

export const DYNAMIC_SONG_CONFIG = {
  initialCoinCost: 100,
  coinCostIncreasePerStep: 50,
  songPurchasesPerStep: 2,
  maxCoinCost: 500
};

export function getXpRequired(level) {
  return 0;
}

export function getLevelReward(level) {
  const numLevel = parseInt(level);
  if (isNaN(numLevel) || numLevel < 2) {
    return { type: 'coin', amount: 0 };
  }
  const match = LEVEL_BALANCING.find(item => item.level === numLevel);
  if (match) {
    return match.reward;
  }
  // Fallback if level is higher than our maximum defined level
  if (LEVEL_BALANCING.length > 0) {
    return LEVEL_BALANCING[LEVEL_BALANCING.length - 1].reward;
  }
  return { type: 'coin', amount: 0 };
}

export function setXpRequired(levelIndex, value) {
  // Stubbed for safety
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
    coinForNewStar: [0, 0, 0, 0, 0, 0], // coins rewarded for each new star gained
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

export const BOSS_BALANCING = [
  { id: 1, name: "Neon Overlord", maxHp: 4000, rewardCoins: 250, rewardPellets: 0, color: "from-purple-500 to-indigo-700", avatar: "👾" },
  { id: 2, name: "Synth Wave Colossus", maxHp: 5000, rewardCoins: 500, rewardPellets: 0, color: "from-pink-500 to-rose-700", avatar: "🤖" },
  { id: 3, name: "Glitch Behemoth", maxHp: 12000, rewardCoins: 500, rewardPellets: 8, color: "from-cyan-500 to-teal-700", avatar: "👺" },
  { id: 4, name: "Laser Arch-Demon", maxHp: 16000, rewardCoins: 500, rewardPellets: 11, color: "from-red-500 to-orange-700", avatar: "👹" },
  { id: 5, name: "Cyber Dragon", maxHp: 20000, rewardCoins: 500, rewardPellets: 14, color: "from-emerald-500 to-green-700", avatar: "🐉" },
  { id: 6, name: "Retro Sentinel", maxHp: 23000, rewardCoins: 500, rewardPellets: 17, color: "from-yellow-500 to-amber-700", avatar: "🧱" },
  { id: 7, name: "Digital Gargoyle", maxHp: 26000, rewardCoins: 500, rewardPellets: 20, color: "from-violet-500 to-fuchsia-700", avatar: "👽" },
  { id: 8, name: "Pulse Titan", maxHp: 30000, rewardCoins: 500, rewardPellets: 23, color: "from-blue-500 to-indigo-900", avatar: "☄️" },
  { id: 9, name: "Quantum Phantom", maxHp: 34000, rewardCoins: 500, rewardPellets: 26, color: "from-[#2e0854] to-black", avatar: "👻" },
  { id: 10, name: "Rhythm Star Omega", maxHp: 38000, rewardCoins: 500, rewardPellets: 30, color: "from-yellow-400 via-pink-500 to-cyan-500", avatar: "🌟" }
];

export const BOSS_BALANCING_SCALING = {
  hpIncreasePerLoop: 4000,
  baseRewardCoins: 1000,
  coinsIncreasePerLoop: 0,
  pelletsBase: 2,
  pelletsMultiplierPerBossNum: 3
};

export function getBossMaxHp(bossNum) {
  const bNum = bossNum || 1;
  if (bNum <= 10) {
    const loopIndex = (bNum - 1) % 10;
    const currentBoss = BOSS_BALANCING[loopIndex] || BOSS_BALANCING[0];
    return currentBoss.maxHp;
  } else {
    return BOSS_BALANCING[9].maxHp + (bNum - 10) * BOSS_BALANCING_SCALING.hpIncreasePerLoop;
  }
}

export const PET_BALANCING = {
  // Collection of companion pets with level-based stats
  pets: [
    {
      id: 1,
      name: "Neon Meow",
      avatar: "🐱",
      unlockLevel: 3,
      stats: [200, 220, 240, 260, 280, 300, 320, 340, 360, 400],
      abilityName: "Golden Notes"
    },
    {
      id: 2,
      name: "Beat Bunny",
      avatar: "🐰",
      unlockLevel: 5,
      stats: [100, 110, 120, 130, 140, 150, 160, 170, 180, 200],
      abilityName: "Combo Bonus"
    },
    {
      id: 6,
      name: "Mystic Fox",
      avatar: "🦊",
      unlockLevel: 15,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 3,
      name: "Hyper Hamster",
      avatar: "🐹",
      unlockLevel: 8,
      stats: [10, 11, 12, 13, 14, 15, 16, 17, 18, 20],
      abilityName: "Hyper Score"
    },
    {
      id: 7,
      name: "Electro Pup",
      avatar: "🐶",
      unlockLevel: 17,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 4,
      name: "Rhythm Panda",
      avatar: "🐼",
      unlockLevel: 10,
      stats: [1.5, 1.6, 1.7, 1.8, 1.9, 2.0, 2.1, 2.2, 2.3, 2.5],
      abilityName: "Perfect Multiplier"
    },
    {
      id: 8,
      name: "Synth Sloth",
      avatar: "🦥",
      unlockLevel: 20,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 5,
      name: "Cyber Dragon",
      avatar: "🐉",
      unlockLevel: 12,
      stats: [30, 33, 36, 39, 42, 45, 48, 51, 54, 60],
      abilityName: "Accuracy Strike"
    },
    {
      id: 9,
      name: "Cosmic Kitty",
      avatar: "🦉",
      unlockLevel: 22,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 10,
      name: "Astro Axolotl",
      avatar: "🐠",
      unlockLevel: 25,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 11,
      name: "Vocaloid Wolf",
      avatar: "🐺",
      unlockLevel: 27,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 12,
      name: "Beat Hydra",
      avatar: "🦁",
      unlockLevel: 30,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "TemplateAbility: +1 point per note hit"
    },
    {
      id: 13,
      name: "Retro Raccoon",
      avatar: "🦝",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    },
    {
      id: 14,
      name: "Cyber Crow",
      avatar: "🐦",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    },
    {
      id: 15,
      name: "Disco Duck",
      avatar: "🦆",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    },
    {
      id: 16,
      name: "Synth Squirrel",
      avatar: "🐿️",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    },
    {
      id: 17,
      name: "Lo-Fi Koala",
      avatar: "🐨",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    },
    {
      id: 18,
      name: "Metal Monkey",
      avatar: "🐵",
      unlockLevel: 99,
      stats: [1,1,1,1,1,1,1,1,1,1],
      abilityName: "AlbumReward: +1 point per note hit"
    }
  ],
  // Cost array corresponding to level upgrades from Level 1 to 9 (max L.10)
  upgradeCost: [3, 6, 10, 15, 20, 30, 40, 50, 100],
  // Recovering time (seconds) on upgrading from Level 1 to 9 (5s, 5s, 30s, 2m, 10m, 2h, 4h, 8h, 8h)
  sleepDurationSeconds: [5, 5, 30, 120, 600, 7200, 14400, 28800, 28800],
  // Coin speedup cost per 2 minutes (120 seconds) of recovery time
  speedupCostPer2min: 25
};

export function getStarOneTimeReward(starIndex, diffLevel) {
  // starIndex is 0-indexed (0 to 5 for 1st to 6th star)
  // diffLevel is standard number from 1 to 6 (or clamped)
  let bracket = 0; // default for 1-2
  if (diffLevel >= 5) {
    bracket = 2; // 5-6
  } else if (diffLevel >= 3) {
    bracket = 1; // 3-4
  }

  const rewardsTable = [
    // 1st star: index 0
    [ { type: 'coin', amount: 80 },  { type: 'coin', amount: 120 }, { type: 'coin', amount: 160 } ],
    // 2nd star: index 1
    [ { type: 'coin', amount: 100 }, { type: 'coin', amount: 150 }, { type: 'coin', amount: 200 } ],
    // 3rd star: index 2
    [ { type: 'key', amount: 5 },    { type: 'key', amount: 5 },   { type: 'key', amount: 5 } ],
    // 4th star: index 3
    [ { type: 'coin', amount: 120 }, { type: 'coin', amount: 160 }, { type: 'coin', amount: 200 } ],
    // 5th star: index 4
    [ { type: 'coin', amount: 150 }, { type: 'coin', amount: 225 }, { type: 'coin', amount: 300 } ],
    // 6th star: index 5
    [ { type: 'decoTicket', amount: 25 }, { type: 'decoTicket', amount: 25 }, { type: 'decoTicket', amount: 25 } ]
  ];

  return rewardsTable[starIndex] ? rewardsTable[starIndex][bracket] : null;
}

export const ScriptedGachaReward = [1,0,0,1,0,0,0,1,0,0,1,0,0,0,1,0,0,1];


