import { BOSS_BALANCING, BOSS_BALANCING_SCALING, PET_BALANCING, getBossMaxHp } from '../balance.js';
import { state } from '../state.js';
import { getStageCollectionBonus } from './StageCustomizer.js';

export function showBossBattlePopup(stats, onComplete) {
  const layer = document.getElementById('popup-layer');
  if (!layer) {
    if (onComplete) onComplete();
    return;
  }

  // Active layer overlay setup with high specificity classes
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/90', 'backdrop-blur-md');

  const bState = state.bossState;
  bState.bossNum = bState.bossNum || 1;
  const loopIndex = (bState.bossNum - 1) % 10;
  const currentBoss = BOSS_BALANCING[loopIndex] || BOSS_BALANCING[0];
  const loopOffset = Math.floor((bState.bossNum - 1) / 10);
  const maxHp = getBossMaxHp(bState.bossNum);
  const originalHp = (bState.currentBossHp !== undefined && bState.currentBossHp !== null) ? bState.currentBossHp : maxHp;

  // Compute damage components
  const petContribs = (stats && stats.petContributions) || {};
  let totalPetDmg = 0;
  for (let key in petContribs) {
    if (key.startsWith('pet')) {
      totalPetDmg += petContribs[key] || 0;
    }
  }
  
  const scoreDamage = typeof stats === 'number' ? stats : (stats?.score || 0);
  const playerBaseScoreDamage = Math.max(0, scoreDamage - totalPetDmg);
  const playerDamage = 4000; // co-op player bonus damage
  const stageCollectionBonus = getStageCollectionBonus(state);

  const totalDamage = playerBaseScoreDamage + playerDamage + totalPetDmg + stageCollectionBonus;
  
  // Pet active checking for visual indicators only
  const PETS_LIST_BATTLE = PET_BALANCING.pets;
  
  let petLabelHtml = '';
  let activeCompanionsHtml = '';
  
  PETS_LIST_BATTLE.forEach(pet => {
    const isUnlocked = state.unlockedPets.has(pet.id);
    const isSleeping = state.petSleepUntil && (state.petSleepUntil[pet.id] > Date.now());
    if (isUnlocked && !isSleeping) {
      activeCompanionsHtml += `
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-pink-500 border-2 border-white/40 flex items-center justify-center text-lg shadow-[0_0_15px_rgba(236,72,153,0.6)] animate-bounce shrink-0" style="animation-duration: ${1.8 + pet.id * 0.3}s">
          ${pet.avatar}
        </div>
      `;
    }
  });
  
  if (activeCompanionsHtml !== '') {
    petLabelHtml = `
      <div id="active-pet-battle-avatar" class="absolute -top-3 -right-6 flex items-center gap-0.5 max-w-[120px] overflow-visible shrink-0">
        ${activeCompanionsHtml}
      </div>
    `;
  }
  
  const petContributionsList = [];
  PET_BALANCING.pets.forEach(p => {
    const dmg = petContribs[`pet${p.id}`] || 0;
    if (dmg > 0) {
      petContributionsList.push({ avatar: p.avatar, name: p.name, pts: dmg });
    }
  });

  let contribsHtml = `
    <div class="mt-1.5 w-full max-w-[270px] space-y-1 mx-auto bg-black/40 border border-white/5 rounded-xl p-2 font-mono text-[8px] text-left uppercase tracking-tight">
      <div class="flex justify-between border-b border-white/10 pb-0.5 mb-1 text-[7px] text-indigo-300 font-bold font-sans">
        <span></span>
        <span>SCORE / DAMAGE</span>
      </div>
      ${playerBaseScoreDamage > 0 ? `
      <div class="flex justify-between">
        <span class="text-white/60">SCORE:</span>
        <span class="text-white font-extrabold">+${playerBaseScoreDamage.toLocaleString()}</span>
      </div>
      ` : ''}
      ${playerDamage > 0 ? `
      <div class="flex justify-between">
        <span class="text-white/60">PLAYER BASE:</span>
        <span class="text-pink-400 font-extrabold">+${playerDamage.toLocaleString()}</span>
      </div>
      ` : ''}
      ${stageCollectionBonus > 0 ? `
      <div class="flex justify-between">
        <span class="text-white/60">STAGE COLLECTION BONUS:</span>
        <span class="text-yellow-400 font-extrabold">+${stageCollectionBonus.toLocaleString()}</span>
      </div>
      ` : ''}
      ${petContributionsList.map(p => `
        <div class="flex justify-between">
          <span class="text-white/60">${p.avatar} ${p.name}:</span>
          <span class="text-fuchsia-400 font-extrabold">+${p.pts.toLocaleString()}</span>
        </div>
      `).join('')}
    </div>
  `;

  const newHp = Math.max(0, originalHp - totalDamage);
  const isDefeated = newHp <= 0;

  // Render popup skeleton
  const popup = document.createElement('div');
  popup.className = "w-[330px] bg-[#0c051c] border-2 border-indigo-500/50 rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(99,102,241,0.5)] flex flex-col font-sans relative select-none animate-in fade-in zoom-in duration-300";

  // CSS Animations for jump charge, shake, damage numbers, and defeat vfx
  popup.innerHTML = `
    <style>
      @keyframes battle-player-charge {
        0% { transform: translate(0, 0) scale(1); }
        30% { transform: translate(-15px, 10px) scale(0.95); }
        50% { transform: translate(120px, -70px) scale(1.25); }
        70% { transform: translate(105px, -55px) scale(1.15); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes battle-boss-shake {
        0%, 100% { transform: translate(0, 0); }
        10%, 30%, 50%, 70%, 90% { transform: translate(-8px, -4px); filter: brightness(2) saturate(2); }
        20%, 40%, 60%, 80% { transform: translate(8px, 4px); filter: brightness(3); }
      }
      @keyframes battle-damage-float {
        0% { transform: translateY(10px) scale(0.5); opacity: 0; }
        20% { transform: translateY(-15px) scale(1.3); opacity: 1; }
        80% { transform: translateY(-40px) scale(1.1); opacity: 1; filter: blur(0); }
        100% { transform: translateY(-60px) scale(0.8); opacity: 0; filter: blur(1px); }
      }
      @keyframes battle-boss-defeat {
        0% { transform: scale(1) rotate(0); opacity: 1; filter: none; }
        30% { transform: scale(1.2) rotate(-15deg); opacity: 0.8; filter: hue-rotate(90deg) brightness(3); }
        100% { transform: scale(0) rotate(270deg); opacity: 0; }
      }

      .animate-charge { animation: battle-player-charge 0.8s ease-in-out; }
      .animate-shake { animation: battle-boss-shake 0.6s ease-in-out; }
      .animate-damage { animation: battle-damage-float 1.2s forwards cubic-bezier(0.18, 0.89, 0.32, 1.28); }
      .animate-defeat { animation: battle-boss-defeat 1.1s forwards ease-in-out; }
    </style>

    <!-- Battle Stage Sandbox -->
    <div class="h-44 w-full bg-[#110926] relative overflow-hidden flex flex-col justify-between p-4 border-b border-indigo-500/20">
      <!-- Grid Decoration Overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/30 via-transparent to-transparent opacity-60 z-0"></div>
      <div class="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none z-0"></div>

      <!-- Enemy Boss Node (Top-Right Layout) -->
      <div id="boss-area-node" class="self-end flex flex-col items-end w-[180px] z-10 transition-all duration-300">
        <!-- Name & Status -->
        <div class="flex items-center gap-1.5 justify-end">
          <span class="text-white text-[11px] font-black italic tracking-tight uppercase">${currentBoss.name}</span>
          <span class="text-[8px] bg-red-500/20 text-red-400 border border-red-500/30 px-1 py-0.2 rounded uppercase font-black">LV.${currentBoss.id}</span>
        </div>
        <!-- Health Bar -->
        <div class="w-full h-2.5 bg-black/50 border border-white/10 rounded-full mt-1.5 overflow-hidden flex items-center p-[1.5px]">
          <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-400 rounded-full transition-all duration-1000 ease-out" style="width: ${(originalHp/maxHp)*100}%"></div>
        </div>
        <!-- HP Label -->
        <span id="boss-hp-text" class="text-white/60 text-[8px] font-mono font-black mt-0.5 uppercase">${originalHp.toLocaleString()} / ${maxHp.toLocaleString()} HP</span>
      </div>

      <!-- Boss Monster Representation (Middle Right) -->
      <div id="boss-avatar-container" class="absolute top-12 right-6 z-10 text-6xl flex items-center justify-center transition-all">
        <span class="transform hover:scale-110 active:scale-95 transition-transform cursor-pointer filter drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]">${currentBoss.avatar}</span>
      </div>

      <!-- Damage Number Splash Node -->
      <div id="damage-text-splash" class="absolute top-14 right-14 z-20 text-red-500 font-black text-2xl uppercase italic tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] opacity-0 select-none pointer-events-none"></div>

      <!-- Player Hero Representation (Bottom Left Layout) -->
      <div id="player-node" class="self-start flex items-center gap-2.5 pt-4 z-10 transition-all">
        <div class="relative">
          <div id="player-avatar-box" class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl border-2 border-white/20 shadow-[0_4px_12px_rgba(99,102,241,0.4)]">
            ✨
          </div>
          ${petLabelHtml}
        </div>
        <div class="flex flex-col">
          <div class="flex items-center gap-1.5">
            <span class="text-white text-[11px] font-extrabold uppercase tracking-tight">${state.user.name}</span>
            <span class="text-[8px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1 py-0.2 rounded font-black font-mono">LV.${state.user.level}</span>
          </div>
          <!-- Simple exp bar design for symmetry -->
          <div class="w-24 h-1.5 bg-black/40 border border-white/5 rounded-full mt-1.5 overflow-hidden">
            <div class="h-full bg-cyan-400 rounded-full" style="width: 60%"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Battle Console TextBox -->
    <div class="p-4 bg-[#0a0416] flex-grow flex flex-col justify-between min-h-[160px]">
      <div id="battle-console-textbox" class="bg-black/30 border border-indigo-950 p-2.5 rounded-2xl min-h-[130px] flex flex-col items-center justify-center text-center font-mono text-[10px] leading-relaxed text-indigo-200 uppercase tracking-wide">
        Preparing Combat Round...
      </div>

      <!-- Continue/Claim rewards button container -->
      <button id="battle-continue-btn" class="w-full mt-3 bg-gradient-to-b from-cyan-400 to-blue-600 text-white font-black italic py-2.5 rounded-2xl border-b-4 border-blue-900 active:border-b-0 active:translate-y-[2px] transition-all shadow-lg text-[10px] uppercase tracking-widest hidden">
        CONTINUE ➔
      </button>
    </div>
  `;

  layer.appendChild(popup);

  const consoleBox = popup.querySelector('#battle-console-textbox');
  const playerNode = popup.querySelector('#player-node');
  const bossAvatar = popup.querySelector('#boss-avatar-container');
  const bossHpBar = popup.querySelector('#boss-hp-bar');
  const bossHpText = popup.querySelector('#boss-hp-text');
  const damageSplash = popup.querySelector('#damage-text-splash');
  const continueBtn = popup.querySelector('#battle-continue-btn');

  // STEP BY STEP BATTLE AUTOMATION
  // 1. Initial Greeting
  setTimeout(() => {
    consoleBox.innerHTML = `<div></div>`;
    
    // 2. Play Rhythm Strike Charge
    setTimeout(() => {
      consoleBox.innerHTML = `<div></div>`;
      playerNode.classList.add('animate-charge');

      // 3. Impact & Damage splash
      setTimeout(() => {
        // Screen & Boss Shake animation
        popup.classList.add('animate-shake');
        bossAvatar.classList.add('animate-shake');

        // Render floating damage number
        damageSplash.innerHTML = `-${totalDamage.toLocaleString()}`;
        damageSplash.className = "absolute top-14 right-14 z-20 text-rose-500 font-black text-2xl uppercase italic tracking-tighter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] animate-damage";

        // Update Boss HP Bar & HP Label
        bossHpBar.style.width = `${(newHp / maxHp) * 100}%`;
        bossHpText.innerHTML = `${newHp.toLocaleString()} / ${maxHp.toLocaleString()} HP`;

        // Update state and write to RAM
        bState.currentBossHp = newHp;

        setTimeout(() => {
          popup.classList.remove('animate-shake');
          bossAvatar.classList.remove('animate-shake');
        }, 600);

        // 4. Resolve defeat or survive with simplified total damage centered panel
        setTimeout(() => {
          if (isDefeated) {
            bossAvatar.classList.add('animate-defeat');
            
            // Grant reward
            let pelletsGained = 0;
            let coinsGained = 0;
            if (bState.bossNum <= 10) {
              pelletsGained = currentBoss.rewardPellets !== undefined ? currentBoss.rewardPellets : (BOSS_BALANCING_SCALING.pelletsBase + BOSS_BALANCING_SCALING.pelletsMultiplierPerBossNum * bState.bossNum);
              coinsGained = currentBoss.rewardCoins !== undefined ? currentBoss.rewardCoins : BOSS_BALANCING_SCALING.baseRewardCoins;
            } else {
              pelletsGained = BOSS_BALANCING_SCALING.pelletsBase + (BOSS_BALANCING_SCALING.pelletsMultiplierPerBossNum * bState.bossNum);
              coinsGained = BOSS_BALANCING_SCALING.baseRewardCoins + (loopOffset * BOSS_BALANCING_SCALING.coinsIncreasePerLoop);
            }

            state.user.coins += coinsGained;
            state.petPellets = (state.petPellets || 0) + pelletsGained;
            if (window.state) {
              window.state.user.coins = state.user.coins;
              window.state.petPellets = state.petPellets;
            }
            const headerCoinsCountEl = document.querySelector('#header-coins-count');
            if (headerCoinsCountEl) {
              headerCoinsCountEl.innerHTML = state.user.coins.toLocaleString();
            }

            // Advance to next boss
            bState.bossNum = (bState.bossNum || 1) + 1;
            const nextBossIndex = (bState.bossNum - 1) % 10;
            const nextBossObj = BOSS_BALANCING[nextBossIndex] || BOSS_BALANCING[0];
            const nextMaxHp = getBossMaxHp(bState.bossNum);

            bState.currentBossIdx = nextBossIndex;
            bState.currentBossHp = nextMaxHp;

            // Render simple victory indicator on the boss area
            const bossAreaNode = popup.querySelector('#boss-area-node');
            if (bossAreaNode) {
              bossAreaNode.innerHTML = `
                <div class="text-right flex flex-col items-end justify-center select-none pt-2 animate-bounce">
                  <span class="text-rose-500 font-black text-[13px] tracking-wide uppercase">BOSS DEFEATED</span>
                  <span class="text-white font-extrabold text-[11.5px] font-mono mt-1">🪙+${coinsGained} &nbsp; 🍪 +${pelletsGained}</span>
                </div>
              `;
            }

            // Keep the detail section in the consoleBox
            consoleBox.innerHTML = `
              <div class="flex flex-col items-center justify-center text-center w-full">
                <span class="text-[9px] text-green-400 font-extrabold uppercase tracking-widest mb-1">TOTAL DAMAGE DEALT</span>
                <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-rose-500 italic uppercase select-none tracking-tighter drop-shadow-md leading-none">
                  ${totalDamage.toLocaleString()}
                </span>
                ${contribsHtml}
              </div>
            `;
            
            continueBtn.classList.remove('hidden');
            continueBtn.classList.add('animate-pulse');

          } else {
            // Simplified total damage block and stat listing
            consoleBox.innerHTML = `
              <div class="flex flex-col items-center justify-center text-center w-full">
                <span class="text-[9px] text-indigo-400 font-extrabold uppercase tracking-widest mb-0.5">TOTAL DAMAGE</span>
                <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-rose-500 italic uppercase select-none tracking-tighter drop-shadow-md leading-none">
                  ${totalDamage.toLocaleString()}
                </span>
                ${contribsHtml}
              </div>
            `;
            continueBtn.classList.remove('hidden');
          }
        }, 1100);

      }, 500); // Wait for charge animation completion
    }, 1500); // Wild boss entry text timing
  }, 100);

  continueBtn.onclick = () => {
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      // Ensure popup-layer overlay is clean ONLY if there are no more popup modals active
      if (layer.childElementCount === 0) {
        layer.classList.add('pointer-events-none');
        layer.classList.remove('pointer-events-auto', 'bg-black/80', 'bg-black/90', 'backdrop-blur-sm', 'backdrop-blur-md');
      }
      if (onComplete) onComplete();
    }, 200);
  };
}
