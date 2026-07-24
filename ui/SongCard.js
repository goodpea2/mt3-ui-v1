import { state } from '../state.js';
import { getStarJourneyLevelAndProgress } from '../balance.js';

const DIFFICULTY_MAP = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Expert",
  5: "Extreme",
  6: "Hell"
};

export function getSongCardHtml(song, isExpanded) {
  const { 
    id, title, artist, level, score, 
    playCount = "15K", isDeluxe = false, isSotd = false, 
    coverUrl, starLevel, isLocked, coinCost = 1000
  } = song;

  // Ensure arrays
  const levels = Array.isArray(level) ? level : [level];
  const scores = Array.isArray(score) ? score : [score];
  const starLevels = Array.isArray(starLevel) ? starLevel : [starLevel];
  const isLockedArray = Array.isArray(isLocked) ? isLocked : [isLocked];

  // Always display the first available difficulty
  const activeDiffIdx = 0;
  const currentLevel = levels[0];

  const difficultyBadges = levels.map((l, idx) => {
    let color = "bg-blue-500";
    if (l >= 3 && l <= 4) color = "bg-yellow-500";
    else if (l >= 5) color = "bg-red-600";
    
    // First difficulty icon is always unlocked!
    const isLocked = idx === 0 ? false : isLockedArray[idx];
    const isActive = idx === activeDiffIdx; // always active for first
    
    return `
      <div class="${color} ${isLocked ? 'opacity-30 grayscale' : 'opacity-100'} ${isActive ? 'scale-110 font-bold' : 'scale-90'} w-4 h-4 flex items-center justify-center text-white text-[8px] font-black rounded-full shadow-sm shrink-0 transition-all">
        ${isLocked ? '<svg class="w-2 h-2" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>' : l}
      </div>
    `;
  }).join('');

  const sotdRibbon = isSotd ? `
    <div class="flex justify-end pr-2 -mb-2 relative z-20">
      <div class="bg-gradient-to-r from-pink-600 to-pink-400 text-white text-[9px] font-bold px-4 py-1 rounded-tl-xl rounded-tr-md flex items-center gap-2 shadow-lg">
        Daily free song - 12h16m
      </div>
    </div>
  ` : '';

  const boostRibbon = song.deluxeSongBoost ? `
    <div class="flex justify-end pr-2 -mb-2 relative z-20">
      <div class="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 text-[9px] font-extrabold px-3.5 py-1 rounded-tl-xl rounded-tr-md flex items-center gap-1.5 shadow-lg animate-pulse uppercase tracking-wider">
        🔥 DELUXE: ${song.deluxeSongBoost.buffType} 🔥
      </div>
    </div>
  ` : '';

  const containerClass = `song-card relative w-full rounded-xl overflow-hidden cursor-pointer h-[72px] border border-white/5 hover:border-[#a855f7]/30 transition-all duration-300 hover:scale-[1.015] shadow-lg`;
  
  const contentBg = isLockedArray[0]
    ? "bg-gradient-to-r from-zinc-700 to-zinc-800"
    : (isDeluxe 
        ? "bg-gradient-to-r from-[#5a1a1a] via-[#2d1b5e] to-[#1a0b3d]" 
        : "bg-gradient-to-r from-[#2d1b5e] to-[#1a0b3d]");

  // Right section logic based on user's requirements:
  // - the numbers of stars remaining available to collect (num⭐)
  // - show a check if all stars is collected
  // - show the coin item if the song is locked
  const totalStars = state.visualUser?.totalStars || state.user?.totalStars || 0;
  const journey = getStarJourneyLevelAndProgress(totalStars);
  const maxStarsPerDiff = journey.level < 4 ? 3 : 6;
  const maxStarsPoss = levels.length * maxStarsPerDiff;
  const totalCollected = starLevels.reduce((sum, current) => {
    return sum + Math.min(maxStarsPerDiff, current || 0);
  }, 0);
  const remainingStars = Math.max(0, maxStarsPoss - totalCollected);

  let rightSectionHtml = '';
  if (isLockedArray[0]) {
    rightSectionHtml = `
      <div class="flex items-center gap-1 bg-[#1a0b3d]/90 border border-cyan-500/30 rounded-xl px-2 py-1 shadow-md">
        <span class="text-[10.5px] leading-none mb-0.5">🔑</span>
        <span class="text-cyan-400 font-extrabold text-[10px] italic font-mono leading-none">${coinCost.toLocaleString()}</span>
      </div>
    `;
  } else if (remainingStars === 0) {
    rightSectionHtml = `
      <div class="w-7 h-7 bg-emerald-500/20 border border-emerald-400/50 rounded-full flex items-center justify-center text-emerald-400 font-black text-xs shadow-inner" title="All stars collected!">
        ✓
      </div>
    `;
  } else {
    rightSectionHtml = `
      <div class="flex items-center gap-1 border border-white/5 bg-[#12082b]/85 rounded-full px-2.5 py-1.5 shadow-md">
        <span class="text-indigo-200 font-black text-[11px] font-mono leading-none">${remainingStars}</span>
        <span class="text-yellow-400 text-[10px] leading-none">⭐</span>
      </div>
    `;
  }

  return `
    <div class="w-full card-wrapper" data-id="${id}">
      ${sotdRibbon || boostRibbon}
      <div onclick="window.openSongInfo('${id}', 0)" class="${containerClass}">
        ${isDeluxe ? '<div class="deluxe-sparkle"></div>' : ''}
        <div class="absolute inset-0 halftone-bg opacity-10 pointer-events-none"></div>
        
        <div class="relative h-full w-full ${contentBg} flex items-center py-1 px-2 gap-2.5 transition-colors duration-300">
          
          <div class="relative shrink-0 w-16 h-16">
            <img src="${coverUrl}" class="w-full h-full object-cover rounded-lg border border-white/20 shadow-md" />
          </div>

          <div class="flex-1 flex flex-col justify-center overflow-hidden h-full">
            <div class="flex items-center gap-1.5">
              ${isDeluxe ? `<span class="bg-red-600 text-white text-[6px] font-black px-1 py-0.5 rounded italic shrink-0">DELUXE</span>` : ''}
              <h4 class="text-white font-black text-xs truncate uppercase tracking-tight">${title}</h4>
            </div>
            
            <p class="text-purple-300/60 text-[9.5px] font-bold truncate mt-0.5">${artist}</p>
            
            <div class="flex items-center gap-2 mt-1">
              <div class="inline-flex items-center rounded-full bg-black/20 px-1.5 py-0.5 border border-white/5 h-4 gap-1">
                 <div class="flex gap-0.5 shrink-0">
                   ${difficultyBadges}
                 </div>
              </div>
            </div>
          </div>

          <div class="relative shrink-0 flex items-center justify-end pr-1">
            ${rightSectionHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}
