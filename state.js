
import { MOCK_SONGS } from './songs.js';
import { CATEGORIES } from './constants.js';

export const state = {
  debugMode: false,
  activeCategory: 'HOME',
  user: {
    name: 'Player One',
    level: 1,
    xp: 0,
    coins: 0
  },
  visualUser: {
    level: 1,
    xp: 0,
    coins: 0
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
  newlyUnlockedSongs: new Set(),
  newlyUnlockedDifficulties: {}, // { songId: Set([idx, ...]) }
  unlockedFigures: new Set([1]), // Start with one unlocked
  newlyUnlockedFigures: new Set(),
  collectedSetRewards: new Set(),
  decoCoins: 0,
  pendingLevelUpRewards: [],
  isLevelUpPopupShowing: false,
  gameConfig: {
    minXp: 150,
    maxXp: 250,
    minCoins: 70,
    maxCoins: 120
  },
  debugSections: {
    play: false,
    xp: false
  }
};
