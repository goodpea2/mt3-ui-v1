
import { state } from './state.js';
import { CATEGORIES } from './constants.js';
import { getXpRequired, setXpRequired, getLevelReward, setLevelReward, setAllLevelBalancing, LEVEL_BALANCING, DYNAMIC_SONG_CONFIG, PLAY_STAT } from './balance.js';
import { VFXManager } from './vfx/Manager.js';
import { simulatePlay } from './simulation.js';
import { showPlayStatsPopup } from './ui/PlayStatsPopup.js';
import { showLevelUpPopup } from './ui/LevelUpPopup.js';
import { showGameplayScene } from './ui/GameplayScene.js';

// UI Components
import { renderHeader } from './ui/Header.js';
import { renderTabs } from './ui/Tabs.js';
import { renderContent } from './ui/Content.js';
import { renderNav } from './ui/Nav.js';
import { renderDebug } from './ui/Debug.js';

import { renderFigureCollection, showFigureFocus } from './ui/FigureCollection.js';
import { FIGURES_DATA, SET_FIGURES_DATA } from './figures.js';
import { playGiftOpenVFX } from './vfx/GiftOpen.js';

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
  tabs: () => {
    if (state.activeCategory === 'FIGURES') {
      const tabsRoot = document.getElementById('tabs-root');
      if (tabsRoot) tabsRoot.innerHTML = ''; // Hide tabs in figures
      return;
    }
    renderTabs(state, (cat) => {
      state.activeCategory = cat;
      ui.tabs();
      ui.content();
    });
  },
  content: () => {
    if (state.activeCategory === 'FIGURES') {
      renderFigureCollection(state);
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

window.switchTab = (tab) => {
  state.activeCategory = tab;
  ui.all();
};

window.focusFigure = (id) => {
  showFigureFocus(id, state);
};

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
  
  if (set.reward.type === 'coin') {
    window.addCoins(set.reward.amount);
  }
  
  showPopup("SET REWARD COLLECTED!", "text-yellow-400 font-black");
  ui.content();
};

window.addCoins = (amount) => {
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
    if (Array.isArray(song.isLocked)) {
      song.isLocked[0] = false;
    } else {
      song.isLocked = false;
    }
    state.newlyUnlockedSongs.add(id);
    showPopup("SONG UNLOCKED!", "text-yellow-400 font-black text-2xl");
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

window.playSong = (id, difficultyIdx = 0) => {
  const song = state.songs.find(s => s.id === id);
  if (!song) return;
  
  const isLocked = Array.isArray(song.isLocked) ? song.isLocked[difficultyIdx] : song.isLocked;
  if (isLocked) return;

  showGameplayScene(song, difficultyIdx, (finalDiffIdx) => {
    const stats = simulatePlay(song, finalDiffIdx);

    showPlayStatsPopup(song, stats, () => {
      // Apply rewards after popup is dismissed
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
          // All particles landed
          showPendingLevelUps();
        });

        VFXManager.spawnRewards('coin', coinsGained, startRect, targetCoins, (increment) => {
          state.visualUser.coins += increment;
          ui.header();
        });
      }

      // Update song state
      if (Array.isArray(song.starLevel)) {
        song.starLevel[finalDiffIdx] = Math.max(song.starLevel[finalDiffIdx], stats.starLevel);
        song.score[finalDiffIdx] += Math.floor(Math.random() * 500) + 500;
        
        // Unlock next difficulty if available
        if (finalDiffIdx + 1 < song.isLocked.length && song.isLocked[finalDiffIdx + 1]) {
          song.isLocked[finalDiffIdx + 1] = false;
          if (!state.newlyUnlockedDifficulties[id]) {
            state.newlyUnlockedDifficulties[id] = new Set();
          }
          state.newlyUnlockedDifficulties[id].add(finalDiffIdx + 1);
        }
      } else {
        song.starLevel = Math.max(song.starLevel, stats.starLevel);
        song.score += Math.floor(Math.random() * 500) + 500;
      }
      
      // Update user state
      state.user.xp += xpGained;
      state.user.coins += coinsGained;
      state.stats.totalPlayCount++;
      state.stats.totalXpGained += xpGained;
      state.stats.totalCoinGained += coinsGained;
      
      // Update time stats
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

      // NEW: Show Gift Box Popup after song
      setTimeout(() => {
        showGiftBoxPopup();
      }, 1000);
    });
  });
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
