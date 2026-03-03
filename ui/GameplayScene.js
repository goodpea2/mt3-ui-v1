
import { playSongCardNewDifficultyUnlockedVFX } from '../vfx/SongCardNewDifficultyUnlocked.js';

const DIFFICULTY_MAP = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Expert",
  5: "Extreme",
  6: "Hell"
};

const THEMES = {
  blue: "from-[#00d2ff] to-[#3a7bd5]",
  gold: "from-[#f6d365] to-[#fda085]",
  red: "from-[#ff0844] to-[#ffb199]"
};

export function showGameplayScene(song, initialDiffIdx = 0, onFinish) {
  const app = document.getElementById('app');
  if (!app) return;

  let currentDiffIdx = initialDiffIdx;
  const levels = Array.isArray(song.level) ? song.level : [song.level];
  const isLockedArray = Array.isArray(song.isLocked) ? song.isLocked : [song.isLocked];

  const container = document.createElement('div');
  container.id = 'gameplay-scene';
  
  const getTheme = (level) => {
    if (level >= 5) return THEMES.red;
    if (level >= 3) return THEMES.gold;
    return THEMES.blue;
  };

  const updateTheme = () => {
    const level = levels[currentDiffIdx];
    const themeClass = getTheme(level);
    container.className = `absolute inset-0 z-[200] bg-gradient-to-br ${themeClass} flex flex-col overflow-hidden animate-in fade-in duration-300`;
  };

  updateTheme();
  
  // Background patterns
  const bgDecor = `
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Large Star Background -->
      <div class="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
        <svg class="w-[900px] h-[900px] text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
      <!-- Additional Glows -->
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"></div>
      <div class="absolute inset-0 halftone-bg opacity-10"></div>
    </div>
  `;

  const renderStartingUI = (showNewUnlockVFX = false) => {
    const level = levels[currentDiffIdx];
    const difficultyName = DIFFICULTY_MAP[level];
    const isLocked = isLockedArray[currentDiffIdx];
    
    let bannerColor = "from-[#00c6ff] to-[#0072ff]";
    let diffTextColor = "text-[#00c6ff]";
    if (level >= 3 && level <= 4) {
      bannerColor = "from-[#f6d365] to-[#fda085]";
      diffTextColor = "text-[#f6d365]";
    } else if (level >= 5) {
      bannerColor = "from-[#ff0844] to-[#ffb199]";
      diffTextColor = "text-[#ff0844]";
    }

    container.innerHTML = `
      ${bgDecor}
      <div class="relative flex-1 flex flex-col pt-12">
        <!-- Top Banner -->
        <div class="relative w-full h-40 flex items-center">
          <!-- Slanted Background -->
          <div class="absolute inset-x-[-20px] h-32 bg-gradient-to-r ${bannerColor} -rotate-2 border-y-4 border-white/40 shadow-[0_0_40px_rgba(0,0,0,0.2)] transition-all duration-500"></div>
          
          <div class="relative flex items-center gap-4 w-full px-6">
            <!-- Circular Cover -->
            <div class="relative shrink-0">
              <div class="w-28 h-28 rounded-full border-4 border-white overflow-hidden shadow-2xl ring-8 ring-white/20">
                <img src="${song.coverUrl}" class="w-full h-full object-cover" />
              </div>
              <!-- Sparkles -->
              <div class="absolute -top-3 -right-3 text-white animate-pulse">
                <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>
              </div>
            </div>

            <div class="flex flex-col">
              <h2 class="text-white font-black text-3xl uppercase italic tracking-tighter drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]">${song.title}</h2>
              <p class="text-white/90 font-bold text-base italic drop-shadow-sm">${song.artist}</p>
              
              <div class="mt-2 bg-white/30 backdrop-blur-md rounded-xl p-2 border border-white/30 flex flex-col items-center shadow-lg">
                <div class="flex gap-1">
                  <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                  <svg class="w-7 h-7 text-black/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                </div>
                <span class="text-white font-black text-2xl italic tracking-tighter mt-1 drop-shadow-md">12,562</span>
              </div>
            </div>
          </div>

          <!-- Difficulty Tag -->
          <div class="absolute right-0 top-24 flex flex-col items-end">
            <div class="bg-white px-6 py-2 rounded-l-full shadow-xl border-y-2 border-l-2 border-white/50">
               <span class="${diffTextColor} font-black italic uppercase text-lg tracking-tight transition-colors duration-500">${difficultyName}</span>
            </div>
          </div>
        </div>

        <!-- Gameplay Area (Canvas + Start Button) -->
        <div class="flex-1 relative flex items-end justify-center pb-24 px-4 gap-3">
          <!-- Start Button Overlay -->
          <div class="relative z-10 w-full flex items-center justify-center gap-4">
            <button id="prev-diff-btn" class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white active:scale-90 transition-all ${currentDiffIdx === 0 ? 'opacity-20 pointer-events-none' : ''}">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
            </button>

            <button id="start-game-btn" class="flex-1 max-w-[180px] h-72 bg-[#1e293b] rounded-3xl border-4 border-white/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center group active:scale-95 transition-all ${isLocked ? 'grayscale opacity-50' : ''}">
              <span class="text-white font-black text-3xl uppercase tracking-tighter group-hover:scale-110 transition-transform">${isLocked ? 'LOCKED' : 'START'}</span>
              ${isLocked ? '<svg class="w-8 h-8 text-white mt-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>' : ''}
            </button>

            <button id="next-diff-btn" class="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-white active:scale-90 transition-all ${currentDiffIdx === levels.length - 1 ? 'opacity-20 pointer-events-none' : ''}">
              <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
            </button>
          </div>
        </div>

        <!-- Bottom Song Bar -->
        <div class="h-28 flex gap-3 px-4 overflow-hidden opacity-60 mb-4">
           ${Array.from({length: 5}).map((_, i) => `
             <div class="w-24 h-24 rounded-2xl overflow-hidden border-2 border-white/30 shrink-0 shadow-lg">
               <img src="https://picsum.photos/seed/song${i}/150/150" class="w-full h-full object-cover" />
             </div>
           `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#prev-diff-btn').onclick = () => {
      if (currentDiffIdx > 0) {
        currentDiffIdx--;
        updateTheme();
        renderStartingUI();
      }
    };

    container.querySelector('#next-diff-btn').onclick = () => {
      if (currentDiffIdx < levels.length - 1) {
        currentDiffIdx++;
        updateTheme();
        renderStartingUI();
      }
    };

    const startBtn = container.querySelector('#start-game-btn');
    startBtn.onclick = () => {
      if (!isLocked) renderEndingUI();
    };

    if (showNewUnlockVFX) {
      playSongCardNewDifficultyUnlockedVFX(startBtn);
    }
  };

  const renderEndingUI = () => {
    const uiOverlay = document.createElement('div');
    uiOverlay.className = "absolute inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300";
    
    const nextDiffIdx = currentDiffIdx + 1;
    const hasNextDiff = nextDiffIdx < levels.length;
    const nextDiffName = hasNextDiff ? DIFFICULTY_MAP[levels[nextDiffIdx]] : null;

    uiOverlay.innerHTML = `
      <div class="bg-white/10 backdrop-blur-2xl border-2 border-white/20 rounded-[40px] p-10 flex flex-col items-center gap-8 shadow-[0_0_80px_rgba(0,0,0,0.4)] w-full max-w-sm">
        <div class="relative">
          <div class="absolute inset-0 bg-cyan-400 blur-3xl opacity-30 animate-pulse"></div>
          <h1 class="text-4xl font-black text-white italic uppercase tracking-tighter relative drop-shadow-2xl">Song Finished</h1>
        </div>
        
        <div class="flex flex-col items-center gap-2">
          <p class="text-blue-200 font-black text-lg uppercase tracking-[0.2em]">Excellent!</p>
          <div class="flex gap-2">
            <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <svg class="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          </div>
        </div>

        ${hasNextDiff ? `
          <div class="w-full bg-white/5 rounded-3xl p-4 border border-white/10 flex flex-col items-center gap-3">
            <p class="text-white/60 font-bold text-[10px] uppercase tracking-widest">Next Challenge Unlocked!</p>
            <div class="flex items-center justify-between w-full px-2">
              <span class="text-cyan-400 font-black italic uppercase text-lg">${nextDiffName}</span>
              <button id="go-next-btn" class="bg-cyan-400 hover:bg-cyan-300 text-blue-900 font-black italic px-6 py-2 rounded-xl active:scale-95 transition-all shadow-lg text-sm">
                GO
              </button>
            </div>
          </div>
        ` : ''}

        <button id="return-home-btn" class="w-full bg-white/10 hover:bg-white/20 text-white font-black italic py-4 rounded-3xl border border-white/20 active:translate-y-[2px] transition-all shadow-xl text-lg uppercase tracking-widest">
          Return
        </button>
      </div>
    `;

    container.appendChild(uiOverlay);

    if (hasNextDiff) {
      uiOverlay.querySelector('#go-next-btn').onclick = () => {
        currentDiffIdx = nextDiffIdx;
        // Unlock it in the data (index.js handles the actual state, but we can update local copy for UI)
        isLockedArray[currentDiffIdx] = false;
        uiOverlay.remove();
        updateTheme();
        renderStartingUI(true);
      };
    }

    uiOverlay.querySelector('#return-home-btn').onclick = () => {
      container.classList.add('animate-out', 'fade-out', 'duration-300');
      setTimeout(() => {
        container.remove();
        if (onFinish) onFinish(currentDiffIdx);
      }, 300);
    };
  };

  renderStartingUI();
  app.appendChild(container);

  // Initialize Canvas for lanes
  const canvas = document.createElement('canvas');
  canvas.className = "absolute inset-0 pointer-events-none";
  container.insertBefore(canvas, container.firstChild);

  const resizeCanvas = () => {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    drawLanes();
  };

  const drawLanes = () => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const laneCount = 4;
    const padding = 16;
    const gap = 12;
    const availableWidth = canvas.width - (padding * 2);
    const laneWidth = (availableWidth - (gap * (laneCount - 1))) / laneCount;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;

    for (let i = 0; i < laneCount; i++) {
      const x = padding + i * (laneWidth + gap);
      const y = 180; // Start below banner
      const h = canvas.height - y - 140; // End above bottom bar
      
      // Draw lane background with rounded corners
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, y, laneWidth, h, 24);
      } else {
        ctx.rect(x, y, laneWidth, h);
      }
      ctx.fill();
      ctx.stroke();

      const gradient = ctx.createLinearGradient(x, y, x, y + h);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  };

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 0);
}
