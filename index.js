
import { state } from './state.js';
window.state = state;
import { CATEGORIES } from './constants.js';
import { getLevelReward, setLevelReward, setAllLevelBalancing, LEVEL_BALANCING, DYNAMIC_SONG_CONFIG, PLAY_STAT, PET_BALANCING, getStarJourneyLevelAndProgress, STAR_JOURNEY_REQUIREMENTS, getStarOneTimeReward, getCarrySlotsCount, BOSS_BALANCING, BOSS_BALANCING_SCALING, getBossMaxHp } from './balance.js';
import { VFXManager } from './vfx/Manager.js';
import { simulatePlay } from './simulation.js';
import { showPlayStatsPopup } from './ui/PlayStatsPopup.js';
import { showLevelUpPopup } from './ui/LevelUpPopup.js';
import { showGameplayScene } from './ui/GameplayScene.js';
import { showBossBattlePopup } from './ui/BossBattlePopup.js';
import { showSongInfoPopup } from './ui/SongInfoPopup.js';
import { showStarJourneyPopup } from './ui/StarJourneyPopup.js';
import { showSongGachaPopup } from './ui/SongGachaPopup.js';
import { showCurrencyShopPopup } from './ui/CurrencyShopPopup.js';

// UI Components
import { renderHeader } from './ui/Header.js';
import { renderTabs } from './ui/Tabs.js';
import { renderContent, updatePetsLoungeUI } from './ui/Content.js';
import { renderNav } from './ui/Nav.js';
import { renderDebug } from './ui/Debug.js';

import { renderFigureCollection, showFigureFocus } from './ui/FigureCollection.js';
import { FIGURES_DATA, SET_FIGURES_DATA } from './figures.js';
import { playGiftOpenVFX } from './vfx/GiftOpen.js';
import { renderStageCustomizer, initStageState } from './ui/StageCustomizer.js';

export function getTotalStarsCollected(songs) {
  let total = 0;
  if (!songs) return 0;
  songs.forEach(song => {
    if (Array.isArray(song.starLevel)) {
      song.starLevel.forEach(stars => {
        total += (stars || 0);
      });
    } else {
      total += (song.starLevel || 0);
    }
  });
  return total + (state.user?.extraStars || 0);
}

export function syncUserLevel() {
  const totalStars = getTotalStarsCollected(state.songs);
  const journey = getStarJourneyLevelAndProgress(totalStars);
  state.user.level = journey.level;
  state.user.totalStars = totalStars;
}

// --- Helper Logic ---

function getCurrentDynamicCost() {
  const { initialCoinCost, coinCostIncreasePerStep, songPurchasesPerStep, maxCoinCost } = DYNAMIC_SONG_CONFIG;
  const currentStep = Math.floor(state.purchasedSongCount / songPurchasesPerStep);
  return Math.min(initialCoinCost + (currentStep * coinCostIncreasePerStep), maxCoinCost);
}

function getSongCost(song) {
  return song.isDeluxe ? 20 : 10;
}

// --- Wrapper Renders ---
// These wrappers ensure we pass the correct dependencies to the modular UI functions

const ui = {
  header: () => renderHeader(state),
  tabs: () => {
    if (!CATEGORIES.includes(state.activeCategory)) {
      const tabsRoot = document.getElementById('tabs-root');
      if (tabsRoot) tabsRoot.innerHTML = ''; // Hide sub-tabs for non-song sections
      return;
    }
    renderTabs(state, (cat) => {
      state.activeCategory = cat;
      ui.tabs();
      ui.content();
    });
  },
  petsLounge: () => {
    updatePetsLoungeUI(state);
  },
  content: () => {
    if (state.activeCategory === 'FIGURES') {
      renderFigureCollection(state);
    } else if (state.activeCategory === 'STAGE') {
      renderStageCustomizer(state);
    } else {
      renderContent(state, getSongCost);
    }
  },
  nav: () => renderNav(state),
  debug: () => renderDebug(state, getCurrentDynamicCost),
  all: () => {
    ui.header();
    ui.tabs();
    ui.content();
    ui.nav();
    ui.debug();
  }
};
window.ui = ui;
window.refreshUI = () => {
  ui.all();
};

window.switchTab = (tab) => {
  if (tab === 'FIGURES' && (!state.user || state.user.level < 6)) {
    if (window.showPopup) {
      window.showPopup("REACH LEVEL 6", "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg uppercase");
    }
    return;
  }
  state.activeCategory = tab;
  if (tab === 'STAGE') {
    state.stageButtonNewTag = false;
  }
  if (tab === 'FIGURES') {
    state.figuresBadgeCount = 0;
  }
  ui.all();
};

window.focusFigure = (id) => {
  showFigureFocus(id, state);
};

window.openStarJourney = () => {
  showStarJourneyPopup(state);
};

window.openSongGacha = () => {
  showSongGachaPopup(state, () => {
    ui.all();
  });
};

window.openCurrencyShop = () => {
  showCurrencyShopPopup(() => {
    ui.all();
  });
};

window.openSongInfo = (id, diffIdx = 0) => {
  showSongInfoPopup(id, diffIdx, (selectedDiff) => {
    window.playSong(id, selectedDiff, false, true);
  });
};

window.showPopup = showPopup;

window.unlockFigure = (id) => {
  const fig = FIGURES_DATA.find(f => f.id === id);
  if (!fig) return;
  if (state.decoCoins < fig.decoCoinCost) {
    showPopup("NOT ENOUGH DECO COINS", "text-pink-500 font-black");
    return;
  }
  state.decoCoins -= fig.decoCoinCost;
  state.unlockedFigures.add(id);
  state.newlyUnlockedFigures.add(id);
  
  const overlay = document.getElementById('figure-focus-overlay');
  if (overlay) overlay.remove();
  
  showPopup("FIGURE UNLOCKED!", "text-cyan-400 font-black");
  ui.content();
};

window.collectSetReward = (setId) => {
  const set = SET_FIGURES_DATA.find(s => s.id === setId);
  if (!set) return;
  state.collectedSetRewards.add(setId);
  
  if (set.reward.type === 'pet') {
    const petId = set.reward.petId;
    state.unlockedPets.add(petId);
    state.selectedPetIdDetail = petId;
    syncPets();
    
    const petObj = PET_BALANCING.pets.find(p => p.id === petId);
    const petName = petObj ? petObj.name : `Companion #${petId}`;
    showPopup(`UNLOCKED ${petName.toUpperCase()}! 🎉`, "px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg uppercase");
  } else if (set.reward.type === 'coin') {
    window.addCoins(set.reward.amount);
  }
  
  showPopup("SET REWARD COLLECTED!", "px-4 py-2 rounded-xl bg-yellow-500 text-white font-bold text-xs shadow-lg uppercase");
  ui.content();
};

window.addCoins = (amount) => {
  const targetCoins = document.getElementById('coins-target');
  if (targetCoins && state.activeCategory !== 'STAGE') {
    const rect = targetCoins.getBoundingClientRect();
    VFXManager.spawnRewards('coin', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetCoins, (inc) => {
      state.visualUser.coins += inc;
      ui.header();
    });
  } else {
    state.visualUser.coins += amount;
    ui.header();
  }
  state.user.coins += amount;
  state.stats.totalCoinGained += amount;
};

// --- Debug Actions ---
window.toggleDebug = () => {
  state.debugMode = !state.debugMode;
  ui.debug();
};

window.add5Stars = () => {
  const amount = 5;
  state.user.extraStars = (state.user.extraStars || 0) + amount; // Store extra stars
  const targetStars = document.getElementById('stars-target');
  if (targetStars) {
    const rect = targetStars.getBoundingClientRect();
    VFXManager.spawnRewards('star', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetStars, (inc) => {
      state.visualUser.totalStars = (state.visualUser.totalStars || 0) + inc;
      checkLevelUpVisual();
      ui.header();
      ui.petsLounge();
    }, () => {
      showPendingLevelUps();
    });
  } else {
    state.visualUser.totalStars = (state.visualUser.totalStars || 0) + amount;
    checkLevelUpVisual();
    ui.header();
    ui.petsLounge();
  }
  state.user.totalStars = (state.user.totalStars || 0) + amount;
  syncUserLevel();
  if (state.debugMode) ui.debug();
};

window.add10Pellets = () => {
  const amount = 10;
  const targetPellets = document.getElementById('pellets-target');
  if (targetPellets) {
    const rect = targetPellets.getBoundingClientRect();
    VFXManager.spawnRewards('pellet', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetPellets, (inc) => {
      state.visualUser.petPellets = (state.visualUser.petPellets || 0) + inc;
      ui.header();
    });
  } else {
    state.visualUser.petPellets = (state.visualUser.petPellets || 0) + amount;
    ui.header();
  }
  state.petPellets = (state.petPellets || 0) + amount;
  if (state.debugMode) ui.debug();
};

window.add1000Coins = () => {
  const amount = 1000;
  const targetCoins = document.getElementById('coins-target');
  if (targetCoins && state.activeCategory !== 'STAGE') {
    const rect = targetCoins.getBoundingClientRect();
    VFXManager.spawnRewards('coin', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetCoins, (inc) => {
      state.visualUser.coins += inc;
      ui.header();
    });
  } else {
    state.visualUser.coins += amount;
    ui.header();
  }
  state.user.coins += amount;
  state.stats.totalCoinGained += amount;
  if (state.debugMode) ui.debug();
};

window.add10Keys = () => {
  const amount = 10;
  const targetKeys = document.getElementById('keys-holder');
  if (targetKeys && state.activeCategory !== 'STAGE') {
    const rect = targetKeys.getBoundingClientRect();
    VFXManager.spawnRewards('key', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetKeys, (inc) => {
      state.visualUser.keys = (state.visualUser.keys || 0) + inc;
      ui.header();
    });
  } else {
    state.visualUser.keys = (state.visualUser.keys || 0) + amount;
    ui.header();
  }
  state.user.keys = (state.user.keys || 0) + amount;
  if (state.debugMode) ui.debug();
};

window.add10DecoTickets = () => {
  const amount = 10;
  state.visualUser.decoTickets = (state.visualUser.decoTickets || 0) + amount;
  state.user.decoTickets = (state.user.decoTickets || 0) + amount;
  ui.header();
  if (state.debugMode) ui.debug();
};

window.add100DecoCoins = () => {
  const amount = 100;
  state.decoCoins = (state.decoCoins || 0) + amount;
  showPopup("ADDED 100 DECO COINS! 🪙", "text-pink-400 font-black");
  ui.content();
  if (state.debugMode) ui.debug();
};

window.unlockAllSongs = () => {
  state.songs.forEach(s => {
    if (Array.isArray(s.isLocked)) {
      s.isLocked = s.isLocked.map(() => false);
    } else {
      s.isLocked = false;
    }
  });
  showPopup("ALL SONGS UNLOCKED", "text-cyan-400 font-black");
  ui.content();
};

window.lockAllSongs = () => {
  state.songs.forEach((s, idx) => {
    if (idx > 0) {
      if (Array.isArray(s.isLocked)) {
        s.isLocked = s.isLocked.map(() => true);
      } else {
        s.isLocked = true;
      }
    }
  });
  state.purchasedSongCount = 0;
  showPopup("SONGS LOCKED", "text-red-400 font-black");
  ui.content();
  if (state.debugMode) ui.debug();
};

window.resetToLevel1 = () => {
  state.user.level = 1;
  state.user.totalStars = 0;
  state.user.extraStars = 0;
  state.visualUser.level = 1;
  state.visualUser.totalStars = 0;
  state.songs.forEach(song => {
    if (Array.isArray(song.starLevel)) {
      song.starLevel = song.starLevel.map(() => 0);
    } else {
      song.starLevel = 0;
    }
  });
  showPopup("JOURNEY RESET TO TIER 1", "text-white font-black uppercase");
  ui.header();
  ui.petsLounge();
  if (state.debugMode) ui.debug();
};

window.resetAllCounters = () => {
  state.stats.totalTimeSpentPlaying = 0;
  state.stats.totalTimeSpentWatchingAd = 0;
  state.stats.totalPlayCount = 0;
  state.stats.totalAdCount = 0;
  showPopup("COUNTERS RESET", "text-orange-400 font-black");
  if (state.debugMode) ui.debug();
};

window.updateBalancing = (key, val) => {
  state.gameConfig[key] = parseInt(val) || 0;
};

window.updateLevelReward = (index, field, val) => {
  const reward = getLevelReward(index + 2);
  const type = field === 'type' ? val : reward.type;
  const amount = field === 'amount' ? val : reward.amount;
  const songId = field === 'songId' ? val : reward.songId;
  setLevelReward(index, type, amount, songId);
  ui.debug();
};

window.updateAllLevelBalancing = (val) => {
  try {
    const data = new Function(`return [${val}]`)();
    setAllLevelBalancing(data);
    ui.header();
    ui.debug();
    showPopup("LEVEL BALANCING UPDATED", "text-green-400 font-black");
  } catch (e) {
    console.error("Failed to parse level balancing data", e);
    showPopup("INVALID DATA FORMAT", "text-red-400 font-black");
  }
};

window.toggleDynamicCost = () => {
  state.dynamicSongCostEnabled = !state.dynamicSongCostEnabled;
  ui.content();
  ui.debug();
};

window.updateDynamicParam = (key, val) => {
  DYNAMIC_SONG_CONFIG[key] = parseInt(val) || 0;
  ui.content();
  ui.debug();
};

window.toggleDebugSection = (section) => {
  state.debugSections[section] = !state.debugSections[section];
  ui.debug();
};

window.updatePlayStat = (path, val, isArray = false, index = -1) => {
  const parts = path.split('.');
  let target = PLAY_STAT;
  for (let i = 0; i < parts.length - 1; i++) {
    target = target[parts[i]];
  }
  const lastKey = parts[parts.length - 1];
  
  if (isArray && index !== -1) {
    target[lastKey][index] = parseFloat(val) || 0;
  } else if (isArray) {
    target[lastKey] = val.split(',').map(v => parseFloat(v.trim()) || 0);
  } else {
    target[lastKey] = parseFloat(val) || 0;
  }
  ui.debug();
};

window.updateGameplayConfig = (key, val) => {
  state.gameplayConfig[key] = val.split(',').map(v => parseInt(v.trim()) || 0);
  ui.debug();
};

window.rewardAllFigures = () => {
  FIGURES_DATA.forEach(f => state.unlockedFigures.add(f.id));
  showPopup("ALL FIGURES UNLOCKED", "text-cyan-400 font-black");
  ui.content();
};

window.resetAllFigures = () => {
  state.unlockedFigures.clear();
  state.unlockedFigures.add(1);
  state.newlyUnlockedFigures.clear();
  state.collectedSetRewards.clear();
  state.decoCoins = 0;
  showPopup("FIGURES RESET", "text-red-400 font-black");
  ui.content();
};

window.killCurrentBoss = () => {
  const bState = state.bossState || { bossNum: 1, currentBossIdx: 0, currentBossHp: 4000 };
  const maxHp = getBossMaxHp(bState.bossNum);
  if (bState.currentBossHp === undefined || bState.currentBossHp === null) {
    bState.currentBossHp = maxHp;
  }
  
  const damage = 100000;
  const oldHp = bState.currentBossHp;
  const newHp = Math.max(0, oldHp - damage);
  bState.currentBossHp = newHp;
  
  if (newHp <= 0) {
    const loopIndex = (bState.bossNum - 1) % 10;
    const currentBoss = BOSS_BALANCING[loopIndex] || BOSS_BALANCING[0];
    const loopOffset = Math.floor((bState.bossNum - 1) / 10);
    
    let pelletsGained = 0;
    let coinsGained = 0;
    if (bState.bossNum <= 10) {
      pelletsGained = currentBoss.rewardPellets !== undefined ? currentBoss.rewardPellets : (BOSS_BALANCING_SCALING.pelletsBase + BOSS_BALANCING_SCALING.pelletsMultiplierPerBossNum * bState.bossNum);
      coinsGained = currentBoss.rewardCoins !== undefined ? currentBoss.rewardCoins : BOSS_BALANCING_SCALING.baseRewardCoins;
    } else {
      pelletsGained = BOSS_BALANCING_SCALING.pelletsBase + (BOSS_BALANCING_SCALING.pelletsMultiplierPerBossNum * bState.bossNum);
      coinsGained = BOSS_BALANCING_SCALING.baseRewardCoins + (loopOffset * BOSS_BALANCING_SCALING.coinsIncreasePerLoop);
    }
    
    state.user.coins += coinsGained;
    state.petPellets = (state.petPellets || 0) + pelletsGained;
    if (window.state) {
      window.state.user.coins = state.user.coins;
      window.state.petPellets = state.petPellets;
    }
    
    // Advance to next boss
    bState.bossNum = (bState.bossNum || 1) + 1;
    const nextBossIndex = (bState.bossNum - 1) % 10;
    const nextMaxHp = getBossMaxHp(bState.bossNum);
    
    bState.currentBossIdx = nextBossIndex;
    bState.currentBossHp = nextMaxHp;
    
    showPopup(`BOSS DEFEATED! 🪙+${coinsGained} 🍪+${pelletsGained}`, "px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-xs shadow-lg uppercase");
  } else {
    showPopup(`DEALT 100,000 DMG TO BOSS!`, "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg uppercase");
  }
  
  ui.header();
  ui.content();
  if (state.debugMode) ui.debug();
};

// --- Game Actions ---

window.toggleExpand = (id) => {
  if (state.expandedSongId !== id) {
    state.expandedSongId = id;
    ui.content();
  }
};

window.unlockWithCoins = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song) return;
  
  const isLocked = Array.isArray(song.isLocked) ? song.isLocked[0] : song.isLocked;
  if (!isLocked) return;

  const cost = song.isDeluxe ? 20 : 10;
  if ((state.user.keys || 0) < cost) {
    showPopup("NOT ENOUGH KEYS!", "text-cyan-400 font-black text-2xl");
    if (window.openCurrencyShop) window.openCurrencyShop();
    return;
  }

  const btn = document.getElementById(`purchase-btn-${id}`);
  const counter = document.getElementById('keys-holder');
  
  if (btn && counter) {
    const targetRect = btn.getBoundingClientRect();
    VFXManager.spawnSpend('coin', cost, counter, targetRect, () => {});
  }

  state.user.keys = (state.user.keys || 0) - cost;
  state.visualUser.keys = state.user.keys;
  state.purchasedSongCount++;
  
  setTimeout(() => {
    if (Array.isArray(song.isLocked)) {
      song.isLocked[0] = false;
    } else {
      song.isLocked = false;
    }
    state.newlyUnlockedSongs.add(id);
    showPopup("SONG UNLOCKED! 🔑", "text-yellow-400 font-black text-2xl");
    ui.header();
    ui.content();
    if (state.debugMode) ui.debug();
  }, 800);
};

window.unlockWithAd = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song || state.unlockingTimers[id]) return;
  
  const isLocked = Array.isArray(song.isLocked) ? song.isLocked[0] : song.isLocked;
  if (!isLocked) return;

  const btn = document.getElementById(`free-btn-${id}`);
  if (!btn) return;

  let timeLeft = 5;
  btn.disabled = true;
  btn.classList.add('opacity-50', 'grayscale');
  btn.innerHTML = `WAIT ${timeLeft}S`;
  
  state.unlockingTimers[id] = setInterval(() => {
    timeLeft -= 1;
    if (timeLeft <= 0) {
      clearInterval(state.unlockingTimers[id]);
      delete state.unlockingTimers[id];
      if (Array.isArray(song.isLocked)) {
        song.isLocked[0] = false;
      } else {
        song.isLocked = false;
      }
      state.newlyUnlockedSongs.add(id);
      showPopup("FREE UNLOCK COMPLETE!", "text-cyan-400 font-black text-2xl");
      ui.content();
    } else {
      btn.innerHTML = `WAIT ${timeLeft}S`;
    }
  }, 1000);
};

function triggerDeluxeSongBoost() {
  // Clear any existing DeluxeSongBoost from all songs
  state.songs.forEach(s => {
    delete s.deluxeSongBoost;
  });

  // Only show up when the player has TotalPlayCount>=4
  if (!state.stats || state.stats.totalPlayCount < 4) {
    return;
  }

  // Find all deluxe songs
  const deluxeSongs = state.songs.filter(s => s.isDeluxe);
  if (deluxeSongs.length > 0) {
    // Select a random deluxe song
    const randomSong = deluxeSongs[Math.floor(Math.random() * deluxeSongs.length)];
    
    // Choose a random buff
    const buffs = ["+100% Score", "+150% Score", "+100% Coin", "+100% Food", "+150% Food"];
    const chosenBuff = buffs[Math.floor(Math.random() * buffs.length)];
    
    randomSong.deluxeSongBoost = {
      buffType: chosenBuff
    };
    
    console.log(`Deluxe song ${randomSong.title} boosted with: ${chosenBuff}`);
  }
}

window.playSong = (id, difficultyIdx = 0, showNewUnlockVFX = false, skipPopup = false) => {
  const song = state.songs.find(s => s.id === id);
  if (!song) return;
  
  const isLocked = Array.isArray(song.isLocked) ? song.isLocked[difficultyIdx] : song.isLocked;
  if (isLocked) return;

  // Intercept with Song Info popup if skipPopup is false
  if (!skipPopup) {
    showSongInfoPopup(id, difficultyIdx, (selectedDiffIdx) => {
      window.playSong(id, selectedDiffIdx, showNewUnlockVFX, true);
    });
    return;
  }

  showGameplayScene(song, difficultyIdx, (finalDiffIdx, gameplayStats) => {
    // Check for active DeluxeSongBoost first before clearing
    const activeBoost = song.deluxeSongBoost;
    
    // Clear boost from all songs and roll a new one
    triggerDeluxeSongBoost();

    let stats;

    if (!song.completedTasks) {
      const levels = Array.isArray(song.level) ? song.level : [song.level];
      const starLevels = Array.isArray(song.starLevel) ? song.starLevel : [song.starLevel];
      song.completedTasks = levels.map((lvl, idx) => {
        const completed = [false, false, false, false, false, false];
        const starCount = starLevels[idx] || 0;
        for (let t = 0; t < Math.min(starCount, 6); t++) {
          completed[t] = true;
        }
        return completed;
      });
    }

    const currentLevel = song.level[finalDiffIdx];
    const historicTasks = song.completedTasks[finalDiffIdx] || [false, false, false, false, false, false];
    let completedTasksInPlay = [false, false, false, false, false, false];

    if (gameplayStats) {
      completedTasksInPlay = gameplayStats.completedTasksInPlay || [true, true, false, false, false, false];
    } else {
      const rawSim = simulatePlay(song, finalDiffIdx);
      for (let t = 0; t < Math.min(rawSim.starLevel, 6); t++) {
        completedTasksInPlay[t] = true;
      }
    }

    const mergedTasks = historicTasks.map((prev, t) => prev || completedTasksInPlay[t]);
    song.completedTasks[finalDiffIdx] = mergedTasks;

    const previousStarLevel = historicTasks.filter(Boolean).length;
    const starLevel = mergedTasks.filter(Boolean).length;
    const starsGained = Math.max(0, starLevel - previousStarLevel);

    // Calculate newly unlocked 1-time star clear rewards
    const oneTimeRewardsGained = [];
    mergedTasks.forEach((done, t) => {
      if (done && !historicTasks[t]) {
        const reward = getStarOneTimeReward(t, currentLevel);
        if (reward) {
          oneTimeRewardsGained.push(reward);
          // Auto-deliver immediately to user's real balance
          if (reward.type === 'coin') {
            state.user.coins += reward.amount;
            state.stats.totalCoinGained += reward.amount;
          } else if (reward.type === 'key') {
            state.user.keys = (state.user.keys || 0) + reward.amount;
          } else if (reward.type === 'decoTicket') {
            state.user.decoTickets = (state.user.decoTickets || 0) + reward.amount;
          }
        }
      }
    });

    // Immediate user level sync to accurately verify pellet eligibility (level >= 3)
    if (Array.isArray(song.starLevel)) {
      song.starLevel[finalDiffIdx] = Math.max(song.starLevel[finalDiffIdx] || 0, starLevel);
    } else {
      song.starLevel = Math.max(song.starLevel || 0, starLevel);
    }
    syncUserLevel();

    if (gameplayStats) {
      const baseCoins = Math.floor(Math.random() * 11) + 60; // 60 to 70 guaranteed
      let bonusCoins = 0;
      if (starLevel > 0) {
        for (let i = 0; i < starLevel; i++) {
          bonusCoins += 20;
        }
        if (starsGained > 0) {
          bonusCoins += (starsGained * 30);
        }
      }
      const totalCoins = baseCoins + bonusCoins;

      const nextDiffIdx = finalDiffIdx + 1;
      const isNextDiffCurrentlyLocked = nextDiffIdx < song.isLocked.length && song.isLocked[nextDiffIdx];
      const DIFFICULTY_MAP = { 1: "Easy", 2: "Normal", 3: "Hard", 4: "Expert", 5: "Extreme", 6: "Hell" };
      const nextDiffName = isNextDiffCurrentlyLocked ? (DIFFICULTY_MAP[song.level[nextDiffIdx]] || "") : "";

      stats = {
        ...gameplayStats,
        starLevel,
        starsGained,
        totalCoins,
        totalPellets: (state.user.level >= 3) ? (6 + starLevel) : 0,
        effectiveSongDuration: 45,
        adDuration: 0,
        idleDuration: 15,
        totalTime: 60,
        newDifficultyUnlocked: isNextDiffCurrentlyLocked,
        nextDiffIdx: isNextDiffCurrentlyLocked ? nextDiffIdx : -1,
        nextDiffName: nextDiffName,
        difficultyIdx: finalDiffIdx,
        oneTimeRewardsGained
      };
    } else {
      stats = {
        ...simulatePlay(song, finalDiffIdx),
        starLevel,
        starsGained,
        totalPellets: (state.user.level >= 3) ? (6 + starLevel) : 0,
        difficultyIdx: finalDiffIdx,
        oneTimeRewardsGained
      };
    }

    // Apply score and reward boosts from deluxeSongBoost
    if (activeBoost) {
      if (activeBoost.buffType === "+100% Score") {
        stats.score = Math.round((stats.score || 0) * 2.0);
      } else if (activeBoost.buffType === "+150% Score") {
        stats.score = Math.round((stats.score || 0) * 2.5);
      } else if (activeBoost.buffType === "+100% Coin") {
        stats.totalCoins = Math.round((stats.totalCoins || 0) * 2.0);
      } else if (activeBoost.buffType === "+100% Food") {
        stats.totalPellets = Math.round((stats.totalPellets || 0) * 2.0);
      } else if (activeBoost.buffType === "+150% Food") {
        stats.totalPellets = Math.round((stats.totalPellets || 0) * 2.5);
      }
    }

    state.stats.totalAdCount = (state.stats.totalAdCount || 0) + 1;

    showBossBattlePopup(stats, () => {
      showPlayStatsPopup(song, stats, (isGoClicked, isRetryClicked) => {
        // Update song state
        if (Array.isArray(song.starLevel)) {
          song.starLevel[finalDiffIdx] = Math.max(song.starLevel[finalDiffIdx], stats.starLevel);
          if (gameplayStats) {
            song.score[finalDiffIdx] = Math.max(song.score[finalDiffIdx] || 0, stats.score);
          } else {
            song.score[finalDiffIdx] += Math.floor(Math.random() * 500) + 500;
          }
          
          // Unlock next difficulty if available (DISABLED: now requires keys to unlock)
          /*
          if (finalDiffIdx + 1 < song.isLocked.length && song.isLocked[finalDiffIdx + 1]) {
            song.isLocked[finalDiffIdx + 1] = false;
            if (!state.newlyUnlockedDifficulties[id]) {
              state.newlyUnlockedDifficulties[id] = new Set();
            }
            state.newlyUnlockedDifficulties[id].add(finalDiffIdx + 1);
          }
          */
        } else {
          song.starLevel = Math.max(song.starLevel, stats.starLevel);
          if (gameplayStats) {
            song.score = Math.max(song.score || 0, stats.score);
          } else {
            song.score += Math.floor(Math.random() * 500) + 500;
          }
        }

        // Figure progress addition
        const figureId = song.id;
        if (!state.figureProgress) state.figureProgress = {};
        if (!state.prevFigureProgress) state.prevFigureProgress = {};
        
        if (state.prevFigureProgress[figureId] === undefined) {
          state.prevFigureProgress[figureId] = state.figureProgress[figureId] || 0;
        }
        
        const oldProgress = state.figureProgress[figureId] || 0;
        const starsAchievedInPlay = stats.starLevel || 0;
        const newProgress = Math.min(6, oldProgress + starsAchievedInPlay);
        
        state.figureProgress[figureId] = newProgress;
        
        if (oldProgress < 6 && newProgress >= 6) {
          state.unlockedFigures.add(figureId);
          state.newlyUnlockedFigures.add(figureId);
          state.figuresBadgeCount = (state.figuresBadgeCount || 0) + 1;
        }

        const pelletsGained = stats.totalPellets !== undefined ? stats.totalPellets : 0;
        const coinsGained = stats.totalCoins;
        const starsGained = stats.starsGained || 0;

        // Update user state
        state.user.coins += coinsGained;
        state.petPellets = (state.petPellets || 0) + pelletsGained;
        state.stats.totalPlayCount++;
        state.stats.totalCoinGained += coinsGained;
        
        // Update time stats
        state.stats.totalTimeSpentPlaying += stats.effectiveSongDuration;
        state.stats.totalTimeSpentWatchingAd += stats.adDuration;
        if (stats.adDuration > 0) {
          state.stats.totalAdCount += (stats.starLevel >= 4 ? 2 : 1);
        }

        syncUserLevel();
        
        ui.content();
        if (state.debugMode) ui.debug();

        if (isRetryClicked) {
          // Immediately apply visual values and update header
          state.visualUser.petPellets = (state.visualUser.petPellets || 0) + pelletsGained;
          state.visualUser.coins += coinsGained;
          state.visualUser.totalStars = (state.visualUser.totalStars || 0) + starsGained;
          if (stats.oneTimeRewardsGained && stats.oneTimeRewardsGained.length > 0) {
            stats.oneTimeRewardsGained.forEach(r => {
              if (r.type === 'coin') {
                state.visualUser.coins += r.amount;
              } else if (r.type === 'key') {
                state.visualUser.keys = (state.visualUser.keys || 0) + r.amount;
              } else if (r.type === 'decoTicket') {
                state.visualUser.decoTickets = (state.visualUser.decoTickets || 0) + r.amount;
              }
            });
          }
          checkLevelUpVisual();
          ui.header();

          setTimeout(() => {
            window.playSong(song.id, stats.difficultyIdx, false, false);
          }, 100);
          return;
        }

        const btn = document.getElementById(`play-btn-${id}`);
        const targetStars = document.getElementById('stars-target');
        const targetCoins = document.getElementById('coins-target');
        const targetPellets = document.getElementById('pellets-target');
        
        if (btn && targetCoins) {
          const startRect = btn.getBoundingClientRect();

          // Sync one-time clear rewards instantly to visual state
          if (stats.oneTimeRewardsGained && stats.oneTimeRewardsGained.length > 0) {
            stats.oneTimeRewardsGained.forEach(r => {
              if (r.type === 'coin') {
                state.visualUser.coins += r.amount;
              } else if (r.type === 'key') {
                state.visualUser.keys = (state.visualUser.keys || 0) + r.amount;
              } else if (r.type === 'decoTicket') {
                state.visualUser.decoTickets = (state.visualUser.decoTickets || 0) + r.amount;
              }
            });
            ui.header();
          }

          // Spawn Coins
          VFXManager.spawnRewards('coin', coinsGained, startRect, targetCoins, (increment) => {
            state.visualUser.coins += increment;
            ui.header();
          }, () => {
            window.refreshUI();
          });

          // Spawn Pellets
          if (targetPellets) {
            VFXManager.spawnRewards('pellet', pelletsGained, startRect, targetPellets, (increment) => {
              state.visualUser.petPellets = (state.visualUser.petPellets || 0) + increment;
              ui.header();
            }, () => {
              window.refreshUI();
            });
          } else {
            state.visualUser.petPellets = (state.visualUser.petPellets || 0) + pelletsGained;
          }

          // Spawn Stars is only done if new stars were achieved in StarJourney!
          if (starsGained > 0 && targetStars) {
            VFXManager.spawnRewards('star', starsGained, startRect, targetStars, (increment) => {
              state.visualUser.totalStars = (state.visualUser.totalStars || 0) + increment;
              checkLevelUpVisual();
              ui.header();
              ui.petsLounge();
            }, () => {
              showPendingLevelUps();
              window.refreshUI();
              if (isGoClicked) {
                setTimeout(() => {
                  window.playSong(song.id, stats.nextDiffIdx, true, true);
                }, 500);
              }
            });
          } else {
            // No new stars achieved, trigger next instantly or shows standard rewards
            showPendingLevelUps();
            window.refreshUI();
            if (isGoClicked) {
              setTimeout(() => {
                window.playSong(song.id, stats.nextDiffIdx, true, true);
              }, 500);
            }
          }

        } else {
          // Fallback if no DOM elements found
          state.visualUser.petPellets = (state.visualUser.petPellets || 0) + pelletsGained;
          state.visualUser.coins += coinsGained;
          state.visualUser.totalStars = (state.visualUser.totalStars || 0) + starsGained;
          if (stats.oneTimeRewardsGained && stats.oneTimeRewardsGained.length > 0) {
            stats.oneTimeRewardsGained.forEach(r => {
              if (r.type === 'coin') {
                state.visualUser.coins += r.amount;
              } else if (r.type === 'key') {
                state.visualUser.keys = (state.visualUser.keys || 0) + r.amount;
              } else if (r.type === 'decoTicket') {
                state.visualUser.decoTickets = (state.visualUser.decoTickets || 0) + r.amount;
              }
            });
          }
          checkLevelUpVisual();
          showPendingLevelUps();
          window.refreshUI();
          if (isGoClicked) {
            setTimeout(() => {
              window.playSong(song.id, stats.nextDiffIdx, true, true);
            }, 500);
          }
        }
      });
    });
  }, showNewUnlockVFX);
};

function showGiftBoxPopup() {
  const overlay = document.createElement('div');
  overlay.id = 'gift-box-overlay';
  overlay.className = "fixed inset-0 z-[400] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300";
  
  overlay.innerHTML = `
    <div class="relative flex flex-col items-center">
      <div id="gift-box-container" class="w-48 h-48 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl shadow-[0_0_50px_rgba(236,72,153,0.5)] flex items-center justify-center cursor-pointer hover:scale-110 transition-transform animate-bounce">
        <svg class="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.41 12.25 12 8.66l3.59 3.59L17 10.83 14.92 8H20v6z"/></svg>
      </div>
      <p class="text-white font-black italic uppercase text-xl mt-8 animate-pulse">Tap to open gift!</p>
    </div>
  `;

  document.body.appendChild(overlay);

  const box = overlay.querySelector('#gift-box-container');
  box.onclick = () => {
    playGiftOpenVFX(box);
    box.classList.remove('animate-bounce');
    box.animate([
      { transform: 'scale(1)', opacity: 1 },
      { transform: 'scale(2)', opacity: 0 }
    ], { duration: 500, fill: 'forwards' });

    setTimeout(() => {
      awardRandomFigure(overlay);
    }, 500);
  };
}

function awardRandomFigure(overlay) {
  const randomFig = FIGURES_DATA[Math.floor(Math.random() * FIGURES_DATA.length)];
  const isDuplicate = state.unlockedFigures.has(randomFig.id);
  
  if (isDuplicate) {
    state.decoCoins += 10;
  } else {
    state.unlockedFigures.add(randomFig.id);
    state.newlyUnlockedFigures.add(randomFig.id);
  }

  overlay.innerHTML = `
    <div class="bg-gradient-to-br from-gray-900 to-black w-full max-w-sm rounded-[40px] border-2 border-white/20 p-8 flex flex-col items-center text-center shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in duration-500">
      <h2 class="text-white font-black text-3xl uppercase italic tracking-tighter mb-2">${isDuplicate ? 'DUPLICATE!' : 'NEW FIGURE!'}</h2>
      <div id="awarded-figure-img" class="relative w-48 h-48 my-6 flex items-center justify-center">
        <div class="absolute inset-0 bg-white/10 blur-3xl rounded-full"></div>
        <img src="${randomFig.img}" class="w-40 h-40 object-contain relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]" />
      </div>
      
      <h3 class="text-white font-black text-xl mb-2">Figure #${randomFig.id}</h3>
      
      ${isDuplicate ? `
        <div class="flex items-center gap-2 bg-pink-500/20 px-4 py-2 rounded-full border border-pink-500/30 mb-8">
          <span class="text-pink-400 font-black italic">+10 DECO COINS</span>
        </div>
      ` : `
        <p class="text-white/60 text-sm mb-8">Added to your collection!</p>
      `}
      
      <button id="close-gift-btn" class="w-full bg-white text-black font-black italic py-4 rounded-2xl active:scale-95 transition-all uppercase tracking-widest">
        Awesome
      </button>
    </div>
  `;

  overlay.querySelector('#close-gift-btn').onclick = () => {
    const imgContainer = overlay.querySelector('#awarded-figure-img');
    const navItems = document.querySelectorAll('#nav-root .cursor-pointer, #nav-root .mb-1');
    const figureTab = navItems[1]; // Second icon

    if (imgContainer && figureTab) {
      const startRect = imgContainer.getBoundingClientRect();
      VFXManager.spawnFigureFly(randomFig.img, startRect, figureTab, () => {
        overlay.remove();
        ui.nav(); // Refresh nav to show any indicators if needed
      });
    } else {
      overlay.remove();
    }
  };
}

function checkLevelUpVisual() {
  const currentJourney = getStarJourneyLevelAndProgress(state.visualUser.totalStars || 0);
  while (state.visualUser.level < currentJourney.level) {
    state.visualUser.level += 1;
    
    const reward = getLevelReward(state.visualUser.level);
    let finalReward = { ...reward, levelReached: state.visualUser.level };
    
    if (reward.type === 'coin') {
      state.user.coins += reward.amount;
      state.stats.totalCoinGained += reward.amount;
      // Spawn VFX for level up coin reward
      const targetCoins = document.getElementById('coins-target');
      if (targetCoins) {
        VFXManager.spawnRewards('coin', reward.amount, { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }, targetCoins, (inc) => {
          state.visualUser.coins += inc;
          ui.header();
        });
      } else {
        state.visualUser.coins += reward.amount;
      }
    } else if (reward.type === 'key') {
      state.user.keys = (state.user.keys || 0) + reward.amount;
      const targetKeys = document.getElementById('keys-holder');
      if (targetKeys) {
        VFXManager.spawnRewards('key', reward.amount, { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0, height: 0 }, targetKeys, (inc) => {
          state.visualUser.keys = (state.visualUser.keys || 0) + inc;
          ui.header();
        });
      } else {
        state.visualUser.keys = (state.visualUser.keys || 0) + reward.amount;
      }
    } else if (reward.type === 'decoTicket') {
      state.user.decoTickets = (state.user.decoTickets || 0) + reward.amount;
      state.visualUser.decoTickets = (state.visualUser.decoTickets || 0) + reward.amount;
    } else if (reward.type === 'song') {
      let songId = reward.songId;
      if (!songId) {
        const lockedSongs = state.songs.filter(s => {
          if (Array.isArray(s.isLocked)) {
            return s.isLocked[0];
          }
          return s.isLocked;
        });
        if (lockedSongs.length > 0) {
          const randomSong = lockedSongs[Math.floor(Math.random() * lockedSongs.length)];
          songId = randomSong.id;
        }
      }
      const song = state.songs.find(s => s.id === songId);
      if (song) {
        if (Array.isArray(song.isLocked)) {
          song.isLocked = song.isLocked.map(() => false);
        } else {
          song.isLocked = false;
        }
        finalReward.songId = songId;
      }
    } else if (reward.type === 'pet') {
      state.unlockedPets.add(reward.petId);
      state.selectedPetIdDetail = reward.petId;
      syncPets();
      
      // Auto switch to HOME and scroll to top
      state.activeCategory = 'HOME';
      setTimeout(() => {
        const contentRoot = document.getElementById('content-root');
        if (contentRoot) {
          contentRoot.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 350);
    }
    state.pendingLevelUpRewards.push(finalReward);
  }
}

function showPendingLevelUps() {
  if (state.pendingLevelUpRewards.length > 0 && !state.isLevelUpPopupShowing) {
    const nextReward = state.pendingLevelUpRewards.shift();
    state.isLevelUpPopupShowing = true;
    
    showLevelUpPopup(nextReward.levelReached || state.visualUser.level, nextReward, () => {
      state.isLevelUpPopupShowing = false;
      ui.header();
      ui.content();
      showPendingLevelUps();
    });
  }
}

function showPopup(text, classes) {
  const layer = document.getElementById('popup-layer');
  const popup = document.createElement('div');
  popup.className = `reward-popup absolute flex flex-col items-center justify-center pointer-events-none ${classes} z-[100] drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]`;
  popup.innerText = text;
  layer.appendChild(popup);
  setTimeout(() => popup.remove(), 1200);
}

// --- Init ---

const PETS_MAP_LOCAL = {
  1: "🐱 Neon Meow",
  2: "🐰 Beat Bunny",
  3: "🐹 Hyper Hamster",
  4: "🐼 Rhythm Panda",
  5: "🐉 Cyber Dragon"
};

function syncPets() {
  const levels = [3, 5, 10, 15, 20];
  levels.forEach((lvl, idx) => {
    if (state.user.level >= lvl) {
      state.unlockedPets.add(idx + 1);
    }
  });

  // Auto-equip unlocked pets if there are empty slots available
  const maxSlots = getCarrySlotsCount(state.user.level);
  if (!state.equippedPetIds) state.equippedPetIds = [];
  
  state.unlockedPets.forEach(petId => {
    if (state.equippedPetIds.length < maxSlots && !state.equippedPetIds.includes(petId)) {
      state.equippedPetIds.push(petId);
    }
  });
}

window.selectPet = (petId) => {
  state.selectedPetIdDetail = petId;
  ui.petsLounge();
};

window.add1000Pellets = () => {
  state.petPellets = (state.petPellets || 0) + 1000;
  showPopup("ADDED 1000 FOOD! 🍪", "px-4 py-2 rounded-xl bg-fuchsia-600 text-white font-bold text-xs shadow-lg uppercase");
  ui.header();
  ui.petsLounge();
  ui.debug();
};

window.upgradePet = (petId) => {
  if (!state.unlockedPets.has(petId)) return;
  const currentLevel = state.petLevels[petId] || 1;
  if (currentLevel >= 10) {
    showPopup("MAX LEVEL REACHED! ⭐", "px-4 py-2 rounded-xl bg-cyan-600 text-white font-bold text-xs shadow-lg uppercase");
    return;
  }
  const costIdx = Math.min(PET_BALANCING.upgradeCost.length - 1, currentLevel - 1);
  const cost = PET_BALANCING.upgradeCost[costIdx];
  if ((state.petPellets || 0) < cost) {
    showPopup("NOT ENOUGH FOOD! 🍪", "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg uppercase");
    return;
  }
  
  // Deduct Pellets
  state.petPellets -= cost;
  // Increase Level
  state.petLevels[petId] = currentLevel + 1;
  
  // Put Pet to sleep
  const sleepIdx = Math.min(PET_BALANCING.sleepDurationSeconds.length - 1, currentLevel - 1);
  const sleepSecs = PET_BALANCING.sleepDurationSeconds[sleepIdx];
  state.petSleepUntil[petId] = Date.now() + (sleepSecs * 1000);
  
  showPopup(`PET UPGRADING TO LEVEL ${currentLevel + 1}!`, "px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs shadow-lg uppercase");
  
  ui.header();
  ui.petsLounge();
  
  startSleepTicker();
};

window.speedUpPetSleep = (petId) => {
  if (!state.petSleepUntil || !state.petSleepUntil[petId]) return;
  const secsLeft = Math.ceil((state.petSleepUntil[petId] - Date.now()) / 1000);
  if (secsLeft <= 0) return;
  
  const speedupCost = Math.max(1, Math.ceil(secsLeft / 120)) * PET_BALANCING.speedupCostPer2min;
  if (state.visualUser.coins < speedupCost) {
    showPopup("NOT ENOUGH COINS! 💰", "px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg uppercase");
    return;
  }
  
  // Deduct coins
  state.visualUser.coins -= speedupCost;
  state.user.coins = state.visualUser.coins;
  state.stats.totalCoinSpent += speedupCost;
  
  // Wake up
  state.petSleepUntil[petId] = 0;
  
  showPopup(`PET UPGRADE COMPLETE`, "px-4 py-2 rounded-xl bg-cyan-500 text-white font-bold text-[10px] shadow-lg uppercase");
  
  ui.header();
  ui.petsLounge();
};

let sleepTickerInterval = null;
function startSleepTicker() {
  if (sleepTickerInterval) return;
  sleepTickerInterval = setInterval(() => {
    let anySleeping = false;
    for (let petId in state.petSleepUntil) {
      if (state.petSleepUntil[petId] > Date.now()) {
        anySleeping = true;
      }
    }
    if (anySleeping) {
      if (state.activeCategory === 'HOME') {
        ui.petsLounge();
      }
    } else {
      clearInterval(sleepTickerInterval);
      sleepTickerInterval = null;
      if (state.activeCategory === 'HOME') {
        ui.petsLounge();
      }
    }
  }, 1000);
}

function init() {
  const stars = getTotalStarsCollected(state.songs);
  state.user.totalStars = stars;
  state.visualUser.totalStars = stars;
  state.visualUser.petPellets = state.petPellets || 0;
  
  const journey = getStarJourneyLevelAndProgress(stars);
  state.user.level = journey.level;
  state.visualUser.level = journey.level;

  syncPets();
  startSleepTicker();
  initStageState();
  ui.all();
}
document.addEventListener('DOMContentLoaded', init);
