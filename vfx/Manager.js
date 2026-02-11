
import { VFX_CONFIG } from './Config.js';

export class VFXManager {
  static spawnRewards(type, amount, startRect, targetEl, onHitCallback) {
    const config = VFX_CONFIG[type];
    const count = Math.min(
      config.maxParticles, 
      Math.max(config.minParticles, Math.floor(amount / config.particleValue))
    );
    
    // Calculate how much each particle is "worth" for the counter
    const valuePerParticle = amount / count;

    for (let i = 0; i < count; i++) {
      const stagger = Math.random() * 400; // Stagger initial spawn
      setTimeout(() => {
        this.createParticle(type, startRect, targetEl, config, valuePerParticle, onHitCallback);
      }, stagger);
    }
  }

  static createParticle(type, start, target, config, value, onHit) {
    const p = document.createElement('div');
    const size = 10;
    
    // Initial styling
    p.style.position = 'fixed';
    p.style.zIndex = '1000';
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.borderRadius = '50%';
    p.style.backgroundColor = config.color;
    p.style.boxShadow = config.glow;
    p.style.pointerEvents = 'none';
    
    const startX = start.left + start.width / 2;
    const startY = start.top + start.height / 2;
    p.style.left = `${startX}px`;
    p.style.top = `${startY}px`;
    
    document.body.appendChild(p);

    // Random spread vector
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * config.spreadRadius;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;

    // Phase 1 & 2: Burst and Hover
    const burstAnim = p.animate([
      { transform: 'translate(0, 0) scale(0)', opacity: 0 },
      { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1, offset: 0.2 },
      { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1, offset: 1.0 }
    ], {
      duration: config.hoverDelay,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    burstAnim.onfinish = () => {
      // Phase 3: Fly to target
      const targetRect = target.getBoundingClientRect();
      const tx = (targetRect.left + targetRect.width / 2) - (startX + sx);
      const ty = (targetRect.top + targetRect.height / 2) - (startY + sy);

      const flyAnim = p.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${sx + tx}px, ${sy + ty}px) scale(1)`, opacity: 1 }
      ], {
        duration: config.flyDuration,
        // Using cubic-bezier for a strong "accelerating" effect towards the target
        easing: 'cubic-bezier(0.4, 0, 1, 1)' 
      });

      flyAnim.onfinish = () => {
        p.remove();
        // Trigger Flash and Counter
        target.classList.remove('target-flash');
        void target.offsetWidth; // Trigger reflow
        target.classList.add('target-flash');
        onHit(value);
      };
    };
  }
}
