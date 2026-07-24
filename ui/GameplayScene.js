import { playSongCardNewDifficultyUnlockedVFX } from '../vfx/SongCardNewDifficultyUnlocked.js';
import { state } from '../state.js';
import { PET_BALANCING, getStarJourneyLevelAndProgress } from '../balance.js';
import { initStageState, STAGE_ELEMENTS, drawSimulationBackground, drawNoteVisual, triggerHitVfx, drawStyledAccuracyText } from './StageCustomizer.js';

const DIFFICULTY_MAP = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Expert",
  5: "Extreme",
  6: "Hell"
};

function isPetActive(petId) {
  const isUnlocked = state.unlockedPets.has(petId);
  const isSleeping = state.petSleepUntil && (state.petSleepUntil[petId] > Date.now());
  const isEquipped = state.equippedPetIds && state.equippedPetIds.includes(petId);
  return isUnlocked && !isSleeping && isEquipped;
}

function getPetLevel(petId) {
  return state.petLevels ? (state.petLevels[petId] || 1) : 1;
}

const THEMES = {
  blue: "from-[#00d2ff] to-[#3a7bd5]",
  gold: "from-[#f6d365] to-[#fda085]",
  red: "from-[#ff0844] to-[#ffb199]"
};

export function showGameplayScene(song, initialDiffIdx = 0, onFinish, showNewUnlockVFX = false) {
  initStageState();
  const app = document.getElementById('app');
  if (!app) return;

  let currentDiffIdx = initialDiffIdx;
  const levels = Array.isArray(song.level) ? song.level : [song.level];
  const isLockedArray = Array.isArray(song.isLocked) ? song.isLocked : [song.isLocked];

  // Store performance history to return the last completed play to Home screen results
  let lastCompletedPlayStats = null;

  const getClampedNoteCount = () => {
    const level = levels[currentDiffIdx];
    const diffIndexForNotes = Math.min(Math.max(level - 1, 0), 5);
    const activeState = window.state || state;
    const minN = (activeState && activeState.gameplayConfig) ? activeState.gameplayConfig.minNotesByDifficulty[diffIndexForNotes] : 30;
    const maxN = (activeState && activeState.gameplayConfig) ? activeState.gameplayConfig.maxNotesByDifficulty[diffIndexForNotes] : 70;
    
    if (!song.noteCount) {
      song.noteCount = [];
    }
    if (song.noteCount[currentDiffIdx] === undefined) {
      song.noteCount[currentDiffIdx] = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
    }
    
    let rawNoteCount = song.noteCount[currentDiffIdx];
    return Math.min(Math.max(rawNoteCount, minN), maxN);
  };

  const container = document.createElement('div');
  container.id = 'gameplay-scene';
  container.className = 'absolute inset-0 z-[200] bg-black/85 backdrop-blur-sm flex items-center justify-center overflow-hidden animate-in fade-in duration-300';
  
  const gameFrame = document.createElement('div');
  
  const canvas = document.createElement('canvas');
  canvas.className = 'absolute inset-0 w-full h-full pointer-events-none z-0';
  
  let gameState = 'idle'; // 'idle', 'countdown', 'playing', 'ended', 'prompting_speed'

  const getTheme = (level) => {
    if (level >= 5) return THEMES.red;
    if (level >= 3) return THEMES.gold;
    return THEMES.blue;
  };

  const updateTheme = () => {
    const level = levels[currentDiffIdx];
    const themeClass = getTheme(level);
    if (gameState === 'idle') {
      gameFrame.className = `relative w-full max-w-md h-full bg-[#05020c] flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/10 animate-in fade-in duration-300`;
    } else {
      gameFrame.className = `relative w-full max-w-md h-full bg-gradient-to-br ${themeClass} flex flex-col overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/10`;
    }
  };

  updateTheme();
  
  // Background star decor
  const bgDecor = `
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
        <svg class="w-[900px] h-[900px] text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
      <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15),transparent_70%)]"></div>
      <div class="absolute inset-0 halftone-bg opacity-10"></div>
    </div>
  `;

  // Define game constants & variables
  let score = 0;
  let combo = 0;
  let maxCombo = 0;
  let perfectCount = 0;
  let greatCount = 0;
  let goodCount = 0;
  let missCount = 0;
  let notesSpawned = 0;
  let pet3HitsCount = 0; // State variable tracking forced hits from Pet 3
  
  let petContributions = {
    pet1: 0,
    pet2: 0,
    pet3: 0,
    pet4: 0,
    pet5: 0,
    pet6: 0,
    pet7: 0,
    pet8: 0,
    pet9: 0,
    pet10: 0,
    pet11: 0,
    pet12: 0
  };
  
  // Speed mode tracking
  let speedModeState = 'normal'; // 'normal', 'speed2x', 'speed3x'
  let speed2xCompleted = false;
  let speed3xCompleted = false;
  let normalNoteSpeed = 5;
  let normalNotesCount = 100;
  let totalNotesPlayedAcrossRuns = 100;

  let notesList = [];
  let particlesList = [];
  let floatingTexts = [];
  let keyHighlightList = [false, false, false, false];
  
  let countdownIntervalId = null;
  let onCountdownCompleteCallback = null;

  let totalNotes = 100;
  let noteSpeed = 5;
  let spawnCounter = 0;
  let isSkipping = false;
  let accuracyHistory = [];
  let skipAccuracyIndex = 0;

  const activateSkipState = () => {
    if ((gameState !== 'playing' && gameState !== 'countdown') || isSkipping) return;

    if (gameState === 'countdown') {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
      }
      const banner = gameFrame.querySelector('#countdown-banner');
      if (banner) {
        banner.classList.add('opacity-0');
      }
      gameState = 'playing';
      if (onCountdownCompleteCallback) {
        onCountdownCompleteCallback();
        onCountdownCompleteCallback = null;
      }
    }

    isSkipping = true;
    noteSpeed = noteSpeed * 2;

    const skipBtn = gameFrame.querySelector('#skip-gameplay-btn');
    if (skipBtn) {
      skipBtn.innerHTML = "AUTO-PLAYING ➔";
      skipBtn.className = "pointer-events-auto bg-cyan-700/60 text-cyan-200 border border-cyan-400 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase mb-1.5 transition-all shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse";
    }
  };

  const autoHitNote = (note) => {
    note.active = false;

    let result = 'perfect';
    if (accuracyHistory.length > 0) {
      result = accuracyHistory[skipAccuracyIndex % accuracyHistory.length];
      skipAccuracyIndex++;
    } else {
      const rand = Math.random();
      if (rand < 0.60) result = 'perfect';
      else if (rand < 0.85) result = 'great';
      else if (rand < 0.95) result = 'good';
      else result = 'miss';
    }

    let judgeText = '';
    let judgeColor = '';
    let points = 0;

    const p3Lvl = getPetLevel(3);
    const p3Config = PET_BALANCING.pets.find(p => p.id === 3);
    const pet3Max = p3Config ? p3Config.stats[Math.min(p3Lvl - 1, p3Config.stats.length - 1)] : 10;

    if (result === 'perfect') {
      judgeText = 'PERFECT';
      judgeColor = '#f472b6';
      points = 40;
      
      if (isPetActive(4) && perfectCount >= 50) {
        const p4Lvl = getPetLevel(4);
        const p4Config = PET_BALANCING.pets.find(p => p.id === 4);
        const multiplier = p4Config ? p4Config.stats[Math.min(p4Lvl - 1, p4Config.stats.length - 1)] : 2.0;
        points = Math.round(points * multiplier);
        judgeText = 'SUPER PERFECT';
        judgeColor = '#f43f5e';
        petContributions.pet4 += Math.round(40 * (multiplier - 1.0));
      }

      perfectCount++;
    } else if (result === 'great') {
      judgeText = 'GREAT';
      judgeColor = '#facc15';
      points = 30;
      greatCount++;
    } else if (result === 'good') {
      judgeText = 'GOOD';
      judgeColor = '#22d3ee';
      points = 20;
      goodCount++;
    } else {
      judgeText = 'MISS';
      judgeColor = '#94a3b8';
      points = 0;
      missCount++;
      combo = 0;
    }

    if (note.isSpecial200) {
      const p1Lvl = getPetLevel(1);
      const p1Config = PET_BALANCING.pets.find(p => p.id === 1);
      points = p1Config ? p1Config.stats[Math.min(p1Lvl - 1, p1Config.stats.length - 1)] : 200;
      judgeText = 'GOLDEN NOTE';
      judgeColor = '#facc15';
      petContributions.pet1 += points;
    }

    if (isPetActive(3) && pet3HitsCount < pet3Max && points > 0) {
      const bonus = points * 4;
      points += bonus;
      pet3HitsCount++;
      petContributions.pet3 += bonus;
      judgeText = `${judgeText} x5!`;
      judgeColor = '#a855f7';
    }

    // PetId >= 6 onward abilities are TemplateAbility: +1 point per note hit
    for (let pId = 6; pId <= 12; pId++) {
      if (isPetActive(pId) && points > 0) {
        points += 1;
        if (!petContributions[`pet${pId}`]) petContributions[`pet${pId}`] = 0;
        petContributions[`pet${pId}`] += 1;
      }
    }

    const hitsPosTarget = canvas.height - 110;

    if (points > 0) {
      score += points;
      combo++;
      maxCombo = Math.max(maxCombo, combo);
      
      if (isPetActive(2) && combo > 0 && combo % 5 === 0) {
        const p2Lvl = getPetLevel(2);
        const p2Config = PET_BALANCING.pets.find(p => p.id === 2);
        const p2Bonus = p2Config ? p2Config.stats[Math.min(p2Lvl - 1, p2Config.stats.length - 1)] : 100;
        score += p2Bonus;
        spawnFloatingText(note.lane, hitsPosTarget - 55, `COMBO +${p2Bonus}`, '#f43f5e');
        petContributions.pet2 += p2Bonus;
      }

      spawnHitVfx(note.lane, hitsPosTarget, judgeColor, true);
    } else {
      spawnHitVfx(note.lane, hitsPosTarget, '#ef4444', false);
    }

    spawnFloatingText(note.lane, hitsPosTarget - 30, judgeText, judgeColor);
    
    keyHighlightList[note.lane] = true;
    setTimeout(() => { keyHighlightList[note.lane] = false; }, 80);

    updateHUD();
  };

  // Key Listeners references
  let handleKeyDownRef = null;

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

    gameFrame.innerHTML = `
      <div class="relative flex-grow flex flex-col justify-center items-center w-full px-6">
        <!-- Elegant Song Info Banner -->
        <div class="flex items-center gap-3 bg-black/45 backdrop-blur-md border border-white/10 rounded-2xl p-3 mb-6 w-full max-w-[280px]">
          <img src="${song.coverUrl}" class="w-12 h-12 object-cover rounded-xl border border-white/15 shadow-md shrink-0" />
          <div class="flex flex-col min-w-0 text-left">
            <span class="text-white font-black text-sm truncate leading-tight select-none">${song.title}</span>
            <span class="text-purple-300 font-bold text-[10px] truncate mt-0.5 select-none">${song.artist}</span>
          </div>
        </div>

        <!-- Center Start Area -->
        <div class="relative z-10 w-full flex items-center justify-center gap-4">
          <button id="prev-diff-btn" class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white active:scale-90 transition-all ${currentDiffIdx === 0 ? 'opacity-20 pointer-events-none' : ''}">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>

          <button id="start-game-btn" class="flex-grow max-w-[210px] h-48 bg-gradient-to-b from-purple-900/90 via-slate-900/90 to-black/90 rounded-3xl border-4 border-purple-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.75)] flex flex-col items-center justify-center group active:scale-95 transition-all ${isLocked ? 'grayscale opacity-50' : ''}">
            <span class="text-white font-black text-3xl uppercase tracking-tighter group-hover:scale-110 transition-transform">${isLocked ? 'LOCKED' : 'PLAY'}</span>
            <span class="text-white/50 font-bold text-[9px] mt-1.5 tracking-widest">${getClampedNoteCount()} NOTES</span>
            ${isLocked ? '<svg class="w-6 h-6 text-white mt-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>' : ''}
          </button>

          <button id="next-diff-btn" class="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center text-white active:scale-90 transition-all ${currentDiffIdx === levels.length - 1 ? 'opacity-20 pointer-events-none' : ''}">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </button>
        </div>
      </div>
    `;

    gameFrame.querySelector('#prev-diff-btn').onclick = () => {
      if (currentDiffIdx > 0) {
        currentDiffIdx--;
        updateTheme();
        renderStartingUI();
      }
    };

    gameFrame.querySelector('#next-diff-btn').onclick = () => {
      if (currentDiffIdx < levels.length - 1) {
        currentDiffIdx++;
        updateTheme();
        renderStartingUI();
      }
    };

    const startBtn = gameFrame.querySelector('#start-game-btn');
    startBtn.onclick = () => {
      if (!isLocked) {
        startRhythmGame();
      }
    };

    if (showNewUnlockVFX) {
      playSongCardNewDifficultyUnlockedVFX(startBtn);
    }
  };

  const triggerCountdown = (onCountdownComplete) => {
    gameState = 'countdown';
    let countdownLeft = 3;
    const banner = gameFrame.querySelector('#countdown-banner');
    if (banner) {
      banner.innerHTML = "3";
      banner.classList.remove('opacity-0');
      banner.style.transform = 'scale(1.5)';
    }

    onCountdownCompleteCallback = onCountdownComplete;
    if (countdownIntervalId) clearInterval(countdownIntervalId);

    countdownIntervalId = setInterval(() => {
      countdownLeft--;
      if (countdownLeft > 0) {
        if (banner) {
          banner.innerHTML = countdownLeft;
          banner.style.transform = 'scale(1.5)';
          setTimeout(() => { banner.style.transform = 'scale(1)'; }, 100);
        }
      } else if (countdownLeft === 0) {
        if (banner) {
          banner.innerHTML = "GO!";
          banner.style.transform = 'scale(1.8)';
          setTimeout(() => { banner.style.transform = 'scale(1)'; }, 100);
        }
      } else {
        clearInterval(countdownIntervalId);
        countdownIntervalId = null;
        if (banner) {
          banner.classList.add('opacity-0');
        }
        gameState = 'playing';
        onCountdownCompleteCallback = null;
        if (onCountdownComplete) onCountdownComplete();
      }
    }, 800);
  };

  const startRhythmGame = () => {
    gameState = 'countdown';
    updateTheme();
    gameFrame.innerHTML = ''; // Clear StartingUI    // Setup HUD overlay structure
    const level = levels[currentDiffIdx];
    totalNotes = getClampedNoteCount();
    const maxScore = totalNotes * 40;
    
    const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
    const journey = getStarJourneyLevelAndProgress(totalStars);
    const maxStarsAllowed = journey.level < 4 ? 3 : 6;

    // Reset speed parameters for a fresh track play
    speedModeState = 'normal';
    speed2xCompleted = false;
    speed3xCompleted = false;
    normalNotesCount = totalNotes;
    totalNotesPlayedAcrossRuns = totalNotes;
    normalNoteSpeed = 5; // Default standard fall speed
    noteSpeed = 5;

    let countdownLeft = 3;
    const scoreElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.score) || STAGE_ELEMENTS[15];

    gameFrame.innerHTML = `
      ${bgDecor}
      <div class="absolute inset-0 flex flex-col justify-between p-4 z-10 select-none pb-12 pointer-events-none">
        
        <!-- Live HUD Header -->
        <div class="flex justify-between items-start pt-6">
          <div class="flex flex-col p-2.5 rounded-xl border backdrop-blur-sm shadow-md transition-all ${scoreElem.style.bg}">
            <span class="text-white/40 text-[9px] font-black tracking-widest uppercase mb-0.5">SCORE</span>
            <span id="live-score-text" class="font-extrabold text-xl tracking-wider leading-none ${scoreElem.style.fontClass}">000,000</span>
            <span id="live-combo-text" class="text-fuchsia-400 font-black text-xs uppercase tracking-widest mt-1">0 COMBO</span>
          </div>

          <!-- Realtime Progress bar and Stars indicators -->
          <div class="flex flex-col items-center flex-1 max-w-[160px] px-2">
            <div class="w-full bg-black/40 h-2.5 rounded-full border border-white/10 p-0.5 flex relative items-center mb-1 overflow-hidden">
                <div id="live-progress-bar" class="bg-gradient-to-r from-cyan-400 to-fuchsia-500 h-full w-0 rounded-full transition-all duration-300"></div>
            </div>
            <div class="flex gap-0.5" id="realtime-stars">
              ${Array.from({length: maxStarsAllowed}).map((_, s) => `
                <svg id="star-rt-${s}" class="w-4 h-4 text-white/10 transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              `).join('')}
            </div>
          </div>

          <!-- Difficulty and Skip HUD -->
          <div class="text-right flex flex-col items-end">
            <button id="skip-gameplay-btn" class="pointer-events-auto bg-black/45 hover:bg-black/70 active:scale-95 text-white/90 border border-white/20 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase mb-1.5 transition-all shadow-md">
              Skip (S) ➔
            </button>
            <span class="text-white/40 text-[9px] font-black tracking-widest uppercase block">DIFFICULTY</span>
            <span class="text-cyan-400 font-extrabold text-sm italic uppercase tracking-wider">${DIFFICULTY_MAP[level]} (LV.${level})</span>
            <span id="hud-speed-info" class="text-yellow-400 font-extrabold text-[10px] tracking-widest uppercase mt-0.5 hidden">⚡ SPEED 2x</span>
          </div>
        </div>

        <!-- Center Countdown/Flash Panel -->
        <div class="flex-1 flex items-center justify-center pointer-events-none">
          <div id="countdown-banner" class="text-8xl font-black text-white italic tracking-tighter drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] transform scale-150 transition-all duration-300">3</div>
        </div>

        <!-- On Screen Hit Zones and Input cues (Perfect for touch interactions) -->
        <div class="absolute inset-x-0 bottom-6 h-40 flex px-4 gap-3 pointer-events-auto">
          <div id="touchpad-0" class="flex-1 flex flex-col justify-end items-center pb-4 cursor-pointer active:bg-white/10 rounded-2xl transition-all border border-transparent active:border-white/20 select-none">
            <span class="text-white text-[10px] font-black opacity-30 select-none">1</span>
          </div>
          <div id="touchpad-1" class="flex-1 flex flex-col justify-end items-center pb-4 cursor-pointer active:bg-white/10 rounded-2xl transition-all border border-transparent active:border-white/20 select-none">
            <span class="text-white text-[10px] font-black opacity-30 select-none">2</span>
          </div>
          <div id="touchpad-2" class="flex-1 flex flex-col justify-end items-center pb-4 cursor-pointer active:bg-white/10 rounded-2xl transition-all border border-transparent active:border-white/20 select-none">
            <span class="text-white text-[10px] font-black opacity-30 select-none">3</span>
          </div>
          <div id="touchpad-3" class="flex-1 flex flex-col justify-end items-center pb-4 cursor-pointer active:bg-white/10 rounded-2xl transition-all border border-transparent active:border-white/20 select-none">
            <span class="text-white text-[10px] font-black opacity-30 select-none">4</span>
          </div>
        </div>
      </div>
    `;

    // Reattach canvas elements
    gameFrame.appendChild(canvas);

    // Recreate notes structure & constants
    score = 0;
    petContributions = {
      pet1: 0,
      pet2: 0,
      pet3: 0,
      pet4: 0,
      pet5: 0,
      pet6: 0,
      pet7: 0,
      pet8: 0,
      pet9: 0,
      pet10: 0,
      pet11: 0,
      pet12: 0
    };
    combo = 0;
    maxCombo = 0;
    perfectCount = 0;
    greatCount = 0;
    goodCount = 0;
    missCount = 0;
    notesSpawned = 0;
    notesList = [];
    particlesList = [];
    floatingTexts = [];
    spawnCounter = 0;
    isSkipping = false;
    accuracyHistory = [];
    skipAccuracyIndex = 0;

    const banner = gameFrame.querySelector('#countdown-banner');
    
    // Setup Pointer Interactivity for pads
    for (let i = 0; i < 4; i++) {
      const touchpad = gameFrame.querySelector(`#touchpad-${i}`);
      if (touchpad) {
         touchpad.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          keyHighlightList[i] = true;
          handleLaneInput(i);
          setTimeout(() => { keyHighlightList[i] = false; }, 100);
        });
      }
    }

    const skipBtn = gameFrame.querySelector('#skip-gameplay-btn');
    if (skipBtn) {
      skipBtn.addEventListener('click', (e) => {
        e.preventDefault();
        activateSkipState();
      });
    }

    // Run initial countdown
    triggerCountdown();

    // Initialise Keyboard Input matching lanes 1, 2, 3, 4
    handleKeyDownRef = (e) => {
      if (gameState !== 'playing') return;
      
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        activateSkipState();
        return;
      }

      let laneIndex = -1;
      if (e.key === '1') laneIndex = 0;
      else if (e.key === '2') laneIndex = 1;
      else if (e.key === '3') laneIndex = 2;
      else if (e.key === '4') laneIndex = 3;

      if (laneIndex !== -1) {
        e.preventDefault();
        keyHighlightList[laneIndex] = true;
        handleLaneInput(laneIndex);
        setTimeout(() => { keyHighlightList[laneIndex] = false; }, 80);
      }
    };
    window.addEventListener('keydown', handleKeyDownRef);
  };

  const handleLaneInput = (laneIndex) => {
    if (isSkipping) return;
    const hitsPosTarget = canvas.height - 110;
    // Find active notes in the target lane
    const activeNotes = notesList.filter(n => n.lane === laneIndex && n.active);
    if (activeNotes.length === 0) {
      // Small sparks on keyboard smash even if no notes
      spawnHitVfx(laneIndex, hitsPosTarget, 'rgba(255,255,255,0.3)', false);
      return;
    }

    // Capture the nearest note to the target line
    let closestNote = null;
    let minDistance = Infinity;

    for (let note of activeNotes) {
      let distance = Math.abs(note.y - hitsPosTarget);
      if (distance < minDistance) {
        minDistance = distance;
        closestNote = note;
      }
    }

    if (closestNote && minDistance < 100) {
      closestNote.active = false;
      
      const p3Lvl = getPetLevel(3);
      const p3Config = PET_BALANCING.pets.find(p => p.id === 3);
      const pet3Max = p3Config ? p3Config.stats[Math.min(p3Lvl - 1, p3Config.stats.length - 1)] : 10;

      let judgeText = '';
      let judgeColor = '';
      let points = 0;

      if (minDistance <= 22) {
        judgeText = 'PERFECT';
        judgeColor = '#f472b6'; // Magenta pink
        points = 40;
        accuracyHistory.push('perfect');

        // Pet 4: after 50 perfects, subsequent perfects give scaled score multiplier
        if (isPetActive(4) && perfectCount >= 50) {
          const p4Lvl = getPetLevel(4);
          const p4Config = PET_BALANCING.pets.find(p => p.id === 4);
          const multiplier = p4Config ? p4Config.stats[Math.min(p4Lvl - 1, p4Config.stats.length - 1)] : 2.0;
          points = Math.round(points * multiplier);
          judgeText = 'SUPER PERFECT';
          judgeColor = '#f43f5e'; // Flame rose
          petContributions.pet4 += Math.round(40 * (multiplier - 1.0));
        }

        perfectCount++;
      } else if (minDistance <= 48) {
        judgeText = 'GREAT';
        judgeColor = '#facc15'; // Golden yellow
        points = 30;
        greatCount++;
        accuracyHistory.push('great');
      } else if (minDistance <= 78) {
        judgeText = 'GOOD';
        judgeColor = '#22d3ee'; // Bright Cyan-blue
        points = 20;
        goodCount++;
        accuracyHistory.push('good');
      } else {
        judgeText = 'MISS';
        judgeColor = '#94a3b8'; // SLATE / gray
        points = 0;
        missCount++;
        combo = 0;
        accuracyHistory.push('miss');
      }

      // Override points and text for special note hit (Pet 1 - Golden note)
      if (closestNote.isSpecial200) {
        const p1Lvl = getPetLevel(1);
        const p1Config = PET_BALANCING.pets.find(p => p.id === 1);
        points = p1Config ? p1Config.stats[Math.min(p1Lvl - 1, p1Config.stats.length - 1)] : 200;
        judgeText = 'GOLDEN NOTE';
        judgeColor = '#facc15';
        petContributions.pet1 += points;
      }

      // Pet 3: The first 10 hit notes of the play are worth 5x points
      if (isPetActive(3) && pet3HitsCount < pet3Max && points > 0) {
        const bonus = points * 4; // x5 means original + 4x bonus points
        points += bonus;
        pet3HitsCount++;
        petContributions.pet3 += bonus;
        judgeText = `${judgeText} x5!`;
        judgeColor = '#a855f7'; // Purple gold glow
      }

      // PetId >= 6 onward abilities are TemplateAbility: +1 point per note hit
      for (let pId = 6; pId <= 12; pId++) {
        if (isPetActive(pId) && points > 0) {
          points += 1;
          if (!petContributions[`pet${pId}`]) petContributions[`pet${pId}`] = 0;
          petContributions[`pet${pId}`] += 1;
        }
      }

      if (points > 0) {
        score += points;
        combo++;
        maxCombo = Math.max(maxCombo, combo);
        
        // Pet 2: add scaled bonus pts every 5 combos
        if (isPetActive(2) && combo > 0 && combo % 5 === 0) {
          const p2Lvl = getPetLevel(2);
          const p2Config = PET_BALANCING.pets.find(p => p.id === 2);
          const p2Bonus = p2Config ? p2Config.stats[Math.min(p2Lvl - 1, p2Config.stats.length - 1)] : 100;
          score += p2Bonus;
          spawnFloatingText(laneIndex, hitsPosTarget - 55, `COMBO +${p2Bonus}`, '#f43f5e');
          petContributions.pet2 += p2Bonus;
        }

        spawnHitVfx(laneIndex, hitsPosTarget, judgeColor, true);
      } else {
        spawnHitVfx(laneIndex, hitsPosTarget, '#ef4444', false);
      }

      spawnFloatingText(laneIndex, hitsPosTarget - 30, judgeText, judgeColor);
      updateHUD();
    }
  };

  const spawnHitVfx = (lane, y, color, rich) => {
    const laneCount = 4;
    const padding = 16;
    const gap = 12;
    const availableWidth = canvas.width - (padding * 2);
    const laneWidth = (availableWidth - (gap * (laneCount - 1))) / laneCount;
    const x = padding + lane * (laneWidth + gap) + laneWidth/2;

    const vfxElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.vfx) || STAGE_ELEMENTS[10];

    if (vfxElem && vfxElem.id !== 'vfx-default') {
      triggerHitVfx(particlesList, x, y, vfxElem);
    } else {
      const count = rich ? 16 : 6;
      for (let i = 0; i < count; i++) {
        particlesList.push({
          x: x,
          y: y,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 2,
          color: color,
          size: Math.random() * 4 + 2,
          life: 20,
          maxLife: 20
        });
      }
    }
  };

  const spawnFloatingText = (lane, y, text, color) => {
    const laneCount = 4;
    const padding = 16;
    const gap = 12;
    const availableWidth = canvas.width - (padding * 2);
    const laneWidth = (availableWidth - (gap * (laneCount - 1))) / laneCount;
    const x = padding + lane * (laneWidth + gap) + laneWidth/2;

    // Check if there is an existing text in similar position, push standard index layout
    floatingTexts.push({
      x,
      y,
      text: text,
      color: color,
      scale: 1.0,
      life: 28,
      maxLife: 28
    });
  };

  const updateHUD = () => {
    const scoreText = gameFrame.querySelector('#live-score-text');
    const comboText = gameFrame.querySelector('#live-combo-text');
    const progressBar = gameFrame.querySelector('#live-progress-bar');

    if (scoreText) {
      scoreText.innerHTML = score.toLocaleString('en-US', { minimumIntegerDigits: 6, useGrouping: false });
    }
    if (comboText) {
      comboText.innerHTML = combo > 0 ? `${combo}x COMBO` : '';
    }
    if (progressBar) {
      const progressRatio = totalNotes > 0 ? Math.min((notesList.filter(n => !n.active).length / totalNotes) * 100, 100) : 0;
      progressBar.style.width = `${progressRatio}%`;
    }

    // Realtime stars computation
    const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
    const journey = getStarJourneyLevelAndProgress(totalStars);
    const maxStarsAllowed = journey.level < 4 ? 3 : 6;

    const notesDone = notesList.filter(n => !n.active).length;
    const isHalfDone = (notesDone >= totalNotes * 0.5);
    const isFinished = (notesDone >= totalNotes);
    const isPerfect50 = (perfectCount >= totalNotes * 0.5);
    const speed2ActiveOrDone = speed2xCompleted || (speedModeState === 'speed2x');
    const speed3ActiveOrDone = speed3xCompleted || (speedModeState === 'speed3x');
    const isCombo100 = (maxCombo >= totalNotes);

    let earnedStars = 0;
    if (isHalfDone) earnedStars++; // Star 1
    if (isFinished) earnedStars++; // Star 2
    if (isPerfect50) earnedStars++; // Star 3
    
    if (maxStarsAllowed >= 6) {
      if (speed2ActiveOrDone && isFinished) earnedStars++; // Star 4
      if (speed3ActiveOrDone && isFinished) earnedStars++; // Star 5
      if (isCombo100 && isFinished) earnedStars++; // Star 6
    }
    earnedStars = Math.min(earnedStars, maxStarsAllowed);

    for (let s = 0; s < maxStarsAllowed; s++) {
      const starSvg = gameFrame.querySelector(`#star-rt-${s}`);
      if (starSvg) {
        if (s < earnedStars) {
          starSvg.classList.add('text-yellow-400', 'drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]');
          starSvg.classList.remove('text-white/10');
        } else {
          starSvg.classList.remove('text-yellow-400', 'drop-shadow-[0_0_5px_rgba(250,204,21,0.6)]');
          starSvg.classList.add('text-white/10');
        }
      }
    }
  };

  // Rendering Game Engine frames
  const runGameUpdate = () => {
    if (gameState === 'ended') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState === 'idle') {
      requestAnimationFrame(runGameUpdate);
      return;
    }

    const laneCount = 4;
    const padding = 16;
    const gap = 12;
    const availableWidth = canvas.width - (padding * 2);
    const laneWidth = (availableWidth - (gap * (laneCount - 1))) / laneCount;
    const targetY = canvas.height - 110;

    const bgElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.background) || STAGE_ELEMENTS[0];
    const noteElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.note) || STAGE_ELEMENTS[5];
    const vfxElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.vfx) || STAGE_ELEMENTS[10];
    const scoreElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.score) || STAGE_ELEMENTS[15];
    const accElem = STAGE_ELEMENTS.find(el => el.id === state.equippedStageElements.accuracy) || STAGE_ELEMENTS[20];

    window.gameplayBackgroundTimer = (window.gameplayBackgroundTimer || 0) + 1;
    drawSimulationBackground(ctx, canvas.width, canvas.height, bgElem, window.gameplayBackgroundTimer, laneCount, canvas.width / 4, targetY);

    // 1. Draw solid sleek vertical lanes
    for (let i = 0; i < laneCount; i++) {
      const x = padding + i * (laneWidth + gap);
      const startY = 120;
      const h = canvas.height - startY - 70;

      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;

      // Lane base
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, startY, laneWidth, h, 16);
      } else {
        ctx.rect(x, startY, laneWidth, h);
      }
      ctx.fill();
      ctx.stroke();

      // Active keystrokes glow flashes
      if (keyHighlightList[i]) {
        const highlightGrad = ctx.createLinearGradient(x, startY, x, targetY);
        highlightGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        highlightGrad.addColorStop(0.8, 'rgba(255, 255, 255, 0.08)');
        highlightGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
        ctx.fillStyle = highlightGrad;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(x, startY, laneWidth, h, 16);
        } else {
          ctx.rect(x, startY, laneWidth, h);
        }
        ctx.fill();
      }
    }

    // 2. Draw Target Nodes rings inside lanes
    for (let i = 0; i < laneCount; i++) {
      const padCenterX = padding + i * (laneWidth + gap) + laneWidth/2;
      
      ctx.beginPath();
      ctx.arc(padCenterX, targetY, 22, 0, Math.PI * 2);
      ctx.strokeStyle = keyHighlightList[i] ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = keyHighlightList[i] ? 4 : 2.5;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      ctx.stroke();

      // Outer aesthetic glowing radar circle
      ctx.beginPath();
      ctx.arc(padCenterX, targetY, 28, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Spawning notes timer
    if (gameState === 'playing') {
      if (isSkipping) {
        // Spawn on every frame under skip/auto-play mode
        if (notesSpawned < totalNotes) {
          const lane = Math.floor(Math.random() * 4);
          const isSpecial200 = (isPetActive(1) && Math.random() < 0.10);
          notesList.push({
            id: notesSpawned,
            lane: lane,
            y: 100, // Starts at top lane entry
            active: true,
            isSpecial200: isSpecial200
          });
          notesSpawned++;
        }
      } else {
        const level = levels[currentDiffIdx];
        const spawnInterval = [40, 33, 27, 22, 18, 15][Math.min(level - 1, 5)];

        spawnCounter++;
        if (spawnCounter >= spawnInterval && notesSpawned < totalNotes) {
          spawnCounter = 0;
          
          // Decide random landing lane
          const lane = Math.floor(Math.random() * 4);
          const isSpecial200 = (isPetActive(1) && Math.random() < 0.10);
          notesList.push({
            id: notesSpawned,
            lane: lane,
            y: 100, // Starts at top lane entry
            active: true,
            isSpecial200: isSpecial200
          });
          notesSpawned++;
        }
      }
    }

    // 3. Update & render falling notes
    // Set colors according to difficulty level themes
    const activeLevel = levels[currentDiffIdx];
    let noteStrokeColor = '#00f0ff';
    
    if (activeLevel >= 5) {
      noteStrokeColor = '#ff0844';
    } else if (activeLevel >= 3) {
      noteStrokeColor = '#facc15';
    }

    for (let note of notesList) {
      if (!note.active) continue;

      // Note y delta increments
      note.y += noteSpeed;

      // Auto hit under skip/auto-play mode
      if (isSkipping && note.y >= targetY) {
        autoHitNote(note);
        continue;
      }

      // Miss boundary threshold check
      if (note.y > targetY + 68) {
        note.active = false;
        missCount++;
        combo = 0;
        if (!isSkipping) {
          accuracyHistory.push('miss');
        }
        spawnFloatingText(note.lane, targetY, 'MISS', '#94a3b8');
        updateHUD();
        continue;
      }

      // Draw notes visual (customized pill-shaped notes)
      const noteCenterX = padding + note.lane * (laneWidth + gap) + laneWidth/2;
      const noteW = laneWidth - 6;
      const noteH = 14;

      // Special note overlay overrides
      let drawStyle = { ...noteElem };
      if (note.isSpecial200) {
        drawStyle.style = {
          ...drawStyle.style,
          color: '#facc15',
          fillColor: '#271901',
          strokeColor: '#ffffff',
          strokeWidth: 3,
          shadowColor: '#facc15'
        };
      } else if (noteElem.id === 'note-default') {
        // Simple black note matches the selected difficulty level's neon theme!
        drawStyle.style = {
          ...drawStyle.style,
          strokeColor: noteStrokeColor,
          color: noteStrokeColor
        };
      }

      drawNoteVisual(ctx, noteCenterX, note.y, drawStyle, noteW, noteH);

      // Draw glossy 200 marker inner label
      if (note.isSpecial200) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'black 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('200', noteCenterX, note.y);
      }
    }

    // 4. Update particles bursts list
    for (let p of particlesList) {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      
      const lifeRatio = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = lifeRatio;

      if (p.type) {
        // Custom particle rendering logic from StageCustomizer
        if (p.type === 'splash') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'stars') {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          const rot = Math.PI / 2 * 3;
          let sx = p.x, sy = p.y;
          const outerRadius = p.size;
          const innerRadius = p.size * 0.4;
          const step = Math.PI / 5;
          for (let i = 0; i < 10; i++) {
            const r = (i % 2 === 0) ? outerRadius : innerRadius;
            const currAngle = rot + i * step;
            sx = p.x + Math.cos(currAngle) * r;
            sy = p.y + Math.sin(currAngle) * r;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (p.type === 'ripple') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (1 + (p.maxLife - p.life) / p.maxLife), 0, Math.PI * 2);
          ctx.stroke();
        } else if (p.type === 'flare') {
          const beamWidth = 6 * lifeRatio;
          ctx.fillStyle = p.color;
          ctx.fillRect(p.x - beamWidth / 2, 0, beamWidth, canvas.height);
        } else if (p.type === 'lightning') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.size;
          ctx.beginPath();
          ctx.moveTo(p.startX, p.startY);
          p.coords.forEach((pt, k) => {
            ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();
        }
      } else {
        // Standard default particle rendering
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * lifeRatio, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
    particlesList = particlesList.filter(p => p.life > 0);

    // 5. Render floating text judgements popups
    for (let txt of floatingTexts) {
      txt.y -= 0.8; // Floating speed
      txt.life--;

      const textLifeRatio = txt.life / txt.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, textLifeRatio);

      const isNoteAccuracyText = ['PERFECT', 'GREAT', 'GOOD'].includes(txt.text);
      if (isNoteAccuracyText && accElem && accElem.id !== 'accuracy-default') {
        drawStyledAccuracyText(ctx, txt.text, txt.x, txt.y, accElem);
      } else {
        ctx.fillStyle = txt.color;
        ctx.shadowColor = txt.color;
        ctx.shadowBlur = 10;
        ctx.font = 'italic 900 18px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(txt.text, txt.x, txt.y);
      }
      
      ctx.restore();
      ctx.shadowBlur = 0;
    }
    floatingTexts = floatingTexts.filter(t => t.life > 0);

    // End Condition Match (Ensure all notes spawned have run dry/inactive)
    if (gameState === 'playing' && notesSpawned === totalNotes && notesList.every(n => !n.active)) {
      const triggerFinishedSequence = () => {
        gameState = 'ended';
        
        // Cleanup events
        if (handleKeyDownRef) {
          window.removeEventListener('keydown', handleKeyDownRef);
          handleKeyDownRef = null;
        }

        let achievedScore = score;
        if (isPetActive(5)) {
          const p5Lvl = getPetLevel(5);
          const p5Config = PET_BALANCING.pets.find(p => p.id === 5);
          const accuracyVal = (perfectCount + greatCount * 0.75 + goodCount * 0.5) / (totalNotesPlayedAcrossRuns || 1);
          const finalBlowPoints = Math.round((p5Config ? p5Config.stats[Math.min(p5Lvl - 1, p5Config.stats.length - 1)] : 30) * 100 * accuracyVal);
          achievedScore += finalBlowPoints;
          petContributions.pet5 = finalBlowPoints;
        }

        const finalPerformanceStats = {
          score: achievedScore,
          perfectCount,
          greatCount,
          goodCount,
          missCount,
          maxCombo,
          starLevel: 0, // calculated in index.js to support historic tasks logic
          totalNotes: totalNotesPlayedAcrossRuns,
          speed2xCompleted,
          speed3xCompleted,
          completedTasksInPlay: [
            true, // Task 1: start the song
            true, // Task 2: reach the end of the song
            perfectCount >= normalNotesCount * 0.5, // Task 3: hit 50% perfect
            speed2xCompleted, // Task 4: complete 2x speed mode
            speed3xCompleted, // Task 5: complete 3x speed mode
            maxCombo >= normalNotesCount * 1.0 // Task 6: reach 100% combo
          ],
          petContributions
        };

        // Show stylized FINISHED text overlay
        const finishedOverlay = document.createElement('div');
        finishedOverlay.className = "absolute inset-0 z-[300] bg-black/60 flex items-center justify-center animate-in zoom-in duration-300 select-none pointer-events-none";
        finishedOverlay.innerHTML = `
          <div class="text-center">
            <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-cyan-400 italic uppercase tracking-widest drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] animate-pulse">
              FINISHED
            </h1>
            <p class="text-white/60 font-black text-[10px] tracking-widest mt-2 uppercase">Generating Results...</p>
          </div>
        `;
        gameFrame.appendChild(finishedOverlay);

        setTimeout(() => {
          container.classList.add('animate-out', 'fade-out', 'duration-300');
          setTimeout(() => {
            if (container.cleanup) container.cleanup();
            container.remove();
            if (onFinish) onFinish(currentDiffIdx, finalPerformanceStats);
          }, 300);
        }, 1000);
      };

      const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
      const journey = getStarJourneyLevelAndProgress(totalStars);
      const isSpeedUnlocked = journey.level >= 4;

      if (speedModeState === 'normal') {
        if (isSpeedUnlocked) {
          gameState = 'prompting_speed';
          state.stats.totalAdCount = (state.stats.totalAdCount || 0) + 1;
          
          const promptOverlay = document.createElement('div');
          promptOverlay.id = 'speed-mode-prompt';
          promptOverlay.className = "absolute inset-0 bg-black/85 flex items-center justify-center p-6 z-[350] animate-in fade-in duration-300 pointer-events-auto select-none";
          promptOverlay.innerHTML = `
            <div class="text-center bg-[#150a30] border-2 border-indigo-500/30 p-6 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.5)] max-w-[280px] hover:scale-105 transition-transform duration-300">
              <div class="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-yellow-400 via-pink-500 to-rose-600 flex items-center justify-center text-3xl mb-3 shadow-[0_4px_12px_rgba(244,63,94,0.3)] animate-bounce" style="animation-duration: 2s">
                ⚡
              </div>
              <h3 class="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-rose-500 italic uppercase tracking-wider mb-2">SPEED MODE?</h3>
              <p class="text-indigo-200/80 text-[10px] mb-6 tracking-wide leading-relaxed">
                Do you want to enter <strong class="text-cyan-400 uppercase">Speed Mode</strong>? Replay this track with notes falling <strong class="text-yellow-400 font-mono">2x FASTER</strong> to claim higher stars!
              </p>
              <div class="flex gap-3">
                <button id="speed-cancel-btn" class="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 font-black italic tracking-wide text-[10px] active:scale-95 transition-all">
                  CANCEL
                </button>
                <button id="speed-accept-btn" class="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 border-b-2 border-indigo-950 active:border-b-0 active:translate-y-[1px] hover:brightness-110 text-white font-black italic tracking-wide text-[10px] transition-all shadow-[0_4px_16px_rgba(34,211,238,0.3)]">
                  ACCEPT
                </button>
              </div>
            </div>
          `;
          
          promptOverlay.querySelector('#speed-cancel-btn').onclick = (e) => {
            e.stopPropagation();
            promptOverlay.remove();
            triggerFinishedSequence();
          };

          promptOverlay.querySelector('#speed-accept-btn').onclick = (e) => {
            e.stopPropagation();
            promptOverlay.remove();
            
            // Switch to 2x Speed Mode!
            speedModeState = 'speed2x';
            noteSpeed = normalNoteSpeed * 2;
            
            // Reset spawners for replay run
            notesSpawned = 0;
            notesList = [];
            spawnCounter = 0;
            
            isSkipping = false;
            skipAccuracyIndex = 0;
            accuracyHistory = [];
            
            const skipBtn = gameFrame.querySelector('#skip-gameplay-btn');
            if (skipBtn) {
              skipBtn.innerHTML = "Skip (S) ➔";
              skipBtn.className = "pointer-events-auto bg-black/45 hover:bg-black/70 active:scale-95 text-white/90 border border-white/20 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase mb-1.5 transition-all shadow-md";
            }

            // Add standard notes count for run
            totalNotesPlayedAcrossRuns += normalNotesCount;
            
            // Update speed label on HUD
            const speedInfo = gameFrame.querySelector('#hud-speed-info');
            if (speedInfo) {
              speedInfo.innerHTML = '⚡ SPEED 2x';
              speedInfo.classList.remove('hidden');
            }
            
            triggerCountdown(() => {
              updateHUD();
            });
          };
          
          gameFrame.appendChild(promptOverlay);
        } else {
          triggerFinishedSequence();
        }
      } else if (speedModeState === 'speed2x') {
        // Complete 2x Speed Mode -> Automatically advance to 3x Speed Mode
        speed2xCompleted = true;
        speedModeState = 'speed3x';
        noteSpeed = normalNoteSpeed * 3;
        
        // Reset spawners for replay run
        notesSpawned = 0;
        notesList = [];
        spawnCounter = 0;
        
        isSkipping = false;
        skipAccuracyIndex = 0;
        accuracyHistory = [];

        const skipBtn = gameFrame.querySelector('#skip-gameplay-btn');
        if (skipBtn) {
          skipBtn.innerHTML = "Skip (S) ➔";
          skipBtn.className = "pointer-events-auto bg-black/45 hover:bg-black/70 active:scale-95 text-white/90 border border-white/20 rounded-full px-2.5 py-1 text-[9px] font-black tracking-wider uppercase mb-1.5 transition-all shadow-md";
        }

        // Add standard notes count for run
        totalNotesPlayedAcrossRuns += normalNotesCount;
        
        // Update speed label on HUD
        const speedInfo = gameFrame.querySelector('#hud-speed-info');
        if (speedInfo) {
          speedInfo.innerHTML = '⚡ SPEED 3x';
          speedInfo.className = 'text-rose-500 font-extrabold text-[10px] tracking-widest uppercase mt-0.5 animate-pulse';
          speedInfo.classList.remove('hidden');
        }
        
        triggerCountdown(() => {
          updateHUD();
        });
      } else if (speedModeState === 'speed3x') {
        speed3xCompleted = true;
        triggerFinishedSequence();
      }
    }

    requestAnimationFrame(runGameUpdate);
  };

  const handleResize = () => {
    canvas.width = gameFrame.clientWidth || 390;
    canvas.height = gameFrame.clientHeight || 700;
  };

  window.addEventListener('resize', handleResize);
  
  // Append gameFrame inside the blurred fullscreen container and initial append canvas
  container.appendChild(gameFrame);
  gameFrame.appendChild(canvas);

  renderStartingUI(showNewUnlockVFX);
  app.appendChild(container);

  // Trigger resize and startup game engine loops frames
  setTimeout(() => {
    handleResize();
    requestAnimationFrame(runGameUpdate);
  }, 50);

  // Expose global cleanups to remove active keyboard capture routines
  container.cleanup = () => {
    window.removeEventListener('resize', handleResize);
    if (handleKeyDownRef) {
      window.removeEventListener('keydown', handleKeyDownRef);
    }
  };
}
