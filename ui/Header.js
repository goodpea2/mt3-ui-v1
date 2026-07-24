
import { getStarJourneyLevelAndProgress, BOSS_BALANCING, getBossMaxHp } from '../balance.js';
import { getTotalStarsCollected } from '../index.js';

export function renderHeader(state) {
  // Sync visualUser stats with actual user stats if no particles are currently animating
  if (state.visualUser && state.user) {
    if (!document.querySelector('.vfx-particle')) {
      state.visualUser.coins = state.user.coins;
      state.visualUser.keys = state.user.keys;
      state.visualUser.decoTickets = state.user.decoTickets || 0;
      state.visualUser.totalStars = state.user.totalStars || 0;
      state.visualUser.level = state.user.level;
    } else {
      // In case they are undefined, fallback immediately
      if (state.visualUser.coins === undefined || state.visualUser.coins === null) state.visualUser.coins = state.user.coins;
      if (state.visualUser.keys === undefined || state.visualUser.keys === null) state.visualUser.keys = state.user.keys;
      if (state.visualUser.decoTickets === undefined || state.visualUser.decoTickets === null) state.visualUser.decoTickets = state.user.decoTickets || 0;
      if (state.visualUser.totalStars === undefined || state.visualUser.totalStars === null) state.visualUser.totalStars = state.user.totalStars || 0;
      if (state.visualUser.level === undefined || state.visualUser.level === null) state.visualUser.level = state.user.level;
    }
  }

  const totalStars = getTotalStarsCollected(state.songs);
  // Ensure we use the visual totalStars for the header progress animation
  const journey = getStarJourneyLevelAndProgress(state.visualUser.totalStars || 0);
  const starsPct = (journey.progress / journey.required) * 100;

  // Boss progress for main menu (enabled on second boss onwards)
  const bState = state.bossState || { bossNum: 1, currentBossIdx: 0, currentBossHp: 4000 };
  const showBossProgress = bState.bossNum >= 2;
  let bossProgressHtml = '';
  if (showBossProgress) {
    const loopIndex = (bState.bossNum - 1) % 10;
    const currentBoss = BOSS_BALANCING[loopIndex] || BOSS_BALANCING[0];
    const maxHp = getBossMaxHp(bState.bossNum);
    if (bState.currentBossHp === undefined || bState.currentBossHp === null) {
      bState.currentBossHp = maxHp;
    }
    const hpPct = Math.min(100, Math.max(0, (bState.currentBossHp / maxHp) * 100));
    bossProgressHtml = `
      <div class="flex items-center gap-1 bg-[#1a0b3d]/60 border border-rose-500/30 rounded-xl px-1.5 py-0.5 select-none shadow-[0_0_12px_rgba(244,63,94,0.15)] mx-1">
        <span class="text-xs leading-none animate-bounce shrink-0" style="animation-duration: 2.5s">${currentBoss.avatar}</span>
        <div class="flex flex-col">
          <span class="text-[10px] font-mono font-black text-white/80 leading-none shrink-0">${Math.floor(bState.currentBossHp).toLocaleString()} HP</span>
          <div class="w-12 sm:w-14 h-1 bg-black/40 border border-white/5 rounded-full overflow-hidden mt-0.5 relative flex items-center">
            <div class="h-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 transition-all duration-300" style="width: ${hpPct}%"></div>
          </div>
        </div>
      </div>
    `;
  }
  
  const container = document.getElementById('header-root');
  if (!container) return;
  container.innerHTML = `
    <div class="px-3 py-2 flex items-center justify-between z-10 bg-black/20 backdrop-blur-md select-none">
      <div onclick="window.openStarJourney()" class="flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-200" title="Click to view Star Journey Battle Pass">
        <div class="relative">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-800 border-2 border-white/20 p-0.5 overflow-hidden shadow-xl animate-pulse" style="animation-duration: 4s">
            <img src="https://picsum.photos/seed/avatar/200/200" alt="Avatar" class="w-full h-full object-cover rounded-xl" />
          </div>
          <div class="absolute -bottom-1 -right-1 bg-gradient-to-b from-fuchsia-500 to-pink-600 border-2 border-[#1a0b3d] text-white text-[9.5px] font-black px-1.5 py-0 rounded-lg shadow-lg">
            ${journey.level}
          </div>
        </div>
        <div class="flex flex-col gap-0.5">
          <span class="text-white font-black text-xs ml-1 flex items-center gap-1">
            ${state.user.name}
          </span>
          <div id="stars-target" class="relative w-32 h-3 bg-[#1a0b3d] border border-white/10 rounded-full overflow-hidden flex items-center shadow-inner">
             <div class="absolute h-full left-0 top-0 bg-gradient-to-r from-fuchsia-500 to-yellow-500 transition-all duration-300" style="width: ${starsPct}%"></div>
             <div class="relative w-full text-center text-[7.5px] font-black text-white/95 z-10 font-mono tracking-wide leading-none select-none">
               STARS ${journey.progress} / ${journey.required} ⭐
             </div>
          </div>
        </div>
      </div>

      ${bossProgressHtml}

      <div class="flex items-center gap-1.5">
        ${state.activeCategory === 'STAGE' ? `
          <!-- Decoration Tickets -->
          <div id="coins-target" class="bg-[#1a0b3d] border-2 border-pink-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-inner transition-all duration-300">
            <span class="text-[11px] leading-none">🎨</span>
            <span class="text-pink-400 font-extrabold text-[10.5px] font-mono leading-none tracking-tight">${Math.floor(state.visualUser.decoTickets || 0).toLocaleString()}</span>
          </div>
        ` : `
          <!-- Coins -->
          <div id="coins-target" onclick="window.openCurrencyShop()" class="relative bg-[#1a0b3d] border-2 border-[#4a2d8a] hover:border-purple-400 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 ${journey.level >= 2 ? '' : 'hidden'}" title="Click to open Currency Shop">
            ${(state.currencyShopLimits && state.currencyShopLimits.coinsFree < 1) ? `
              <div class="absolute -top-2.5 -right-1.5 bg-gradient-to-r from-red-500 to-amber-500 border border-[#1a0b3d] text-white text-[7.5px] font-black px-1.5 py-0.5 rounded shadow-[0_1px_5px_rgba(239,68,68,0.5)] leading-none uppercase select-none animate-bounce z-40">
                FREE
              </div>
            ` : ''}
            <span class="text-[11px] leading-none">🪙</span>
            <span class="text-yellow-400 font-extrabold text-[10.5px] font-mono leading-none tracking-tight">${Math.floor(state.visualUser.coins).toLocaleString()}</span>
          </div>
        `}

        <!-- Keys -->
        <div id="keys-holder" onclick="window.openCurrencyShop()" class="bg-[#1a0b3d] border-2 border-cyan-500/40 hover:border-cyan-400 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ${journey.level >= 2 ? '' : 'hidden'}" title="Click to open Currency Shop">
          <span class="text-[11px] leading-none">🔑</span>
          <span class="text-cyan-400 font-extrabold text-[10.5px] font-mono leading-none tracking-tight">${Math.floor(state.visualUser.keys || 0).toLocaleString()}</span>
        </div>
      </div>
    </div>
  `;
}
