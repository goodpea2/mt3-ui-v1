
import { FIGURES_DATA, SET_FIGURES_DATA } from '../figures.js';

export function renderFigureCollection(state) {
  const container = document.getElementById('content-root');
  if (!container) return;

  // Header for Figure Collection
  const headerHtml = `
    <div class="w-full flex justify-between items-center px-4 py-2 bg-black/20 backdrop-blur-md border-b border-white/10 mb-4">
      <h2 class="text-white font-black italic uppercase text-lg tracking-tighter">Figure Collection</h2>
      <div class="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-pink-500/30 shadow-[0_0_10px_rgba(236,72,153,0.2)]">
        <div class="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center border border-white/20">
          <span class="text-white font-black text-[8px]">D</span>
        </div>
        <span id="deco-coin-counter" class="text-pink-400 font-black text-xs">${state.decoCoins}</span>
      </div>
    </div>
  `;

  let setsHtml = '';
  SET_FIGURES_DATA.forEach(set => {
    const setFigures = set.figures.map(id => FIGURES_DATA.find(f => f.id === id));
    const isSetComplete = set.figures.every(id => state.unlockedFigures.has(id));
    const isRewardCollected = state.collectedSetRewards.has(set.id);

    const figuresHtml = setFigures.map(fig => {
      const isUnlocked = state.unlockedFigures.has(fig.id);
      const isNew = state.newlyUnlockedFigures.has(fig.id);
      
      return `
        <div 
          onclick="window.focusFigure(${fig.id})"
          class="relative group cursor-pointer transition-all duration-300 hover:scale-105"
        >
          <div class="w-16 h-20 bg-black/40 rounded-lg border border-white/10 flex flex-col items-center justify-end p-1 relative overflow-hidden">
            <!-- Spotlight effect -->
            <div class="absolute top-0 inset-x-0 h-8 bg-gradient-to-b from-white/10 to-transparent"></div>
            
            ${isUnlocked ? `
              <img src="${fig.img}" class="w-12 h-12 object-contain drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]" />
            ` : `
              <div class="w-12 h-12 flex items-center justify-center opacity-20 grayscale">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
              </div>
            `}
            
            <div class="w-full h-1 bg-white/20 rounded-full mt-1"></div>
          </div>
          
          ${isNew ? `
            <div class="absolute -top-1 -right-1 bg-red-500 text-white text-[6px] font-black px-1 rounded animate-bounce">NEW</div>
          ` : ''}
        </div>
      `;
    }).join('');

    setsHtml += `
      <div class="mb-8 relative px-4">
        <div class="flex justify-between items-end mb-2">
          <h3 class="text-white/60 font-black italic uppercase text-[10px] tracking-widest">${set.setName}</h3>
          <span class="text-white/30 text-[8px] font-bold">${set.figures.filter(id => state.unlockedFigures.has(id)).length}/${set.figures.length}</span>
        </div>
        
        <!-- Shelf/Display Case -->
        <div class="relative bg-gradient-to-b from-white/5 to-transparent p-4 rounded-2xl border border-white/10 shadow-inner flex gap-3 overflow-x-auto no-scrollbar">
          ${figuresHtml}
          
          ${isSetComplete && !isRewardCollected ? `
            <div 
              onclick="event.stopPropagation(); window.collectSetReward(${set.id})"
              class="absolute inset-0 bg-pink-500/20 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center cursor-pointer group animate-in fade-in zoom-in duration-300"
            >
              <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.5)] flex items-center justify-center animate-bounce group-hover:scale-110 transition-transform">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.41 12.25 12 8.66l3.59 3.59L17 10.83 14.92 8H20v6z"/></svg>
              </div>
              <span class="text-white font-black text-[10px] uppercase mt-2 drop-shadow-md">Collect Reward!</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div class="flex-1 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in duration-300 pb-20">
      ${headerHtml}
      ${setsHtml}
    </div>
  `;

  // Clear "new" indicators when viewing
  if (state.newlyUnlockedFigures.size > 0) {
    setTimeout(() => {
      state.newlyUnlockedFigures.clear();
    }, 2000);
  }
}

export function showFigureFocus(figureId, state) {
  const figure = FIGURES_DATA.find(f => f.id === figureId);
  if (!figure) return;

  const isUnlocked = state.unlockedFigures.has(figureId);
  const overlay = document.createElement('div');
  overlay.id = 'figure-focus-overlay';
  overlay.className = "fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300";
  
  overlay.innerHTML = `
    <div class="bg-gradient-to-br from-gray-900 to-black w-full max-w-sm rounded-[40px] border-2 border-white/20 overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in duration-300">
      <div class="relative h-64 flex items-center justify-center bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]">
        <!-- Spotlight -->
        <div class="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-white/10 to-transparent"></div>
        
        ${isUnlocked ? `
          <img src="${figure.img}" class="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]" />
        ` : `
          <div class="w-48 h-48 flex items-center justify-center opacity-10 grayscale">
            <svg class="w-32 h-32 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
          </div>
        `}
        
        <button onclick="document.getElementById('figure-focus-overlay').remove()" class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      
      <div class="p-8 flex flex-col items-center text-center">
        <h3 class="text-white font-black text-2xl uppercase italic tracking-tighter mb-4">Figure #${figure.id}</h3>
        <p class="text-white/60 text-sm leading-relaxed mb-8">
          ${isUnlocked ? figure.description : 'Play to unlock more figures'}
        </p>
        
        ${!isUnlocked ? `
          <button 
            onclick="window.unlockFigure(${figure.id})"
            class="w-full bg-gradient-to-b from-pink-500 to-purple-600 text-white font-black italic py-4 rounded-2xl border-b-4 border-purple-900 active:border-b-0 active:translate-y-[2px] transition-all shadow-lg flex items-center justify-center gap-3"
          >
            <div class="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <span class="text-[10px]">D</span>
            </div>
            <span>UNLOCK FOR ${figure.decoCoinCost}</span>
          </button>
        ` : `
          <div class="bg-green-500/20 text-green-400 font-black italic px-8 py-3 rounded-full border border-green-500/30 uppercase tracking-widest text-xs">
            Unlocked
          </div>
        `}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
}
