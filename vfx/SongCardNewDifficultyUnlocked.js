
export function playSongCardNewDifficultyUnlockedVFX(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = "fixed pointer-events-none z-[1000]";
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(burst);

  for (let i = 0; i < 30; i++) {
    const p = document.createElement('div');
    p.className = "absolute w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]";
    burst.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 30 + Math.random() * 150;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.animate([
      { transform: 'translate(0, 0) scale(1.5)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 500,
      easing: 'cubic-bezier(0, 0, 0.2, 1)'
    });
  }

  setTimeout(() => burst.remove(), 2000);
}
