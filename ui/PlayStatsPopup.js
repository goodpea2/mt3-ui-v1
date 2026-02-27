
export function showPlayStatsPopup(song, stats, onConfirm) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  // Remove pointer-events-none from layer while popup is active
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const popup = document.createElement('div');
  popup.className = "w-[320px] bg-[#1a0b3d] border-2 border-purple-500/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.4)] animate-in fade-in zoom-in duration-300 flex flex-col";
  
  popup.innerHTML = `
    <div class="relative h-32 w-full">
      <img src="${song.coverUrl}" class="w-full h-full object-cover opacity-40" />
      <div class="absolute inset-0 bg-gradient-to-t from-[#1a0b3d] to-transparent"></div>
      <div class="absolute bottom-4 left-6">
        <h2 class="text-white font-black text-xl uppercase italic tracking-tighter">${song.title}</h2>
        <p class="text-purple-300/60 text-xs font-bold">${song.artist}</p>
      </div>
    </div>

    <div class="px-6 py-4 space-y-4">
      <!-- Stars & Main Stats -->
      <div class="flex justify-between items-center bg-white/5 rounded-2xl p-3 border border-white/10">
        <div class="flex flex-col">
          <span class="text-[10px] font-black text-purple-400 uppercase">Stars Achieved</span>
          <div class="flex gap-1 mt-1">
            ${Array.from({ length: 6 }).map((_, i) => `
              <div class="w-5 h-5 ${i < stats.starLevel ? 'text-yellow-400' : 'text-white/10'}">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-black text-green-400 uppercase">New Stars</span>
          <p class="text-white font-black text-xl italic">+${stats.starsGained}</p>
        </div>
      </div>

      <!-- Note Hits -->
      <div class="grid grid-cols-3 gap-2">
        <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
          <span class="text-[8px] font-black text-cyan-400 uppercase">Perfect</span>
          <span class="text-white font-black text-sm">${stats.perfectCount}</span>
        </div>
        <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
          <span class="text-[8px] font-black text-yellow-400 uppercase">Great</span>
          <span class="text-white font-black text-sm">${stats.greatCount}</span>
        </div>
        <div class="bg-white/5 rounded-xl p-2 border border-white/5 flex flex-col items-center">
          <span class="text-[8px] font-black text-orange-400 uppercase">Good</span>
          <span class="text-white font-black text-sm">${stats.goodCount}</span>
        </div>
      </div>

      <!-- Rewards -->
      <div class="flex gap-2">
        <div class="flex-1 bg-gradient-to-br from-yellow-400/20 to-orange-600/20 rounded-2xl p-3 border border-yellow-500/30 flex items-center justify-between">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/20">
             <span class="text-white font-black text-[12px] leading-none">$</span>
          </div>
          <span class="text-yellow-400 font-black text-lg italic">+${stats.totalCoins}</span>
        </div>
        <div class="flex-1 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-2xl p-3 border border-cyan-500/30 flex items-center justify-between">
          <div class="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg border border-white/20">
             <span class="text-white font-black text-[8px] leading-none">XP</span>
          </div>
          <span class="text-cyan-400 font-black text-lg italic">+${stats.totalXp}</span>
        </div>
      </div>

      <!-- Time Stats -->
      <div class="bg-black/40 rounded-2xl p-3 border border-white/5 space-y-2">
        <div class="flex justify-between text-[10px] font-bold">
          <span class="text-white/40 uppercase">Playing Time</span>
          <span class="text-white">${formatTime(stats.effectiveSongDuration)}</span>
        </div>
        <div class="flex justify-between text-[10px] font-bold">
          <span class="text-white/40 uppercase">Ad Watching</span>
          <span class="text-white">${formatTime(stats.adDuration)}</span>
        </div>
        <div class="flex justify-between text-[10px] font-bold">
          <span class="text-white/40 uppercase">Idle Time</span>
          <span class="text-white">${formatTime(stats.idleDuration)}</span>
        </div>
        <div class="pt-1 border-t border-white/10 flex justify-between text-[11px] font-black">
          <span class="text-purple-400 uppercase">Total Session</span>
          <span class="text-purple-400">${formatTime(stats.totalTime)}</span>
        </div>
      </div>

      <button id="stats-confirm-btn" class="w-full bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-black italic py-3 rounded-2xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-[2px] transition-all shadow-lg text-sm uppercase tracking-widest">
        Awesome!
      </button>
    </div>
  `;

  layer.appendChild(popup);

  const confirmBtn = popup.querySelector('#stats-confirm-btn');
  confirmBtn.onclick = () => {
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      layer.classList.add('pointer-events-none');
      layer.classList.remove('pointer-events-auto', 'bg-black/80', 'backdrop-blur-sm');
      if (onConfirm) onConfirm();
    }, 200);
  };
}
