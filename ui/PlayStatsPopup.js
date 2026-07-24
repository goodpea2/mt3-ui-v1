import { getStarOneTimeReward, getStarJourneyLevelAndProgress } from '../balance.js';
import { state } from '../state.js';

const BLUE_THEME = { cardGradient: "from-blue-600 to-indigo-700" };
const GOLD_THEME = { cardGradient: "from-yellow-600 to-amber-700" };
const RED_THEME = { cardGradient: "from-red-600 to-rose-700" };

const METADATA_THEMES = {
  1: BLUE_THEME,
  2: BLUE_THEME,
  3: GOLD_THEME,
  4: GOLD_THEME,
  5: RED_THEME,
  6: RED_THEME
};

const concisedTaskName = (id, notes) => {
  switch (id) {
    case 1: return "Complete 50% of Song";
    case 2: return "Clear the Track";
    case 3: return `Hit ${Math.ceil(notes * 0.5)} Perfects`;
    case 4: return "Clear 2x Speed";
    case 5: return "Clear 3x Speed";
    case 6: return `Reach ${Math.ceil(notes * 1.0)} Combo`;
    default: return "";
  }
};

function renderTaskCardHtml(title, oneTimeReward, isDone) {
  let rewardIconHtml = '';
  let amountStr = '0';
  if (oneTimeReward) {
    amountStr = oneTimeReward.amount.toLocaleString();
    if (oneTimeReward.type === 'coin') {
      rewardIconHtml = `
        <div class="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-[#60a5fa] via-[#a855f7] to-[#ec4899] border border-white/40 flex items-center justify-center shadow-md shrink-0">
          <span class="text-white text-[8px] font-black leading-none">🪙</span>
        </div>
      `;
    } else if (oneTimeReward.type === 'decoTicket') {
      rewardIconHtml = `
        <div class="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-[#f472b6] via-[#db2777] to-[#818cf8] border border-white/40 flex items-center justify-center shadow-md shrink-0">
          <span class="text-white text-[8px] font-black leading-none">🎨</span>
        </div>
      `;
    } else if (oneTimeReward.type === 'key') {
      rewardIconHtml = `
        <div class="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-[#22d3ee] to-[#06b6d4] border border-white/40 flex items-center justify-center shadow-md shrink-0">
          <span class="text-white text-[9px] leading-none">🔑</span>
        </div>
      `;
    }
  } else {
    rewardIconHtml = `
      <div class="w-5.5 h-5.5 rounded-full bg-indigo-950 border border-white/25 flex items-center justify-center shadow-md shrink-0">
        <span class="text-white/30 text-[8px] leading-none">✓</span>
      </div>
    `;
  }

  return `
    <div class="snap-start shrink-0 w-[78px] h-[82px] rounded-2xl bg-white border border-white/20 shadow-md relative overflow-hidden flex flex-col justify-between ${isDone ? 'ring-2 ring-yellow-400' : 'opacity-85'}">
      <!-- Shiny 4-pointed star overlapping top-left -->
      <div class="absolute -top-1.5 -left-1.5 w-5 h-5 z-20">
        <svg class="w-full h-full text-white filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4z" class="${isDone ? 'text-yellow-200' : 'text-slate-300'}" />
        </svg>
      </div>

      <!-- Purple Header section -->
      <div class="bg-[#4a36b4] h-7 w-full flex items-center justify-center text-center px-1 shrink-0 relative z-10 border-b border-white/10">
        <span class="text-yellow-300 text-[6.5px] font-black tracking-tight leading-none uppercase select-none line-clamp-2 max-w-full">${title}</span>
      </div>

      <!-- Bottom Part: Light cyan gradient background -->
      <div class="flex-1 bg-gradient-to-b from-[#e0f2fe] to-[#c084fc]/15 flex flex-col items-center justify-center p-1 relative select-none">
        ${isDone ? `
          <div class="absolute top-0.5 right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-[7.5px] text-white font-black shadow-sm z-10 border border-white/20">✓</div>
        ` : ''}
        <div class="flex flex-col items-center justify-center gap-0.5">
          ${rewardIconHtml}
          <span class="text-white text-[11px] font-black font-sans leading-none tracking-tight select-none filter drop-shadow-[0_1.5px_0_rgba(0,0,0,1)]" style="text-shadow: 1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000;">
            ${amountStr}
          </span>
        </div>
      </div>
    </div>
  `;
}

export function showPlayStatsPopup(song, stats, onConfirm) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  // Remove pointer-events-none from layer while popup is active
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');

  const formatTime = (seconds) => {
    const s = seconds ?? 0;
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine difficulty level played
  const levels = Array.isArray(song.level) ? song.level : [song.level];
  const diffIdx = stats.difficultyIdx !== undefined ? stats.difficultyIdx : 0;
  const currentLevel = levels[diffIdx] || levels[0] || 1;
  const theme = METADATA_THEMES[currentLevel] || METADATA_THEMES[2];

  // Note count estimation
  const minNotesByDifficulty = [30, 40, 50, 60, 70, 80];
  const maxNotesByDifficulty = [70, 100, 130, 160, 200, 240];
  const diffIndexForNotes = Math.min(Math.max(currentLevel - 1, 0), 5);
  const minN = minNotesByDifficulty[diffIndexForNotes];
  const maxN = maxNotesByDifficulty[diffIndexForNotes];

  if (!song.noteCount) song.noteCount = [];
  if (song.noteCount[diffIdx] === undefined) {
    song.noteCount[diffIdx] = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
  }
  const singleRunNoteCount = song.noteCount[diffIdx];

  // Read current task statuses
  const taskStatus = song.completedTasks ? (song.completedTasks[diffIdx] || [false, false, false, false, false, false]) : [false, false, false, false, false, false];

  const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
  const journey = getStarJourneyLevelAndProgress(totalStars);
  const maxTasks = journey.level < 4 ? 3 : 6;

  let tasksListCardsHtml = '';
  for (let tIdx = 0; tIdx < maxTasks; tIdx++) {
    const isDone = taskStatus[tIdx];
    const title = concisedTaskName(tIdx + 1, singleRunNoteCount);
    const oneTimeReward = getStarOneTimeReward(tIdx, currentLevel);
    tasksListCardsHtml += renderTaskCardHtml(title, oneTimeReward, isDone);
  }
  
  const totalCoins = (stats.totalCoins || 0);
  const totalPellets = (stats.totalPellets || 0);
  
  let finalCoins = totalCoins;
  let finalPellets = totalPellets;
  let finalKeys = 0;
  let finalTickets = 0;

  if (stats.oneTimeRewardsGained) {
    stats.oneTimeRewardsGained.forEach(rew => {
      if (rew.type === 'coin') {
        finalCoins += rew.amount;
      } else if (rew.type === 'key') {
        finalKeys += rew.amount;
      } else if (rew.type === 'decoTicket') {
        finalTickets += rew.amount;
      }
    });
  }

  const popup = document.createElement('div');
  popup.className = "w-[320px] bg-[#1a0b3d] border-2 border-purple-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-in fade-in zoom-in duration-300 flex flex-col";
  
  popup.innerHTML = `
    <div class="relative h-28 w-full">
      <img src="${song.coverUrl}" class="w-full h-full object-cover opacity-40" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#1a0b3d] to-transparent"></div>
      <div class="absolute bottom-4 left-6">
        <h2 class="text-white font-black text-xl uppercase italic tracking-tighter">${song.title}</h2>
        <p class="text-purple-300/60 text-xs font-bold">${song.artist}</p>
      </div>
    </div>

    <!-- Dual Tab Headers -->
    <div class="flex border-b border-purple-500/30 px-6 mt-1">
      <button id="tab-btn-result" class="flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-cyan-400 text-cyan-400 focus:outline-none transition-all">
         RESULT
      </button>
      <button id="tab-btn-performance" class="flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-transparent text-white/50 hover:text-white focus:outline-none transition-all">
         PERFORMANCE
      </button>
    </div>

    <div class="px-6 py-4 space-y-4">
      
      <!-- RESULT TAB CONTENT -->
      <div id="tab-result-content" class="space-y-4 animate-in fade-in duration-200">

        <!-- Center Stars Row (No headers/right side boxes, "NEW" on top of newly earned star(s)) -->
        <div class="flex flex-col items-center bg-white/5 rounded-2xl p-3 border border-white/10">
          <div class="flex gap-2">
            ${Array.from({ length: 6 }).map((_, i) => {
              const isStarFilled = i < stats.starLevel;
              const isNewStar = isStarFilled && (i >= (stats.starLevel - stats.starsGained));
              return `
                <div class="relative flex flex-col items-center select-none">
                  <div class="h-3.5 flex items-center justify-center">
                    ${isNewStar ? `
                      <span class="text-[6px] font-mono font-black text-emerald-400 tracking-tight bg-emerald-500/25 border border-emerald-400/40 px-0.5 rounded leading-none uppercase animate-pulse">NEW</span>
                    ` : ''}
                  </div>
                  <div class="w-6 h-6 ${isStarFilled ? 'text-yellow-400 drop-shadow-[0_2px_6px_rgba(250,204,21,0.5)]' : 'text-white/10'} mt-1 transition-transform hover:scale-115 duration-300">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Song Tasks updated status scroll -->
        <div class="flex flex-col gap-1">
          <div class="flex flex-row overflow-x-auto gap-2 py-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory">
            ${tasksListCardsHtml}
          </div>
        </div>

        <!-- Rewards Section -->
        <div class="flex items-center justify-center gap-3.5 bg-black/40 border border-white/5 rounded-2xl p-2 select-none text-[11px] font-black text-white font-mono">
          ${finalKeys > 0 ? `<span>🔑+${finalKeys}</span>` : ''}
          ${finalCoins > 0 ? `<span>🪙+${finalCoins}</span>` : ''}
          ${finalPellets > 0 ? `<span>🍪+${finalPellets}</span>` : ''}
          ${finalTickets > 0 ? `<span>🎨+${finalTickets}</span>` : ''}
        </div>
      </div>

      <!-- PERFORMANCE TAB CONTENT -->
      <div id="tab-performance-content" class="space-y-4 hidden animate-in fade-in duration-200">
        <!-- Hit Accuracy Grid -->
        <div class="grid grid-cols-4 gap-1.5">
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-cyan-400 uppercase">Perfect</span>
            <span class="text-white font-black text-xs">${stats.perfectCount}</span>
          </div>
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-yellow-400 uppercase">Great</span>
            <span class="text-white font-black text-xs">${stats.greatCount}</span>
          </div>
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-orange-400 uppercase">Good</span>
            <span class="text-white font-black text-xs">${stats.goodCount}</span>
          </div>
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-red-400 uppercase">Miss</span>
            <span class="text-white font-black text-xs">${stats.missCount}</span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-fuchsia-400 uppercase">Max Combo</span>
            <span class="text-white font-black text-xs">${stats.maxCombo}x</span>
          </div>
          <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
            <span class="text-[8px] font-black text-green-400 uppercase">Accuracy</span>
            <span class="text-white font-black text-xs">
              ${stats.totalNotes > 0 ? Math.round(((stats.perfectCount + stats.greatCount + stats.goodCount) / stats.totalNotes) * 100) : 0}%
            </span>
          </div>
        </div>

        <!-- Duration Stats -->
        <div class="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-1.5">
          <div class="flex justify-between text-[9px] font-bold">
            <span class="text-white/40 uppercase">Playing Time</span>
            <span class="text-white">${formatTime(stats.effectiveSongDuration || stats.totalTime)}</span>
          </div>
          <div class="flex justify-between text-[9px] font-bold">
            <span class="text-white/40 uppercase">Ad Watching</span>
            <span class="text-white">${formatTime(stats.adDuration)}</span>
          </div>
          <div class="flex justify-between text-[9px] font-bold">
            <span class="text-white/40 uppercase">Idle Time</span>
            <span class="text-white">${formatTime(stats.idleDuration)}</span>
          </div>
          <div class="pt-1 border-t border-white/10 flex justify-between text-[10px] font-black">
            <span class="text-purple-400 uppercase">Total Session</span>
            <span class="text-purple-400">${formatTime(stats.totalTime)}</span>
          </div>
        </div>
      </div>

      <!-- Action Buttons containing Retry & Claim Confirm side-by-side -->
      <div class="flex gap-3">
        <button id="stats-retry-btn" class="flex-1 py-3 bg-white/5 border border-white/10 text-white/75 hover:bg-white/10 hover:text-white font-black italic rounded-2xl active:translate-y-[1px] transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 focus:outline-none shadow-md">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89" />
          </svg>
          RETRY
        </button>
        <button id="stats-confirm-btn" class="flex-[1.5] bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-black italic py-3 rounded-2xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-[2px] transition-all shadow-lg text-xs uppercase tracking-widest focus:outline-none">
          Awesome!
        </button>
      </div>
    </div>
  `;

  layer.appendChild(popup);

  // Tab Navigation Listeners
  const btnResult = popup.querySelector('#tab-btn-result');
  const btnPerformance = popup.querySelector('#tab-btn-performance');
  const frameResult = popup.querySelector('#tab-result-content');
  const framePerformance = popup.querySelector('#tab-performance-content');

  btnResult.onclick = () => {
    btnResult.className = "flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-cyan-400 text-cyan-400 focus:outline-none transition-all";
    btnPerformance.className = "flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-transparent text-white/50 hover:text-white focus:outline-none transition-all";
    frameResult.classList.remove('hidden');
    framePerformance.classList.add('hidden');
  };

  btnPerformance.onclick = () => {
    btnResult.className = "flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-transparent text-white/50 hover:text-white focus:outline-none transition-all";
    btnPerformance.className = "flex-1 text-center py-2.5 text-[10px] font-black italic tracking-widest border-b-2 border-cyan-400 text-cyan-400 focus:outline-none transition-all";
    frameResult.classList.add('hidden');
    framePerformance.classList.remove('hidden');
  };

  // Buttons actions
  const retryBtn = popup.querySelector('#stats-retry-btn');
  if (retryBtn) {
    retryBtn.onclick = () => {
      popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
      setTimeout(() => {
        popup.remove();
        if (layer.childElementCount === 0) {
          layer.classList.add('pointer-events-none');
          layer.classList.remove('pointer-events-auto', 'bg-black/80', 'bg-black/90', 'backdrop-blur-sm', 'backdrop-blur-md');
        }
        if (onConfirm) onConfirm(false, true); // (isGoClicked, isRetryClicked)
      }, 200);
    };
  }

  const confirmBtn = popup.querySelector('#stats-confirm-btn');
  confirmBtn.onclick = () => {
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      if (layer.childElementCount === 0) {
        layer.classList.add('pointer-events-none');
        layer.classList.remove('pointer-events-auto', 'bg-black/80', 'bg-black/90', 'backdrop-blur-sm', 'backdrop-blur-md');
      }
      if (onConfirm) onConfirm(false, false); // (isGoClicked, isRetryClicked)
    }, 200);
  };
}
