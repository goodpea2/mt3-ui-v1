
import { getXpRequired } from '../balance.js';

export function renderHeader(state) {
  const reqXp = getXpRequired(state.visualUser.level);
  const xpPct = (state.visualUser.xp / reqXp) * 100;
  
  const container = document.getElementById('header-root');
  if (!container) return;
  container.innerHTML = `
    <div class="px-3 py-2 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md">
      <div class="flex items-center gap-2">
        <div class="relative">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-800 border-2 border-white/20 p-0.5 overflow-hidden shadow-xl">
            <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" class="w-full h-full object-cover rounded-xl" />
          </div>
          <div class="absolute -bottom-1 -right-1 bg-gradient-to-b from-[#4ade80] to-[#22c55e] border-2 border-[#1a0b3d] text-white text-[9px] font-black px-1 py-0 rounded-lg shadow-lg">
            LV.${state.visualUser.level}
          </div>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-white font-black text-xs ml-1">${state.user.name}</span>
          <div id="xp-target" class="relative w-32 h-3 bg-[#1a0b3d] border border-white/10 rounded-full overflow-hidden flex items-center shadow-inner">
             <div class="absolute h-full left-0 top-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300" style="width: ${xpPct}%"></div>
             <div class="relative w-full text-center text-[7px] font-black text-white/80 z-10 uppercase tracking-widest">
               XP ${Math.floor(state.visualUser.xp)} / ${reqXp}
             </div>
          </div>
        </div>
      </div>
      <div id="coins-target" class="bg-[#1a0b3d] border-2 border-[#4a2d8a] rounded-xl px-2 py-1 flex items-center gap-1.5 shadow-inner transition-transform duration-300">
        <div class="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/20">
           <span class="text-white font-black text-[10px] leading-none">$</span>
        </div>
        <span class="text-yellow-400 font-black text-base italic tracking-tighter drop-shadow-sm">${Math.floor(state.visualUser.coins).toLocaleString()}</span>
      </div>
    </div>
  `;
}
