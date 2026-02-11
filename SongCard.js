
const DIFFICULTY_MAP = {
  1: "Easy",
  2: "Normal",
  3: "Hard",
  4: "Expert",
  5: "Extreme",
  6: "Hell"
};

const getStarConfig = (level) => {
  const configs = [
    ['empty', 'empty', 'empty'],
    ['empty', 'empty', 'star'],
    ['empty', 'star', 'star'],
    ['star', 'star', 'star'],
    ['star', 'star', 'crown'],
    ['star', 'crown', 'crown'],
    ['crown', 'crown', 'crown'],
  ];
  return configs[level] || configs[0];
};

const ICONS = {
  star: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`,
  crown: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>`,
  empty: `<svg class="w-full h-full opacity-20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`,
  coin: `<div class="w-3.5 h-3.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg shrink-0 border border-white/20"><span class="text-white font-black text-[8px] leading-none">$</span></div>`
};

export function getSongCardHtml(song, isExpanded) {
  const { 
    id, title, artist, level, score = 0, 
    playCount = "15K", isDeluxe = false, isSotd = false, 
    coverUrl, starLevel = 0, isLocked = false, coinCost = 1000
  } = song;

  const difficulty = DIFFICULTY_MAP[level];
  
  let levelColor = "bg-blue-500";
  let levelHex = "#3b82f6";
  if (level >= 3 && level <= 4) {
    levelColor = "bg-yellow-500";
    levelHex = "#eab308";
  } else if (level >= 5) {
    levelColor = "bg-red-600";
    levelHex = "#dc2626";
  }

  const starConfig = getStarConfig(starLevel);
  const starSizeClass = "w-6 h-6";

  const showStars = !isLocked && (isExpanded || (starLevel > 0));
  const starsHtml = showStars ? `
    <div class="flex gap-0.5 transition-all duration-300 ${isExpanded ? 'star-vfx' : ''}" style="color: ${levelHex}">
      ${starConfig.map(type => `
        <div class="${starSizeClass} transition-all duration-300">
          ${ICONS[type]}
        </div>
      `).join('')}
    </div>
  ` : '';

  const sotdRibbon = isSotd ? `
    <div class="flex justify-end pr-2 -mb-2 relative z-20">
      <div class="bg-gradient-to-r from-pink-600 to-pink-400 text-white text-[9px] font-bold px-4 py-1 rounded-tl-xl rounded-tr-md flex items-center gap-2 shadow-lg">
        Daily free song - 12h16m
      </div>
    </div>
  ` : '';

  const cardHeightClass = isExpanded ? 'h-[100px]' : 'h-[80px]';
  const containerClass = `song-card relative w-full rounded-2xl overflow-hidden cursor-pointer ${cardHeightClass} ${isExpanded ? 'fancy-outline-container' : 'shadow-md'}`;
  
  let contentBg = isExpanded 
    ? (isDeluxe ? "bg-gradient-to-br from-yellow-50 via-white to-orange-100" : "bg-gradient-to-br from-white via-blue-50 to-blue-100")
    : (isDeluxe ? "bg-gradient-to-r from-[#5a1a1a] via-[#2d1b5e] to-[#1a0b3d]" : "bg-gradient-to-r from-[#2d1b5e] to-[#1a0b3d]");

  const isButtonVisible = !isLocked && (isExpanded || starLevel === 0);

  // Locked specific buttons: Purchase is smaller and tinted purple
  const lockedButtons = isLocked ? `
    <div class="flex items-center gap-2">
      <button 
        id="purchase-btn-${id}"
        onclick="event.stopPropagation(); window.unlockWithCoins('${id}')"
        class="flex items-center gap-1.5 bg-gradient-to-b from-indigo-400 to-blue-600 text-white font-black italic text-[9px] px-2.5 py-1.5 rounded-xl border-b-2 border-indigo-900 active:border-b-0 active:translate-y-[1px] transition-all shadow-md group"
      >
        ${ICONS.coin}
        <span class="text-yellow-300 drop-shadow-sm">${coinCost.toLocaleString()}</span>
      </button>
      <button 
        id="free-btn-${id}"
        onclick="event.stopPropagation(); window.unlockWithAd('${id}')"
        class="flex items-center gap-1.5 bg-gradient-to-b from-cyan-400 to-blue-500 text-white font-black italic text-[11px] px-5 py-2 rounded-xl border-b-2 border-blue-900 active:border-b-0 active:translate-y-[1px] transition-all shadow-md"
      >
        <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
        FREE
      </button>
    </div>
  ` : '';

  return `
    <div class="w-full card-wrapper ${isExpanded ? 'expanded' : 'collapsed'}" data-id="${id}">
      ${sotdRibbon}
      <div onclick="window.toggleExpand('${id}')" class="${containerClass}">
        ${isExpanded && isDeluxe ? '<div class="deluxe-sparkle"></div>' : ''}
        <div class="absolute inset-0 halftone-bg opacity-10 pointer-events-none"></div>
        
        <div class="relative h-full w-full ${contentBg} flex items-center p-2.5 gap-3 transition-colors duration-300">
          
          <div class="relative shrink-0 transition-all duration-300 ${isExpanded ? 'w-20 h-20' : 'w-16 h-16'}">
            <img src="${coverUrl}" class="w-full h-full object-cover rounded-xl border border-white/40 shadow-md transition-all duration-300" />
            <div class="absolute inset-0 rounded-xl blur-md opacity-10 transition-opacity duration-300 ${isExpanded ? 'opacity-30' : 'opacity-0'}" style="background: ${levelHex}"></div>
          </div>

          <div class="flex-1 flex flex-col justify-center overflow-hidden h-full">
            <div class="flex items-center gap-1.5">
              ${isDeluxe ? `<span class="bg-red-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded italic shrink-0">DELUXE</span>` : ''}
              <h4 class="${isExpanded ? 'text-blue-900' : 'text-white'} font-black text-sm truncate uppercase tracking-tight transition-all duration-300">${title}</h4>
            </div>
            <p class="${isExpanded ? 'text-blue-400' : 'text-purple-300/60'} text-[10px] font-bold truncate transition-colors duration-300">${artist}</p>
            
            <div class="flex flex-col mt-1">
              <div class="flex items-center gap-2">
                <div class="inline-flex items-center rounded-full bg-black/5 overflow-hidden h-5 transition-all duration-300 ${isExpanded ? 'pr-3 border border-black/5' : 'w-5'}">
                   <div class="${levelColor} w-5 h-5 flex items-center justify-center text-white text-[9px] font-black rounded-full shadow-sm shrink-0">
                     ${level}
                   </div>
                   <div class="text-blue-900/80 px-2 py-0.5 text-[8px] font-black italic uppercase transition-all duration-300 overflow-hidden ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}">
                     ${difficulty}
                   </div>
                </div>

                <div class="flex items-center gap-1 text-[#4ade80] text-[9px] font-bold transition-all duration-300 ${isExpanded ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'}">
                  <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  ${playCount}
                </div>
              </div>
              
              <div class="transition-all duration-300 ${isExpanded ? 'h-5 opacity-100 mt-0.5' : 'h-0 opacity-0 overflow-hidden'}">
                <div class="font-black text-lg italic tracking-tighter leading-none ${isLocked ? 'text-purple-400/50' : 'text-blue-500'}">
                  ${isLocked ? 'LOCKED' : score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end justify-center gap-1.5 h-full py-0.5 pr-1">
            ${isLocked ? lockedButtons : starsHtml}
            
            <div class="transition-all duration-300 ${isButtonVisible ? 'opacity-100 h-10 translate-y-0' : 'opacity-0 h-0 translate-y-2 overflow-hidden'}">
              <button 
                id="play-btn-${id}"
                onclick="event.stopPropagation(); window.playSong('${id}')" 
                class="play-btn-vfx bg-gradient-to-b from-[#ff00ff] to-[#d400d4] text-white font-black italic text-sm px-8 py-2.5 rounded-2xl border-b-4 border-[#960096] active:border-b-0 active:translate-y-[2px] transition-all shadow-[0_10px_20px_-5px_rgba(255,0,255,0.4)]"
              >
                PLAY
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
