
export function playSongCardUnlockedVFX(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = "fixed pointer-events-none z-[1000]";
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(burst);

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = "absolute w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_10px_#facc15]";
    burst.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 50 + Math.random() * 100;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 800 + Math.random() * 400,
      easing: 'cubic-bezier(0, 0, 0.2, 1)'
    });
  }

  setTimeout(() => burst.remove(), 1500);
}
