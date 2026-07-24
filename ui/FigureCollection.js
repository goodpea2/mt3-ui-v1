import { FIGURES_DATA, SET_FIGURES_DATA } from '../figures.js';
import { PET_BALANCING } from '../balance.js';

export function renderFigureCollection(state) {
  const container = document.getElementById('content-root');
  if (!container) return;

  // Header for Figure Collection (DecoCoin UI disabled as per user instruction)
  const headerHtml = `
    <div class="w-full flex justify-between items-center px-4 py-3 bg-black/20 backdrop-blur-md border-b border-white/10 mb-3">
      <div class="flex flex-col">
        <h2 class="text-white font-black italic uppercase text-base tracking-tighter leading-none">FIGURE ALBUMS</h2>
        <span class="text-zinc-500 text-[8px] font-bold uppercase tracking-widest mt-1">GATHER STARS TO UNLOCK FIGURES & PETS</span>
      </div>
    </div>
  `;

  // Safely initialize state.figureProgress and state.prevFigureProgress if not yet done
  if (!state.figureProgress) state.figureProgress = {};
  if (!state.prevFigureProgress) state.prevFigureProgress = {};

  state.songs.forEach(song => {
    if (state.figureProgress[song.id] === undefined) {
      const songStars = Array.isArray(song.starLevel) ? song.starLevel.reduce((a, b) => a + (b || 0), 0) : (song.starLevel || 0);
      state.prevFigureProgress[song.id] = 0;
      state.figureProgress[song.id] = Math.min(6, songStars);
      if (songStars >= 6) {
        state.unlockedFigures.add(song.id);
      }
    }
  });

  // Calculate figure states & render sets
  let setsHtml = '';
  SET_FIGURES_DATA.forEach(set => {
    const setFigures = set.figures.map(id => FIGURES_DATA.find(f => f.id === id)).filter(Boolean);
    const isSetComplete = set.figures.every(id => state.unlockedFigures.has(id));
    const isRewardCollected = state.collectedSetRewards.has(set.id);
    const petObj = PET_BALANCING.pets.find(p => p.id === set.reward.petId);

    const figuresHtml = setFigures.map(fig => {
      // Use previous progress for initial animation frame
      const initialStars = state.prevFigureProgress[fig.id] !== undefined ? state.prevFigureProgress[fig.id] : (state.figureProgress[fig.id] || 0);
      const isUnlocked = state.unlockedFigures.has(fig.id) && (state.prevFigureProgress[fig.id] === undefined || state.prevFigureProgress[fig.id] >= 6);
      const progressPct = (initialStars / 6) * 100;
      
      return `
        <div 
          id="figure-card-${fig.id}"
          onclick="window.openSongInfo('${fig.id}')"
          class="relative group cursor-pointer transition-all duration-300 hover:scale-105 h-[82px] bg-black/40 rounded-lg border border-white/10 overflow-hidden"
        >
          <!-- Spotlight effect -->
          <div class="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none"></div>
          
          ${isUnlocked ? `
            <img id="figure-img-${fig.id}" src="${fig.img}" class="absolute inset-0 w-full h-full object-cover transition-all brightness-100 filter-none" />
          ` : `
            <div class="p-1 h-full flex flex-col justify-between">
              <div class="relative w-9 h-9 mx-auto flex items-center justify-center mt-0.5">
                <img id="figure-img-${fig.id}" src="${fig.img}" class="w-9 h-9 object-cover rounded border border-white/10 transition-all brightness-50 grayscale contrast-125" />
                <div id="figure-lock-${fig.id}" class="absolute inset-0 flex items-center justify-center bg-black/45 rounded">
                  <span class="text-[7px]">🔒</span>
                </div>
              </div>

              <!-- Stars progress indicator -->
              <div id="figure-status-area-${fig.id}" class="w-full mt-1">
                <div class="w-full flex flex-col items-center">
                  <div class="flex justify-between w-full text-[6px] font-mono text-zinc-400 font-bold mb-0.5 px-0.5 leading-none">
                    <span id="figure-stars-text-${fig.id}">${initialStars}/6</span>
                    <span>⭐</span>
                  </div>
                  <div class="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
                    <div id="figure-progress-bar-${fig.id}" class="h-full bg-gradient-to-r from-pink-500 via-rose-500 to-yellow-500 transition-all duration-300" style="width: ${progressPct}%"></div>
                  </div>
                </div>
              </div>
            </div>
          `}
        </div>
      `;
    }).join('');

    setsHtml += `
      <div class="mb-4 relative px-2 sm:px-4">
        <div class="flex justify-between items-center mb-1.5 px-1">
          <div class="flex flex-col">
            <h3 class="text-white font-black italic uppercase text-[10px] tracking-wider leading-none">${set.setName}</h3>
            <span class="text-zinc-500 text-[7px] font-bold uppercase tracking-widest mt-0.5">PROGRESS: ${set.figures.filter(id => state.unlockedFigures.has(id)).length}/5</span>
          </div>
          <div class="flex items-center gap-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg px-2 py-0.5 text-[7.5px] font-black uppercase text-indigo-300">
            <span class="text-zinc-400 text-[6px] font-bold">REWARD:</span>
            <span class="text-xs leading-none">${petObj ? petObj.avatar : '🎁'}</span>
            <span class="text-[7.5px] font-bold text-white/90">${petObj ? petObj.name : 'Companion'}</span>
            ${isRewardCollected ? `
              <span class="text-green-400 text-[6.5px] font-black ml-0.5">✓ OWNED</span>
            ` : ''}
          </div>
        </div>
        
        <!-- Shelf/Display Case - Grid for exactly 5 columns with no horizontal scrolling -->
        <div class="relative bg-gradient-to-b from-white/5 to-transparent p-1.5 rounded-xl border border-white/10 shadow-inner flex flex-col justify-center min-h-[96px]">
          <div class="grid grid-cols-5 gap-1.5 w-full">
            ${figuresHtml}
          </div>
          
          ${isSetComplete && !isRewardCollected ? `
            <div 
              onclick="event.stopPropagation(); window.collectSetReward(${set.id})"
              class="absolute inset-0 bg-indigo-600/40 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center cursor-pointer group animate-in fade-in zoom-in duration-300 z-10"
            >
              <div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl border border-white/20 shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center animate-bounce group-hover:scale-110 transition-transform">
                <span class="text-xl">${petObj ? petObj.avatar : '🎁'}</span>
              </div>
              <span class="text-white font-black text-[8px] uppercase mt-1 drop-shadow-md tracking-wider">CLAIM ${petObj ? petObj.name.toUpperCase() : 'PET'}!</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = `
    <div id="figures-scroll-container" class="flex-1 flex flex-col overflow-y-auto no-scrollbar animate-in fade-in duration-300 pb-20">
      ${headerHtml}
      ${setsHtml}
    </div>
  `;

  // Detect figures that should animate on this view session
  const figuresToAnimate = [];
  FIGURES_DATA.forEach(fig => {
    const prev = state.prevFigureProgress[fig.id] !== undefined ? state.prevFigureProgress[fig.id] : 0;
    const curr = state.figureProgress[fig.id] !== undefined ? state.figureProgress[fig.id] : 0;
    if (curr > prev) {
      figuresToAnimate.push({
        id: fig.id,
        prev,
        curr
      });
    }
  });

  // Perform sequential progress bar animation and scrolling
  if (figuresToAnimate.length > 0) {
    let animIndex = 0;
    
    function animateNext() {
      if (animIndex >= figuresToAnimate.length) {
        // All animations complete, persist progress values
        figuresToAnimate.forEach(item => {
          state.prevFigureProgress[item.id] = item.curr;
        });
        return;
      }
      
      const item = figuresToAnimate[animIndex];
      const cardEl = document.getElementById(`figure-card-${item.id}`);
      const barEl = document.getElementById(`figure-progress-bar-${item.id}`);
      const textEl = document.getElementById(`figure-stars-text-${item.id}`);
      
      if (cardEl) {
        // Scroll target card into visual focus (ONLY vertically)
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        
        setTimeout(() => {
          let currentVal = item.prev;
          const targetVal = item.curr;
          
          // Speed up the fill up process by 2x (duration is 500ms instead of 1000ms)
          const duration = 500;
          const steps = 15;
          const stepTime = duration / steps;
          const increment = (targetVal - currentVal) / steps;
          let step = 0;
          
          const interval = setInterval(() => {
            step++;
            currentVal = Math.min(targetVal, currentVal + increment);
            
            if (barEl) barEl.style.width = `${(currentVal / 6) * 100}%`;
            if (textEl) textEl.innerText = `${Math.floor(currentVal)}/6`;
            
            if (step >= steps || currentVal >= targetVal) {
              clearInterval(interval);
              
              if (barEl) barEl.style.width = `${(targetVal / 6) * 100}%`;
              if (textEl) textEl.innerText = `${targetVal}/6`;
              
              if (targetVal >= 6) {
                // Set unlock in memory
                state.unlockedFigures.add(item.id);
                state.newlyUnlockedFigures.add(item.id);

                // Update unlock state to let image fill the whole frame
                const figureObj = FIGURES_DATA.find(f => f.id === item.id);
                cardEl.innerHTML = `
                  <!-- Spotlight effect -->
                  <div class="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none"></div>
                  <img id="figure-img-${item.id}" src="${figureObj ? figureObj.img : ''}" class="absolute inset-0 w-full h-full object-cover transition-all brightness-100 filter-none" />
                `;
                
                // Show a nice one-time shine vfx on the figure itself as requested
                const shine = document.createElement('div');
                shine.className = "absolute inset-0 bg-white rounded-lg pointer-events-none z-30 opacity-100";
                shine.style.transition = "opacity 0.6s ease-out";
                cardEl.appendChild(shine);
                
                // Visual satisfying bounce/glow feedback
                cardEl.classList.add('scale-110', 'rotate-1', 'shadow-[0_0_15px_rgba(255,255,255,0.7)]', 'z-20');
                
                setTimeout(() => {
                  shine.style.opacity = "0";
                  setTimeout(() => {
                    shine.remove();
                    cardEl.classList.remove('scale-110', 'rotate-1', 'shadow-[0_0_15px_rgba(255,255,255,0.7)]', 'z-20');
                  }, 600);
                }, 50);
              }
              
              animIndex++;
              setTimeout(animateNext, 200);
            }
          }, stepTime);
        }, 200);
      } else {
        animIndex++;
        animateNext();
      }
    }
    
    setTimeout(animateNext, 200);
  }

  // Clear newly unlocked indicators after viewing
  if (state.newlyUnlockedFigures.size > 0) {
    setTimeout(() => {
      state.newlyUnlockedFigures.clear();
    }, 2000);
  }
}

export function showFigureFocus(figureId, state) {
  // Kept for bundle compatibility
}
