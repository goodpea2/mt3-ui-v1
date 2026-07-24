
import { MOCK_SONGS } from './songs.js';
import { CATEGORIES } from './constants.js';

export const state = {
  debugMode: false,
  activeCategory: 'HOME',
  stageButtonNewTag: false,
  hasAcquiredDecoTickets: false,
  user: {
    name: 'Player One',
    level: 1,
    xp: 0,
    coins: 0,
    keys: 0,
    _decoTickets: 50,
    get decoTickets() {
      return this._decoTickets;
    },
    set decoTickets(val) {
      const oldVal = this._decoTickets;
      this._decoTickets = val;
      if (val > oldVal && oldVal !== undefined) {
        if (!state.hasAcquiredDecoTickets) {
          state.hasAcquiredDecoTickets = true;
          state.stageButtonNewTag = true;
        }
      }
    },
    shields: 5,
    extraStars: 0
  },
  visualUser: {
    level: 1,
    xp: 0,
    coins: 0,
    keys: 0,
    decoTickets: 50,
    shields: 5
  },
  currencyShopLimits: {
    keysCoin: 0,
    keysAd: 0,
    coinsFree: 0,
    coinsAd: 0
  },
  stats: {
    totalPlayCount: 0,
    totalXpGained: 0,
    totalCoinGained: 0,
    totalCoinSpent: 0,
    totalTimeSpentPlaying: 0,
    totalTimeSpentWatchingAd: 0,
    totalAdCount: 0
  },
  songs: MOCK_SONGS,
  expandedSongId: 'song-0',
  unlockingTimers: {},
  dynamicSongCostEnabled: false,
  purchasedSongCount: 0,
  gachaSpunBefore: false,
  newlyUnlockedSongs: new Set(),
  newlyUnlockedDifficulties: {}, // { songId: Set([idx, ...]) }
  unlockedFigures: new Set(), // Now stores song-id strings, e.g. 'song-0'
  figureProgress: {}, // tracks star progress (0-6) of each figure
  prevFigureProgress: {}, // tracks star progress before current session for animation
  figuresBadgeCount: 0, // badge count of newly unlocked figures
  unlockedPets: new Set(), // Set of unlocked pet IDs
  activePetId: null, // Equipped pet ID
  equippedPetIds: [], // Currently carried pet IDs
  selectedPetIdDetail: 1, // Currently inspected pet in the lobby
  petPellets: 0, // Pellet currency for pet upgrades
  petLevels: { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1 }, // Level of each pet
  petSleepUntil: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0, 13: 0, 14: 0, 15: 0, 16: 0, 17: 0, 18: 0 }, // Timestamp when pet wakes up
  newlyUnlockedFigures: new Set(),
  collectedSetRewards: new Set(),
  decoCoins: 0,
  pendingLevelUpRewards: [],
  isLevelUpPopupShowing: false,
  bossState: {
    bossNum: 1,
    currentBossIdx: 0,
    currentBossHp: 5000
  },
  gameplayConfig: {
    minNotesByDifficulty: [30, 40, 50, 60, 70, 80],
    maxNotesByDifficulty: [70, 100, 130, 160, 200, 240]
  },
  gameConfig: {
    minXp: 150,
    maxXp: 250,
    minCoins: 70,
    maxCoins: 120
  },
  debugSections: {
    play: false,
    xp: false,
    gameplay: false
  }
};
