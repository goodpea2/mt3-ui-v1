
// --- Constants & Mock Data ---
const CATEGORIES = [
  'HOME', 'YOUR SONG', 'VIETNAM', 'KPOP', 'CLASSIC', 'ANIME', 'TIKTOK', 'WHATEVER'
];

const MOCK_USER = {
  name: 'YourName',
  level: 20,
  stamina: 275,
  maxStamina: 400,
  currency: 2345
};

const MOCK_SONGS = [
  {
    id: '1',
    title: 'Neon Nights',
    artist: 'Future Flux',
    difficulty: 'Easy',
    level: 1,
    score: 17890,
    playCount: '15K',
    coverUrl: 'https://picsum.photos/seed/music1/400/400',
    starType: 'blue',
    isFree: true
  },
  {
    id: '2',
    title: 'Sorry Im Here For Someone Else',
    artist: 'Digital Dreamer',
    difficulty: 'Normal',
    level: 3,
    playCount: '22K',
    coverUrl: 'https://picsum.photos/seed/music2/400/400',
    starType: 'none',
    isFree: true
  },
  {
    id: '3',
    title: 'Cyber Pulse',
    artist: 'Synth Wave',
    difficulty: 'Hard',
    level: 5,
    playCount: '8K',
    coverUrl: 'https://picsum.photos/seed/music3/400/400',
    starType: 'none',
    isFree: false
  },
  {
    id: '4',
    title: 'Star Fall',
    artist: 'Galactic Soul',
    difficulty: 'Normal',
    level: 2,
    playCount: '45K',
    coverUrl: 'https://picsum.photos/seed/music4/400/400',
    starType: 'crown',
    isDeluxe: true,
    price: 1000
  },
  {
    id: '5',
    title: 'Retro Beat',
    artist: 'Vintage Echo',
    difficulty: 'Normal',
    level: 4,
    playCount: '12K',
    coverUrl: 'https://picsum.photos/seed/music5/400/400',
    starType: 'yellow',
    price: 5000
  }
];

// --- State ---
let state = {
  activeCategory: 'HOME',
  user: MOCK_USER,
  songs: MOCK_SONGS
};

// --- Rendering Functions ---

function renderHeader() {
  const staminaPct = (state.user.stamina / state.user.maxStamina) * 100;
  const container = document.getElementById('header-root');
  container.innerHTML = `
    <div class="px-4 py-4 flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <div class="relative">
          <div class="w-16 h-16 rounded-3xl bg-gradient-to-br from-purple-400 to-purple-800 border-2 border-white/20 p-1 overflow-hidden">
            <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" class="w-full h-full object-cover rounded-2xl" />
          </div>
          <div class="absolute -bottom-1 -right-1 bg-gradient-to-b from-[#4ade80] to-[#22c55e] border-2 border-[#1a0b3d] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg shadow-md">
            ${state.user.level}
          </div>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-white font-bold text-sm ml-1">${state.user.name}</span>
          <div class="relative w-40 h-6 bg-[#1a0b3d] border border-white/10 rounded-full overflow-hidden flex items-center">
             <div class="absolute h-full left-0 top-0 bg-gradient-to-r from-[#6366f1] to-[#a855f7]" style="width: ${staminaPct}%"></div>
             <div class="relative w-full text-center text-[10px] font-bold flex items-center justify-center gap-1 z-10">
               <svg class="w-3 h-3 text-cyan-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
               <span class="text-white">${state.user.stamina} / ${state.user.maxStamina}</span>
             </div>
          </div>
        </div>
      </div>
      <div class="bg-[#1a0b3d] border-2 border-[#4a2d8a] rounded-2xl px-3 py-2 flex items-center gap-2 shadow-inner">
        <div class="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg">
          <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" /></svg>
        </div>
        <span class="text-white font-extrabold text-lg italic">${state.user.currency.toLocaleString()}</span>
      </div>
    </div>
  `;
}

function renderTabs() {
  const container = document.getElementById('tabs-root');
  container.className = "w-full bg-[#130829] py-1 border-y border-white/5";
  
  const scrollArea = document.createElement('div');
  scrollArea.className = "flex overflow-x-auto px-4 no-scrollbar gap-4 items-center h-12";
  
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `whitespace-nowrap text-xs font-bold tracking-wider px-4 py-2 rounded-lg transition-all duration-200 ${
      state.activeCategory === cat 
        ? 'bg-[#3b2175] text-[#ff00ff] border border-[#ff00ff30] shadow-[0_0_10px_rgba(255,0,255,0.1)]' 
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

function getSongCardHtml(song, isFeatured = false) {
  if (isFeatured) {
    return `
      <div class="relative w-full h-44 bg-gradient-to-r from-[#2d1b5e] to-[#4a2d8a] rounded-[2rem] overflow-hidden p-1 shadow-2xl group">
        <div class="absolute inset-0 halftone-bg opacity-30"></div>
        <div class="relative h-full w-full bg-[#1a0b3d]/40 rounded-[1.8rem] flex items-center p-3 gap-4 border border-white/10">
          <div class="relative w-32 h-32 flex-shrink-0">
             <div class="absolute inset-0 bg-gradient-to-br from-pink-500 to-cyan-500 rounded-full blur-sm opacity-50"></div>
             <img src="${song.coverUrl}" class="w-full h-full object-cover rounded-full border-2 border-white/30 relative z-10" />
          </div>
          <div class="flex-1 flex flex-col justify-between py-1 overflow-hidden">
            <div>
              <h3 class="text-white font-black text-xl leading-tight truncate">${song.title}</h3>
              <p class="text-purple-300 text-xs font-semibold truncate opacity-80">${song.artist}</p>
              <div class="mt-2 flex items-center gap-2">
                <span class="bg-[#0ea5e9] text-white text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1">
                  <span class="w-3 h-3 bg-white rounded-full text-[#0ea5e9] flex items-center justify-center text-[8px]">1</span> Easy
                </span>
              </div>
            </div>
            <div class="flex items-end justify-between pr-2">
              <span class="text-[#00ffff] font-black text-2xl italic tracking-tighter">${song.score?.toLocaleString() || 0}</span>
              <div class="flex gap-1">
                ${[1, 2, 3].map(() => `<svg class="w-6 h-6 text-[#94a3b8]/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  const starColor = song.starType === 'crown' ? 'text-pink-400' : song.starType === 'yellow' ? 'text-yellow-400' : 'text-gray-700';

  return `
    <div class="relative w-full h-24 bg-[#1a0b3d] rounded-2xl overflow-hidden flex items-center p-2 gap-3 border border-white/5 transition-transform active:scale-95">
      <div class="w-20 h-20 flex-shrink-0 relative">
        <img src="${song.coverUrl}" class="w-full h-full object-cover rounded-xl border border-white/10" />
      </div>
      <div class="flex-1 flex flex-col justify-between py-1 overflow-hidden">
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-white font-bold text-sm truncate">${song.title}</h4>
            ${song.isDeluxe ? '<span class="bg-gradient-to-r from-[#e91e63] to-[#ff4081] text-white text-[6px] font-black px-1.5 py-0.5 rounded italic">DELUXE</span>' : ''}
          </div>
          <p class="text-gray-400 text-[10px] font-medium truncate">${song.artist}</p>
          <div class="flex items-center gap-2 mt-1">
            <div class="flex items-center gap-0.5">
               <span class="text-white text-[10px] font-bold mr-1">Lv.</span>
               <div class="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white ${song.level >= 5 ? 'bg-pink-600' : 'bg-yellow-500'}">
                 ${song.level}
               </div>
            </div>
            <div class="flex items-center gap-1 text-[#4ade80] text-[10px] font-bold">
               <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
               ${song.playCount}
            </div>
          </div>
        </div>
      </div>
      <div class="flex flex-col items-end gap-1.5 pr-1">
        <div class="flex gap-0.5">
          ${[1, 2, 3].map(() => `<svg class="w-6 h-6 ${starColor}" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`).join('')}
        </div>
        ${song.price ? `
          <div class="flex gap-1">
             <div class="bg-[#1a0b3d] border border-[#4a2d8a] rounded-lg px-2 py-1 flex items-center gap-1">
                <div class="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center text-[8px]">♫</div>
                <span class="text-white text-[10px] font-bold">${song.price.toLocaleString()}</span>
             </div>
          </div>
        ` : `
          <button class="bg-gradient-to-b from-[#ff00ff] to-[#d400d4] text-white font-black italic text-xs px-4 py-1.5 rounded-lg border-2 border-white/30 btn-play-shadow">
            PLAY
          </button>
        `}
      </div>
    </div>
  `;
}

function renderContent() {
  const container = document.getElementById('content-root');
  let html = `
    <div class="mb-6">
      ${getSongCardHtml(state.songs[0], true)}
    </div>
    <div class="flex justify-end pr-2 -mb-2">
      <div class="bg-[#e91e63] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-2 transform skew-x-[-15deg] shadow-lg">
        <span class="transform skew-x-[15deg]">Daily free song - 12h16m</span>
      </div>
    </div>
  `;

  state.songs.slice(1).forEach(song => {
    html += getSongCardHtml(song);
  });

  // Adding some dummy repeats for scroll test
  state.songs.slice(1).forEach((song, i) => {
    html += getSongCardHtml({...song, id: `extra-${i}`});
  });

  container.innerHTML = html;
}

function renderNav() {
  const container = document.getElementById('nav-root');
  container.innerHTML = `
    <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black via-[#130829] to-transparent pointer-events-none">
      <div class="absolute bottom-4 left-0 w-full flex justify-around items-end px-4 pointer-events-auto">
        <div class="relative cursor-pointer">
          <div class="absolute inset-x-[-10px] top-[-15px] bottom-[-5px] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-2xl shadow-xl"></div>
          <div class="relative bg-gradient-to-b from-[#ff4081] to-[#e91e63] w-16 h-16 rounded-xl flex flex-col items-center justify-center border-2 border-white/40 shadow-inner">
             <div class="flex gap-1.5 mb-0.5">
               <div class="w-2.5 h-6 bg-white rounded-sm opacity-90"></div>
               <div class="w-2.5 h-6 bg-white rounded-sm opacity-90"></div>
               <div class="w-2.5 h-6 bg-cyan-300 rounded-sm shadow-[0_0_5px_cyan]"></div>
             </div>
             <span class="text-white text-[10px] font-black italic mt-1">HOME</span>
          </div>
        </div>
        ${['Library', 'Playlist', 'Rank', 'Shop'].map((label) => `
          <div class="mb-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex flex-col items-center">
             <div class="w-12 h-12 bg-[#2d1b5e]/80 rounded-xl flex items-center justify-center border border-white/10 shadow-lg">
                <div class="w-8 h-8 rounded-lg bg-[#4a2d8a]/50 flex items-center justify-center text-purple-300 text-xs font-bold">
                   ${label[0]}
                </div>
             </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// --- Init ---
function init() {
  renderHeader();
  renderTabs();
  renderContent();
  renderNav();
}

document.addEventListener('DOMContentLoaded', init);
