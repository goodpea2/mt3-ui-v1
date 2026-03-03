
import { LEVEL_BALANCING, DYNAMIC_SONG_CONFIG, PLAY_STAT } from '../balance.js';

export function renderDebug(state, getCurrentDynamicCost) {
  const container = document.getElementById('debug-root');
  if (!container) return;
  
  if (!state.debugMode) {
    container.innerHTML = `
      <div class="absolute top-4 left-4 pointer-events-auto">
        <button onclick="window.toggleDebug()" class="bg-black/60 border border-cyan-500/50 text-cyan-400 text-[8px] font-black px-2 py-1 rounded hover:bg-cyan-500/20 transition-all">DEBUG</button>
      </div>
    `;
    return;
  }

  const cheatBtnClass = "bg-gradient-to-b from-cyan-400 to-blue-500 text-white font-black italic text-[9px] px-3 py-2 rounded-xl border-b-2 border-blue-900 active:border-b-0 active:translate-y-[1px] transition-all shadow-md uppercase text-center";

  container.innerHTML = `
    <div class="pointer-events-auto w-full h-[98vh] bg-[#0c051d] border-b border-white/20 overflow-y-auto no-scrollbar p-4 flex flex-col gap-4 pb-20">
      <!-- Close Trigger -->
      <div class="flex justify-end shrink-0">
        <button onclick="window.toggleDebug()" class="bg-red-500 text-white font-black px-3 py-1 rounded text-[10px]">CLOSE</button>
      </div>

      <!-- Stats Panel -->
      <div class="bg-white/5 rounded-lg border border-white/10 p-3 flex flex-col gap-1 text-[10px] font-black italic text-cyan-400">
         <p>Total play count: ${state.stats.totalPlayCount}</p>
         <p>Total XP gained: ${state.stats.totalXpGained.toLocaleString()}</p>
         <p>Total Coin gained: ${state.stats.totalCoinGained.toLocaleString()}</p>
         <p>Total Coin spent: ${state.stats.totalCoinSpent.toLocaleString()}</p>
         <p class="text-purple-400 mt-1">Total Time Playing: ${Math.floor(state.stats.totalTimeSpentPlaying / 60)}m ${state.stats.totalTimeSpentPlaying % 60}s</p>
         <p class="text-purple-400">Total Time Ads: ${Math.floor(state.stats.totalTimeSpentWatchingAd / 60)}m ${state.stats.totalTimeSpentWatchingAd % 60}s</p>
         <p class="text-purple-400">Total Ads Watched: ${state.stats.totalAdCount}</p>
      </div>

      <!-- Cheat Buttons -->
      <div class="grid grid-cols-2 gap-2 shrink-0">
        <button onclick="window.add1000Xp()" class="${cheatBtnClass}">Add 1000 XP</button>
        <button onclick="window.add1000Coins()" class="${cheatBtnClass}">Add 1000 Coins</button>
        <button onclick="window.unlockAllSongs()" class="${cheatBtnClass}">Unlock All Songs</button>
        <button onclick="window.lockAllSongs()" class="${cheatBtnClass}">Lock All Songs</button>
        <button onclick="window.resetToLevel1()" class="${cheatBtnClass}">Reset XP Level</button>
        <button onclick="window.resetAllCounters()" class="${cheatBtnClass}">Reset Counters</button>
        <button onclick="window.rewardAllFigures()" class="${cheatBtnClass}">Reward All Figures</button>
        <button onclick="window.resetAllFigures()" class="${cheatBtnClass}">Reset All Figures</button>
      </div>

      <!-- Dynamic Pricing Config -->
      <div class="space-y-2 p-3 bg-white/5 rounded-lg border border-white/10">
        <div class="flex justify-between items-center mb-1">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">Dynamic Pricing</h3>
          <button onclick="window.toggleDynamicCost()" class="px-3 py-1 rounded text-[8px] font-black ${state.dynamicSongCostEnabled ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'}">
            ${state.dynamicSongCostEnabled ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
        ${state.dynamicSongCostEnabled ? `
          <div class="grid grid-cols-2 gap-2">
            <div>
              <p class="debug-label">Initial Cost</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.initialCoinCost}" oninput="window.updateDynamicParam('initialCoinCost', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Incr / Step</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.coinCostIncreasePerStep}" oninput="window.updateDynamicParam('coinCostIncreasePerStep', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Purchases / Step</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.songPurchasesPerStep}" oninput="window.updateDynamicParam('songPurchasesPerStep', this.value)" class="debug-input" />
            </div>
            <div>
              <p class="debug-label">Max Cost</p>
              <input type="number" value="${DYNAMIC_SONG_CONFIG.maxCoinCost}" oninput="window.updateDynamicParam('maxCoinCost', this.value)" class="debug-input" />
            </div>
          </div>
          <p class="text-green-400 text-[8px] font-black italic mt-1 uppercase">Current price: ${getCurrentDynamicCost()} | Step: ${Math.floor(state.purchasedSongCount / DYNAMIC_SONG_CONFIG.songPurchasesPerStep)}</p>
        ` : ''}
      </div>

      <!-- Play Config -->
      <div class="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col">
        <div class="flex justify-between items-center mb-1 shrink-0">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">Play Config (Simulation)</h3>
          <button onclick="window.toggleDebugSection('play')" class="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">CONFIG</button>
        </div>
        ${state.debugSections.play ? `
          <div class="space-y-4 mt-2 pr-1">
            <!-- Star Config -->
            <div class="space-y-2">
              <p class="text-white/40 text-[8px] font-bold uppercase border-b border-white/5 pb-1">Star Config</p>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="debug-label">Weights for Stars (0-6)</p>
                  <input type="text" value="${PLAY_STAT.starConfig.weightForStars.join(', ')}" onchange="window.updatePlayStat('starConfig.weightForStars', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Extra coins for New Star (1-6)</p>
                  <input type="text" value="${PLAY_STAT.starConfig.coinForNewStar.join(', ')}" onchange="window.updatePlayStat('starConfig.coinForNewStar', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Base coins for Repeated Star (1-6)</p>
                  <input type="text" value="${PLAY_STAT.starConfig.coinForRepeatedStar.join(', ')}" onchange="window.updatePlayStat('starConfig.coinForRepeatedStar', this.value, true)" class="debug-input" />
                </div>
              </div>
            </div>

            <!-- Note Config -->
            <div class="space-y-2">
              <p class="text-white/40 text-[8px] font-bold uppercase border-b border-white/5 pb-1">Note Config</p>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="debug-label">Note Count Min (0-6 stars)</p>
                  <input type="text" value="${PLAY_STAT.noteConfig.noteCountMin.join(', ')}" onchange="window.updatePlayStat('noteConfig.noteCountMin', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Note Count Max (0-6 stars)</p>
                  <input type="text" value="${PLAY_STAT.noteConfig.noteCountMax.join(', ')}" onchange="window.updatePlayStat('noteConfig.noteCountMax', this.value, true)" class="debug-input" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="debug-label">XP Per Hit Accuracy (Pf,Gr,Go)</p>
                    <input type="text" value="${PLAY_STAT.noteConfig.xpPerAccuracy.join(', ')}" onchange="window.updatePlayStat('noteConfig.xpPerAccuracy', this.value, true)" class="debug-input" />
                  </div>
                  <div>
                    <p class="debug-label">Guaranteed XP Per Play (Min,Max)</p>
                    <input type="text" value="${PLAY_STAT.guaranteedXpPerPlay.join(', ')}" onchange="window.updatePlayStat('guaranteedXpPerPlay', this.value, true)" class="debug-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- XP Multipliers -->
            <div class="space-y-2">
              <p class="text-white/40 text-[8px] font-bold uppercase border-b border-white/5 pb-1">XP Multipliers</p>
              <div class="grid grid-cols-1 gap-2">
                <div>
                  <p class="debug-label">Difficulty XP Bonus (diff 1-6)</p>
                  <input type="text" value="${PLAY_STAT.songDifficultyXpBonus.join(', ')}" onchange="window.updatePlayStat('songDifficultyXpBonus', this.value, true)" class="debug-input" />
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="debug-label">Deluxe XP Bonus</p>
                    <input type="number" step="0.1" value="${PLAY_STAT.songDeluxeXpBonus}" oninput="window.updatePlayStat('songDeluxeXpBonus', this.value)" class="debug-input" />
                  </div>
                  <div>
                    <p class="debug-label">SotD XP Bonus</p>
                    <input type="number" step="0.1" value="${PLAY_STAT.songOfTheDayXpBonus}" oninput="window.updatePlayStat('songOfTheDayXpBonus', this.value)" class="debug-input" />
                  </div>
                </div>
              </div>
            </div>

            <!-- Global Durations -->
            <div class="space-y-2">
              <p class="text-white/40 text-[8px] font-bold uppercase border-b border-white/5 pb-1">Durations & Rewards</p>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <p class="debug-label">Song Duration (Min,Max)</p>
                  <input type="text" value="${PLAY_STAT.songDuration.join(', ')}" onchange="window.updatePlayStat('songDuration', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Ad Duration (Min,Max)</p>
                  <input type="text" value="${PLAY_STAT.adDuration.join(', ')}" onchange="window.updatePlayStat('adDuration', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Idle Duration (Min,Max)</p>
                  <input type="text" value="${PLAY_STAT.idleDuration.join(', ')}" onchange="window.updatePlayStat('idleDuration', this.value, true)" class="debug-input" />
                </div>
                <div>
                  <p class="debug-label">Guaranteed Coins Per Play (Min,Max)</p>
                  <input type="text" value="${PLAY_STAT.guaranteedCoins.join(', ')}" onchange="window.updatePlayStat('guaranteedCoins', this.value, true)" class="debug-input" />
                </div>
              </div>
            </div>
          </div>
        ` : ''}
      </div>

      <!-- XP Level Config -->
      <div class="p-3 bg-white/5 rounded-lg border border-white/10 flex flex-col shrink-0">
        <div class="flex justify-between items-center mb-1 shrink-0">
          <h3 class="text-white text-[10px] font-black uppercase tracking-tighter">XP Level Config</h3>
          <button onclick="window.toggleDebugSection('xp')" class="text-[8px] font-black bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded border border-cyan-500/30">CONFIG</button>
        </div>
        ${state.debugSections.xp ? `
          <div class="flex flex-col gap-2 mt-2">
            <textarea 
              class="debug-input h-48 font-mono text-[8px] leading-tight whitespace-pre overflow-x-auto" 
              onchange="window.updateAllLevelBalancing(this.value)"
            >${LEVEL_BALANCING.map(item => JSON.stringify(item)).join(',\n')}</textarea>
            <p class="text-[8px] text-white/20 italic">Format: {xpRequired: 200, reward: {type: 'coin', amount: 100}}, ...</p>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}
