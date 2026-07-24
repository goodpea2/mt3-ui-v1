import { VFXManager } from '../vfx/Manager.js';
import { rollGachaPrize } from '../gachaConfig.js';
import { ScriptedGachaReward } from '../balance.js';

export function showSongGachaPopup(state, onComplete) {
  const layer = document.getElementById('popup-layer');
  if (!layer) return;

  // Enable layer pointer events and add high-contrast dark overlay
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/90', 'backdrop-blur-md');

  let clickHandler = null;
  clickHandler = (e) => {
    if (window.gachaSkipHandler) {
      window.gachaSkipHandler();
    }
  };
  layer.addEventListener('click', clickHandler);

  // Find all currently locked songs
  const getLockedSongs = () => {
    return state.songs.filter(s => {
      const isLockedArray = Array.isArray(s.isLocked) ? s.isLocked : [s.isLocked];
      return isLockedArray[0];
    });
  };

  const getSongCost = () => 1000;

  // Render container
  const popup = document.createElement('div');
  popup.className = "relative w-[360px] h-[580px] bg-gradient-to-b from-[#1b0a3a] via-[#0d041d] to-[#04010a] border-4 border-indigo-500/40 rounded-[40px] shadow-[0_0_80px_rgba(99,102,241,0.3)] animate-in fade-in zoom-in duration-300 flex flex-col overflow-hidden select-none font-sans";

  // Create neon equalizer animation stylesheet dynamically
  const styleId = "gacha-eq-styles";
  if (!document.getElementById(styleId)) {
    const styleSheet = document.createElement("style");
    styleSheet.id = styleId;
    styleSheet.innerText = `
      @keyframes eq-scale {
        0%, 100% { transform: scaleY(0.25); }
        50% { transform: scaleY(1); }
      }
      .eq-bar {
        animation: eq-scale 1.2s ease-in-out infinite;
        transform-origin: bottom;
      }
      @keyframes marquee-flash {
        0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 2px rgba(255, 0, 255, 0.4)); }
        50% { opacity: 1; filter: drop-shadow(0 0 8px rgba(0, 255, 255, 0.9)); }
      }
      .neon-orb-flash {
        animation: marquee-flash 1s infinite;
      }
    `;
    document.head.appendChild(styleSheet);
  }

  // Populate inner html structure (with GachaBeat and Footer texts completely removed)
  popup.innerHTML = `
    <!-- Cabinet Header: Spectrum and Lights -->
    <div class="h-28 bg-[#100624] border-b-2 border-indigo-950 flex flex-col justify-between p-3 shrink-0 relative">
      <button id="gacha-close-btn" class="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white flex items-center justify-center text-xs active:scale-90 transition-transform z-50">✕</button>
      
      <!-- Animated Equalizer Spectrum Marquee -->
      <div class="w-full bg-[#05010c] rounded-lg p-2 h-16 flex items-end justify-center gap-[3px] overflow-hidden relative">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
        <!-- 16 Columns of Neon Equalizer Bars -->
        <div class="eq-bar w-1.5 h-12 bg-pink-500 rounded-t" style="animation-delay: 0.1s"></div>
        <div class="eq-bar w-1.5 h-12 bg-indigo-500 rounded-t" style="animation-delay: 0.4s"></div>
        <div class="eq-bar w-1.5 h-12 bg-cyan-400 rounded-t" style="animation-delay: 0.25s"></div>
        <div class="eq-bar w-1.5 h-12 bg-purple-500 rounded-t" style="animation-delay: 0.5s"></div>
        <div class="eq-bar w-1.5 h-12 bg-pink-500 rounded-t" style="animation-delay: 0.15s"></div>
        <div class="eq-bar w-1.5 h-12 bg-cyan-400 rounded-t" style="animation-delay: 0.6s"></div>
        <div class="eq-bar w-1.5 h-12 bg-fuchsia-500 rounded-t" style="animation-delay: 0.3s"></div>
        <div class="eq-bar w-1.5 h-12 bg-purple-500 rounded-t" style="animation-delay: 0.2s"></div>
        <div class="eq-bar w-1.5 h-12 bg-indigo-500 rounded-t" style="animation-delay: 0.45s"></div>
        <div class="eq-bar w-1.5 h-12 bg-fuchsia-500 rounded-t" style="animation-delay: 0.35s"></div>
        <div class="eq-bar w-1.5 h-12 bg-cyan-400 rounded-t" style="animation-delay: 0.55s"></div>
        <div class="eq-bar w-1.5 h-12 bg-pink-500 rounded-t" style="animation-delay: 0.12s"></div>
        <div class="eq-bar w-1.5 h-12 bg-purple-500 rounded-t" style="animation-delay: 0.52s"></div>
        <div class="eq-bar w-1.5 h-12 bg-fuchsia-500 rounded-t" style="animation-delay: 0.22s"></div>
        <div class="eq-bar w-1.5 h-12 bg-cyan-400 rounded-t" style="animation-delay: 0.32s"></div>
        <div class="eq-bar w-1.5 h-12 bg-pink-500 rounded-t" style="animation-delay: 0.42s"></div>
      </div>

      <!-- Pulse Light Orbs -->
      <div class="flex items-center justify-between px-3">
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-pink-500 border border-white/20 select-none" style="animation-delay: 0.0s"></div>
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/20 select-none" style="animation-delay: 0.2s"></div>
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-indigo-400 border border-white/20 select-none" style="animation-delay: 0.4s"></div>
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-yellow-400 border border-white/20 select-none" style="animation-delay: 0.6s"></div>
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-cyan-400 border border-white/20 select-none" style="animation-delay: 0.8s"></div>
        <div class="neon-orb-flash w-3.5 h-3.5 rounded-full bg-pink-500 border border-white/20 select-none" style="animation-delay: 1.0s"></div>
      </div>
    </div>

    <!-- Main Cabinet Screen Compartment -->
    <div class="flex-1 px-4 py-3 flex flex-col justify-center relative overflow-hidden bg-[#0d051a]">
      <!-- Tech Grid Lines in Background -->
      <div class="absolute inset-0 halftone-bg opacity-15 pointer-events-none"></div>
      
      <!-- Side Neon Bars -->
      <div class="absolute top-0 bottom-0 left-1 w-[3px] bg-gradient-to-b from-cyan-500 via-indigo-500 to-pink-500 rounded-full shadow-[0_0_8px_#ff00ff]"></div>
      <div class="absolute top-0 bottom-0 right-1 w-[3px] bg-gradient-to-b from-cyan-500 via-indigo-500 to-pink-500 rounded-full shadow-[0_0_8px_#ff00ff]"></div>

      <!-- Main Screen Viewing Deck Frame -->
      <div class="relative w-full h-[240px] bg-[#07010f] border-2 border-indigo-500/20 rounded-3xl p-[2px] shadow-inner flex flex-col overflow-hidden">
        
        <!-- Scrolling Wheel Roller Deck -->
        <div id="gacha-roller-viewport" class="relative w-full h-full overflow-hidden flex flex-col justify-center">
          
          <!-- Moving Roller Strip of Song Cards -->
          <div id="gacha-roller-strip" class="absolute inset-x-0 flex flex-col gap-2 p-3" style="transform: translateY(-60px); transition: none;">
            <!-- Will be dynamically populated with scroll cards -->
          </div>

          <!-- Vertical Fade Masks overlapping top/bottom of screen -->
          <div class="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#07010f] to-transparent pointer-events-none text-zinc-500"></div>
          <div class="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#07010f] to-transparent pointer-events-none text-zinc-500"></div>

          <!-- Sighting Marquee / Target Frame indicating winning landing spot (initially hidden during IDLE) -->
          <div id="gacha-target-frame" class="absolute inset-x-0 h-[68px] top-1/2 -translate-y-1/2 border-y-2 border-pink-500 bg-pink-500/5 flex items-center justify-between px-1 pointer-events-none z-20 transition-all duration-300 hidden">
            <!-- Neon cyan left and right arrows -->
            <div class="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[12px] border-l-pink-500 animate-pulse"></div>
            <div class="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-r-[12px] border-r-pink-500 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <!-- Coins counter inside screen bottom margin -->
      <div class="mt-2.5 flex items-center justify-center gap-1.5">
        <span class="text-zinc-500 font-extrabold text-[10px] tracking-wider uppercase">Your Coins:</span>
        <div class="bg-[#120824] border border-white/5 rounded-full px-3 py-1 flex items-center gap-1">
          <span class="text-xs">💰</span>
          <span id="gacha-user-coins" class="text-yellow-400 font-mono font-black text-xs">${state.user.coins.toLocaleString()}</span>
        </div>
      </div>
    </div>

    <!-- Bottom chassis platform & giant 3D Spin Button -->
    <div class="bg-[#100624] p-6 shrink-0 border-t-2 border-indigo-950 flex flex-col items-center justify-center gap-4 relative">
      <!-- Metallic speaker vents and wire details -->
      <div class="w-24 h-1 bg-[#05010b] rounded mb-1 border-b border-white/5"></div>
      
      <button id="gacha-spin-btn" class="w-56 bg-gradient-to-b from-fuchsia-500 via-purple-600 to-indigo-800 border-t-2 border-fuchsia-300 font-black italic text-white uppercase text-2xl tracking-widest rounded-3xl cursor-pointer py-4 px-10 transition-all duration-150 hover:scale-[1.03] active:scale-95 shadow-[0_12px_20px_rgba(168,85,247,0.4),_0_-4px_0_rgba(0,0,0,0.5)_inset,0_4px_0_rgba(168,85,247,0.5)] flex flex-col items-center leading-none">
        <span>SPIN</span>
        <span class="text-[8px] font-sans font-bold tracking-widest text-fuchsia-200 mt-1">COST: 1,000 COINS</span>
      </button>
    </div>
  `;

  layer.appendChild(popup);

  const spinBtn = popup.querySelector('#gacha-spin-btn');
  const rollerStrip = popup.querySelector('#gacha-roller-strip');
  const targetFrame = popup.querySelector('#gacha-target-frame');

  // Helper functions for Gacha elements rendering
  const getMiniCardClass = (itemObj) => {
    if (itemObj.type === 'song' || itemObj.type === 'deluxe_song') {
      const song = itemObj.resolvedSong || state.songs[0];
      const isDeluxe = song.isDeluxe;
      const contentBg = isDeluxe 
        ? "bg-gradient-to-r from-[#441313] via-[#1d1042] to-[#12072c]" 
        : "bg-gradient-to-r from-[#1d1042] to-[#12072c]";
      return `w-full h-[64px] rounded-2xl border border-white/5 flex items-center p-2.5 gap-3 shrink-0 ${contentBg} relative overflow-hidden`;
    } else {
      let grad = 'bg-gradient-to-r from-[#031d2b] to-[#12072c] border-[#06b6d4]/20';
      if (itemObj.type === 'pellet') {
        grad = 'bg-gradient-to-r from-[#2a0c30] to-[#12072c] border-[#d946ef]/20';
      } else if (itemObj.type === 'shield') {
        grad = 'bg-gradient-to-r from-[#2a0e14] to-[#12072c] border-[#f43f5e]/20';
      }
      return `w-full h-[64px] rounded-2xl border flex items-center p-2.5 gap-3 shrink-0 ${grad} relative overflow-hidden`;
    }
  };

  const getMiniCardInnerHtml = (itemObj) => {
    if (itemObj.type === 'song' || itemObj.type === 'deluxe_song') {
      const song = itemObj.resolvedSong || state.songs[0];
      const isDeluxe = song.isDeluxe;
      return `
        ${isDeluxe ? '<div class="absolute inset-0 bg-yellow-500/5 animate-pulse"></div>' : ''}
        <img src="${song.coverUrl}" class="w-11 h-11 object-cover rounded-xl border border-white/10 shrink-0" />
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <div class="flex items-center gap-1">
            ${isDeluxe ? '<span class="bg-red-600 text-white text-[5px] font-extrabold px-1 py-0.5 rounded italic shrink-0 leading-none">DELUXE</span>' : ''}
            <h5 class="text-white font-black text-xs uppercase italic truncate leading-none">${song.title}</h5>
          </div>
          <p class="text-purple-300/50 text-[9px] font-bold truncate mt-1 leading-none">${song.artist}</p>
        </div>
      `;
    } else {
      let icon = '🔑';
      let labelColor = 'text-cyan-400';
      let name = 'KEYS';
      if (itemObj.type === 'pellet') {
        icon = '🍪';
        labelColor = 'text-fuchsia-400';
        name = 'FOOD';
      } else if (itemObj.type === 'shield') {
        icon = '🛡️';
        labelColor = 'text-rose-400';
        name = 'SHIELDS';
      }
      return `
        <div class="w-11 h-11 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center text-xl shrink-0">
          ${icon}
        </div>
        <div class="flex-1 min-w-0 flex flex-col justify-center">
          <h5 class="${labelColor} font-black text-xs uppercase italic tracking-wide leading-none">${itemObj.amount} ${name}</h5>
          <p class="text-white/40 text-[9px] font-bold mt-1 leading-none">Lucky Gacha Reward</p>
        </div>
      `;
    }
  };

  // Let's populate the roller list strip
  const populateRollerEntries = (winningPrize = null) => {
    rollerStrip.innerHTML = '';
    
    // We want a list of around 120 cards to loop satisfyingly over and over
    const totalEntriesCount = 120;
    const targetIndex = 110;

    for (let i = 0; i < totalEntriesCount; i++) {
      let itemObj;
      if (i === targetIndex && winningPrize) {
        itemObj = winningPrize;
      } else {
        // filler item
        const dummyRnd = i % 3;
        if (dummyRnd === 0) {
          const songIdx = (i * 3) % state.songs.length;
          itemObj = { type: state.songs[songIdx].isDeluxe ? 'deluxe_song' : 'song', resolvedSong: state.songs[songIdx] };
        } else if (dummyRnd === 1) {
          itemObj = { type: 'key', amount: 3 };
        } else {
          itemObj = { type: 'pellet', amount: 15 };
        }
      }

      const miniCard = document.createElement('div');
      miniCard.className = getMiniCardClass(itemObj);
      miniCard.innerHTML = getMiniCardInnerHtml(itemObj);
      rollerStrip.appendChild(miniCard);
    }
  };

  // Close handler
  const closeGacha = (unlockedSongId) => {
    if (window.gachaSpinInterval) {
      clearInterval(window.gachaSpinInterval);
      window.gachaSpinInterval = null;
    }
    if (clickHandler) {
      layer.removeEventListener('click', clickHandler);
    }
    window.gachaSkipHandler = null;
    popup.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      popup.remove();
      layer.innerHTML = '';
      layer.classList.add('pointer-events-none');
      layer.classList.remove('pointer-events-auto', 'bg-black/90', 'backdrop-blur-md');
      
      if (onComplete) onComplete();

      if (unlockedSongId) {
        // Wait for rendering to fully complete, then scroll and highlight card
        setTimeout(() => {
          const songEl = document.querySelector(`.card-wrapper[data-id="${unlockedSongId}"]`);
          if (songEl) {
            songEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Add custom high-visibility glow outline
            songEl.classList.add('ring-4', 'ring-pink-500', 'scale-[1.02]', 'transition-all', 'duration-500', 'z-50');
            setTimeout(() => {
              songEl.classList.remove('ring-4', 'ring-pink-500', 'scale-[1.02]', 'z-50');
            }, 2500);
          }
        }, 300);
      }
    }, 200);
  };

  const closeBtn = popup.querySelector('#gacha-close-btn');
  closeBtn.onclick = () => closeGacha();

  // Initial populate (just with random cards)
  populateRollerEntries();

  // On startup, we center Index 2 as a neat reference.
  rollerStrip.style.transform = `translateY(-${(2 * 72) - 84}px)`;

  // Spinning logic status
  let isSpinning = false;

  spinBtn.onclick = () => {
    if (isSpinning) return;

    // Check coins again, open Currency Shop if insufficient
    if (state.user.coins < getSongCost()) {
      const widget = popup.querySelector('#gacha-user-coins');
      if (widget) {
        widget.classList.add('animate-ping');
        setTimeout(() => widget.classList.remove('animate-ping'), 500);
      }
      
      const layerPopup = document.getElementById('popup-layer');
      const textPopup = document.createElement('div');
      textPopup.className = "reward-popup absolute flex flex-col items-center justify-center text-red-500 font-extrabold text-xs italic uppercase tracking-tighter z-[320] pointer-events-none";
      textPopup.innerText = "NOT ENOUGH COINS 💰 - OPENING SHOP";
      layerPopup.appendChild(textPopup);
      setTimeout(() => textPopup.remove(), 1200);

      if (window.openCurrencyShop) {
        window.openCurrencyShop(() => {
          const coinsLabel = popup.querySelector('#gacha-user-coins');
          if (coinsLabel) {
            coinsLabel.innerText = state.user.coins.toLocaleString();
          }
        });
      }
      return;
    }

    isSpinning = true;
    spinBtn.disabled = true;
    spinBtn.classList.add('brightness-50', 'cursor-not-allowed', 'scale-95');

    // While spinning the songs, make the list loop physically, keep target-frame hidden
    if (targetFrame) {
      targetFrame.classList.add('hidden');
    }

    if (state.gachaRollCount === undefined) {
      state.gachaRollCount = 0;
    }

    let prize;
    if (state.gachaRollCount < ScriptedGachaReward.length) {
      const isSongRequired = ScriptedGachaReward[state.gachaRollCount] === 1;
      prize = rollGachaPrize(isSongRequired);
    } else {
      prize = rollGachaPrize();
    }

    state.gachaRollCount++;
    state.gachaSpunBefore = true;

    // Resolve song or deluxe specifically if rolled
    if (prize.type === 'song') {
      const lockedClassic = state.songs.filter(s => {
        const isLockedArray = Array.isArray(s.isLocked) ? s.isLocked : [s.isLocked];
        return isLockedArray[0] && !s.isDeluxe;
      });
      if (lockedClassic.length > 0) {
        prize.resolvedSong = lockedClassic[Math.floor(Math.random() * lockedClassic.length)];
      } else {
        const lockedDeluxe = state.songs.filter(s => {
          const isLockedArray = Array.isArray(s.isLocked) ? s.isLocked : [s.isLocked];
          return isLockedArray[0] && s.isDeluxe;
        });
        if (lockedDeluxe.length > 0) {
          prize.type = 'deluxe_song';
          prize.resolvedSong = lockedDeluxe[Math.floor(Math.random() * lockedDeluxe.length)];
          prize.item = '1 deluxe song';
        } else {
          // Fallback to keys
          prize = { item: '15 keys', type: 'key', amount: 15, weight: 6 };
        }
      }
    } else if (prize.type === 'deluxe_song') {
      const lockedDeluxe = state.songs.filter(s => {
        const isLockedArray = Array.isArray(s.isLocked) ? s.isLocked : [s.isLocked];
        return isLockedArray[0] && s.isDeluxe;
      });
      if (lockedDeluxe.length > 0) {
        prize.resolvedSong = lockedDeluxe[Math.floor(Math.random() * lockedDeluxe.length)];
      } else {
        const lockedClassic = state.songs.filter(s => {
          const isLockedArray = Array.isArray(s.isLocked) ? s.isLocked : [s.isLocked];
          return isLockedArray[0] && !s.isDeluxe;
        });
        if (lockedClassic.length > 0) {
          prize.type = 'song';
          prize.resolvedSong = lockedClassic[Math.floor(Math.random() * lockedClassic.length)];
          prize.item = '1 song';
        } else {
          // Fallback to keys
          prize = { item: '15 keys', type: 'key', amount: 15, weight: 6 };
        }
      }
    }

    // Deduct coins from State and visual counters
    state.user.coins -= getSongCost();
    state.stats.totalCoinSpent += getSongCost();
    state.visualUser.coins = state.user.coins;
    
    // Update local coins text inside popup
    popup.querySelector('#gacha-user-coins').innerText = state.user.coins.toLocaleString();

    // Populate roller strip with winning song strictly locked at index 110
    populateRollerEntries(prize);

    // Prepare strip transform: reset to index 2 instantly, without transition
    rollerStrip.style.transition = 'none';
    rollerStrip.style.transform = `translateY(-${(2 * 72) - 84}px)`;

    // Wait slightly to trigger transition
    let spinStartTime = Date.now();
    let spinTimeout = null;
    let overlayTimeout = null;

    const skipSpin = () => {
      if (!isSpinning || (Date.now() - spinStartTime < 150)) return;
      isSpinning = false;
      window.gachaSkipHandler = null;

      if (spinTimeout) {
        clearTimeout(spinTimeout);
        spinTimeout = null;
      }
      if (overlayTimeout) {
        clearTimeout(overlayTimeout);
        overlayTimeout = null;
      }

      // Instantly position at the winning slot (Index 110)
      rollerStrip.style.transition = 'none';
      const targetOffset = (110 * 72) - 84;
      rollerStrip.style.transform = `translateY(-${targetOffset}px)`;

      // Show target frame highlight overlay only on landing/reveal
      if (targetFrame) {
        targetFrame.classList.remove('hidden');
      }

      // Flash the lights to indicate landing
      const marquees = popup.querySelectorAll('.neon-orb-flash');
      marquees.forEach(m => {
        m.classList.remove('neon-orb-flash');
        m.classList.add('bg-green-400', 'shadow-[0_0_15px_#22c55e]');
      });

      // Restore EQ bar speeds
      popup.querySelectorAll('.eq-bar').forEach(bar => {
        bar.style.animationDuration = '';
      });

      // Set unlock variables or award currencies!
      if (prize.type === 'song' || prize.type === 'deluxe_song') {
        const winningSong = prize.resolvedSong;
        if (Array.isArray(winningSong.isLocked)) {
          winningSong.isLocked[0] = false;
        } else {
          winningSong.isLocked = false;
        }
        state.newlyUnlockedSongs.add(winningSong.id);
        state.purchasedSongCount++;
      } else if (prize.type === 'pellet') {
        state.petPellets = (state.petPellets || 0) + prize.amount;
        if (state.visualUser) {
          state.visualUser.petPellets = state.petPellets;
        }
      } else if (prize.type === 'shield') {
        state.user.shields = (state.user.shields || 0) + prize.amount;
        if (state.visualUser) {
          state.visualUser.shields = state.user.shields;
        }
      } else if (prize.type === 'key') {
        state.user.keys = (state.user.keys || 0) + prize.amount;
        if (state.visualUser) {
          state.visualUser.keys = state.user.keys;
        }
      }

      // Display big success overlay window
      showGachaPrizeOverlay(prize, () => {
        if (targetFrame) {
          targetFrame.classList.add('hidden');
        }
        
        spinBtn.disabled = false;
        spinBtn.classList.remove('brightness-50', 'cursor-not-allowed', 'scale-95');
        
        // Repopulate with randoms and center back to Index 2 as tidy default
        populateRollerEntries();
        rollerStrip.style.transition = 'none';
        rollerStrip.style.transform = `translateY(-${(2 * 72) - 84}px)`;
        
        // Restore light list indicators
        const refreshedMarquees = popup.querySelectorAll('.bg-green-400');
        refreshedMarquees.forEach(m => {
          m.classList.remove('bg-green-400', 'shadow-[0_0_15px_#22c55e]');
          m.classList.add('neon-orb-flash');
        });
        
        if (prize.type === 'song' || prize.type === 'deluxe_song') {
          closeGacha(prize.resolvedSong.id);
        } else {
          if (onComplete) onComplete();
        }
      });
    };

    window.gachaSkipHandler = skipSpin;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Spin to index 110 (makes it loop beautifully)
        rollerStrip.style.transition = 'transform 3.8s cubic-bezier(0.12, 0.82, 0.28, 1)';
        const targetOffset = (110 * 72) - 84;
        rollerStrip.style.transform = `translateY(-${targetOffset}px)`;
        
        // Equalizer bar frequency speed boosts
        const bars = popup.querySelectorAll('.eq-bar');
        bars.forEach(bar => {
          bar.style.animationDuration = '0.35s';
        });

        // Landing callback after transition finishes (3.8s)
        spinTimeout = setTimeout(() => {
          isSpinning = false;
          window.gachaSkipHandler = null;
          
          // Show target frame highlight overlay only on landing/reveal
          if (targetFrame) {
            targetFrame.classList.remove('hidden');
          }

          // Flash the lights to indicate landing
          const marquees = popup.querySelectorAll('.neon-orb-flash');
          marquees.forEach(m => {
            m.classList.remove('neon-orb-flash');
            m.classList.add('bg-green-400', 'shadow-[0_0_15px_#22c55e]');
          });

          // Restore EQ bar speeds
          popup.querySelectorAll('.eq-bar').forEach(bar => {
            bar.style.animationDuration = '';
          });

          // Set unlock variables or award currencies!
          if (prize.type === 'song' || prize.type === 'deluxe_song') {
            const winningSong = prize.resolvedSong;
            if (Array.isArray(winningSong.isLocked)) {
              winningSong.isLocked[0] = false;
            } else {
              winningSong.isLocked = false;
            }
            state.newlyUnlockedSongs.add(winningSong.id);
            state.purchasedSongCount++;
          } else if (prize.type === 'pellet') {
            state.petPellets = (state.petPellets || 0) + prize.amount;
            if (state.visualUser) {
              state.visualUser.petPellets = state.petPellets;
            }
          } else if (prize.type === 'shield') {
            state.user.shields = (state.user.shields || 0) + prize.amount;
            if (state.visualUser) {
              state.visualUser.shields = state.user.shields;
            }
          } else if (prize.type === 'key') {
            state.user.keys = (state.user.keys || 0) + prize.amount;
            if (state.visualUser) {
              state.visualUser.keys = state.user.keys;
            }
          }

          // Display big success overlay window
          overlayTimeout = setTimeout(() => {
            showGachaPrizeOverlay(prize, () => {
              if (targetFrame) {
                targetFrame.classList.add('hidden');
              }
              
              spinBtn.disabled = false;
              spinBtn.classList.remove('brightness-50', 'cursor-not-allowed', 'scale-95');
              
              // Repopulate with randoms and center back to Index 2 as tidy default
              populateRollerEntries();
              rollerStrip.style.transition = 'none';
              rollerStrip.style.transform = `translateY(-${(2 * 72) - 84}px)`;
              
              // Restore light list indicators
              const refreshedMarquees = popup.querySelectorAll('.bg-green-400');
              refreshedMarquees.forEach(m => {
                m.classList.remove('bg-green-400', 'shadow-[0_0_15px_#22c55e]');
                m.classList.add('neon-orb-flash');
              });
              
              if (prize.type === 'song' || prize.type === 'deluxe_song') {
                closeGacha(prize.resolvedSong.id);
              } else {
                if (onComplete) onComplete();
              }
            });
          }, 350);

        }, 3800);
      });
    });
  };
}

function showGachaPrizeOverlay(prize, onDismiss) {
  const overlay = document.createElement('div');
  overlay.className = "fixed inset-0 z-[400] bg-black/85 flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300";

  let innerHtml = '';
  if (prize.type === 'song' || prize.type === 'deluxe_song') {
    const song = prize.resolvedSong;
    innerHtml = `
      <div class="relative flex flex-col items-center text-center max-w-sm w-full bg-gradient-to-br from-[#1c0a37] to-[#04010a] p-8 rounded-3xl border-2 border-pink-500/50 shadow-[0_0_65px_rgba(236,72,153,0.4)]">
        <div class="absolute -top-12 w-24 h-24 rounded-full bg-pink-500 flex items-center justify-center text-5xl shadow-lg border-4 border-[#04010a] animate-bounce shrink-0 z-30">
          🎰
        </div>

        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-fuchsia-500/10 via-transparent to-transparent pointer-events-none"></div>

        <h2 class="text-pink-400 font-black text-3xl uppercase tracking-tighter italic mt-6 mb-1 animate-pulse">GACHA UNLOCKED!</h2>
        <p class="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-6">New Song added to collection</p>

        <!-- Large Song Cover Display -->
        <div class="relative w-44 h-44 mb-6 rounded-2xl border border-white/25 overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.15)] bg-slate-900 flex-shrink-0">
          <img src="${song.coverUrl}" class="w-full h-full object-cover" />
          ${song.isDeluxe ? `
            <div class="absolute top-2.5 left-2.5 bg-red-600 text-white text-[7px] font-black px-2 py-0.5 rounded italic shadow-md">DELUXE</div>
          ` : ''}
        </div>

        <h3 class="text-white font-extrabold text-xl uppercase tracking-tight italic leading-snug drop-shadow-md px-4">${song.title}</h3>
        <p class="text-purple-300 text-xs font-bold font-sans mt-1.5">${song.artist}</p>

        <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

        <button id="gacha-prize-confirm-btn" class="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-black italic py-4 rounded-2xl border-b-4 border-indigo-950 active:border-b-0 active:translate-y-[2px] transition-all text-sm uppercase tracking-widest hover:brightness-110 font-black">
          Awesome, claim it
        </button>
      </div>
    `;
  } else {
    // Other items
    let icon = '🔑';
    let cardTitle = 'GACHA KEYS UNLOCKED!';
    let subtitleColor = 'text-cyan-400';
    let text = `${prize.amount} KEYS`;
    let glow = 'shadow-[0_0_65px_rgba(6,182,212,0.4)]';
    let border = 'border-cyan-500/50';

    if (prize.type === 'pellet') {
      icon = '🍪';
      cardTitle = 'GACHA FOOD REWARDED!';
      subtitleColor = 'text-fuchsia-400';
      text = `${prize.amount} FOOD`;
      glow = 'shadow-[0_0_65px_rgba(217,70,239,0.4)]';
      border = 'border-fuchsia-500/50';
    } else if (prize.type === 'shield') {
      icon = '🛡️';
      cardTitle = 'GACHA SHIELD REWARDED!';
      subtitleColor = 'text-rose-400';
      text = `${prize.amount} SHIELDS`;
      glow = 'shadow-[0_0_65px_rgba(244,63,94,0.4)]';
      border = 'border-rose-500/50';
    }

    innerHtml = `
      <div class="relative flex flex-col items-center text-center max-w-sm w-full bg-gradient-to-br from-[#0c162b] to-[#01060f] p-8 rounded-3xl border-2 ${border} ${glow}">
        <div class="absolute -top-12 w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-5xl shadow-lg border-4 border-[#01060f] animate-bounce shrink-0 z-30">
          ${icon}
        </div>

        <h2 class="${subtitleColor} font-black text-3xl uppercase tracking-tighter italic mt-6 mb-1 animate-pulse">REWARD CLAIMED!</h2>
        <p class="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em] mb-6">${cardTitle}</p>

        <!-- Large Icon Showcase -->
        <div class="w-40 h-40 mb-6 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-8xl shrink-0 animate-pulse">
          ${icon}
        </div>

        <h3 class="text-white font-extrabold text-2xl uppercase tracking-tight italic leading-none drop-shadow-md px-4">${text}</h3>
        <p class="text-zinc-400 text-xs font-bold font-sans mt-2">Added directly to your game wallet</p>

        <div class="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

        <button id="gacha-prize-confirm-btn" class="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-black italic py-4 rounded-2xl border-b-4 border-indigo-950 active:border-b-0 active:translate-y-[2px] transition-all text-sm uppercase tracking-widest hover:brightness-110 font-extrabold">
          Awesome, collect
        </button>
      </div>
    `;
  }

  overlay.innerHTML = innerHtml;
  document.body.appendChild(overlay);

  const confirmBtn = overlay.querySelector('#gacha-prize-confirm-btn');
  confirmBtn.onclick = () => {
    overlay.classList.add('animate-out', 'fade-out', 'zoom-out', 'duration-200');
    setTimeout(() => {
      overlay.remove();
      if (onDismiss) onDismiss();
    }, 200);
  };
}
