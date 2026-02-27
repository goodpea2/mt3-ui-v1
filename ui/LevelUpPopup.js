
export function showLevelUpPopup(level, rewards, onConfirm) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/80', 'backdrop-blur-md');

  const popup = document.createElement('div');
  popup.className = "w-[340px] bg-[#1a0b3d] border-2 border-yellow-500/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(234,179,8,0.3)] animate-in fade-in zoom-in duration-300 flex flex-col items-center p-6 text-center";
  
  const getRewardHtml = (reward) => {
    if (reward.type === 'coin') {
      return `
        <div class="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-2xl p-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
             <span class="text-white font-black text-xl leading-none">$</span>
          </div>
          <div class="text-left">
            <p class="text-yellow-400 font-black text-lg italic leading-none">+${reward.amount}</p>
            <p class="text-white/40 text-[8px] font-bold uppercase tracking-widest mt-1">Coins Reward</p>
          </div>
        </div>
      `;
    } else if (reward.type === 'song') {
      return `
        <div class="w-full bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <img src="https://picsum.photos/seed/${reward.songId}/100/100" class="w-10 h-10 rounded-xl object-cover shrink-0" />
          <div class="text-left">
            <p class="text-cyan-400 font-black text-[8px] uppercase tracking-widest leading-none mb-1">New Song Unlocked!</p>
            <p class="text-white font-black text-xs uppercase italic truncate">${reward.songId.replace('-', ' ')}</p>
          </div>
        </div>
      `;
    } else if (reward.type === 'themeSet') {
      return `
        <div class="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-2xl p-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
             <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div class="text-left">
            <p class="text-pink-400 font-black text-xs uppercase italic leading-none">New Theme Set</p>
            <p class="text-white/40 text-[8px] font-bold uppercase tracking-widest mt-1">Visual Reward</p>
          </div>
        </div>
      `;
    } else if (reward.type === 'noteSkin') {
      return `
        <div class="flex items-center gap-3 w-full bg-white/5 border border-white/10 rounded-2xl p-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
             <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
          </div>
          <div class="text-left">
            <p class="text-cyan-400 font-black text-xs uppercase italic leading-none">New Note Skin</p>
            <p class="text-white/40 text-[8px] font-bold uppercase tracking-widest mt-1">Visual Reward</p>
          </div>
        </div>
      `;
    }
    return '';
  };

  const rewardsList = Array.isArray(rewards) ? rewards : [rewards];
  const rewardsHtml = rewardsList.map(r => getRewardHtml(r)).join('');

  popup.innerHTML = `
    <div class="relative mb-4">
      <div class="absolute inset-0 bg-yellow-400 blur-2xl opacity-20 animate-pulse"></div>
      <h1 class="text-4xl font-black text-white italic uppercase tracking-tighter relative">Level Up!</h1>
      <p class="text-yellow-400 font-black text-xl uppercase tracking-widest mt-1">Reached LV.${level}</p>
    </div>

    <div class="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6"></div>

    <div class="mb-8 w-full flex flex-col items-center">
      <p class="text-white/40 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Rewards Unlocked</p>
      <div class="w-full space-y-2 max-h-[240px] overflow-y-auto no-scrollbar pr-1">
        ${rewardsHtml}
      </div>
    </div>

    <button id="levelup-confirm-btn" class="w-full bg-gradient-to-b from-yellow-400 to-orange-600 text-white font-black italic py-4 rounded-2xl border-b-4 border-orange-900 active:border-b-0 active:translate-y-[2px] transition-all shadow-[0_10px_20px_rgba(234,179,8,0.3)] text-base uppercase tracking-widest">
      Claim Rewards
    </button>
  `;

  layer.appendChild(popup);

  const confirmBtn = popup.querySelector('#levelup-confirm-btn');
  confirmBtn.onclick = () => {
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      layer.classList.add('pointer-events-none');
      layer.classList.remove('pointer-events-auto', 'bg-black/80', 'backdrop-blur-md');
      if (onConfirm) onConfirm();
    }, 200);
  };
}
