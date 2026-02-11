
import { VFX_CONFIG } from './Config.js';

export class VFXManager {
  static spawnRewards(type, amount, startRect, targetEl, onHitCallback) {
    const config = VFX_CONFIG[type];
    const count = Math.min(
      config.maxParticles, 
      Math.max(config.minParticles, Math.floor(amount / config.particleValue))
    );
    
    const valuePerParticle = amount / count;

    for (let i = 0; i < count; i++) {
      const stagger = Math.random() * 400; 
      setTimeout(() => {
        this.createParticle(type, startRect, targetEl, config, valuePerParticle, onHitCallback, false);
      }, stagger);
    }
  }

  static spawnSpend(type, amount, sourceEl, targetRect, onComplete) {
    const config = VFX_CONFIG[type];
    const sourceRect = sourceEl.getBoundingClientRect();
    const count = 15; // Fixed count for spending visual
    
    for (let i = 0; i < count; i++) {
      const stagger = Math.random() * 300;
      setTimeout(() => {
        this.createParticle(type, sourceRect, { getBoundingClientRect: () => targetRect }, config, 0, onComplete, true);
      }, stagger);
    }
  }

  static createParticle(type, start, target, config, value, onHit, isReverse = false) {
    const p = document.createElement('div');
    const size = 10;
    
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

    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * config.spreadRadius;
    const sx = Math.cos(angle) * dist;
    const sy = Math.sin(angle) * dist;

    const burstAnim = p.animate([
      { transform: 'translate(0, 0) scale(0)', opacity: 0 },
      { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1, offset: 0.2 },
      { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1, offset: 1.0 }
    ], {
      duration: config.hoverDelay,
      easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    burstAnim.onfinish = () => {
      const targetRect = (typeof target.getBoundingClientRect === 'function') ? target.getBoundingClientRect() : target;
      const tx = (targetRect.left + targetRect.width / 2) - (startX + sx);
      const ty = (targetRect.top + targetRect.height / 2) - (startY + sy);

      const flyAnim = p.animate([
        { transform: `translate(${sx}px, ${sy}px) scale(1)`, opacity: 1 },
        { transform: `translate(${sx + tx}px, ${sy + ty}px) scale(1)`, opacity: 1 }
      ], {
        duration: config.flyDuration,
        easing: 'cubic-bezier(0.4, 0, 1, 1)' 
      });

      flyAnim.onfinish = () => {
        p.remove();
        if (!isReverse) {
          const targetEl = target;
          if (targetEl.classList) {
            targetEl.classList.remove('target-flash');
            void targetEl.offsetWidth;
            targetEl.classList.add('target-flash');
          }
          if (onHit) onHit(value);
        } else {
          // For reverse, we might trigger a small effect on the target (button)
          if (onHit) onHit();
        }
      };
    };
  }
}
