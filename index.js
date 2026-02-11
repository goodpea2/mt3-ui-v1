
import { getSongCardHtml } from './SongCard.js';
import { MOCK_SONGS } from './songs.js';
import { getXpRequired } from './balance.js';

// --- Constants ---
const CATEGORIES = [
  'HOME', 'YOUR SONG', 'VIETNAM', 'KPOP', 'CLASSIC', 'ANIME', 'TIKTOK', 'WHATEVER'
];

// --- Simulation State ---
const state = {
  activeCategory: 'HOME',
  user: {
    name: 'Player One',
    level: 1,
    xp: 0,
    coins: 100,
    stamina: 275,
    maxStamina: 400,
  },
  songs: MOCK_SONGS,
  expandedSongId: 'song-0'
};

window.toggleExpand = (id) => {
  if (state.expandedSongId !== id) {
    state.expandedSongId = id;
    renderContent();
  }
};

window.playSong = (id) => {
  const song = state.songs.find(s => s.id === id);
  if (!song) return;

  const xpGained = Math.floor(Math.random() * 101) + 150; 
  const coinsGained = Math.floor(Math.random() * 31) + 50; 
  const starGained = Math.floor(Math.random() * 2) + 2;   

  // Get coords for animation
  const btn = document.getElementById(`play-btn-${id}`);
  const targetXp = document.getElementById('xp-target');
  const targetCoins = document.getElementById('coins-target');
  
  if (btn && targetXp && targetCoins) {
    const startRect = btn.getBoundingClientRect();
    const xpRect = targetXp.getBoundingClientRect();
    const coinRect = targetCoins.getBoundingClientRect();

    spawnParticles(startRect, xpRect, 'cyan', 5);
    spawnParticles(startRect, coinRect, 'gold', 5);
  }

  // Update song
  song.starLevel = Math.min(6, song.starLevel + starGained);
  song.score += Math.floor(Math.random() * 500) + 500;
  
  // Update user with delay to match particles
  setTimeout(() => {
    state.user.xp += xpGained;
    state.user.coins += coinsGained;

    // Handle Level Up
    while (state.user.xp >= getXpRequired(state.user.level)) {
      state.user.xp -= getXpRequired(state.user.level);
      state.user.level += 1;
      showPopup(`LEVEL UP! LV.${state.user.level}`, "text-yellow-400 font-black text-4xl");
    }

    renderHeader();
    renderContent();
  }, 700);
};

function spawnParticles(start, end, color, count) {
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = Math.random() * 10 + 5;
    p.className = 'particle';
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.borderRadius = '50%';
    p.style.backgroundColor = color === 'cyan' ? '#22d3ee' : '#fbbf24';
    p.style.boxShadow = `0 0 8px ${p.style.backgroundColor}`;
    p.style.left = `${start.left + start.width / 2}px`;
    p.style.top = `${start.top + start.height / 2}px`;
    
    const tx = end.left - start.left + (Math.random() * 20 - 10);
    const ty = end.top - start.top + (Math.random() * 20 - 10);
    
    p.style.setProperty('--tx', `${tx}px`);
    p.style.setProperty('--ty', `${ty}px`);
    
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 800);
  }
}

function showPopup(text, classes) {
  const layer = document.getElementById('popup-layer');
  const popup = document.createElement('div');
  popup.className = `reward-popup absolute flex flex-col items-center justify-center pointer-events-none ${classes} z-[100]`;
  popup.innerText = text;
  layer.appendChild(popup);
  setTimeout(() => popup.remove(), 1000);
}

function renderHeader() {
  const staminaPct = (state.user.stamina / state.user.maxStamina) * 100;
  const reqXp = getXpRequired(state.user.level);
  const xpPct = (state.user.xp / reqXp) * 100;
  
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
            LV.${state.user.level}
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-white font-black text-sm ml-1">${state.user.name}</span>
          <div id="xp-target" class="relative w-40 h-4 bg-[#1a0b3d] border border-white/10 rounded-full overflow-hidden flex items-center shadow-inner">
             <div class="absolute h-full left-0 top-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500" style="width: ${xpPct}%"></div>
             <div class="relative w-full text-center text-[8px] font-black text-white/80 z-10 uppercase tracking-widest">
               XP ${Math.floor(state.user.xp)} / ${reqXp}
             </div>
          </div>
        </div>
      </div>
      <div id="coins-target" class="bg-[#1a0b3d] border-2 border-[#4a2d8a] rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-inner">
        <div class="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg">
           <span class="text-white font-black text-[10px]">$</span>
        </div>
        <span class="text-white font-extrabold text-lg italic tracking-tighter">${state.user.coins.toLocaleString()}</span>
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
    html += getSongCardHtml(song, state.expandedSongId === song.id);
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

function init() {
  renderHeader();
  renderTabs();
  renderContent();
  renderNav();
}
document.addEventListener('DOMContentLoaded', init);
