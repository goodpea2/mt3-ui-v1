import { getSongCardHtml } from './SongCard.js';
import { playSongCardUnlockedVFX } from '../vfx/SongCardUnlocked.js';
import { playSongCardNewDifficultyUnlockedVFX } from '../vfx/SongCardNewDifficultyUnlocked.js';
import { PET_BALANCING, getStarJourneyLevelAndProgress, getCarrySlotsCount } from '../balance.js';
import { getTotalStarsCollected } from '../index.js';

const PETS_LIST = PET_BALANCING.pets;

window.toggleEquipPet = (petId) => {
  const maxSlots = getCarrySlotsCount(state.user.level);
  if (!state.equippedPetIds) state.equippedPetIds = [];
  
  if (state.equippedPetIds.includes(petId)) {
    // Unequip
    state.equippedPetIds = state.equippedPetIds.filter(id => id !== petId);
  } else {
    // Equip
    if (state.equippedPetIds.length >= maxSlots) {
      // Create and show custom visual notification
      const floatToast = document.createElement('div');
      floatToast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-950/95 border border-rose-500 text-white font-black px-4 py-2 text-[10px] rounded-xl font-sans tracking-wide shadow-2xl z-[900] uppercase text-center animate-bounce";
      floatToast.innerHTML = `SQUAD SLOTS FULL (${maxSlots}/${maxSlots})!<br>Level up to unlock slots.`;
      document.body.appendChild(floatToast);
      setTimeout(() => floatToast.remove(), 2500);
      return;
    }
    state.equippedPetIds.push(petId);
  }
  
  // Re-save context if globally set
  if (window.state) {
    window.state.equippedPetIds = state.equippedPetIds;
  }
  
  // Re-render UI
  const { ui } = window;
  if (ui) {
    if (ui.header) ui.header();
    if (ui.petsLounge) ui.petsLounge();
  }
};

function drawLoungeTree(ctx, x, y, leafColor, label) {
  // Trunk
  ctx.fillStyle = '#451a03';
  ctx.fillRect(x - 3, y, 6, 28);

  // Big glowing top leaves
  const leafGrad = ctx.createRadialGradient(x, y, 2, x, y, 20);
  leafGrad.addColorStop(0, leafColor);
  leafGrad.addColorStop(1, '#022c22');
  ctx.fillStyle = leafGrad;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  ctx.beginPath();
  ctx.arc(x - 4, y - 4, 10, 0, Math.PI * 2);
  ctx.fill();
}

function drawPetOnCanvas(ctx, pet, x, y, size, isSleeping) {
  ctx.save();
  ctx.translate(x, y);

  if (isSleeping) {
    ctx.globalAlpha = 0.6;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, size - 2, size * 0.9, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glow halo
  const glowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 1.5);
  glowGrad.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
  glowGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Procedural canvas vector pets
  if (pet.id === 1) { // Neon Meow (blue cat)
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 0.6);
    ctx.lineTo(-size * 0.3, -size * 1.2);
    ctx.lineTo(-size * 0.1, -size * 0.6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.8, -size * 0.6);
    ctx.lineTo(size * 0.3, -size * 1.2);
    ctx.lineTo(size * 0.1, -size * 0.6);
    ctx.fill();
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(-size * 0.4, -size * 0.1, size * 0.2, 0, Math.PI * 2);
    ctx.arc(size * 0.4, -size * 0.1, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === 2) { // Beat Bunny
    ctx.fillStyle = '#ff7bbd';
    ctx.beginPath();
    ctx.ellipse(-size * 0.3, -size * 1.0, size * 0.2, size * 0.6, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.3, -size * 1.0, size * 0.2, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e879f9';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.18, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === 3) { // Hyper Hamster
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 1.1, size * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(-size * 0.7, -size * 0.7, size * 0.3, 0, Math.PI * 2);
    ctx.arc(size * 0.7, -size * 0.7, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f87171';
    ctx.beginPath();
    ctx.arc(-size * 0.6, size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.arc(size * 0.6, size * 0.2, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === 4) { // Rhythm Panda
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-size * 0.8, -size * 0.8, size * 0.35, 0, Math.PI * 2);
    ctx.arc(size * 0.8, -size * 0.8, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(-size * 0.35, -size * 0.1, size * 0.2, size * 0.25, 0, 0, Math.PI * 2);
    ctx.ellipse(size * 0.35, -size * 0.1, size * 0.2, size * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-size * 0.35, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.arc(size * 0.35, -size * 0.1, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === 5) { // Cyber Dragon
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, size);
    ctx.lineTo(-size, size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#06b6d4';
    ctx.beginPath();
    ctx.arc(-size * 0.3, size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.arc(size * 0.3, size * 0.2, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, -size * 0.6);
    ctx.lineTo(-size * 0.6, -size * 1.3);
    ctx.moveTo(size * 0.3, -size * 0.6);
    ctx.lineTo(size * 0.6, -size * 1.3);
    ctx.stroke();
  } else if (pet.id === 6) { // Mystic Fox
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.1);
    ctx.lineTo(size * 1.1, size * 0.2);
    ctx.lineTo(0, size * 1.1);
    ctx.lineTo(-size * 1.1, size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(-size * 0.5, size * 0.3, size * 0.3, 0, Math.PI * 2);
    ctx.arc(size * 0.5, size * 0.3, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size * 0.4);
    ctx.lineTo(-size * 0.9, -size * 1.1);
    ctx.lineTo(-size * 0.2, -size * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.7, -size * 0.4);
    ctx.lineTo(size * 0.9, -size * 1.1);
    ctx.lineTo(size * 0.2, -size * 0.7);
    ctx.fill();
  } else if (pet.id === 7) { // Electro Pup
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(-size * 0.8, size * 0.1, size * 0.25, size * 0.55, Math.PI / 6, 0, Math.PI * 2);
    ctx.ellipse(size * 0.8, size * 0.1, size * 0.25, size * 0.55, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, size * 0.4, size * 0.6, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();
  } else if (pet.id === 8) { // Synth Sloth
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.ellipse(0, size * 0.1, size * 0.75, size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#431407';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-size * 0.25, size * 0.05, size * 0.1, Math.PI, 0);
    ctx.arc(size * 0.25, size * 0.05, size * 0.1, Math.PI, 0);
    ctx.stroke();
  } else if (pet.id === 9) { // Cosmic Kitty
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ec4899';
    ctx.beginPath();
    ctx.moveTo(-size * 0.7, -size * 0.7);
    ctx.lineTo(-size * 0.3, -size * 1.3);
    ctx.lineTo(0, -size * 0.7);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.7, -size * 0.7);
    ctx.lineTo(size * 0.3, -size * 1.3);
    ctx.lineTo(0, -size * 0.7);
    ctx.fill();
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-size * 0.3, -size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.arc(size * 0.3, -size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (pet.id === 10) { // Astro Axolotl
    ctx.fillStyle = '#f472b6';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#db2777';
    ctx.beginPath();
    ctx.arc(-size * 1.1, -size * 0.4, size * 0.25, 0, Math.PI * 2);
    ctx.arc(-size * 1.1, size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.arc(size * 1.1, -size * 0.4, size * 0.25, 0, Math.PI * 2);
    ctx.arc(size * 1.1, size * 0.1, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#47153a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  } else if (pet.id === 11) { // Vocaloid Wolf
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 0.6);
    ctx.lineTo(-size * 0.5, -size * 1.4);
    ctx.lineTo(-size * 0.1, -size * 0.6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(size * 0.8, -size * 0.6);
    ctx.lineTo(size * 0.5, -size * 1.4);
    ctx.lineTo(size * 0.1, -size * 0.6);
    ctx.fill();
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.1, Math.PI, 0);
    ctx.stroke();
  } else if (pet.id === 12) { // Beat Hydra
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(-size, size);
    ctx.lineTo(-size * 0.7, -size);
    ctx.lineTo(-size * 0.3, size * 0.3);
    ctx.lineTo(0, -size * 1.2);
    ctx.lineTo(size * 0.3, size * 0.3);
    ctx.lineTo(size * 0.7, -size);
    ctx.lineTo(size, size);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, size * 0.2, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  if (isSleeping) {
    ctx.fillStyle = '#22d3ee';
    ctx.font = 'bold 8.5px sans-serif';
    let label = 'Zzz';
    if (window.state && window.state.petSleepUntil && window.state.petSleepUntil[pet.id]) {
      const secsLeft = Math.ceil((window.state.petSleepUntil[pet.id] - Date.now()) / 1000);
      if (secsLeft > 0) {
        label = `${secsLeft}s`;
      }
    }
    ctx.fillText(label, size * 0.4, -size * 0.8);
  }

  ctx.restore();
}

export function initCanvasPlayground(state) {
  const canvas = document.getElementById('pet-playground-canvas');
  if (!canvas) return;

  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width ? rect.width : 580;
  canvas.height = 144;

  if (!window.playgroundPetsState) {
    window.playgroundPetsState = {};
  }

  canvas.onclick = (e) => {
    const clickRect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - clickRect.left) / clickRect.width) * canvas.width;
    const clickY = ((e.clientY - clickRect.top) / clickRect.height) * canvas.height;

    const fruits = state.playgroundFruits || [];
    const clickedFruit = fruits.find(fruit => {
      const fx = (fruit.x / 100) * canvas.width;
      const fy = fruit.y;
      const distance = Math.hypot(clickX - fx, clickY - fy);
      return distance < 25;
    });

    if (clickedFruit) {
      window.clickFruit(e, clickedFruit.id);
    }
  };

  let activeLoopRunId = Math.random();
  window.currentPlaygroundLoopRunId = activeLoopRunId;

  const drawLoop = () => {
    if (document.getElementById('pet-playground-canvas') !== canvas || window.currentPlaygroundLoopRunId !== activeLoopRunId) {
      return;
    }

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const groundGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    groundGrad.addColorStop(0, '#110e2b');
    groundGrad.addColorStop(0.5, '#121226');
    groundGrad.addColorStop(1, '#0e181e');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = 'rgba(14, 165, 233, 0.12)';
    for (let gx = 8; gx < canvas.width; gx += 16) {
      for (let gy = 8; gy < canvas.height; gy += 16) {
        ctx.beginPath();
        ctx.arc(gx, gy, 0.75, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawLoungeTree(ctx, 0.50 * canvas.width, 85, '#059669', 'PINE TREE');

    const fruits = state.playgroundFruits || [];
    fruits.forEach(fruit => {
      const fx = (fruit.x / 100) * canvas.width;
      const fy = fruit.y;

      const fg = ctx.createRadialGradient(fx, fy, 1, fx, fy, 11);
      fg.addColorStop(0, '#f43f5e');
      fg.addColorStop(0.8, '#b91c1c');
      fg.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fx - 3, fy - 3, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(fx + 2, fy - 10, 3, Math.PI * 0.5, Math.PI * 1.5);
      ctx.stroke();
    });

    PETS_LIST.forEach(pet => {
      const isUnlocked = state.unlockedPets.has(pet.id);
      const isSleeping = state.petSleepUntil && (state.petSleepUntil[pet.id] > Date.now());
      if (isUnlocked) {
        let petState = window.playgroundPetsState[pet.id];
        if (!petState) {
          petState = {
            x: 50 + Math.random() * (canvas.width - 100),
            y: 95 + Math.random() * 25,
            targetX: 50 + Math.random() * (canvas.width - 100),
            targetY: 95 + Math.random() * 25,
            waitFrames: Math.floor(Math.random() * 60)
          };
          window.playgroundPetsState[pet.id] = petState;
        }

        if (isSleeping) {
          const snoozeX = (0.15 + (pet.id * 0.055)) * canvas.width;
          petState.x = petState.x * 0.9 + snoozeX * 0.1;
          petState.y = petState.y * 0.9 + 125 * 0.1;
        } else {
          if (petState.waitFrames > 0) {
            petState.waitFrames--;
          } else {
            const dx = petState.targetX - petState.x;
            const dy = petState.targetY - petState.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 3) {
              petState.waitFrames = 40 + Math.floor(Math.random() * 120);
              petState.targetX = 50 + Math.random() * (canvas.width - 100);
              petState.targetY = 95 + Math.random() * 25;
            } else {
              petState.x += (dx / dist) * 0.45;
              petState.y += (dy / dist) * 0.18;
            }
          }
        }

        drawPetOnCanvas(ctx, pet, petState.x, petState.y, 9, isSleeping);
      }
    });

    requestAnimationFrame(drawLoop);
  };

  requestAnimationFrame(drawLoop);
}

function formatUpgradeTimeDetail(seconds) {
  if (seconds <= 0) return "0s";
  let h = Math.floor(seconds / 3600);
  let m = Math.floor((seconds % 3600) / 60);
  let s = Math.floor(seconds % 60);
  
  let parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0 || parts.length === 0) parts.push(`${s}s`);
  return parts.join('');
}

const injectPlaygroundStyles = () => {
  const cssId = 'playground-roam-css';
  if (document.getElementById(cssId)) return;
  
  const style = document.createElement('style');
  style.id = cssId;
  style.innerHTML = `
    @keyframes roam-1 {
      0%, 100% { transform: translate(12%, 18px); }
      25% { transform: translate(32%, 55px); }
      50% { transform: translate(58%, 25px); }
      75% { transform: translate(22%, 65px); }
    }
    @keyframes roam-2 {
      0%, 100% { transform: translate(68%, 35px); }
      30% { transform: translate(48%, 68px); }
      60% { transform: translate(32%, 20px); }
      85% { transform: translate(72%, 58px); }
    }
    @keyframes roam-3 {
      0%, 100% { transform: translate(42%, 50px); }
      33% { transform: translate(22%, 25px); }
      66% { transform: translate(68%, 35px); }
    }
    @keyframes roam-4 {
      0%, 100% { transform: translate(8%, 62px); }
      20% { transform: translate(38%, 35px); }
      55% { transform: translate(78%, 25px); }
      80% { transform: translate(58%, 62px); }
    }
    @keyframes roam-5 {
      0%, 100% { transform: translate(82%, 18px); }
      25% { transform: translate(52%, 58px); }
      50% { transform: translate(22%, 35px); }
      75% { transform: translate(42%, 62px); }
    }
    
    .pet-roaming {
      position: absolute;
      top: 0;
      left: 0;
      transition: transform 0.2s linear;
      font-size: 24px;
      user-select: none;
      filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));
    }
  `;
  document.head.appendChild(style);
};

// Handle fruit collection logic
window.clickFruit = (event, fruitId) => {
  if (event) event.stopPropagation();
  const currentState = window.lastStateRef;
  if (!currentState) return;
  
  currentState.playgroundFruits = currentState.playgroundFruits || [];
  const idx = currentState.playgroundFruits.findIndex(f => f.id === fruitId);
  if (idx === -1) return;
  
  currentState.playgroundFruits.splice(idx, 1);
  
  const pelletsGained = Math.floor(Math.random() * 2) + 2; // 2 to 3 pellets
  currentState.petPellets = (currentState.petPellets || 0) + pelletsGained;
  currentState.visualUser.petPellets = currentState.petPellets;
  
  // Floating visual text overlay
  const floatText = document.createElement('div');
  floatText.className = "fixed text-fuchsia-400 font-extrabold text-xs px-2 py-1 rounded bg-[#100624]/90 border border-fuchsia-500/30 shadow-[0_0_12px_rgba(236,72,153,0.4)] z-[500] pointer-events-none transition-all duration-1000 transform -translate-y-8 opacity-0 font-sans";
  floatText.style.left = `${event.clientX}px`;
  floatText.style.top = `${event.clientY}px`;
  floatText.innerText = `🍪 +${pelletsGained} Food`;
  document.body.appendChild(floatText);
  
  requestAnimationFrame(() => {
    floatText.style.transform = `translateY(-48px)`;
    floatText.style.opacity = '1';
    setTimeout(() => {
      floatText.style.opacity = '0';
      setTimeout(() => floatText.remove(), 200);
    }, 800);
  });
  
  updatePetsLoungeUI(currentState);
};

function getPetsLoungeHtml(state) {
  window.lastStateRef = state;
  
  // Set up background fruit interval (reduced drop rate to 1-2 per minute -> once every 35 seconds)
  if (!window.petPlaygroundInterval) {
    window.petPlaygroundInterval = setInterval(() => {
      const currentState = window.lastStateRef;
      if (currentState) {
        if (!currentState.playgroundFruits) currentState.playgroundFruits = [];
        if (currentState.playgroundFruits.length < 5) {
          const treePositions = [
            { x: 50, y: 40 }
          ];
          const randTree = treePositions[Math.floor(Math.random() * treePositions.length)];
          let driftX = (Math.random() * 8) - 4;
          let driftY = (Math.random() * 15);
          
          const fruitTypes = ['apples', 'cherry', 'orange'];
          currentState.playgroundFruits.push({
            id: Date.now() + Math.random(),
            x: Math.max(5, Math.min(92, randTree.x + driftX)),
            y: Math.max(30, Math.min(80, randTree.y + driftY)),
            type: fruitTypes[Math.floor(Math.random() * fruitTypes.length)]
          });
          
          if (currentState.activeCategory === 'HOME') {
            updatePetsLoungeUI(currentState);
          }
        }
      }
    }, 60000);
  }

  // Initialize starting fruits if empty
  if (!state.playgroundFruits) {
    state.playgroundFruits = [
      { id: Date.now() + 1, x: 50, y: 45, type: 'cherry' }
    ];
  }

  const selectedDetailId = state.selectedPetIdDetail || 1;
  const selectedPet = PETS_LIST.find(p => p.id === selectedDetailId) || PETS_LIST[0];
  const isSelectedUnlocked = state.unlockedPets.has(selectedPet.id);
  const isSelectedSleeping = state.petSleepUntil && (state.petSleepUntil[selectedPet.id] > Date.now());
  const selectedLevel = state.petLevels[selectedPet.id] || 1;

  // Partition pets list into equipped and unequipped
  const equippedPets = PETS_LIST.filter(pet => state.equippedPetIds && state.equippedPetIds.includes(pet.id));
  const unequippedPets = PETS_LIST.filter(pet => !state.equippedPetIds || !state.equippedPetIds.includes(pet.id));

  // Render EquippedPetList inside the "IN BATTLE" top pink box
  const maxSlots = getCarrySlotsCount(state.user.level);
  let inBattleSlotsHtml = '';
  for (let i = 0; i < 5; i++) {
    if (i < maxSlots) {
      // Unlocked slot
      if (i < equippedPets.length) {
        const pet = equippedPets[i];
        const petLvl = state.petLevels[pet.id] || 1;
        const isSelected = selectedDetailId === pet.id;
        const isSleeping = state.petSleepUntil && (state.petSleepUntil[pet.id] > Date.now());
        const ringClass = isSelected ? 'border-fuchsia-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]' : 'border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
        inBattleSlotsHtml += `
          <div onclick="window.selectPet(${pet.id})" class="relative cursor-pointer select-none group shrink-0">
            <div class="relative w-12 h-12 rounded-2xl bg-[#1d1245] border-2 ${ringClass} flex items-center justify-center text-2xl transition-all duration-250 hover:scale-105 active:scale-95">
              ${pet.avatar}
              ${isSleeping ? `
                <div class="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center text-[8px] text-zinc-400 font-sans font-bold leading-none">
                  <span class="text-[7.5px] text-cyan-400 font-mono font-black">${Math.ceil((state.petSleepUntil[pet.id] - Date.now()) / 1000)}s</span>
                </div>
              ` : `
                <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rotate-45 bg-gradient-to-br from-emerald-400 to-green-600 border border-emerald-300 flex items-center justify-center shadow-md z-20">
                  <span class="-rotate-45 text-white font-black text-[6.5px] font-sans leading-none">${petLvl}</span>
                </div>
              `}
            </div>
          </div>
        `;
      } else {
        // Empty slot
        inBattleSlotsHtml += `
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1b0e3e] to-[#0c051d] border-2 border-dashed border-indigo-500/20 flex items-center justify-center text-indigo-400/50 text-sm select-none">
            <span>+</span>
          </div>
        `;
      }
    } else {
      // Locked slot
      const reqLvl = i === 3 ? 14 : 24;
      inBattleSlotsHtml += `
        <div class="w-12 h-12 rounded-2xl bg-[#0e0722] border border-white/5 flex flex-col items-center justify-center select-none shrink-0 text-zinc-500 gap-0.5">
          <span class="text-xs">🔒</span>
          <span class="text-[6.5px] font-black tracking-tight uppercase">LV.${reqLvl}</span>
        </div>
      `;
    }
  }

  // Render PetList (Bottom/Unequipped list of companion pets)
  let unequippedPetsHtml = '';
  unequippedPets.forEach(pet => {
    const isUnlocked = state.unlockedPets.has(pet.id);
    const isSleeping = state.petSleepUntil && (state.petSleepUntil[pet.id] > Date.now());
    const isSelected = selectedDetailId === pet.id;
    const petLvl = state.petLevels[pet.id] || 1;

    let ringClass = 'border-white/10 hover:border-indigo-500/30';
    if (isSelected) {
      ringClass = 'border-fuchsia-400 shadow-[0_0_12px_rgba(236,72,153,0.5)]';
    } else if (isUnlocked && !isSleeping) {
      ringClass = 'border-cyan-400/40';
    }

    unequippedPetsHtml += `
      <div onclick="window.selectPet(${pet.id})" class="relative cursor-pointer select-none group shrink-0">
        <div class="relative w-12 h-12 rounded-2xl bg-[#13082a] border-2 ${ringClass} flex items-center justify-center text-2xl transition-all duration-250 hover:scale-105 active:scale-95 ${!isUnlocked ? 'grayscale opacity-30' : ''}">
          ${pet.avatar}
          ${isSleeping ? `
            <div class="absolute inset-0 bg-black/80 rounded-2xl flex flex-col items-center justify-center text-[8px] text-zinc-400 font-sans font-bold leading-none">
              <span class="text-[7.5px] text-cyan-400 font-mono font-black">${Math.ceil((state.petSleepUntil[pet.id] - Date.now()) / 1000)}s</span>
            </div>
          ` : isUnlocked ? `
            <!-- Rotated diamond Level Badge -->
            <div class="absolute -top-1.5 -right-1.5 w-4 h-4 rotate-45 bg-gradient-to-br from-emerald-400 to-green-600 border border-emerald-300 flex items-center justify-center shadow-md z-20">
              <span class="-rotate-45 text-white font-black text-[6.5px] font-sans leading-none">${petLvl}</span>
            </div>
          ` : `
            <div class="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-[10px]">🔒</div>
          `}
        </div>
      </div>
    `;
  });

  // Render Highlighted Pet Info Panel (Bottom detail section)
  let detailPanelHtml = '';
  if (!isSelectedUnlocked) {
    detailPanelHtml = `
      <div class="mt-3 bg-gradient-to-br from-[#12072b] to-[#0a0319] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center select-none text-center h-28">
        <span class="text-zinc-500 text-2xl mb-1">🔒</span>
        <span class="text-rose-400 font-extrabold text-[10px] uppercase tracking-widest">REACH PLAYER LEVEL ${selectedPet.unlockLevel}</span>
        <span class="text-zinc-400/60 text-[8px] uppercase mt-0.5 tracking-wider">to enlist this rhythm companion</span>
      </div>
    `;
  } else {
    const isEquipped = state.equippedPetIds && state.equippedPetIds.includes(selectedPet.id);
    const equipButtonText = isEquipped ? 'UNEQUIP' : 'EQUIP';
    const equipButtonColor = isEquipped 
      ? 'bg-rose-500 hover:bg-rose-600 text-white' 
      : 'bg-pink-500 hover:bg-pink-600 text-white';

    const maxIdx = selectedPet.stats.length - 1;
    const currentVal = selectedPet.stats[Math.min(selectedLevel - 1, maxIdx)];
    const isMaxLevel = selectedLevel >= 10;
    const nextVal = !isMaxLevel ? selectedPet.stats[Math.min(selectedLevel, maxIdx)] : null;

    // Ability Description formatting
    let abilityDescription = '';
    let nextLevelText = '';
    if (selectedPet.id >= 6) {
      abilityDescription = "Template ability. Be creative";
      if (nextVal) nextLevelText = `NEXT LEVEL: +${nextVal} pts.`;
    } else if (selectedPet.id === 1) {
      abilityDescription = `10% chance to replace notes with skin worth +${currentVal} pts.`;
      if (nextVal) nextLevelText = `NEXT LEVEL: +${nextVal} pts.`;
    } else if (selectedPet.id === 2) {
      abilityDescription = `For every 5 hit combo, +${currentVal} points.`;
      if (nextVal) nextLevelText = `NEXT LEVEL: +${nextVal} points.`;
    } else if (selectedPet.id === 3) {
      abilityDescription = `The first ${currentVal} notes hit are worth 5x points.`;
      if (nextVal) nextLevelText = `NEXT LEVEL: ${nextVal} notes.`;
    } else if (selectedPet.id === 4) {
      abilityDescription = `After 50 Perfect hits, perfect hit scores are multiplied by ${currentVal.toFixed(1)}x.`;
      if (nextVal) nextLevelText = `NEXT LEVEL: ${nextVal.toFixed(1)}x multiplier.`;
    } else if (selectedPet.id === 5) {
      abilityDescription = `Deals +${currentVal} Boss Damage for every 1% performance accuracy.`;
      if (nextVal) nextLevelText = `NEXT LEVEL: +${nextVal} DMG.`;
    }

    // Left column: Pet card (illustration) + EQUIP/UNEQUIP button inside slightly lighter purple container
    const leftColHtml = `
      <div class="w-[90px] flex flex-col items-center gap-2 bg-[#170e3c] border border-white/5 rounded-2xl p-2 shrink-0">
        <div class="w-14 h-14 rounded-xl bg-[#231754] flex items-center justify-center text-4xl select-none">
          ${selectedPet.avatar}
        </div>
        <button onclick="window.toggleEquipPet(${selectedPet.id})" class="w-full py-1.5 rounded-xl font-black text-[8.5px] uppercase tracking-wider transition-all duration-150 leading-none shadow-md ${equipButtonColor}">
          ${equipButtonText}
        </button>
      </div>
    `;

    // Level-up button and cost setup
    let levelUpActionHtml = '';
    const costIdx = Math.min(PET_BALANCING.upgradeCost.length - 1, selectedLevel - 1);
    const upgradeCost = PET_BALANCING.upgradeCost[costIdx];

    if (isMaxLevel) {
      levelUpActionHtml = `
        <button class="px-3.5 py-2 rounded-xl bg-zinc-800 text-zinc-500 text-[8.5px] font-black uppercase tracking-wider cursor-not-allowed leading-none">
          MAX LEVEL
        </button>
      `;
    } else if (isSelectedSleeping) {
      const sleepIdx = Math.max(0, Math.min(PET_BALANCING.sleepDurationSeconds.length - 1, selectedLevel - 2));
      const secs = Math.ceil((state.petSleepUntil[selectedPet.id] - Date.now()) / 1000);
      const speedupCost = Math.max(1, Math.ceil(secs / 120)) * PET_BALANCING.speedupCostPer2min;

      levelUpActionHtml = `
        <div class="flex flex-col items-end gap-1 select-none">
          <button onclick="window.speedUpPetSleep(${selectedPet.id})" class="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-500 via-[#ca8a04] to-rose-600 text-white text-[8.5px] font-black uppercase tracking-wide hover:scale-105 active:scale-95 transition-transform duration-150 shadow-md flex items-center justify-center gap-1 leading-none">
            WAKE UP &nbsp;🪙${speedupCost}
          </button>
          <span class="text-zinc-500 text-[6.5px] font-bold font-mono uppercase">RECOVERING: ${secs}s</span>
        </div>
      `;
    } else {
      levelUpActionHtml = `
        <div class="flex flex-col items-end gap-0.5 select-none">
          <button onclick="window.upgradePet(${selectedPet.id})" class="px-4 py-1.5 rounded-full bg-yellow-400 hover:bg-yellow-500 text-black text-[9px] font-black uppercase tracking-wider transition-all duration-150 shadow-md flex items-center justify-center leading-none">
            LEVEL UP
          </button>
          <span class="text-fuchsia-400 font-bold font-mono text-[7.5px] tracking-wide uppercase leading-none mt-1">🍪 ${upgradeCost}</span>
        </div>
      `;
    }

    // Right-aligned pellet count
    const pelletsCountHtml = `
      <div class="flex items-center gap-1 bg-black/30 border border-white/5 rounded-full px-2.5 py-0.5 text-fuchsia-400 font-mono font-bold text-[9px]">
        <span>🍪</span>
        <span>${(state.petPellets || 0).toLocaleString()}</span>
      </div>
    `;

    detailPanelHtml = `
      <div class="mt-3 bg-gradient-to-br from-[#130d2a] to-[#0c051d] border border-white/5 rounded-2xl p-3 flex gap-3 min-h-[120px]">
        <!-- Left Column -->
        ${leftColHtml}

        <!-- Right Column -->
        <div class="flex-grow flex flex-col justify-between">
          <!-- Top Row: Name, Level, Pellet count -->
          <div>
            <div class="flex items-center justify-between gap-1 mb-1.5 select-none">
              <div class="flex items-center gap-1.5">
                <div class="w-5 h-5 rotate-45 bg-gradient-to-br from-emerald-400 to-green-600 border border-emerald-300 flex items-center justify-center shadow-md shrink-0">
                  <span class="-rotate-45 text-white font-black text-[8px] font-sans leading-none">${selectedLevel}</span>
                </div>
                <span class="text-white text-[11.5px] font-black tracking-tight uppercase">${selectedPet.name}</span>
              </div>
              ${pelletsCountHtml}
            </div>

            <!-- Description -->
            <p class="text-white/80 text-[8.5px] font-sans font-medium leading-relaxed">
              ${abilityDescription}
            </p>
            ${nextLevelText ? `
              <p class="text-yellow-400 font-extrabold text-[8px] mt-1 uppercase tracking-wider font-mono">
                ${nextLevelText}
              </p>
            ` : ''}
          </div>

          <!-- Bottom Row: Upgrade Action -->
          <div class="flex justify-end items-end mt-1">
            ${levelUpActionHtml}
          </div>
        </div>
      </div>
    `;
  }

  // Trigger procedural canvas setting immediately after visual return
  setTimeout(() => {
    initCanvasPlayground(state);
  }, 0);

  // Render complete dashboard wrapper
  return `
    <div id="pets-lounge-header" class="bg-gradient-to-br from-[#1a0c3a] via-[#10062a] to-[#07011d] rounded-3xl p-4 border border-indigo-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] mb-6 overflow-hidden relative select-none">
      <!-- Background Ambient Glow -->
      <div class="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/30 to-transparent"></div>
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-fuchsia-950/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>

      <!-- Playful stage where companion pets freely drift/roam, fully rendered inside CANVAS -->
      <div class="relative w-full h-36 border border-cyan-500/15 rounded-2xl overflow-hidden mb-3.5 bg-gradient-to-b from-[#110e2b] to-[#121c24] shadow-inner">
        <canvas id="pet-playground-canvas" class="w-full h-full block cursor-pointer"></canvas>
      </div>

      <!-- Top Pink Card for Equipped Pets in Battle -->
      <div class="relative bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/30 rounded-3xl p-4 pt-6 flex flex-col items-center justify-center mb-4">
        <!-- Top badge overlapping -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[8px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full shadow-lg leading-none select-none">
          IN BATTLE
        </div>
        <div class="flex items-center gap-3.5 justify-center">
          ${inBattleSlotsHtml}
        </div>
      </div>

      <!-- Scrollable Unequipped Pet List -->
      <div class="bg-white/[0.01] border border-white/5 rounded-2xl p-3 flex flex-col gap-3">
        <div class="flex items-center gap-3.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth justify-start">
          ${unequippedPetsHtml}
        </div>
      </div>

      <!-- Detail Info Panel (Bottom Column) -->
      ${detailPanelHtml}
    </div>
  `;
}

export function updatePetsLoungeUI(state) {
  const wrapper = document.getElementById('pets-lounge-wrapper');
  if (wrapper && state.activeCategory === 'HOME') {
    if (state.unlockedPets && state.unlockedPets.size > 0) {
      wrapper.innerHTML = getPetsLoungeHtml(state);
      wrapper.style.display = 'block';
    } else {
      wrapper.innerHTML = '';
      wrapper.style.display = 'none';
    }
  }
}

function isSongUnlocked(song) {
  const isLockedArray = Array.isArray(song.isLocked) ? song.isLocked : [song.isLocked];
  return !isLockedArray[0];
}

function getRemainingStars(song) {
  const level = song.level;
  const levels = Array.isArray(level) ? level : [level];
  const starLevels = Array.isArray(song.starLevel) ? song.starLevel : [song.starLevel];
  const maxStarsPoss = levels.length * 6;
  const totalCollected = starLevels.reduce((a, b) => a + (b || 0), 0);
  return Math.max(0, maxStarsPoss - totalCollected);
}

export function renderContent(state, getSongCost) {
  const container = document.getElementById('content-root');
  if (!container) return;
  
  // Create modular wrappers so we do not clear out songs (which causes scroll issues/expand resets/sluggishness)
  let loungeWrapper = document.getElementById('pets-lounge-wrapper');
  let songsWrapper = document.getElementById('songs-list-wrapper');

  if (!loungeWrapper || !songsWrapper) {
    container.innerHTML = `
      <div id="pets-lounge-wrapper"></div>
      <div id="songs-list-wrapper" class="flex flex-col gap-[2.5px]"></div>
    `;
    loungeWrapper = document.getElementById('pets-lounge-wrapper');
    songsWrapper = document.getElementById('songs-list-wrapper');
  }

  // Render/Update the companion lobby
  if (state.activeCategory === 'HOME' && state.unlockedPets && state.unlockedPets.size > 0) {
    loungeWrapper.innerHTML = getPetsLoungeHtml(state);
    loungeWrapper.style.display = 'block';
  } else {
    loungeWrapper.innerHTML = '';
    loungeWrapper.style.display = 'none';
  }

  // Filter and sort songs based on activeCategory
  let filteredSongs = [...state.songs];
  let showGachaButton = false;

  if (state.activeCategory === 'YOUR SONG') {
    filteredSongs = filteredSongs
      .filter(isSongUnlocked)
      .sort((a, b) => getRemainingStars(b) - getRemainingStars(a));
    showGachaButton = true;
  } else if (state.activeCategory === 'HOME') {
    // Hidden on Home screen unless player has reached Level 2
    if (state.user && state.user.level >= 2) {
      showGachaButton = true;
    } else {
      showGachaButton = false;
    }
  }

  // Handle DeluxeSongBoost sorting: push the boosted song to the second position (index 1) of filteredSongs
  const boostedIdx = filteredSongs.findIndex(s => s.deluxeSongBoost);
  if (boostedIdx !== -1) {
    const boostedSong = filteredSongs[boostedIdx];
    filteredSongs.splice(boostedIdx, 1);
    if (filteredSongs.length >= 1) {
      filteredSongs.splice(1, 0, boostedSong);
    } else {
      filteredSongs.unshift(boostedSong);
    }
  }

  // Render the actual songs structure
  let songsHtml = '';
  if (showGachaButton) {
    const isHighlighted = !state.gachaSpunBefore;
    songsHtml += `
      <div class="w-full mb-3 select-none">
        <style>
          @keyframes glossShimmer {
            0% { transform: translateX(-150%) skewX(-25deg); }
            40% { transform: translateX(150%) skewX(-25deg); }
            100% { transform: translateX(150%) skewX(-25deg); }
          }
          .spin-machine-gloss {
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, rgba(250,204,21,0) 0%, rgba(250,204,21,0.4) 50%, rgba(250,204,21,0) 100%);
            animation: glossShimmer 2.5s infinite linear;
            pointer-events: none;
            z-index: 10;
          }
        </style>
        <button onclick="window.openSongGacha()" class="w-full relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-[2px] transition-all duration-300 hover:scale-[1.015] active:scale-95 ${isHighlighted ? 'ring-2 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-bounce' : 'hover:shadow-[0_0_20px_rgba(168,85,247,0.5)]'}" style="${isHighlighted ? 'animation-duration: 2.5s;' : ''}">
          <div class="relative bg-slate-950/90 rounded-[14px] p-3 flex items-center justify-between gap-3 overflow-hidden">
            ${isHighlighted ? '<div class="spin-machine-gloss"></div>' : ''}
            <!-- Floating neon lights -->
            <div class="absolute -right-6 -bottom-6 w-16 h-16 bg-pink-500/10 rounded-full blur-xl animate-pulse" style="animation-duration: 4s"></div>
            <div class="absolute -left-10 -top-10 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl animate-pulse" style="animation-duration: 6s"></div>
            
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-2xl border border-white/20 shadow-md">
                🎰
              </div>
              <div class="text-left">
                <div class="flex items-center gap-1.5">
                  <h4 class="text-white font-black italic text-sm tracking-tight uppercase leading-none">
                    SPIN MACHINE
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </button>
      </div>
    `;
  }

  filteredSongs.forEach(song => {
    const displayCost = getSongCost(song);
    songsHtml += getSongCardHtml({ ...song, coinCost: displayCost }, state.expandedSongId === song.id);
  });
  songsWrapper.innerHTML = songsHtml;

  // Setup IntersectionObserver for special card unlocking VFX
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-id');
        if (state.newlyUnlockedSongs.has(id)) {
          playSongCardUnlockedVFX(entry.target);
          state.newlyUnlockedSongs.delete(id);
        }
        if (state.newlyUnlockedDifficulties[id] && state.newlyUnlockedDifficulties[id].size > 0) {
          playSongCardNewDifficultyUnlockedVFX(entry.target);
          state.newlyUnlockedDifficulties[id].clear();
        }
      }
    });
  }, { threshold: 0.5 });

  songsWrapper.querySelectorAll('.card-wrapper').forEach(card => {
    observer.observe(card);
  });
}
