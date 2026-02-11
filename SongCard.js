
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
    ['star', 'empty', 'empty'],
    ['star', 'star', 'empty'],
    ['star', 'star', 'star'],
    ['crown', 'star', 'star'],
    ['crown', 'crown', 'star'],
    ['crown', 'crown', 'crown'],
  ];
  return configs[level] || configs[0];
};

const ICONS = {
  star: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`,
  crown: `<svg class="w-full h-full" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5M19 19C19 19.6 18.6 20 18 20H6C5.4 20 5 19.6 5 19V18H19V19Z" /></svg>`,
  empty: `<svg class="w-full h-full opacity-20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>`
};

export function getSongCardHtml(song, isExpanded) {
  const { 
    id, title, artist, level, score = 0, 
    playCount = "15K", isDeluxe = false, isSotd = false, 
    coverUrl, starLevel = 0 
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
  const starSizeClass = "w-6 h-6"; // Same for both states as requested
  const starsHtml = `
    <div class="flex gap-0.5 transition-all duration-300 ${isExpanded ? 'star-vfx' : ''}" style="color: ${levelHex}">
      ${starConfig.map(type => `
        <div class="${starSizeClass} transition-all duration-300">
          ${ICONS[type]}
        </div>
      `).join('')}
    </div>
  `;

  const sotdRibbon = isSotd ? `
    <div class="flex justify-end pr-2 -mb-2 relative z-20">
      <div class="bg-gradient-to-r from-pink-600 to-pink-400 text-white text-[9px] font-bold px-4 py-1 rounded-tl-xl rounded-tr-md flex items-center gap-2 shadow-lg">
        Daily free song - 12h16m
      </div>
    </div>
  ` : '';

  // Height is 80px collapsed, 100px expanded (1.25x)
  const cardHeightClass = isExpanded ? 'h-[100px]' : 'h-[80px]';
  const containerClass = `song-card relative w-full rounded-2xl overflow-hidden cursor-pointer ${cardHeightClass} ${isExpanded ? 'fancy-outline-container' : 'shadow-md'}`;
  
  let contentBg = isExpanded 
    ? (isDeluxe ? "bg-gradient-to-br from-yellow-50 via-white to-orange-100" : "bg-gradient-to-br from-white via-blue-50 to-blue-100")
    : (isDeluxe ? "bg-gradient-to-r from-[#5a1a1a] via-[#2d1b5e] to-[#1a0b3d]" : "bg-gradient-to-r from-[#2d1b5e] to-[#1a0b3d]");

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
                <div class="text-blue-500 font-black text-lg italic tracking-tighter leading-none">
                  ${score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div class="flex flex-col items-end justify-between h-full py-0.5 pr-1">
            ${starsHtml}
            
            <div class="transition-all duration-300 ${isExpanded ? 'opacity-100 h-8 translate-y-0' : 'opacity-0 h-0 translate-y-2 overflow-hidden'}">
              <button 
                id="play-btn-${id}"
                onclick="event.stopPropagation(); window.playSong('${id}')" 
                class="play-btn-vfx bg-gradient-to-b from-[#ff00ff] to-[#d400d4] text-white font-black italic text-xs px-5 py-1.5 rounded-xl border-b-2 border-[#960096] active:border-b-0 active:translate-y-[2px] transition-all shadow-lg"
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
