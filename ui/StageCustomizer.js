import { state } from '../state.js';
import { getDecoTicketCost } from '../decoShop.js';

// Define the 35 Stage elements (with 5 new light backgrounds and 5 new dark notes)
export const STAGE_ELEMENTS = [
  // Backgrounds: 1 Default Starfield + 5 other Dark ones + 5 new Light ones = 11 elements
  { id: 'bg-starting-star', type: 'background', name: 'Classic Starfield Canvas', cost: 0, scoreBonus: 0, style: { color: '#00d2ff', type: 'starting-star' } },
  { id: 'bg-default', type: 'background', name: 'Sleek Cyan Skyline', cost: 500, scoreBonus: 50, style: { color: '#00d2ff', type: 'gameplay-classic' } },
  { id: 'bg-nebula', type: 'background', name: 'Nebula Dust', cost: 500, scoreBonus: 50, style: { color: '#ec4899', type: 'nebula' } },
  { id: 'bg-laser', type: 'background', name: 'Laser Projector', cost: 1500, scoreBonus: 100, style: { color: '#06b6d4', type: 'laser' } },
  { id: 'bg-sunset', type: 'background', name: 'Retro Sunset Grid', cost: 1500, scoreBonus: 100, style: { color: '#f97316', type: 'sunset' } },
  { id: 'bg-void', type: 'background', name: 'Prism Void', cost: 4000, scoreBonus: 150, style: { color: '#10b981', type: 'void' } },
  
  // 5 New Light-Themed Backgrounds
  { id: 'bg-light-peach', type: 'background', name: 'Daybreak Peach Glow', cost: 500, scoreBonus: 50, style: { color: '#f43f5e', bgColor: '#fff1f2', type: 'light-peach' } },
  { id: 'bg-light-aurora', type: 'background', name: 'Pastel Aurora Dream', cost: 500, scoreBonus: 50, style: { color: '#0d9488', bgColor: '#f0fdfa', type: 'light-aurora' } },
  { id: 'bg-light-chalk', type: 'background', name: 'Monochrome Sketch', cost: 1500, scoreBonus: 100, style: { color: '#3f3f46', bgColor: '#fafafa', type: 'light-chalk' } },
  { id: 'bg-light-cherry', type: 'background', name: 'Cyber Blossom Grid', cost: 1500, scoreBonus: 100, style: { color: '#db2777', bgColor: '#fdf2f8', type: 'light-cherry' } },
  { id: 'bg-light-solar', type: 'background', name: 'Solar Horizon Morning', cost: 4000, scoreBonus: 150, style: { color: '#ca8a04', bgColor: '#fefbeb', type: 'light-solar' } },

  // Notes: 1 Default + 4 original ones + 5 new Dark ones = 10 elements
  // All updated to look like beautiful custom-styled pills
  { id: 'note-default', type: 'note', name: 'Classic Obsidian Pill', cost: 0, scoreBonus: 0, style: { shape: 'pill', color: '#00d2ff', fillColor: '#050505', strokeColor: '#00d2ff', strokeWidth: 2, pattern: 'none' } },
  { id: 'note-diamond', type: 'note', name: 'Diamond Star Prism', cost: 500, scoreBonus: 50, style: { shape: 'pill', color: '#a855f7', fillColor: '#1e0b36', strokeColor: '#a855f7', strokeWidth: 2, pattern: 'star-dot' } },
  { id: 'note-square', type: 'note', name: 'Retro Grid Square', cost: 500, scoreBonus: 50, style: { shape: 'pill', color: '#f43f5e', fillColor: '#2a0810', strokeColor: '#f43f5e', strokeWidth: 2, pattern: 'stripes' } },
  { id: 'note-star', type: 'note', name: 'Celestial Gold Star', cost: 1500, scoreBonus: 100, style: { shape: 'pill', color: '#eab308', fillColor: '#281c02', strokeColor: '#eab308', strokeWidth: 2.5, pattern: 'glass-sheen' } },
  { id: 'note-ring', type: 'note', name: 'Hyper Quantum Ring', cost: 1500, scoreBonus: 100, style: { shape: 'pill', color: '#10b981', fillColor: '#022415', strokeColor: '#10b981', strokeWidth: 2, pattern: 'eclipse' } },

  // 5 New Dark-Themed Notes (all styled as premium black/dark pills)
  { id: 'note-midnight', type: 'note', name: 'Midnight Onyx Pill', cost: 500, scoreBonus: 50, style: { shape: 'pill', color: '#8b5cf6', fillColor: '#090514', strokeColor: '#a78bfa', strokeWidth: 2, pattern: 'core-glow', shadowColor: '#8b5cf6' } },
  { id: 'note-carbon', type: 'note', name: 'Chrono Carbon Shield', cost: 500, scoreBonus: 50, style: { shape: 'pill', color: '#facc15', fillColor: '#111318', strokeColor: '#facc15', strokeWidth: 2.5, pattern: 'stripes', shadowColor: '#fbbf24' } },
  { id: 'note-eclipse', type: 'note', name: 'Crimson Eclipse Core', cost: 1500, scoreBonus: 100, style: { shape: 'pill', color: '#ef4444', fillColor: '#120205', strokeColor: '#f87171', strokeWidth: 2, pattern: 'eclipse', shadowColor: '#ef4444' } },
  { id: 'note-vortex', type: 'note', name: 'Vortex Void Core', cost: 4000, scoreBonus: 150, style: { shape: 'pill', color: '#d946ef', fillColor: '#08010f', strokeColor: '#f472b6', strokeWidth: 2, pattern: 'star-dot', shadowColor: '#ec4899' } },
  { id: 'note-emerald', type: 'note', name: 'Abyss Emerald Bar', cost: 8000, scoreBonus: 200, style: { shape: 'pill', color: '#10b981', fillColor: '#021810', strokeColor: '#34d399', strokeWidth: 2.5, pattern: 'glass-sheen', shadowColor: '#10b981' } },

  // Note hit vfx
  { id: 'vfx-default', type: 'vfx', name: 'Standard Splash', cost: 0, scoreBonus: 0, style: { type: 'splash', color: '#c084fc' } },
  { id: 'vfx-flare', type: 'vfx', name: 'Hyper Beam Flare', cost: 750, scoreBonus: 50, style: { type: 'flare', color: '#fb7185' } },
  { id: 'vfx-ripple', type: 'vfx', name: 'Sonic Shock Ripple', cost: 2000, scoreBonus: 100, style: { type: 'ripple', color: '#22d3ee' } },
  { id: 'vfx-gold', type: 'vfx', name: 'Golden Star Shower', cost: 2000, scoreBonus: 100, style: { type: 'stars', color: '#facc15' } },
  { id: 'vfx-lightning', type: 'vfx', name: 'Electro Arc Sparks', cost: 6000, scoreBonus: 150, style: { type: 'lightning', color: '#a7f3d0' } },

  // Score panel styling
  { id: 'score-default', type: 'score', name: 'Quantum Wireframe HUD', cost: 0, scoreBonus: 0, style: { theme: 'default', bg: 'bg-slate-900/40 border-white/10', fontClass: 'font-sans text-white/90', barBg: 'bg-white/10', barFill: 'bg-[#00d2ff]', starColor: 'text-yellow-400', barDesc: 'Cyan Neon Wire' } },
  { id: 'score-neon', type: 'score', name: 'Teal Chrono Neon', cost: 750, scoreBonus: 50, style: { theme: 'neon', bg: 'bg-[#032c2d]/70 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]', fontClass: 'font-bold font-mono text-cyan-400 drop-shadow-[0_0_4px_rgba(6,182,212,0.6)]', barBg: 'bg-cyan-950/40', barFill: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]', starColor: 'text-cyan-300 animate-pulse', barDesc: 'Cyber Chrono Pulsar' } },
  { id: 'score-glitch', type: 'score', name: 'LCD Glitch Grid', cost: 750, scoreBonus: 50, style: { theme: 'glitch', bg: 'bg-green-950/40 border-green-500/30 shadow-[inset_0_0_10px_rgba(34,197,94,0.2)]', fontClass: 'font-black font-mono text-green-400 tracking-tighter', barBg: 'bg-green-950/50', barFill: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]', starColor: 'text-green-300 font-mono', barDesc: 'Matrix Retro LCD' } },
  { id: 'score-royal', type: 'score', name: 'Gold Luxury Frame', cost: 2000, scoreBonus: 100, style: { theme: 'royal', bg: 'bg-yellow-950/40 border-yellow-500/50 shadow-[0_4px_20px_rgba(234,179,8,0.15)]', fontClass: 'font-serif text-yellow-400 font-extrabold italic', barBg: 'bg-amber-950/40', barFill: 'bg-gradient-to-r from-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(234,179,8,0.7)]', starColor: 'text-yellow-400 animate-bounce', barDesc: 'Gilded Emperor Gold' } },
  { id: 'score-minimal', type: 'score', name: 'Sleek Slate Minimalist', cost: 2000, scoreBonus: 100, style: { theme: 'minimal', bg: 'bg-zinc-900/80 border-zinc-600/30', fontClass: 'font-sans font-normal text-zinc-100 tracking-widest', barBg: 'bg-zinc-850', barFill: 'bg-zinc-300', starColor: 'text-white', barDesc: 'Monochrome Slate Matte' } },

  // Accuracy text styling
  { id: 'accuracy-default', type: 'accuracy', name: 'Classic Glow', cost: 0, scoreBonus: 0, style: { effect: 'classic', color: '#ffffff', shadowColor: '#a855f7' } },
  { id: 'accuracy-neon', type: 'accuracy', name: 'Magenta Strike Pop', cost: 750, scoreBonus: 50, style: { effect: 'magenta', color: '#ff007f', shadowColor: '#f43f5e' } },
  { id: 'accuracy-glitch', type: 'accuracy', name: 'Double Glitch Shift', cost: 750, scoreBonus: 50, style: { effect: 'glitch', color: '#22c55e', shadowColor: '#06b6d4' } },
  { id: 'accuracy-royal', type: 'accuracy', name: 'Royal Gold Border', cost: 2000, scoreBonus: 100, style: { effect: 'royal', color: '#fbbf24', shadowColor: '#b45309' } },
  { id: 'accuracy-arcade', type: 'accuracy', name: 'Retro Pixel Pulse', cost: 2000, scoreBonus: 100, style: { effect: 'arcade', color: '#facc15', shadowColor: '#000000' } }
];

// Inline visual HTML renderer for quick preview within the card
export function renderItemInlinePreview(el) {
  if (el.type === 'background') {
    if (el.id === 'bg-starting-star') {
      return `
        <div class="absolute inset-0 bg-gradient-to-br from-[#00d2ff] to-[#3a7bd5] flex items-center justify-center overflow-hidden">
          <span class="text-white text-[16px] opacity-25 animate-pulse">⭐️</span>
        </div>
      `;
    } else if (el.id === 'bg-default') {
      return `
        <div class="absolute inset-0 bg-gradient-to-br from-[#0c2240] to-[#1e3a8a] flex items-center justify-center">
          <span class="text-white text-[12px] opacity-40 animate-pulse">✦</span>
        </div>
      `;
    } else if (el.id === 'bg-nebula') {
      return `<div class="absolute inset-0 bg-gradient-to-br from-[#12051f] to-[#ec4899]/30 flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse"></div></div>`;
    } else if (el.id === 'bg-laser') {
      return `<div class="absolute inset-0 bg-slate-950 flex items-center justify-around"><div class="w-[1.5px] h-full bg-cyan-400 rotate-12 opacity-80 shadow-[0_0_8px_cyan]"></div><div class="w-[1.5px] h-full bg-cyan-400 -rotate-12 opacity-80 shadow-[0_0_8px_cyan]"></div></div>`;
    } else if (el.id === 'bg-sunset') {
      return `<div class="absolute inset-0 bg-gradient-to-t from-[#ffa07a]/10 to-[#f97316]/50 flex items-center justify-center"><div class="w-4 h-4 rounded-full bg-orange-600 opacity-60"></div></div>`;
    } else if (el.id === 'bg-void') {
      return `<div class="absolute inset-0 bg-[#010f08] border border-emerald-500/10 flex items-center justify-center"><div class="w-3 h-3 border border-emerald-500 rotate-45 opacity-55"></div></div>`;
    } else if (el.id === 'bg-light-peach') {
      return `<div class="absolute inset-0 bg-gradient-to-br from-[#fff1f2] to-[#fecdd3] flex items-center justify-center"><div class="w-3 h-3 rounded-full bg-rose-300 opacity-70"></div></div>`;
    } else if (el.id === 'bg-light-aurora') {
      return `<div class="absolute inset-0 bg-gradient-to-br from-[#e0f2fe] via-[#f0fdf4] to-[#f5f3ff]"><div class="w-full h-[3px] bg-teal-400/20 mt-4 animate-bounce"></div></div>`;
    } else if (el.id === 'bg-light-chalk') {
      return `<div class="absolute inset-0 bg-[#fafafa] flex flex-col justify-around py-1"><div class="h-[0.5px] bg-zinc-300 w-full"></div><div class="h-[0.5px] bg-zinc-300 w-full"></div></div>`;
    } else if (el.id === 'bg-light-cherry') {
      return `<div class="absolute inset-0 bg-gradient-to-br from-[#fdf2f8] to-[#fce7f3] flex items-center justify-center"><span class="text-[8px] text-pink-400">🌸</span></div>`;
    } else if (el.id === 'bg-light-solar') {
      return `<div class="absolute inset-0 bg-gradient-to-br from-[#fffbeb] to-[#fef08a] flex items-center justify-center"><span class="text-yellow-600 text-[10px]">☀️</span></div>`;
    }
  }

  if (el.type === 'note') {
    let pillBg = el.style.fillColor || '#050505';
    let pillBorder = el.style.strokeColor || el.style.color || '#ffffff';
    let extraStyle = '';
    
    if (el.style.pattern === 'stripes') {
      extraStyle = 'background-image: repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.06) 3px, rgba(255,255,255,0.06) 6px);';
    }

    let patternMark = '';
    if (el.style.pattern === 'core-glow') {
      patternMark = `<div class="w-3 h-[2px] bg-white rounded-full"></div>`;
    } else if (el.style.pattern === 'eclipse') {
      patternMark = `<div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>`;
    } else if (el.style.pattern === 'star-dot') {
      patternMark = `<div class="w-1 h-1 rounded-full bg-white/70 mx-0.5"></div><div class="w-1 h-1 rounded-full bg-yellow-400 mx-0.5"></div><div class="w-1 h-1 rounded-full bg-white/70 mx-0.5"></div>`;
    } else if (el.style.pattern === 'glass-sheen') {
      patternMark = `<div class="absolute top-[0.5px] left-1 right-1 h-[1.5px] bg-white/30 rounded-t-full"></div>`;
    }

    return `
      <div class="absolute inset-0 bg-[#0a0514]/90 flex items-center justify-center">
        <div style="background-color: ${pillBg}; border: 1px solid ${pillBorder}; ${extraStyle}" class="w-10 h-3 rounded-full flex items-center justify-center relative shadow-[0_0_8px_${pillBorder}]">
          ${patternMark}
        </div>
      </div>
    `;
  }

  if (el.type === 'vfx') {
    return `
      <div class="absolute inset-0 bg-[#05020d] flex items-center justify-center">
        <div class="text-[12px] animate-pulse" style="color: ${el.style.color || '#fff'}">
          ${el.style.type === 'splash' ? '✨' : el.style.type === 'ripple' ? '◎' : el.style.type === 'stars' ? '★' : el.style.type === 'lightning' ? '⚡' : '⦾'}
        </div>
      </div>
    `;
  }

  if (el.type === 'score') {
    return `
      <div class="absolute inset-0 bg-[#05020d] flex flex-col justify-center items-center p-1 select-none">
        <div class="w-full text-center border px-1.5 py-0.5 rounded font-mono ${el.style.bg} scale-[0.82]">
          <p class="${el.style.fontClass} text-[7px] tracking-tighter leading-none">039,520</p>
          <div class="w-full h-[3px] rounded-full overflow-hidden mt-1 ${el.style.barBg || 'bg-white/10'}">
            <div class="h-full rounded-full ${el.style.barFill || 'bg-cyan-400'}" style="width: 65%"></div>
          </div>
          <p class="text-[5px] text-zinc-400/60 font-black uppercase tracking-wider mt-0.5 font-sans leading-none">${el.style.barDesc || 'Bar'}</p>
        </div>
      </div>
    `;
  }

  if (el.type === 'accuracy') {
    return `
      <div class="absolute inset-0 bg-[#05020d] flex items-center justify-center">
        <span class="text-[8px] font-bold" style="color: ${el.style.color}; text-shadow: 0 0 3px ${el.style.shadowColor}">GREAT</span>
      </div>
    `;
  }

  return `<div class="absolute inset-0 bg-white/5"></div>`;
}

// Initialize default state variables
export function initStageState() {
  if (!state.ownedStageElements) {
    state.ownedStageElements = ['bg-starting-star', 'note-default', 'vfx-default', 'score-default', 'accuracy-default'];
  }
  if (!state.equippedStageElements) {
    state.equippedStageElements = {
      background: 'bg-starting-star',
      note: 'note-default',
      vfx: 'vfx-default',
      score: 'score-default',
      accuracy: 'accuracy-default'
    };
  }
  if (!state.selectedStageItemIds) {
    state.selectedStageItemIds = {
      background: state.equippedStageElements.background || 'bg-starting-star',
      note: state.equippedStageElements.note || 'note-default',
      vfx: state.equippedStageElements.vfx || 'vfx-default',
      score: state.equippedStageElements.score || 'score-default',
      accuracy: state.equippedStageElements.accuracy || 'accuracy-default'
    };
  }
}

// Helper to sum all score bonuses of items owned
export function getStageCollectionBonus(s = state) {
  if (!s.ownedStageElements) return 0;
  let total = 0;
  STAGE_ELEMENTS.forEach(el => {
    if (s.ownedStageElements.includes(el.id)) {
      total += el.scoreBonus;
    }
  });
  return total;
}

// Current active category tab in the Customizer screen
let currentCustomCategory = 'background';
let activeSimulationId = null;

export function renderStageCustomizer(s = state) {
  initStageState();
  const container = document.getElementById('content-root');
  if (!container) return;

  const collectionBonus = getStageCollectionBonus(s);
  const categories = [
    { id: 'background', label: 'Background' },
    { id: 'note', label: 'Notes' },
    { id: 'vfx', label: 'VFX' },
    { id: 'score', label: 'Score UI' },
    { id: 'accuracy', label: 'Accuracy' }
  ];

  // Get selected preview items configs for styles
  const activeBg = STAGE_ELEMENTS.find(el => el.id === s.selectedStageItemIds.background) || STAGE_ELEMENTS[0];
  const activeScore = STAGE_ELEMENTS.find(el => el.id === s.selectedStageItemIds.score) || STAGE_ELEMENTS[15];

  container.className = "flex-1 overflow-y-auto no-scrollbar pb-24 flex flex-col gap-4";
  container.innerHTML = `
    <!-- Total Score Bonus Header Row (Repurposed from DecoTicket Section) -->
    <div class="flex items-center justify-between bg-slate-900/60 border border-white/5 rounded-2xl p-3 px-4 relative overflow-hidden shrink-0 select-none">
      <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-yellow-500/5 rounded-full blur-xl animate-pulse"></div>
      <div class="flex items-center gap-2 relative z-10">
        <span class="text-xl">🎨</span>
        <div>
          <h4 class="text-[10px] text-white font-black uppercase tracking-wider leading-none">Total Score Bonus</h4>
          <p class="text-[7.5px] text-zinc-500 font-extrabold mt-0.5 leading-none">Collect decorations to increase your final score bonus</p>
        </div>
      </div>
      <div class="bg-slate-950/80 border border-yellow-500/20 rounded-xl px-3 py-1.5 flex items-center justify-center font-mono font-black text-yellow-400 text-xs shadow-inner relative z-10">
        +${collectionBonus.toLocaleString()}
      </div>
    </div>

    <!-- Top Interactive Preview Section -->
    <div class="relative w-full aspect-[16/10] bg-slate-950 rounded-2xl overflow-hidden border border-white/5 shadow-2xl flex flex-col shrink-0 select-none">
      
      <!-- Interactive Preview Canvas -->
      <canvas id="stage-preview-canvas" class="absolute inset-0 w-full h-full block"></canvas>
      
      <!-- Score Panel Overlay Styled according to Selected Style -->
      <div id="stage-preview-score-hud" class="absolute top-3 left-3 right-3 p-2 rounded-xl border flex items-center justify-between ${activeScore.style.bg} backdrop-blur-md transition-all duration-300 z-10">
        <div class="text-left flex-grow">
          <p class="text-[7px] opacity-40 font-bold uppercase tracking-widest leading-none mb-0.5 font-sans">Stage Preview</p>
          <p class="text-[11px] font-black tracking-tight leading-none ${activeScore.style.fontClass}" id="hud-score-value">SCORE 0</p>
        </div>
        <!-- Progress Bar & Stars Customizer Preview -->
        <div class="flex flex-col items-end justify-center w-24 gap-0.5 select-none shrink-0">
          <div class="flex items-center gap-1 leading-none">
            <span id="hud-stars" class="text-[9.5px] tracking-tighter ${activeScore.style.starColor || 'text-yellow-400'} font-sans font-bold">☆☆☆</span>
          </div>
          <div class="w-full h-1.5 rounded-full overflow-hidden relative ${activeScore.style.barBg || 'bg-white/10'}">
            <div id="hud-progress-fill" class="h-full rounded-full transition-all duration-100 ${activeScore.style.barFill || 'bg-cyan-400'}" style="width: 0%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Category Selector Pill Tabs -->
    <div class="flex overflow-x-auto gap-1 border-b border-white/5 pb-2 no-scrollbar px-1 shrink-0">
      ${categories.map(c => {
        const isActive = currentCustomCategory === c.id;
        const equippedItem = STAGE_ELEMENTS.find(el => el.id === s.equippedStageElements[c.id]);
        return `
          <button onclick="window.selectCustomCategory('${c.id}')" class="whitespace-nowrap px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider transition-all duration-200 shrink-0 ${isActive ? 'bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff]/30 shadow-[0_0_10px_rgba(255,0,255,0.15)]' : 'bg-white/5 text-white/50 border border-transparent hover:text-white'}">
            ${c.label}
            <span class="text-[6.5px] text-white/30 block tracking-normal">${equippedItem ? equippedItem.name : ''}</span>
          </button>
        `;
      }).join('')}
    </div>

    <!-- Elements Grid for selected Category — Drawn as Premium Vertical Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 px-1 pb-4 flex-1">
      ${STAGE_ELEMENTS.filter(el => el.type === currentCustomCategory).map(el => {
        const isOwned = s.ownedStageElements.includes(el.id);
        const isEquipped = s.equippedStageElements[currentCustomCategory] === el.id;
        const isSelected = s.selectedStageItemIds[currentCustomCategory] === el.id;
        const currentTicketCost = getDecoTicketCost(el.id);
        
        let cardBorderClass = 'border-white/5 hover:border-white/10';
        let cardBgClass = 'bg-white/5';
        let contentHtml = '';
        let badgeHtml = '';

        if (isEquipped) {
          // Case 5: equipped (thick green border)
          cardBorderClass = 'border-green-400 border-[3px] shadow-[0_0_15px_rgba(34,197,94,0.35)]';
          cardBgClass = 'bg-[#152e1f]/35';
          contentHtml = `
            <!-- Circular green checkmark badge in the center/bottom -->
            <div class="w-full shrink-0 mt-auto flex items-center justify-center py-1">
              <div class="w-7 h-7 rounded-full bg-green-500 border-2 border-white/30 flex items-center justify-center shadow-lg transform scale-110">
                <span class="text-white text-xs font-black">✓</span>
              </div>
            </div>
          `;
        } else if (isOwned) {
          if (isSelected) {
            // Case 4: owned & selected (thick yellow/gold glowing border, USE button)
            cardBorderClass = 'border-yellow-400 border-[3px] shadow-[0_0_15px_rgba(234,179,8,0.4)]';
            cardBgClass = 'bg-[#2a2410]/35';
            contentHtml = `
              <div class="w-full shrink-0 mt-auto">
                <button onclick="event.stopPropagation(); window.equipStageItem('${el.id}', '${el.type}')" class="w-full bg-yellow-400 text-black text-[9.5px] font-black uppercase tracking-wider py-1.5 rounded-xl transition-all duration-150 hover:brightness-110 active:scale-95 shadow-md leading-none">
                  USE
                </button>
              </div>
            `;
          } else {
            // Case 3: owned (standard border, dark bar with name)
            cardBorderClass = 'border-white/10';
            cardBgClass = 'bg-white/5';
            contentHtml = `
              <div class="w-full bg-[#1c1921] rounded-xl py-2 mt-auto text-center border border-white/5">
                <p class="text-white font-extrabold text-[9.5px] leading-tight px-1 uppercase truncate">${el.name}</p>
              </div>
            `;
          }
        } else {
          // Locked items show +scoreBonus pts tag at top-right
          badgeHtml = `
            <div class="absolute top-1.5 right-2 z-10">
              <span class="text-yellow-400 font-black text-[8px] tracking-tight bg-black/40 px-1 py-0.5 rounded">+${el.scoreBonus} pts</span>
            </div>
          `;

          if (isSelected) {
            // Case 2: locked & selected (thick yellow border, Buy button)
            cardBorderClass = 'border-yellow-400 border-[3px] shadow-[0_0_15px_rgba(234,179,8,0.4)]';
            cardBgClass = 'bg-[#2a2410]/35';
            contentHtml = `
              <div class="w-full shrink-0 mt-auto">
                <button onclick="event.stopPropagation(); window.buyStageItem('${el.id}')" class="w-full bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[9px] font-black uppercase tracking-wide py-1.5 rounded-xl transition-all duration-150 hover:brightness-110 active:scale-95 shadow-lg leading-none">
                  Buy 🎨 ${currentTicketCost}
                </button>
              </div>
            `;
          } else {
            // Case 1: locked (standard border, dark bar name and price below)
            cardBorderClass = 'border-white/10';
            cardBgClass = 'bg-white/5';
            contentHtml = `
              <div class="w-full bg-[#1c1921] rounded-xl py-1 mt-auto text-center border border-white/5 flex flex-col justify-center gap-0.5">
                <p class="text-white/60 font-extrabold text-[9.5px] leading-none px-1 uppercase truncate">${el.name}</p>
                <p class="text-pink-400 font-bold text-[8.5px] leading-none font-mono">🎨 ${currentTicketCost}</p>
              </div>
            `;
          }
        }

        return `
          <div onclick="window.selectStageItem('${el.id}', '${el.type}')" class="relative rounded-2xl border ${cardBgClass} ${cardBorderClass} p-2.5 flex flex-col items-center justify-between text-center overflow-hidden transition-all duration-200 cursor-pointer h-[124px] select-none hover:scale-[1.015]">
            ${badgeHtml}

            <!-- Card Quick Preview Area -->
            <div class="w-full h-11 rounded-lg overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center relative select-none">
              ${renderItemInlinePreview(el)}
            </div>

            <!-- Content section (USE, Buy button, Checkmark, or dark bar) -->
            ${contentHtml}
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Initialize preview canvas animation with safety timeout
  setTimeout(() => {
    const canvas = document.getElementById('stage-preview-canvas');
    if (canvas) {
      setupPreviewSimulation(canvas);
    }
  }, 30);
}

// Global hook callbacks
window.selectCustomCategory = (catId) => {
  currentCustomCategory = catId;
  renderStageCustomizer();
};

window.selectStageItem = (itemId, type) => {
  initStageState();
  state.selectedStageItemIds[type] = itemId;
  renderStageCustomizer();
};

window.buyStageItem = (itemId) => {
  const el = STAGE_ELEMENTS.find(x => x.id === itemId);
  if (!el) return;

  const cost = getDecoTicketCost(itemId);
  if ((state.user.decoTickets || 0) < cost) {
    // Show insufficient tickets toast
    const floatToast = document.createElement('div');
    floatToast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-950/95 border border-rose-500 text-white font-black px-4 py-2 text-[10px] rounded-xl font-sans tracking-wide shadow-2xl z-[900] uppercase text-center animate-bounce";
    floatToast.innerHTML = `NOT ENOUGH TICKETS!<br>Requires 🎨 ${cost}`;
    document.body.appendChild(floatToast);
    setTimeout(() => floatToast.remove(), 2000);
    return;
  }

  // Deduct deco Tickets
  state.user.decoTickets = (state.user.decoTickets || 0) - cost;
  state.visualUser.decoTickets = state.user.decoTickets;

  // Add owned stage list
  state.ownedStageElements.push(el.id);
  state.equippedStageElements[el.type] = el.id;
  state.selectedStageItemIds[el.type] = el.id;

  // Visual notify
  const floatToast = document.createElement('div');
  floatToast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-emerald-950/95 border border-emerald-500 text-white font-black px-4 py-2 text-[10px] rounded-xl font-sans tracking-wide shadow-2xl z-[900] uppercase text-center animate-pulse";
  floatToast.innerHTML = `STYLE UNLOCKED!<br>${el.name}`;
  document.body.appendChild(floatToast);
  setTimeout(() => floatToast.remove(), 2000);

  // Redraw
  const { ui } = window;
  if (ui) {
    ui.header();
  }
  renderStageCustomizer();
};

window.equipStageItem = (itemId, type) => {
  state.equippedStageElements[type] = itemId;
  state.selectedStageItemIds[type] = itemId;
  
  // Re-render
  renderStageCustomizer();
};

window.unlockAllStageElements = () => {
  initStageState();
  STAGE_ELEMENTS.forEach(el => {
    if (!state.ownedStageElements.includes(el.id)) {
      state.ownedStageElements.push(el.id);
    }
  });

  // Toast notice
  const floatToast = document.createElement('div');
  floatToast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-950/95 border border-amber-500 text-amber-400 font-extrabold px-5 py-3 text-[10px] rounded-2xl font-sans tracking-wide shadow-2xl z-[900] uppercase text-center animate-bounce";
  floatToast.innerHTML = `⭐ ALL STAGE ELEMENTS UNLOCKED! ⭐<br><span class="text-[8px] text-white/60">Choose and Equip items in the customized tabs!</span>`;
  document.body.appendChild(floatToast);
  setTimeout(() => floatToast.remove(), 2500);

  // Redraw
  const { ui } = window;
  if (ui) {
    ui.header();
  }
  renderStageCustomizer();
};

window.resetAllStageElements = () => {
  state.ownedStageElements = ['bg-starting-star', 'note-default', 'vfx-default', 'score-default', 'accuracy-default'];
  state.equippedStageElements = {
    background: 'bg-starting-star',
    note: 'note-default',
    vfx: 'vfx-default',
    score: 'score-default',
    accuracy: 'accuracy-default'
  };
  state.selectedStageItemIds = {
    background: 'bg-starting-star',
    note: 'note-default',
    vfx: 'vfx-default',
    score: 'score-default',
    accuracy: 'accuracy-default'
  };

  // Toast notice
  const floatToast = document.createElement('div');
  floatToast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-600 text-zinc-300 font-extrabold px-5 py-3 text-[10px] rounded-2xl font-sans tracking-wide shadow-2xl z-[900] uppercase text-center animate-pulse";
  floatToast.innerHTML = `♻️ STAGE CUSTOMIZATION RESET! ♻️<br><span class="text-[8px] text-white/55">All styles reverted to standard default baseline!</span>`;
  document.body.appendChild(floatToast);
  setTimeout(() => floatToast.remove(), 2500);

  // Redraw
  const { ui } = window;
  if (ui) {
    ui.header();
  }
  renderStageCustomizer();
};


// ----------------------------------------------------
// Preview Simulation Gameplay Renderer on Canvas
// ----------------------------------------------------
function setupPreviewSimulation(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  
  // Use a fallback of width 332 and height 207 if the rect measurements are zero/hidden on first load
  const w = rect.width || 332;
  const h = rect.height || 207;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  ctx.scale(dpr, dpr);

  // Set randomized loop id to stop old animation loop
  const loopId = Math.random();
  activeSimulationId = loopId;

  const width = w;
  const height = h;

  // Lanes setting
  const numLanes = 4;
  const laneWidth = width / numLanes;
  const hitTargetY = height - 35; // Position where note gets hit

  // Dynamic values
  let simulatedScore = 0;
  let notes = [];
  let hits = []; // Hit visuals
  let particles = [];
  let accuracyTexts = [];

  // Generate some notes initially
  for (let i = 0; i < 4; i++) {
    notes.push({
      id: Math.random(),
      lane: Math.floor(Math.random() * numLanes),
      y: -Math.random() * 150,
      speed: 2.2 + Math.random() * 0.8
    });
  }

  let backgroundAnimationTimer = 0;
  let progressPercent = 0;

  function updateAndDraw() {
    if (activeSimulationId !== loopId || !document.getElementById('stage-preview-canvas')) {
      return; // Stop animation loop
    }

    backgroundAnimationTimer += 1.0;
    progressPercent += 0.22; // increment progress bar slowly
    if (progressPercent > 100) {
      progressPercent = 0;
    }

    // Dynamic progress bar and stars updates
    const fillEl = document.getElementById('hud-progress-fill');
    const starsEl = document.getElementById('hud-stars');
    if (fillEl) {
      fillEl.style.width = `${progressPercent}%`;
    }
    if (starsEl) {
      let starStr = '☆☆☆';
      if (progressPercent >= 90) {
        starStr = '⭐⭐⭐';
      } else if (progressPercent >= 60) {
        starStr = '⭐⭐☆';
      } else if (progressPercent >= 30) {
        starStr = '⭐☆☆';
      }
      starsEl.innerHTML = starStr;
    }

    // Get CURRENT styles dynamically based on state, checking selected items for real-time previewing
    const bgElem = STAGE_ELEMENTS.find(el => el.id === (state.selectedStageItemIds?.background || state.equippedStageElements.background)) || STAGE_ELEMENTS[0];
    const noteElem = STAGE_ELEMENTS.find(el => el.id === (state.selectedStageItemIds?.note || state.equippedStageElements.note)) || STAGE_ELEMENTS[5];
    const vfxElem = STAGE_ELEMENTS.find(el => el.id === (state.selectedStageItemIds?.vfx || state.equippedStageElements.vfx)) || STAGE_ELEMENTS[10];
    const accElem = STAGE_ELEMENTS.find(el => el.id === (state.selectedStageItemIds?.accuracy || state.equippedStageElements.accuracy)) || STAGE_ELEMENTS[20];

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Background
    drawSimulationBackground(ctx, width, height, bgElem, backgroundAnimationTimer, numLanes, laneWidth, hitTargetY);

    // 2. Draw Lane Targets
    drawLaneTargets(ctx, numLanes, laneWidth, hitTargetY, bgElem.style.color);

    // 3. Update & Draw Notes
    notes.forEach((note, idx) => {
      note.y += note.speed;
      
      // Draw note visual based on Note Configuration
      const noteX = (note.lane * laneWidth) + (laneWidth / 2);
      drawNoteVisual(ctx, noteX, note.y, noteElem);

      // Auto hit checking when reaching hit line
      if (note.y >= hitTargetY) {
        // Trigger Hit Reaction Standard
        simulatedScore += 100;
        const scoreHud = document.getElementById('hud-score-value');
        if (scoreHud) scoreHud.innerHTML = `SCORE ${simulatedScore.toLocaleString()}`;

        // Create hit vfx
        triggerHitVfx(particles, noteX, hitTargetY, vfxElem);

        // Accuracy pop
        const accTextsArr = ['PERFECT', 'GREAT', 'GOOD'];
        const weights = [0.8, 0.15, 0.05];
        let chosenAcc = 'PERFECT';
        const rand = Math.random();
        if (rand < weights[0]) chosenAcc = 'PERFECT';
        else if (rand < weights[0] + weights[1]) chosenAcc = 'GREAT';
        else chosenAcc = 'GOOD';

        accuracyTexts.push({
          text: chosenAcc,
          x: noteX,
          y: hitTargetY - 15,
          opacity: 1.0,
          scale: 1.0
        });

        // Respawn note standard
        note.y = -50 - Math.random() * 120;
        note.lane = Math.floor(Math.random() * numLanes);
        note.speed = 2.2 + Math.random() * 0.8;
      }
    });

    // 4. Update & Draw Particles
    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 1;
      p.opacity = p.life / p.maxLife;

      ctx.save();
      ctx.globalAlpha = p.opacity;
      if (p.type === 'splash') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'stars') {
        ctx.fillStyle = p.color;
        // Simple little visual star shape
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
        ctx.arc(p.x, p.y, p.radius * (1 + (p.maxLife - p.life)/p.maxLife), 0, Math.PI*2);
        ctx.stroke();
      } else if (p.type === 'flare') {
        // Vertical flash beams vertical
        const beamWidth = 6 * p.opacity;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - beamWidth / 2, 0, beamWidth, height);
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
      ctx.restore();
    });
    // Filter old sparks
    particles = particles.filter(p => p.life > 0);

    // 5. Update & Draw Accuracy Float Texts
    accuracyTexts.forEach((ac, idx) => {
      ac.y -= 0.6;
      ac.opacity -= 0.024;
      
      ctx.save();
      ctx.globalAlpha = Math.max(0, ac.opacity);
      
      // Draw standard styled accuracy floating elements
      drawStyledAccuracyText(ctx, ac.text, ac.x, ac.y, accElem);
      
      ctx.restore();
    });
    accuracyTexts = accuracyTexts.filter(ac => ac.opacity > 0);

    // Keep loop active
    requestAnimationFrame(updateAndDraw);
  }

  // Start the preview process
  requestAnimationFrame(updateAndDraw);
}

// Draw Background procedural patterns
export function drawSimulationBackground(ctx, w, h, bgElem, pulseTimer, numLanes, laneWidth, hitTargetY) {
  const color = bgElem.style.color || '#8b5cf6';
  const type = bgElem.style.type;

  const isLight = bgElem.id && bgElem.id.includes('light');
  if (isLight) {
    ctx.fillStyle = bgElem.style.bgColor || '#fcfbf7';
  } else {
    ctx.fillStyle = '#05020d';
  }
  ctx.fillRect(0, 0, w, h);

  if (type === 'starting-star') {
    // Gradient matching THEMES.blue: from-[#00d2ff] to-[#3a7bd5]
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#00d2ff');
    grad.addColorStop(1, '#3a7bd5');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing circle in center (radial gradient circle at 50% 50% with 0.15 opacity white)
    const radial = ctx.createRadialGradient(w/2, h/2 * 0.9, 10, w/2, h/2 * 0.9, w * 0.75);
    radial.addColorStop(0, 'rgba(255, 255, 255, 0.22)');
    radial.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    // Giant 5-point star vector centered like in gameplay-classic / gameplay scene
    ctx.save();
    ctx.translate(w/2, h/2 * 0.9);
    ctx.globalAlpha = 0.20; // Matches opacity-20 from starting screen
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const rot = Math.PI/2*3;
    const outerRadius = Math.min(w, h) * 0.45; // Generously large star
    const innerRadius = outerRadius * 0.42;
    const step = Math.PI/5;
    for (let i = 0; i < 10; i++) {
      const r = (i%2 === 0) ? outerRadius : innerRadius;
      const currAngle = rot + i*step;
      const sx = Math.cos(currAngle)*r;
      const sy = Math.sin(currAngle)*r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Subtle drifting particle stars (twinkling)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 8; i++) {
      const px = (w * 0.1 + i * 95) % w;
      const py = (h - ((i * 80 + pulseTimer * 0.6) % (h + 30)));
      const pSize = 1.0 + Math.abs(Math.sin((pulseTimer + i * 15) * 0.04)) * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, pSize, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'gameplay-classic') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#040b17');
    grad.addColorStop(0.5, '#0c2240');
    grad.addColorStop(1, '#1e3a8a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing circle in center
    const radial = ctx.createRadialGradient(w/2, h/2, 10, w/2, h/2, w);
    radial.addColorStop(0, 'rgba(0, 210, 255, 0.15)');
    radial.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, w, h);

    // Big vector star faint silhouette
    ctx.save();
    ctx.translate(w/2, h/2 - 15);
    ctx.globalAlpha = 0.08;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    const rot = Math.PI/2*3;
    const outerRadius = 80;
    const innerRadius = 32;
    const step = Math.PI/5;
    for (let i = 0; i < 10; i++) {
      const r = (i%2 === 0) ? outerRadius : innerRadius;
      const currAngle = rot + i*step;
      const sx = Math.cos(currAngle)*r;
      const sy = Math.sin(currAngle)*r;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Subtle floating particles
    ctx.fillStyle = 'rgba(0, 210, 255, 0.3)';
    for (let i = 0; i < 6; i++) {
      const px = (w * 0.15 + (i * 90) + Math.sin(pulseTimer*0.02 + i)*15) % w;
      const py = (h - ((i * 70 + pulseTimer * 0.8) % (h + 20)));
      ctx.beginPath();
      ctx.arc(px, py, 1.5, 0, Math.PI*2);
      ctx.fill();
    }
  } else if (type === 'light-peach') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.7, '#ffe4e6');
    grad.addColorStop(1, '#fecdd3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Floating bubble orbs (warm white)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.strokeStyle = 'rgba(244, 63, 94, 0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const px = (w * 0.2 + i * 80) % w;
      const py = (h - ((i * 90 + pulseTimer * 0.5) % (h + 30)));
      const size = 6 + (i % 3) * 3;
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  } else if (type === 'light-aurora') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#e0f2fe');
    grad.addColorStop(0.5, '#f0fdf4');
    grad.addColorStop(1, '#f5f3ff');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Soft moving sine waves
    ctx.strokeStyle = 'rgba(13, 148, 136, 0.12)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 10) {
      const y = h/2 + Math.sin(x*0.02 + pulseTimer*0.03)*30;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  } else if (type === 'light-chalk') {
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, w, h);

    // Pencil paper texture lines
    ctx.strokeStyle = 'rgba(63, 63, 70, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 30; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    const offset = (pulseTimer * 0.4) % 65;
    for (let y = offset; y < h; y += 65) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  } else if (type === 'light-cherry') {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#fdf2f8');
    grad.addColorStop(1, '#fce7f3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Grid lines of cherry color
    ctx.strokeStyle = 'rgba(219, 39, 119, 0.05)';
    ctx.lineWidth = 1.5;
    for (let c = 0; c <= w; c += 35) {
      ctx.beginPath();
      ctx.moveTo(c, 0);
      ctx.lineTo(c, h);
      ctx.stroke();
    }
    const offset = (pulseTimer * 1.5) % 35;
    for (let r = offset; r < h; r += 35) {
      ctx.beginPath();
      ctx.moveTo(0, r);
      ctx.lineTo(w, r);
      ctx.stroke();
    }

    // Little pink falling petals
    ctx.fillStyle = 'rgba(219, 39, 119, 0.2)';
    for (let i = 0; i < 6; i++) {
      const px = (w * 0.1 + i * 75 + pulseTimer * 0.5) % w;
      const py = (i * 110 + pulseTimer * 1.1) % h;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(pulseTimer * 0.01 + i);
      ctx.beginPath();
      ctx.ellipse(0, 0, 4, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'light-solar') {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#fffbeb');
    grad.addColorStop(0.5, '#fef3c7');
    grad.addColorStop(1, '#fef08a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Glowing sun rays radiating from top center
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = '#ca8a04';
    const centerX = w/2;
    const centerY = -10;
    const numRayLimit = 12;
    for (let i = 0; i < numRayLimit; i++) {
      const angle = (i / numRayLimit) * Math.PI + (pulseTimer * 0.002);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + Math.cos(angle)*w*2, centerY + Math.sin(angle)*h*2);
      ctx.lineTo(centerX + Math.cos(angle + 0.15)*w*2, centerY + Math.sin(angle + 0.15)*h*2);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  } else if (type === 'grid') {
    // Standard ambient falling lines grid
    ctx.strokeStyle = color + '0f';
    ctx.lineWidth = 1;
    // Lanes
    for (let l = 1; l < numLanes; l++) {
      ctx.beginPath();
      ctx.moveTo(l * laneWidth, 0);
      ctx.lineTo(l * laneWidth, h);
      ctx.stroke();
    }
    // Horizontal scrolling grid
    const spacing = 45;
    const offset = (pulseTimer * 1.2) % spacing;
    ctx.strokeStyle = color + '15';
    for (let gy = offset; gy < h; gy += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
  } else if (type === 'nebula') {
    // Stars scrolling down
    const gradient = ctx.createRadialGradient(w/2, h/2, 5, w/2, h/2, w);
    gradient.addColorStop(0, '#12051f');
    gradient.addColorStop(1, '#05010a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw little twinkling dusty stars
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const starY = ( (i * 55 + pulseTimer * 0.4) % h );
      const starX = (w * 0.18 + (i * 85)) % w;
      const pulseSize = 1.0 + Math.abs(Math.sin((pulseTimer + i * 14) * 0.05)) * 1.5;
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.arc(starX, starY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (type === 'laser') {
    // Shooting laser spotlights
    ctx.strokeStyle = color + '2d';
    ctx.lineWidth = 2.5;
    
    const angle1 = Math.sin(pulseTimer * 0.015) * 0.4 + 0.3;
    const angle2 = Math.cos(pulseTimer * 0.015 + 1.2) * 0.4 - 0.3;

    ctx.save();
    ctx.globalAlpha = 0.4;
    // Laser Left
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(w / 2 + Math.tan(angle1) * 100, 0);
    ctx.stroke();

    // Laser Right
    ctx.beginPath();
    ctx.moveTo(w, h);
    ctx.lineTo(w / 2 + Math.tan(angle2) * 100, 0);
    ctx.stroke();
    ctx.restore();
  } else if (type === 'sunset') {
    // Sunset radial gradient and wireframe perspective road
    const horizonY = h/2 - 10;
    
    // Sunset glow
    const sunGrad = ctx.createRadialGradient(w/2, horizonY, 2, w/2, horizonY, 65);
    sunGrad.addColorStop(0, '#f9731633');
    sunGrad.addColorStop(0.5, '#ef444415');
    sunGrad.addColorStop(1, '#00000000');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w/2, horizonY, 65, 0, Math.PI * 2);
    ctx.fill();

    // Perspectives
    ctx.strokeStyle = '#f973161a';
    ctx.lineWidth = 1;
    for (let l = -3; l <= 3; l++) {
      ctx.beginPath();
      ctx.moveTo(w/2, horizonY);
      ctx.lineTo(w/2 + l * (w / 4), h);
      ctx.stroke();
    }
    // Horizontal perspective steps
    const spacing = 35;
    const offset = (pulseTimer * 0.8) % spacing;
    for (let gy = horizonY + offset; gy < h; gy += spacing) {
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.lineTo(w, gy);
      ctx.stroke();
    }
  } else if (type === 'void') {
    // Floating green geometric translucent prisms
    ctx.fillStyle = '#010f08';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#10b98115';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 3; i++) {
      const prismY = h - ((i * 85 + pulseTimer * 0.5) % (h + 40));
      const prismX = (w * 0.2 + (i * 120)) % w;
      ctx.save();
      ctx.translate(prismX, prismY);
      ctx.rotate(pulseTimer * 0.005 + i);
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(10, 8);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
}

// Draw target elements
function drawLaneTargets(ctx, numLanes, laneWidth, hitTargetY, color) {
  ctx.strokeStyle = color + '4d';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, hitTargetY);
  ctx.lineTo(numLanes * laneWidth, hitTargetY);
  ctx.stroke();

  // Draw target touchpoints
  for (let l = 0; l < numLanes; l++) {
    const rx = (l * laneWidth) + (laneWidth / 2);
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = color + '66';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(rx, hitTargetY, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// Draw a note using different premium stylistic forms (pills match original gameplay)
export function drawNoteVisual(ctx, cx, cy, noteElem, customW = null, customH = null) {
  // Pill dimensions (support custom overrides or fallback to responsive dimensions)
  const w = customW || 54;
  const h = customH || 14;
  
  const style = noteElem.style || {};
  const color = style.color || '#00d2ff';
  
  const x = cx - w / 2;
  const y = cy - h / 2;
  const radius = h / 2; // Perfect Pill cap

  ctx.save();
  
  // Outer Shadows
  if (style.shadowColor) {
    ctx.shadowColor = style.shadowColor;
    ctx.shadowBlur = 10;
  } else {
    ctx.shadowColor = color;
    ctx.shadowBlur = 6;
  }

  // Draw Pill Path
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - radius);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();

  // Fills
  if (style.fillType === 'gradient' || (style.gradientStops)) {
    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
    if (style.gradientStops) {
      style.gradientStops.forEach(stop => grad.addColorStop(stop.offset, stop.color));
    } else {
      grad.addColorStop(0, style.fillColor || '#050505');
      grad.addColorStop(1, style.color || '#fff');
    }
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = style.fillColor || '#050505';
  }
  ctx.fill();

  // Pattern overlays within the clipped pill
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, radius);
  } else {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }
  ctx.closePath();
  ctx.clip();

  if (style.pattern === 'stripes') {
    ctx.strokeStyle = color + '44';
    ctx.lineWidth = 2.5;
    for (let offset = -w; offset < w * 2; offset += 10) {
      ctx.beginPath();
      ctx.moveTo(x + offset, y);
      ctx.lineTo(x + offset + 8, y + h);
      ctx.stroke();
    }
  } else if (style.pattern === 'core-glow') {
    ctx.fillStyle = color + 'aa';
    ctx.beginPath();
    const iw = w * 0.5;
    const ih = h * 0.35;
    const ir = ih / 2;
    if (ctx.roundRect) {
      ctx.roundRect(cx - iw/2, cy - ih/2, iw, ih, ir);
    } else {
      ctx.rect(cx - iw/2, cy - ih/2, iw, ih);
    }
    ctx.fill();
    // Inner white flare
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  } else if (style.pattern === 'eclipse') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    // outer lens ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, h * 0.35, 0, Math.PI * 2);
    ctx.stroke();
  } else if (style.pattern === 'star-dot') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - w * 0.25, cy, 1.5, 0, Math.PI * 2);
    ctx.arc(cx + w * 0.25, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (style.pattern === 'glass-sheen') {
    const shineGrad = ctx.createLinearGradient(x, y, x, y + h * 0.5);
    shineGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    shineGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = shineGrad;
    ctx.fillRect(x, y, w, h * 0.5);
  }
  ctx.restore();

  // Outside Border/Stroke
  ctx.strokeStyle = style.strokeColor || color || '#ffffff';
  ctx.lineWidth = style.strokeWidth || 2;
  ctx.stroke();

  ctx.restore();
}

// Trigger Note Hit Particle structures
export function triggerHitVfx(particles, hitX, hitY, vfxElem) {
  const type = vfxElem.style.type;
  const color = vfxElem.style.color;

  if (type === 'splash') {
    // 8 simple circle sparks
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i;
      const speed = 1.5 + Math.random() * 1.5;
      particles.push({
        type: 'splash',
        x: hitX,
        y: hitY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.5,
        size: 1.5 + Math.random() * 2,
        color: color,
        life: 25,
        maxLife: 25
      });
    }
  } else if (type === 'stars') {
    // fountain star flow
    for (let i = 0; i < 5; i++) {
      particles.push({
        type: 'stars',
        x: hitX,
        y: hitY,
        vx: -1.0 + Math.random() * 2.0,
        vy: -1.7 - Math.random() * 1.5,
        size: 3 + Math.random() * 3,
        color: color,
        life: 30,
        maxLife: 30
      });
    }
  } else if (type === 'ripple') {
    // Large shock ring
    particles.push({
      type: 'ripple',
      x: hitX,
      y: hitY,
      vx: 0,
      vy: 0,
      radius: 10,
      color: color,
      life: 20,
      maxLife: 20
    });
  } else if (type === 'flare') {
    // Full screen horizontal and vertical neon flare
    particles.push({
      type: 'flare',
      x: hitX,
      y: hitY,
      vx: 0,
      vy: 0,
      color: color,
      life: 15,
      maxLife: 15
    });
  } else if (type === 'lightning') {
    // lightning arcs jagged
    for (let c = 0; c < 2; c++) {
      const hitCoords = [];
      let tempX = hitX;
      let tempY = hitY;
      for (let s = 0; s < 4; s++) {
        tempX += -15 + Math.random() * 30;
        tempY += -12 - Math.random() * 15;
        hitCoords.push({ x: tempX, y: tempY });
      }
      particles.push({
        type: 'lightning',
        startX: hitX,
        startY: hitY,
        coords: hitCoords,
        size: 1.5,
        vx: 0,
        vy: 0,
        color: color,
        life: 12,
        maxLife: 12
      });
    }
  }
}

// Draw styled Accuracy strings
export function drawStyledAccuracyText(ctx, text, x, y, accElem) {
  const effect = accElem.style.effect;
  const color = accElem.style.color;
  const shadow = accElem.style.shadowColor;

  ctx.save();
  ctx.textAlign = 'center';

  if (effect === 'classic') {
    ctx.font = 'black italic 11px Arial';
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 4;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else if (effect === 'magenta') {
    ctx.font = 'black italic 12px "Impact", Arial';
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 12;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    // Magenta inner overlay
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else if (effect === 'glitch') {
    ctx.font = 'bold 11px "Courier New", monospace';
    // Offset red-green lines
    ctx.fillStyle = shadow;
    ctx.fillText(text, x - 1.5, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x + 1.0, y);
    ctx.fillStyle = 'white';
    ctx.fillText(text, x, y);
  } else if (effect === 'royal') {
    ctx.font = 'italic 12px "Georgia", serif';
    ctx.shadowColor = shadow;
    ctx.shadowBlur = 3;
    ctx.strokeStyle = '#5c3a03';
    ctx.lineWidth = 1.5;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  } else if (effect === 'arcade') {
    ctx.font = 'bold italic 11px system-ui, sans-serif';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2.0;
    ctx.strokeText(text, x, y);
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
}
