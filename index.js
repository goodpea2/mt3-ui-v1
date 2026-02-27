
import { state } from './state.js';
import { CATEGORIES } from './constants.js';
import { getXpRequired, setXpRequired, getLevelReward, setLevelReward, setAllLevelBalancing, LEVEL_BALANCING, DYNAMIC_SONG_CONFIG, PLAY_STAT } from './balance.js';
import { VFXManager } from './vfx/Manager.js';
import { simulatePlay } from './simulation.js';
import { showPlayStatsPopup } from './ui/PlayStatsPopup.js';
import { showLevelUpPopup } from './ui/LevelUpPopup.js';

// UI Components
import { renderHeader } from './ui/Header.js';
import { renderTabs } from './ui/Tabs.js';
import { renderContent } from './ui/Content.js';
import { renderNav } from './ui/Nav.js';
import { renderDebug } from './ui/Debug.js';

// --- Helper Logic ---

function getCurrentDynamicCost() {
  const { initialCoinCost, coinCostIncreasePerStep, songPurchasesPerStep, maxCoinCost } = DYNAMIC_SONG_CONFIG;
  const currentStep = Math.floor(state.purchasedSongCount / songPurchasesPerStep);
  return Math.min(initialCoinCost + (currentStep * coinCostIncreasePerStep), maxCoinCost);
}

function getSongCost(song) {
  return state.dynamicSongCostEnabled ? getCurrentDynamicCost() : song.coinCost;
}

// --- Wrapper Renders ---
// These wrappers ensure we pass the correct dependencies to the modular UI functions

const ui = {
  header: () => renderHeader(state),
  tabs: () => renderTabs(state, (cat) => {
    state.activeCategory = cat;
    ui.tabs();
    ui.content();
  }),
  content: () => renderContent(state, getSongCost),
  nav: () => renderNav(),
  debug: () => renderDebug(state, getCurrentDynamicCost),
  all: () => {
    ui.header();
    ui.tabs();
    ui.content();
    ui.nav();
    ui.debug();
  }
};

// --- Debug Actions ---
window.toggleDebug = () => {
  state.debugMode = !state.debugMode;
  ui.debug();
};

window.add1000Xp = () => {
  const amount = 1000;
  const targetXp = document.getElementById('xp-target');
  if (targetXp) {
    const rect = targetXp.getBoundingClientRect();
    VFXManager.spawnRewards('xp', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetXp, (inc) => {
      state.visualUser.xp += inc;
      checkLevelUpVisual();
      ui.header();
    }, () => {
      showPendingLevelUps();
    });
  }
  state.user.xp += amount;
  state.stats.totalXpGained += amount;
  while (state.user.xp >= getXpRequired(state.user.level)) {
    state.user.xp -= getXpRequired(state.user.level);
    state.user.level += 1;
  }
  if (state.debugMode) ui.debug();
};

window.add1000Coins = () => {
  const amount = 1000;
  const targetCoins = document.getElementById('coins-target');
  if (targetCoins) {
    const rect = targetCoins.getBoundingClientRect();
    VFXManager.spawnRewards('coin', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetCoins, (inc) => {
      state.visualUser.coins += inc;
      ui.header();
    });
  }
  state.user.coins += amount;
  state.stats.totalCoinGained += amount;
  if (state.debugMode) ui.debug();
};

window.unlockAllSongs = () => {
  state.songs.forEach(s => s.isLocked = false);
  showPopup("ALL SONGS UNLOCKED", "text-cyan-400 font-black");
  ui.content();
};

window.lockAllSongs = () => {
  state.songs.forEach((s, idx) => {
    if (idx > 0) s.isLocked = true;
  });
  state.purchasedSongCount = 0;
  showPopup("SONGS LOCKED", "text-red-400 font-black");
  ui.content();
  if (state.debugMode) ui.debug();
};

window.resetToLevel1 = () => {
  state.user.level = 1;
  state.user.xp = 0;
  state.visualUser.level = 1;
  state.visualUser.xp = 0;
  state.stats.totalXpGained = 0;
  showPopup("RESET TO LV.1", "text-white font-black");
  ui.header();
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

window.updateLevelXp = (index, val) => {
  setXpRequired(index, parseInt(val) || 10);
  ui.header();
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

// --- Game Actions ---

window.toggleExpand = (id) => {
  if (state.expandedSongId !== id) {
    state.expandedSongId = id;
    ui.content();
  }
};

window.unlockWithCoins = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song || !song.isLocked) return;

  const cost = getSongCost(song);
  if (state.user.coins < cost) {
    showPopup("NOT ENOUGH COINS", "text-red-500 font-black text-2xl");
    return;
  }

  const btn = document.getElementById(`purchase-btn-${id}`);
  const counter = document.getElementById('coins-target');
  
  if (btn && counter) {
    const targetRect = btn.getBoundingClientRect();
    VFXManager.spawnSpend('coin', cost, counter, targetRect, () => {});
  }

  state.user.coins -= cost;
  state.stats.totalCoinSpent += cost;
  state.purchasedSongCount++;
  
  setTimeout(() => {
    state.visualUser.coins -= cost;
    song.isLocked = false;
    showPopup("SONG UNLOCKED!", "text-yellow-400 font-black text-2xl");
    ui.header();
    ui.content();
    if (state.debugMode) ui.debug();
  }, 800);
};

window.unlockWithAd = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song || !song.isLocked || state.unlockingTimers[id]) return;

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
      song.isLocked = false;
      showPopup("FREE UNLOCK COMPLETE!", "text-cyan-400 font-black text-2xl");
      ui.content();
    } else {
      btn.innerHTML = `WAIT ${timeLeft}S`;
    }
  }, 1000);
};

window.playSong = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song || song.isLocked) return;

  const stats = simulatePlay(song);

  showPlayStatsPopup(song, stats, () => {
    const xpGained = stats.totalXp;
    const coinsGained = stats.totalCoins;

    const btn = document.getElementById(`play-btn-${id}`);
    const targetXp = document.getElementById('xp-target');
    const targetCoins = document.getElementById('coins-target');
    
    if (btn && targetXp && targetCoins) {
      const startRect = btn.getBoundingClientRect();

      VFXManager.spawnRewards('xp', xpGained, startRect, targetXp, (increment) => {
        state.visualUser.xp += increment;
        checkLevelUpVisual();
        ui.header();
      }, () => {
        showPendingLevelUps();
      });

      VFXManager.spawnRewards('coin', coinsGained, startRect, targetCoins, (increment) => {
        state.visualUser.coins += increment;
        ui.header();
      });
    }

    song.starLevel = Math.max(song.starLevel, stats.starLevel);
    song.score += Math.floor(Math.random() * 500) + 500;
    
    state.user.xp += xpGained;
    state.user.coins += coinsGained;
    state.stats.totalPlayCount++;
    state.stats.totalXpGained += xpGained;
    state.stats.totalCoinGained += coinsGained;
    
    state.stats.totalTimeSpentPlaying += stats.effectiveSongDuration;
    state.stats.totalTimeSpentWatchingAd += stats.adDuration;
    if (stats.adDuration > 0) {
      state.stats.totalAdCount += (stats.starLevel >= 4 ? 2 : 1);
    }

    while (state.user.xp >= getXpRequired(state.user.level)) {
      state.user.xp -= getXpRequired(state.user.level);
      state.user.level += 1;
    }
    
    ui.content();
    if (state.debugMode) ui.debug();
  });
};

function checkLevelUpVisual() {
  while (state.visualUser.xp >= getXpRequired(state.visualUser.level)) {
    state.visualUser.xp -= getXpRequired(state.visualUser.level);
    state.visualUser.level += 1;
    
    const reward = getLevelReward(state.visualUser.level);
    let finalReward = { ...reward };
    
    if (reward.type === 'coin') {
      state.user.coins += reward.amount;
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
    } else if (reward.type === 'song') {
      let songId = reward.songId;
      if (!songId) {
        const lockedSongs = state.songs.filter(s => s.isLocked);
        if (lockedSongs.length > 0) {
          const randomSong = lockedSongs[Math.floor(Math.random() * lockedSongs.length)];
          songId = randomSong.id;
        }
      }
      const song = state.songs.find(s => s.id === songId);
      if (song) {
        song.isLocked = false;
        finalReward.songId = songId;
      }
    }
    state.pendingLevelUpRewards.push(finalReward);
  }
}

function showPendingLevelUps() {
  if (state.pendingLevelUpRewards.length > 0 && !state.isLevelUpPopupShowing) {
    const rewards = [...state.pendingLevelUpRewards];
    state.pendingLevelUpRewards = [];
    state.isLevelUpPopupShowing = true;
    
    showLevelUpPopup(state.visualUser.level, rewards, () => {
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

function init() {
  ui.all();
}
document.addEventListener('DOMContentLoaded', init);
