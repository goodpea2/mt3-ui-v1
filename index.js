
import { getSongCardHtml } from './SongCard.js';
import { MOCK_SONGS } from './songs.js';
import { getXpRequired, setXpRequired, LEVEL_BALANCING, DYNAMIC_SONG_CONFIG } from './balance.js';
import { VFXManager } from './vfx/Manager.js';

// --- Simulation State ---
const state = {
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
    totalCoinSpent: 0
  },
  songs: MOCK_SONGS,
  expandedSongId: 'song-0',
  unlockingTimers: {},
  dynamicSongCostEnabled: false,
  purchasedSongCount: 0,
  gameConfig: {
    minXp: 150,
    maxXp: 250,
    minCoins: 70,
    maxCoins: 120
  },
  // Tracks which config sections are expanded in Debug UI
  debugSections: {
    play: false,
    xp: false
  }
};

const CATEGORIES = ['HOME', 'YOUR SONG', 'VIETNAM', 'KPOP', 'CLASSIC', 'ANIME', 'TIKTOK', 'WHATEVER'];

// --- Helper Logic ---

function getCurrentDynamicCost() {
  const { initialCoinCost, coinCostIncreasePerStep, songPurchasesPerStep, maxCoinCost } = DYNAMIC_SONG_CONFIG;
  const currentStep = Math.floor(state.purchasedSongCount / songPurchasesPerStep);
  return Math.min(initialCoinCost + (currentStep * coinCostIncreasePerStep), maxCoinCost);
}

function getSongCost(song) {
  return state.dynamicSongCostEnabled ? getCurrentDynamicCost() : song.coinCost;
}

// --- Debug Actions ---
window.toggleDebug = () => {
  state.debugMode = !state.debugMode;
  renderDebug();
};

window.add1000Xp = () => {
  const amount = 1000;
  const targetXp = document.getElementById('xp-target');
  if (targetXp) {
    const rect = targetXp.getBoundingClientRect();
    VFXManager.spawnRewards('xp', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetXp, (inc) => {
      state.visualUser.xp += inc;
      checkLevelUpVisual();
      renderHeader();
    });
  }
  state.user.xp += amount;
  state.stats.totalXpGained += amount;
  while (state.user.xp >= getXpRequired(state.user.level)) {
    state.user.xp -= getXpRequired(state.user.level);
    state.user.level += 1;
  }
  if (state.debugMode) renderDebug();
};

window.add1000Coins = () => {
  const amount = 1000;
  const targetCoins = document.getElementById('coins-target');
  if (targetCoins) {
    const rect = targetCoins.getBoundingClientRect();
    VFXManager.spawnRewards('coin', amount, { left: rect.left, top: window.innerHeight, width: rect.width, height: 0 }, targetCoins, (inc) => {
      state.visualUser.coins += inc;
      renderHeader();
    });
  }
  state.user.coins += amount;
  state.stats.totalCoinGained += amount;
  if (state.debugMode) renderDebug();
};

window.unlockAllSongs = () => {
  state.songs.forEach(s => s.isLocked = false);
  showPopup("ALL SONGS UNLOCKED", "text-cyan-400 font-black");
  renderContent();
};

window.lockAllSongs = () => {
  state.songs.forEach((s, idx) => {
    if (idx > 0) s.isLocked = true;
  });
  state.purchasedSongCount = 0;
  showPopup("SONGS LOCKED", "text-red-400 font-black");
  renderContent();
  if (state.debugMode) renderDebug();
};

window.resetToLevel1 = () => {
  state.user.level = 1;
  state.user.xp = 0;
  state.visualUser.level = 1;
  state.visualUser.xp = 0;
  state.stats.totalXpGained = 0; // Reset total XP stat as well
  showPopup("RESET TO LV.1", "text-white font-black");
  renderHeader();
  if (state.debugMode) renderDebug();
};

window.updateBalancing = (key, val) => {
  state.gameConfig[key] = parseInt(val) || 0;
};

window.updateLevelXp = (index, val) => {
  setXpRequired(index, parseInt(val) || 10);
  renderHeader();
};

window.toggleDynamicCost = () => {
  state.dynamicSongCostEnabled = !state.dynamicSongCostEnabled;
  renderContent();
  renderDebug();
};

window.updateDynamicParam = (key, val) => {
  DYNAMIC_SONG_CONFIG[key] = parseInt(val) || 0;
  renderContent();
  renderDebug();
};

window.toggleDebugSection = (section) => {
  state.debugSections[section] = !state.debugSections[section];
  renderDebug();
};

// --- Game Actions ---

window.toggleExpand = (id) => {
  if (state.expandedSongId !== id) {
    state.expandedSongId = id;
    renderContent();
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
    renderHeader();
    renderContent();
    if (state.debugMode) renderDebug();
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
      renderContent();
    } else {
      btn.innerHTML = `WAIT ${timeLeft}S`;
    }
  }, 1000);
};

window.playSong = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song || song.isLocked) return;

  const xpGained = Math.floor(Math.random() * (state.gameConfig.maxXp - state.gameConfig.minXp + 1)) + state.gameConfig.minXp; 
  const coinsGained = Math.floor(Math.random() * (state.gameConfig.maxCoins - state.gameConfig.minCoins + 1)) + state.gameConfig.minCoins; 
  const starGained = Math.floor(Math.random() * 2) + 1;   

  const btn = document.getElementById(`play-btn-${id}`);
  const targetXp = document.getElementById('xp-target');
  const targetCoins = document.getElementById('coins-target');
  
  if (btn && targetXp && targetCoins) {
    const startRect = btn.getBoundingClientRect();

    VFXManager.spawnRewards('xp', xpGained, startRect, targetXp, (increment) => {
      state.visualUser.xp += increment;
      checkLevelUpVisual();
      renderHeader();
    });

    VFXManager.spawnRewards('coin', coinsGained, startRect, targetCoins, (increment) => {
      state.visualUser.coins += increment;
      renderHeader();
    });
  }

  song.starLevel = Math.min(6, song.starLevel + starGained);
  song.score += Math.floor(Math.random() * 500) + 500;
  
  state.user.xp += xpGained;
  state.user.coins += coinsGained;
  state.stats.totalPlayCount++;
  state.stats.totalXpGained += xpGained;
  state.stats.totalCoinGained += coinsGained;

  while (state.user.xp >= getXpRequired(state.user.level)) {
    state.user.xp -= getXpRequired(state.user.level);
    state.user.level += 1;
  }
  
  renderContent();
  if (state.debugMode) renderDebug();
};

function checkLevelUpVisual() {
  const reqXp = getXpRequired(state.visualUser.level);
  if (state.visualUser.xp >= reqXp) {
    state.visualUser.xp -= reqXp;
    state.visualUser.level += 1;
    showPopup(`LEVEL UP! LV.${state.visualUser.level}`, "text-yellow-400 font-black text-4xl");
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

// --- Renders ---

function renderHeader() {
  const reqXp = getXpRequired(state.visualUser.level);
  const xpPct = (state.visualUser.xp / reqXp) * 100;
  
  const container = document.getElementById('header-root');
  if (!container) return;
  container.innerHTML = `
    <div class="px-4 py-4 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-14 h-14 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-800 border-2 border-white/20 p-1 overflow-hidden shadow-xl">
            <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" class="w-full h-full object-cover rounded-2xl" />
          </div>
          <div class="absolute -bottom-1 -right-1 bg-gradient-to-b from-[#4ade80] to-[#22c55e] border-2 border-[#1a0b3d] text-white text-[11px] font-black px-1.5 py-0.5 rounded-lg shadow-lg">
            LV.${state.visualUser.level}
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-white font-black text-sm ml-1">${state.user.name}</span>
          <div id="xp-target" class="relative w-40 h-4 bg-[#1a0b3d] border border-white/10 rounded-full overflow-hidden flex items-center shadow-inner">
             <div class="absolute h-full left-0 top-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style="width: ${xpPct}%"></div>
             <div class="relative w-full text-center text-[8px] font-black text-white/80 z-10 uppercase tracking-widest">
               XP ${Math.floor(state.visualUser.xp)} / ${reqXp}
             </div>
          </div>
        </div>
      </div>
      <div id="coins-target" class="bg-[#1a0b3d] border-2 border-[#4a2d8a] rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-inner transition-transform duration-300">
        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/20">
           <span class="text-white font-black text-[12px] leading-none">$</span>
        </div>
        <span class="text-yellow-400 font-black text-lg italic tracking-tighter drop-shadow-sm">${Math.floor(state.visualUser.coins).toLocaleString()}</span>
      </div>
    </div>
  `;
}

function renderTabs() {
  const container = document.getElementById('tabs-root');
  if (!container) return;
  container.className = "w-full bg-[#130829] py-1 border-y border-white/5 relative z-20";
  const scrollArea = document.createElement('div');
  scrollArea.className = "flex overflow-x-auto px-4 no-scrollbar gap-4 items-center h-12";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `whitespace-nowrap text-xs font-black tracking-widest px-5 py-2 rounded-xl transition-all duration-200 ${
      state.activeCategory === cat 
        ? 'bg-[#3b2175] text-[#ff00ff] border border-[#ff00ff30] shadow-[0_0_15px_rgba(255,0,255,0.2)]' 
        : 'text-gray-400 hover:text-gray-200'
    }`;
    btn.innerText = cat;
    btn.onclick = () => {
      state.activeCategory = cat;
      renderTabs();
      renderContent();
    };
    scrollArea.appendChild(btn);
  });
  container.innerHTML = '';
  container.appendChild(scrollArea);
}

function renderContent() {
  const container = document.getElementById('content-root');
  if (!container) return;
  let html = '';
  state.songs.forEach(song => {
    const displayCost = getSongCost(song);
    html += getSongCardHtml({ ...song, coinCost: displayCost }, state.expandedSongId === song.id);
  });
  container.innerHTML = html;
}

function renderNav() {
  const container = document.getElementById('nav-root');
  if (!container) return;
  container.innerHTML = `
    <div class="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-black via-[#0c051d] to-transparent pointer-events-none z-50">
      <div class="absolute bottom-6 left-0 w-full flex justify-around items-end px-4 pointer-events-auto">
        <div class="relative cursor-pointer group">
          <div class="absolute inset-x-[-15px] top-[-20px] bottom-[-5px] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl shadow-2xl opacity-80 group-hover:scale-105 transition-transform"></div>
          <div class="relative bg-gradient-to-b from-[#ff4081] to-[#e91e63] w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 border-white/40 shadow-inner">
             <div class="flex gap-1.5 mb-0.5">
               <div class="w-2.5 h-6 bg-white rounded-sm opacity-90 shadow-[0_0_5px_white]"></div>
               <div class="w-2.5 h-6 bg-white rounded-sm opacity-90 shadow-[0_0_5px_white]"></div>
               <div class="w-2.5 h-6 bg-cyan-300 rounded-sm shadow-[0_0_10px_cyan]"></div>
             </div>
             <span class="text-white text-[10px] font-black italic tracking-wider uppercase">HOME</span>
          </div>
        </div>
        ${['Library', 'Playlist', 'Rank', 'Shop'].map((label) => `
          <div class="mb-2 opacity-60 hover:opacity-100 transition-all cursor-pointer flex flex-col items-center transform hover:scale-110">
             <div class="w-12 h-12 bg-[#2d1b5e]/80 rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md">
                <div class="w-8 h-8 rounded-xl bg-[#4a2d8a]/50 flex items-center justify-center text-purple-200 text-xs font-black uppercase">
                   ${label[0]}
                </div>
             </div>
             <span class="text-[8px] font-black text-purple-300 mt-1 uppercase">${label}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderDebug() {
  const container = document.getElementById('debug-root');
  if (!container) return;
  
  if (!state.debugMode) {
    container.innerHTML = `
      <div class="absolute top-4 left-4 pointer-events-auto">
        <button onclick="window.toggleDebug()" class="bg-black/60 border border-cyan-500/50 text-cyan-400 text-[8px] font-black px-2 py-1 rounded hover:bg-cyan-500/20 transition-all">DEBUG</button>
      </div>
    `;
    return;
  }

  const cheatBtnClass = "bg-gradient-to-b from-cyan-400 to-blue-500 text-white font-black italic text-[9px] px-3 py-2 rounded-xl border-b-2 border-blue-900 active:border-b-0 active:translate-y-[1px] transition-all shadow-md uppercase text-center";

  container.innerHTML = `
    <div class="pointer-events-auto w-full h-[98vh] bg-[#0c051d] border-b border-white/20 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4">
      <!-- Close Trigger -->
      <div class="flex justify-end shrink-0">
        <button onclick="window.toggleDebug()" class="bg-red-500 text-white font-black px-3 py-1 rounded text-[10px]">CLOSE</button>
      </div>

      <!-- Stats Panel -->
      <div class="bg-white/5 rounded-lg border border-white/10 p-3 flex flex-col gap-1 text-[10px] font-black italic text-cyan-400">
         <p>Total play count: ${state.stats.totalPlayCount}</p>
         <p>Total XP gained: ${state.stats.totalXpGained.toLocaleString()}</p>
         <p>Total Coin gained: ${state.stats.totalCoinGained.toLocaleString()}</p>
         <p>Total Coin spent: ${state.stats.totalCoinSpent.toLocaleString()}</p>
      </div>

      <!-- Cheat Buttons -->
      <div class="grid grid-cols-2 gap-2 shrink-0">
        <button onclick="window.add1000Xp()" class="${cheatBtnClass}">Add 1000 XP</button>
        <button onclick="window.add1000Coins()" class="${cheatBtnClass}">Add 1000 Coins</button>
        <button onclick="window.unlockAllSongs()" class="${cheatBtnClass}">Unlock All Songs</button>
        <button onclick="window.lockAllSongs()" class="${cheatBtnClass}">Lock All Songs</button>
        <button onclick="window.resetToLevel1()" class="col-span-2 ${cheatBtnClass}">Reset XP Level</button>
      </div>

      <!-- Dynamic Pricing Config -->
      <div class="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
        <div class="flex justify-between items-center mb-1">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">Dynamic Pricing</h3>
          <button onclick="window.toggleDynamicCost()" class="px-3 py-1 rounded text-[8px] font-black ${state.dynamicSongCostEnabled ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'}">
            ${state.dynamicSongCostEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
        ${state.dynamicSongCostEnabled ? `
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="debug-label">Initial Cost</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.initialCoinCost}" oninput="window.updateDynamicParam('initialCoinCost', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Incr / Step</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.coinCostIncreasePerStep}" oninput="window.updateDynamicParam('coinCostIncreasePerStep', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Purchases / Step</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.songPurchasesPerStep}" oninput="window.updateDynamicParam('songPurchasesPerStep', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Max Cost</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.maxCoinCost}" oninput="window.updateDynamicParam('maxCoinCost', this.value)" class="debug-input" />
            </div>
          </div>
          <p class="text-green-400 text-[8px] font-black italic mt-1 uppercase">Current price: ${getCurrentDynamicCost()} | Step: ${Math.floor(state.purchasedSongCount / DYNAMIC_SONG_CONFIG.songPurchasesPerStep)}</p>
        ` : ''}
      </div>

      <!-- Play Config -->
      <div class="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col">
        <div class="flex justify-between items-center mb-1 shrink-0">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">Play Config (Rewards)</h3>
          <button onclick="window.toggleDebugSection('play')" class="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">CONFIG</button>
        </div>
        ${state.debugSections.play ? `
          <div class="grid grid-cols-2 gap-2 mt-2">
            <div>
              <p class="debug-label">Min XP</p>
              <input type="number" value="${state.gameConfig.minXp}" oninput="window.updateBalancing('minXp', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Max XP</p>
              <input type="number" value="${state.gameConfig.maxXp}" oninput="window.updateBalancing('maxXp', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Min Coin</p>
              <input type="number" value="${state.gameConfig.minCoins}" oninput="window.updateBalancing('minCoins', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Max Coin</p>
              <input type="number" value="${state.gameConfig.maxCoins}" oninput="window.updateBalancing('maxCoins', this.value)" class="debug-input" />
            </div>
          </div>
        ` : ''}
      </div>

      <!-- XP Level Config -->
      <div class="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col flex-1 overflow-hidden">
        <div class="flex justify-between items-center mb-1 shrink-0">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">XP Level Config</h3>
          <button onclick="window.toggleDebugSection('xp')" class="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">CONFIG</button>
        </div>
        ${state.debugSections.xp ? `
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 overflow-y-auto no-scrollbar pr-1 mt-2">
            ${LEVEL_BALANCING.map((xp, i) => `
              <div class="flex items-center justify-between gap-2">
                <span class="text-white/40 font-black text-[8px] w-6 shrink-0">LV.${i+1}</span>
                <input type="number" value="${xp}" oninput="window.updateLevelXp(${i}, this.value)" class="debug-input text-right" />
              </div>
            `).join('')}
          </div>
        ` : '<div class="flex-1"></div>'}
      </div>
    </div>
  `;
}

function init() {
  renderHeader();
  renderTabs();
  renderContent();
  renderNav();
  renderDebug();
}
document.addEventListener('DOMContentLoaded', init);
