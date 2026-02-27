
import { MOCK_SONGS } from './songs.js';
import { CATEGORIES } from './constants.js';

export const state = {
  debugMode: false,
  activeCategory: 'HOME',
  user: {
    name: 'Player One',
    level: 1,
    xp: 0,
    coins: 2500,
    stamina: 275,
    maxStamina: 400,
  },
  visualUser: {
    level: 1,
    xp: 0,
    coins: 100
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
