import { getLevelReward, STAR_JOURNEY_REQUIREMENTS, getStarJourneyLevelAndProgress, PET_BALANCING, LEVEL_BALANCING } from '../balance.js';
import { getTotalStarsCollected } from '../index.js';

export function showStarJourneyPopup(state, onConfirm) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-[#09031c]/90', 'backdrop-blur-md');

  const popup = document.createElement('div');
  popup.className = "w-[94%] max-w-[460px] bg-[#140b2e] border-2 border-[#a855f7]/60 rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(168,85,247,0.3)] animate-in fade-in zoom-in duration-300 flex flex-col p-6 select-none relative max-h-[94vh]";

  // Calculate current stars and journey level
  const totalStars = getTotalStarsCollected(state.songs);
  const journeyInfo = getStarJourneyLevelAndProgress(totalStars);
  const userLevel = journeyInfo.level;
  const nxtReq = journeyInfo.required;
  const currProgress = journeyInfo.progress;
  const progressPercent = Math.min(100, Math.round((currProgress / nxtReq) * 100));

  const maxLevel = LEVEL_BALANCING[LEVEL_BALANCING.length - 1].level;

  function getRewardDetails(tier) {
    if (tier === 1) return { label: 'Star Pass', icon: '🎒', detail: 'Starter Pack' };
    const reward = getLevelReward(tier);
    if (!reward) return { label: '500 Coins', icon: '🪙', detail: 'Bonus reward' };

    if (reward.type === 'coin') {
      return { label: `${reward.amount}`, icon: '🪙', detail: 'Coins Stack' };
    } else if (reward.type === 'song') {
      return { label: '1 Track', icon: '💿', detail: 'New Music' };
    } else if (reward.type === 'key') {
      return { label: `${reward.amount} Keys`, icon: '🔑', detail: 'Unlock Keys' };
    } else if (reward.type === 'decoTicket') {
      return { label: `${reward.amount} Tickets`, icon: '🎫', detail: 'Decoration Tickets' };
    } else if (reward.type === 'item') {
      return { label: reward.name, icon: '🎒', detail: 'Feature unlock' };
    } else if (reward.type === 'pet') {
      const pet = PET_BALANCING.pets.find(p => p.id === reward.petId);
      const info = pet || { name: 'Squad member', avatar: '👾' };
      return { label: info.name, icon: info.avatar, detail: 'Pet unlock' };
    }
    return { label: '500 Coins', icon: '🪙', detail: 'Bonus reward' };
  }

  let tiersHtml = '';

  // Generate Tiers 1 up to maxLevel climbing upwards
  for (let tier = 1; tier <= maxLevel; tier++) {
    const isUnlocked = tier <= userLevel;
    const isActive = tier === userLevel;
    const isLocked = tier > userLevel;
    const rew = getRewardDetails(tier);
    
    // Winding offsets to mimic a real diagonal winding map track
    let alignClass = '';
    let isLeftNode = true;
    
    // Pattern: 1: center-left, 2: center-right, 3: right, 4: left...
    const step = tier % 4;
    if (step === 0) {
      alignClass = "justify-start pl-[5%]";
      isLeftNode = true;
    } else if (step === 1) {
      alignClass = "justify-center -ml-[12%]";
      isLeftNode = true;
    } else if (step === 2) {
      alignClass = "justify-center -mr-[12%] flex-row-reverse";
      isLeftNode = false;
    } else {
      alignClass = "justify-end pr-[5%] flex-row-reverse";
      isLeftNode = false;
    }

    tiersHtml += `
      <!-- Tier Row ${tier} -->
      <div class="flex items-center gap-4 relative w-full ${alignClass} py-2 transition-all duration-300" id="journey-node-${tier}">
        
        <!-- Background connector curves behind the row (only render if not the last item) -->
        ${tier < maxLevel ? `
          <div class="absolute w-[3px] h-20 bg-gradient-to-b ${isUnlocked ? 'from-green-400 to-[#a855f7]/30' : 'from-slate-705/10 to-slate-800/10'} pointer-events-none -bottom-10 ${isLeftNode ? 'left-[45%]' : 'right-[45%]'} -z-10"></div>
        ` : ''}

        <!-- 1. Node Hexagon Badge -->
        <div class="relative z-10 shrink-0">
          <div class="w-12 h-12 flex items-center justify-center relative scale-95 hover:scale-105 transition-all">
            <!-- Glow background if active -->
            ${isActive ? `
              <div class="absolute inset-x-0 inset-y-0 rounded-full bg-green-400/20 blur-md animate-pulse"></div>
            ` : ''}
            
            <!-- Custom stylized Hexagon button -->
            <div class="w-[44px] h-[44px] rounded-xl flex items-center justify-center font-sans font-black text-sm relative border-2 ${
              isActive 
                ? 'bg-[#183935] border-green-400 text-green-300 shadow-[0_0_15px_rgba(52,211,153,0.6)]' 
                : isUnlocked 
                  ? 'bg-slate-900 border-[#a855f7]/80 text-[#e0aaff]' 
                  : 'bg-slate-950/95 border-slate-800 text-slate-500'
            }">
              <span>${tier}</span>
              
              <!-- Checkmark or lock overlay for aesthetic -->
              ${isUnlocked && !isActive ? `
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border border-white/20 rounded-full flex items-center justify-center text-[8px] text-white font-bold">✓</div>
              ` : ''}
              ${isLocked ? `
                <div class="absolute -top-1 -right-1 w-4 h-4 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-[7px] text-slate-400 font-bold">🔒</div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- 2. Reward Card adjacent to hexagon map badge -->
        <div class="relative shrink-0">
          <div class="w-24 h-24 rounded-2xl bg-gradient-to-b ${
            isActive 
              ? 'from-[#2e0854] to-[#140526] border-2 border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.25)] scale-105' 
              : isUnlocked 
                ? 'from-[#1e103f] to-[#0d051f] border border-[#a855f7]/40' 
                : 'from-[#130d24] to-[#07040f] border border-white/5 opacity-50 grayscale'
          } p-2 flex flex-col justify-between items-center relative transition-transform duration-300 shadow-xl group">
            
            <!-- Checkmark / Lock icon on top card -->
            <div class="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center rounded-full ${
              isLocked 
                ? 'bg-slate-950/90 text-slate-500 text-[10px] border border-slate-800' 
                : isActive 
                  ? 'bg-yellow-400 text-slate-950 text-[10px] border border-white/30 animate-bounce'
                  : 'bg-green-500 text-white text-[10px] border border-white/20'
            }">
              ${isLocked ? '🔒' : isActive ? '⭐️' : '✓'}
            </div>

            <!-- Reward Emoji / Avatar -->
            <div class="w-11 h-11 flex items-center justify-center text-3xl shrink-0 mt-1 drop-shadow-md select-none group-hover:scale-110 transition-transform duration-300">
              ${rew.icon}
            </div>

            <!-- Reward Label badge exactly matching concept -->
            <div class="w-full bg-slate-900/60 border border-white/5 rounded-lg py-0.5 text-[9px] font-black tracking-tight text-center text-indigo-200 truncate font-mono">
              ${rew.label}
            </div>
          </div>
        </div>

      </div>
    `;
  }

  popup.innerHTML = `
    <!-- Top Close Button -->
    <button id="journey-close-x" class="absolute top-4 right-4 text-white/45 hover:text-white cursor-pointer transition-colors focus:outline-none focus:ring-0 z-20">
      <svg class="w-7 h-7 border border-white/10 rounded-full p-1.5 bg-black/40" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Star Journey Banner Header -->
    <div class="relative text-center mb-4 pt-1">
      <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-44 h-44 bg-purple-500 opacity-20 blur-3xl rounded-full pointer-events-none"></div>
      
      <h1 class="text-3xl font-extrabold text-white uppercase tracking-wider drop-shadow-lg leading-none" id="star-journey-title" style="text-shadow: 0 4px 10px rgba(0,0,0,0.6)">
        STAR JOURNEY
      </h1>
      
      <p class="text-indigo-300/80 text-xs font-semibold select-none lowercase tracking-wide mt-1.5">
        description
      </p>
    </div>

    <!-- Combined Progress overlay box at the top exactly matching concept layout -->
    <div class="bg-[#1c1236]/90 border border-white/5 rounded-2xl p-3 flex items-center justify-between mb-4 shadow-2xl relative z-10">
      
      <!-- Purple gamer character mini portrait icon representing player progress -->
      <div class="w-12 h-12 bg-indigo-950 border-2 border-purple-500/30 rounded-xl flex items-center justify-center text-3xl font-black shadow-lg relative shrink-0">
        🙋‍♀️
        <div class="absolute inset-0 bg-gradient-to-t from-fuchsia-500/10 to-transparent rounded-xl"></div>
      </div>

      <!-- Hexagon Level Circle Progress Bar -->
      <div class="flex-1 flex items-center justify-between ml-3 gap-2">
        <div class="w-8 h-8 rounded-lg bg-indigo-900 border border-green-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
          <span class="text-green-300 font-sans font-black text-xs">${userLevel}</span>
        </div>
        
        <!-- Progress bar filling up -->
        <div class="flex-1 bg-slate-900/90 h-6 border border-white/10 rounded-full overflow-hidden relative flex items-center p-0.5">
          <div class="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full rounded-full transition-all duration-500" style="width: ${userLevel >= maxLevel ? 100 : progressPercent}%"></div>
          <div class="absolute inset-0 flex items-center justify-center text-[10px] text-white font-black font-sans tracking-wide">
            ${userLevel >= maxLevel ? '100% UNLOCKED' : `${currProgress} / ${nxtReq}`}
          </div>
        </div>
      </div>

    </div>

    <!-- Vertical Boardgame Track Map Scroll area -->
    <div class="flex-1 overflow-y-auto pr-1 pl-1 py-4 mb-4 select-none scroll-smooth relative rounded-2xl bg-[#09031c]/55 border border-white/5 shadow-inner" id="journey-vertical-track" style="height: 380px;">
      
      <!-- Continuous glowing path trail background decoration inside track -->
      <div class="absolute left-1/2 top-0 bottom-0 w-0.5 border-r border-dashed border-white/5 pointer-events-none -translate-x-1/2 -z-20"></div>

      <div class="flex flex-col-reverse gap-6 w-full relative z-10 px-2">
        ${tiersHtml}
      </div>
    </div>

    <!-- Claim / Confirm button -->
    <div class="flex flex-col shrink-0">
      <button id="journey-claim-btn" class="w-full bg-gradient-to-r from-fuchsia-600 via-purple-650 to-indigo-600 text-white font-black italic py-3 rounded-2xl active:scale-[0.99] hover:brightness-110 transition-all shadow-[0_6px_20px_rgba(168,85,247,0.35)] text-xs uppercase tracking-widest pointer-events-auto">
        LOBBY LOBBY
      </button>
    </div>
  `;

  layer.appendChild(popup);

  // Auto-scroll inside vertical track to keep active tier node centered!
  setTimeout(() => {
    const activeNode = popup.querySelector(`#journey-node-${userLevel}`);
    const scrollContainer = popup.querySelector("#journey-vertical-track");
    if (activeNode && scrollContainer) {
      // scroll to active node vertically
      const offsetTop = activeNode.offsetTop;
      const containerHeight = scrollContainer.clientHeight;
      scrollContainer.scrollTop = offsetTop - (containerHeight / 2) + (activeNode.clientHeight / 2);
    }
  }, 150);

  const closeBtn = popup.querySelector('#journey-claim-btn');
  const closeX = popup.querySelector('#journey-close-x');

  const performClose = () => {
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      layer.classList.add('pointer-events-none');
      layer.classList.remove('pointer-events-auto', 'bg-[#09031c]/90', 'backdrop-blur-md');
      if (onConfirm) onConfirm();
    }, 200);
  };

  closeBtn.onclick = performClose;
  closeX.onclick = performClose;
}
