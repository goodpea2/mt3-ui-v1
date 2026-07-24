import { state } from '../state.js';
import { getStarOneTimeReward, getStarJourneyLevelAndProgress } from '../balance.js';

const DIFFICULTY_MAP = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Expert",
  5: "Extreme",
  6: "Hell"
};

// Colors adapted to sync with difficulty's color system: blue for 1-2, gold for 3-4, red for 5-6
const BLUE_THEME = {
  name: "Blue",
  cardGradient: "from-blue-600 to-indigo-700",
  buttonGrad: "from-blue-500 via-indigo-600 to-indigo-800",
  textLight: "text-blue-450",
  border: "border-blue-500/20",
  solidBg: "bg-blue-500",
  glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]",
  starBg: "text-blue-450/10",
};

const GOLD_THEME = {
  name: "Gold",
  cardGradient: "from-yellow-600 to-amber-700",
  buttonGrad: "from-yellow-400 via-amber-500 to-orange-600",
  textLight: "text-yellow-400",
  border: "border-yellow-500/20",
  solidBg: "bg-yellow-500",
  glow: "shadow-[0_0_30px_rgba(234,179,8,0.3)]",
  starBg: "text-yellow-400/10",
};

const RED_THEME = {
  name: "Red",
  cardGradient: "from-red-600 to-rose-700",
  buttonGrad: "from-red-500 via-rose-600 to-rose-800",
  textLight: "text-red-400",
  border: "border-red-500/20",
  solidBg: "bg-red-500",
  glow: "shadow-[0_0_30px_rgba(220,38,38,0.3)]",
  starBg: "text-red-400/10",
};

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
    <div class="snap-start shrink-0 w-[78px] h-[82px] rounded-2xl bg-white border border-white/20 shadow-md relative overflow-hidden flex flex-col justify-between opacity-85">
      <!-- Dark overlay and giant star for finished tasks -->
      ${isDone ? `
        <div class="absolute inset-0 bg-black/75 flex items-center justify-center z-30">
          <span class="text-4xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">⭐</span>
        </div>
      ` : ''}

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

export function showSongInfoPopup(songId, initialDiffIdx = 0, onPlay) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  const song = state.songs.find(s => s.id === songId);
  if (!song) return;

  // Make sure limit states are ready
  state.currencyShopLimits = state.currencyShopLimits || {
    keysCoin: 0,
    keysAd: 0,
    coinsFree: 0,
    coinsAd: 0
  };

  const levels = Array.isArray(song.level) ? song.level : [song.level];
  const isLockedArray = Array.isArray(song.isLocked) ? song.isLocked : [song.isLocked];
  const starLevels = Array.isArray(song.starLevel) ? song.starLevel : [song.starLevel];

  // Initialize completed tasks block if missing
  if (!song.completedTasks) {
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

  // Active difficulty index in popup
  let selectedDiffIdx = initialDiffIdx;

  // Automatically select the difficulty with the most stars remaining
  let bestIdx = -1;
  let maxRemainingStars = -1;
  for (let i = 0; i < isLockedArray.length; i++) {
    if (!isLockedArray[i]) { // Unlocked difficulty
      const starsGained = starLevels[i] || 0;
      const starsRemaining = 6 - starsGained;
      if (starsRemaining > maxRemainingStars) {
        maxRemainingStars = starsRemaining;
        bestIdx = i;
      }
    }
  }
  if (bestIdx !== -1) {
    selectedDiffIdx = bestIdx;
  }

  // Open popup container
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');

  // Find index for prev/next buttons
  const currentIdx = state.songs.findIndex(s => s.id === songId);

  const popup = document.createElement('div');
  popup.id = 'song-info-popup';
  popup.className = "w-[340px] bg-[#0c051f] border-2 border-indigo-500/30 rounded-3xl overflow-visible animate-in fade-in zoom-in duration-300 flex flex-col relative z-50 transition-all duration-300";

  const renderContent = () => {
    const currentLevel = levels[selectedDiffIdx];
    const isSongLocked = isLockedArray[0];
    const theme = METADATA_THEMES[currentLevel] || METADATA_THEMES[2];

    // Compute single run note count
    const minNotesByDifficulty = state.gameplayConfig?.minNotesByDifficulty || [30, 40, 50, 60, 70, 80];
    const maxNotesByDifficulty = state.gameplayConfig?.maxNotesByDifficulty || [70, 100, 130, 160, 200, 240];
    const diffIndexForNotes = Math.min(Math.max(currentLevel - 1, 0), 5);
    const minN = minNotesByDifficulty[diffIndexForNotes];
    const maxN = maxNotesByDifficulty[diffIndexForNotes];

    if (!song.noteCount) song.noteCount = [];
    if (song.noteCount[selectedDiffIdx] === undefined) {
      song.noteCount[selectedDiffIdx] = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
    }
    const singleRunNoteCount = song.noteCount[selectedDiffIdx];

    // Read tasks statuses
    const taskStatus = song.completedTasks[selectedDiffIdx] || [false, false, false, false, false, false];

    // Direct popup wrapper color styling injection dynamically
    popup.className = `w-[340px] bg-[#0c051f] border-2 border-indigo-500/30 rounded-3xl overflow-visible ${theme.glow} animate-in fade-in zoom-in duration-300 flex flex-col relative z-50 transition-all duration-300`;

    // Difficulty headers list html
    let diffSelectorHtml = '';
    levels.forEach((lvl, idx) => {
      const active = idx === selectedDiffIdx;
      const locked = isLockedArray[idx];
      const diffName = DIFFICULTY_MAP[lvl] || "Unknown";
      const btnTheme = METADATA_THEMES[lvl] || METADATA_THEMES[2];
      
      let tabClass = "";
      if (active) {
        tabClass = `bg-gradient-to-b ${btnTheme.cardGradient} text-white font-extrabold border-white/20`;
      } else if (locked) {
        tabClass = "bg-black/40 text-white/50 hover:bg-white/5 border-white/5 cursor-pointer opacity-80";
      } else {
        tabClass = "bg-white/5 hover:bg-white/10 text-white/70 border-white/10 cursor-pointer";
      }

      const remainingStarsOnDiff = Math.max(0, 6 - (starLevels[idx] || 0));

      diffSelectorHtml += `
        <button 
          data-idx="${idx}"
          class="flex-1 py-1.5 text-[8.5px] font-black italic tracking-wider rounded-lg border transition-all flex items-center justify-center gap-1 uppercase ${tabClass}"
        >
          ${diffName}
          ${locked ? '🔒' : `(${remainingStarsOnDiff}⭐)`}
        </button>
      `;
    });

    // Modern horizontal task cards list HTML
    const tasksList = [];
    const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
    const journey = getStarJourneyLevelAndProgress(totalStars);
    const maxTasks = journey.level < 4 ? 3 : 6;
    for (let tIdx = 0; tIdx < maxTasks; tIdx++) {
      tasksList.push({
        tIdx,
        isDone: taskStatus[tIdx],
        title: concisedTaskName(tIdx + 1, singleRunNoteCount),
        oneTimeReward: getStarOneTimeReward(tIdx, currentLevel)
      });
    }
    // Reorder: unfinished first, then finished
    tasksList.sort((a, b) => {
      if (a.isDone && !b.isDone) return 1;
      if (!a.isDone && b.isDone) return -1;
      return a.tIdx - b.tIdx;
    });

    let tasksListCardsHtml = '';
    tasksList.forEach(task => {
      tasksListCardsHtml += renderTaskCardHtml(task.title, task.oneTimeReward, task.isDone);
    });

    // Dynamic Footer contents: display purchase controls when locked, otherwise Play Now
    const isSelectedDiffLocked = isLockedArray[selectedDiffIdx];
    let footerHtml = '';
    if (isSongLocked) {
      const canWatchAd = (state.currencyShopLimits?.keysAd || 0) < 3;
      const adButtonHtml = canWatchAd ? `
          <button 
            id="popup-ad-keys-btn-${song.id}"
            class="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white font-black italic text-[9px] py-1.5 rounded-xl border-b-2 border-pink-900 active:border-b-0 active:translate-y-[1px] transition-all shadow-[0_4px_12px_rgba(219,39,119,0.2)]"
          >
            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            <span>WATCH AD (+10 🔑)</span>
          </button>
      ` : `
          <button 
            disabled
            class="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 text-gray-500 font-black italic text-[9px] py-1.5 rounded-xl border-b-2 border-gray-800 opacity-50 cursor-not-allowed"
          >
            <span>AD LIMIT REACHED</span>
          </button>
      `;

      footerHtml = `
        <div class="w-full flex items-center gap-3">
          <button 
            id="popup-purchase-btn-${song.id}"
            class="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-cyan-500 to-cyan-700 hover:from-cyan-400 hover:to-cyan-600 text-white font-black italic text-[9.5px] py-1.5 rounded-xl border-b-2 border-cyan-950 active:border-b-0 active:translate-y-[1px] transition-all shadow-[0_4px_12px_rgba(6,182,212,0.2)]"
          >
            <span class="text-[10px] leading-none">🔑</span>
            <span>${song.isDeluxe ? "20 KEYS" : "10 KEYS"}</span>
          </button>
          
          ${adButtonHtml}
        </div>
      `;
    } else if (isSelectedDiffLocked) {
      const currentStarLevels = Array.isArray(song.starLevel) ? song.starLevel : [song.starLevel];
      const isPrevDiffCompleted = selectedDiffIdx === 0 || (currentStarLevels[selectedDiffIdx - 1] || 0) > 0;
      
      if (isPrevDiffCompleted) {
        const diffCost = song.isDeluxe ? 10 : 5;
        footerHtml = `
          <button id="info-unlock-diff-btn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-700 hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 leading-none font-black text-white text-[10px] uppercase">
            🔑 UNLOCK DIFFICULTY (${diffCost} KEYS)
          </button>
        `;
      } else {
        footerHtml = `
          <div class="w-full text-center py-2.5 text-rose-400 font-extrabold text-[10px] uppercase tracking-wider bg-black/20 rounded-xl border border-rose-500/10">
            🔒 COMPLETE PREVIOUS DIFFICULTY TO UNLOCK
          </div>
        `;
      }
    } else {
      footerHtml = `
        <button id="info-play-btn" class="w-full py-2.5 rounded-xl bg-gradient-to-r ${theme.buttonGrad} text-white text-[10px] font-black tracking-wider uppercase hover:brightness-110 active:scale-95 transition-all shadow-md flex items-center justify-center gap-1.5 leading-none">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          PLAY NOW
        </button>
      `;
    }

    popup.innerHTML = `
      <!-- Top Left Keys Counter UI inside popup header -->
      <div class="absolute left-3.5 top-3.5 z-40 bg-[#1a0b3d]/90 border border-cyan-500/30 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 shadow-lg">
        <span class="text-[11px] leading-none">🔑</span>
        <span class="text-cyan-400 font-extrabold text-[10px] font-mono leading-none">${Math.floor(state.visualUser.keys || 0).toLocaleString()}</span>
      </div>

      <!-- Top Right Close Button (X in top right corner) -->
      <button id="info-close-top-btn" class="absolute right-3.5 top-3.5 z-40 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white hover:text-cyan-400 flex items-center justify-center font-bold text-base transition-all focus:outline-none border border-white/10 active:scale-95 shadow-lg">
        &times;
      </button>

      <!-- Navigation buttons on the sides -->
      <button id="info-prev-btn" class="absolute -left-6 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-[#11072b] border border-indigo-500/50 hover:bg-indigo-950 text-cyan-400 hover:text-cyan-300 flex items-center justify-center font-black active:scale-90 transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] select-none cursor-pointer" title="Previous Song">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" /></svg>
      </button>
      <button id="info-next-btn" class="absolute -right-6 top-1/2 -translate-y-1/2 z-50 w-9 h-9 rounded-full bg-[#11072b] border border-indigo-500/50 hover:bg-indigo-950 text-cyan-400 hover:text-cyan-300 flex items-center justify-center font-black active:scale-90 transition-all shadow-[0_0_15px_rgba(99,102,241,0.25)] select-none cursor-pointer" title="Next Song">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
      </button>

      <!-- Header Banner -->
      <div class="relative h-28 w-full shrink-0 flex items-end rounded-t-3xl overflow-hidden">
        <img src="${song.coverUrl}" class="absolute inset-0 w-full h-full object-cover opacity-35" />
        <div class="absolute inset-0 bg-gradient-to-t from-[#0c051f] via-[#0c051f]/40 to-black/50"></div>
        <div class="relative px-5 pb-3">
          <h2 class="text-white font-black text-lg uppercase italic tracking-tighter leading-none">${song.title}</h2>
          <p class="text-white/60 font-bold text-[9.5px] mt-1">${song.artist}</p>
        </div>
      </div>

      <!-- Difficulty Selector Tab block -->
      <div class="px-4 py-2.5 flex gap-1.5 bg-black/20 border-b border-indigo-950">
        ${diffSelectorHtml}
      </div>

      <!-- Scrollable Tasks Grid -->
      <div class="p-4 flex flex-col shrink-0">
        <div class="relative">
          <div class="flex flex-row overflow-x-auto gap-2.5 py-1 px-0.5 no-scrollbar scroll-smooth snap-x snap-mandatory">
            ${tasksListCardsHtml}
          </div>
        </div>
      </div>

      <!-- Bottom actions container (Close button removed, PLAY NOW or UNLOCK options span full screen) -->
      <div class="p-4 bg-black/40 border-t border-indigo-950/65 flex items-center justify-center shrink-0 rounded-b-3xl">
        ${footerHtml}
      </div>
    `;

    // Hook tab buttons
    popup.querySelectorAll('button[data-idx]').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        selectedDiffIdx = parseInt(btn.getAttribute('data-idx'));
        renderContent();
      };
    });

    const clearUnlocks = () => {
      if (state.unlockingTimers[song.id]) {
        clearInterval(state.unlockingTimers[song.id]);
        delete state.unlockingTimers[song.id];
      }
    };

    // Hook Close Button (Top right X button)
    popup.querySelector('#info-close-top-btn').onclick = (e) => {
      e.stopPropagation();
      clearUnlocks();
      popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
      setTimeout(() => {
        popup.remove();
        if (layer.childElementCount === 0) {
          layer.classList.add('pointer-events-none');
          layer.classList.remove('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');
        }
      }, 200);
    };

    // Hook Prev Song Button
    popup.querySelector('#info-prev-btn').onclick = (e) => {
      e.stopPropagation();
      clearUnlocks();
      const prevIdx = (currentIdx - 1 + state.songs.length) % state.songs.length;
      const prevSong = state.songs[prevIdx];
      popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-150');
      setTimeout(() => {
        popup.remove();
        showSongInfoPopup(prevSong.id, 0, onPlay);
      }, 150);
    };

    // Hook Next Song Button
    popup.querySelector('#info-next-btn').onclick = (e) => {
      e.stopPropagation();
      clearUnlocks();
      const nextIdx = (currentIdx + 1) % state.songs.length;
      const nextSong = state.songs[nextIdx];
      popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-150');
      setTimeout(() => {
        popup.remove();
        showSongInfoPopup(nextSong.id, 0, onPlay);
      }, 150);
    };

    // Conditional button bindings
    if (isSongLocked) {
      const purchaseBtn = popup.querySelector(`#popup-purchase-btn-${song.id}`);
      if (purchaseBtn) {
        purchaseBtn.onclick = (e) => {
          e.stopPropagation();
          const cost = song.isDeluxe ? 20 : 10;
          if ((state.user.keys || 0) < cost) {
            if (window.showPopup) {
              window.showPopup("NOT ENOUGH KEYS!", "text-cyan-400 font-black text-2xl animate-shake");
            }
            if (window.openCurrencyShop) {
              window.openCurrencyShop();
            }
            return;
          }

          const counter = document.getElementById('keys-holder');
          if (counter && window.VFXManager) {
            const rect = purchaseBtn.getBoundingClientRect();
            // Spawning a visual spend effect
            window.VFXManager.spawnSpend('coin', cost, counter, rect, () => {});
          }

          state.user.keys = (state.user.keys || 0) - cost;
          state.visualUser.keys = state.user.keys;
          state.purchasedSongCount++;

          if (Array.isArray(song.isLocked)) {
            song.isLocked[0] = false;
          } else {
            song.isLocked = false;
          }
          state.newlyUnlockedSongs.add(song.id);

          if (window.ui) {
            window.ui.header();
            window.ui.content();
          }

          if (window.showPopup) {
            window.showPopup("SONG UNLOCKED! 🔑", "text-yellow-400 font-black text-2xl");
          }

          // Stay in the popup with unlocked state
          renderContent();
        };
      }

      const adKeysBtn = popup.querySelector(`#popup-ad-keys-btn-${song.id}`);
      if (adKeysBtn) {
        adKeysBtn.onclick = (e) => {
          e.stopPropagation();
          if (state.unlockingTimers[song.id]) return;

          let timeLeft = 5;
          adKeysBtn.disabled = true;
          adKeysBtn.classList.add('opacity-50', 'grayscale');
          adKeysBtn.innerHTML = `WATCHING AD... ${timeLeft}S`;

          state.unlockingTimers[song.id] = setInterval(() => {
            timeLeft -= 1;
            if (timeLeft <= 0) {
              clearInterval(state.unlockingTimers[song.id]);
              delete state.unlockingTimers[song.id];

              // Grant +10 keys
              state.user.keys = (state.user.keys || 0) + 10;
              state.visualUser.keys = state.user.keys;

              // Daily limit tracking
              state.currencyShopLimits.keysAd = (state.currencyShopLimits.keysAd || 0) + 1;

              // Statistics tracking
              state.stats.totalAdCount = (state.stats.totalAdCount || 0) + 1;
              state.stats.totalTimeSpentWatchingAd = (state.stats.totalTimeSpentWatchingAd || 0) + 15;

              // Spawn VFX if possible
              const keysHolder = document.getElementById('keys-holder');
              if (keysHolder && window.VFXManager) {
                const rect = adKeysBtn.getBoundingClientRect();
                window.VFXManager.spawnRewards('key', 10, rect, keysHolder, () => {});
              }

              if (window.showPopup) {
                window.showPopup("AD WATCHED! +10 KEYS RECEIVED 🔑", "text-cyan-400 font-black text-2xl animate-bounce");
              }

              if (window.ui) {
                window.ui.header();
                window.ui.content();
              }

              renderContent();
            } else {
              adKeysBtn.innerHTML = `WATCHING AD... ${timeLeft}S`;
            }
          }, 1000);
        };
      }
    } else {
      const playBtn = popup.querySelector('#info-play-btn');
      if (playBtn) {
        playBtn.onclick = (e) => {
          e.stopPropagation();
          clearUnlocks();
          popup.remove();
          if (layer.childElementCount === 0) {
            layer.classList.add('pointer-events-none');
            layer.classList.remove('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');
          }
          if (onPlay) {
            onPlay(selectedDiffIdx);
          }
        };
      }

      const unlockDiffBtn = popup.querySelector('#info-unlock-diff-btn');
      if (unlockDiffBtn) {
        unlockDiffBtn.onclick = (e) => {
          e.stopPropagation();
          const diffCost = song.isDeluxe ? 10 : 5;
          if ((state.user.keys || 0) < diffCost) {
            if (window.showPopup) {
              window.showPopup("NOT ENOUGH KEYS!", "text-cyan-400 font-black text-2xl animate-shake");
            }
            if (window.openCurrencyShop) {
              window.openCurrencyShop();
            }
            return;
          }

          const counter = document.getElementById('keys-holder');
          if (counter && window.VFXManager) {
            const rect = unlockDiffBtn.getBoundingClientRect();
            window.VFXManager.spawnSpend('coin', diffCost, counter, rect, () => {});
          }

          state.user.keys = (state.user.keys || 0) - diffCost;
          state.visualUser.keys = state.user.keys;

          if (Array.isArray(song.isLocked)) {
            song.isLocked[selectedDiffIdx] = false;
          }

          if (window.showPopup) {
            window.showPopup("DIFFICULTY UNLOCKED! 🔑", "text-cyan-400 font-black text-2xl");
          }

          if (window.ui) {
            window.ui.header();
            window.ui.content();
          }

          renderContent();
        };
      }
    }
  };

  renderContent();
  layer.appendChild(popup);
}
