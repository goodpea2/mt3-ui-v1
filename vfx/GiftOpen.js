
export function playGiftOpenVFX(element) {
  if (!element) return;
  const rect = element.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = "fixed pointer-events-none z-[1000]";
  burst.style.left = `${rect.left + rect.width / 2}px`;
  burst.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(burst);

  // Confetti burst
  const colors = ['#f472b6', '#c084fc', '#60a5fa', '#34d399', '#fbbf24'];
  for (let i = 0; i < 50; i++) {
    const p = document.createElement('div');
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.className = `absolute w-2 h-2 rounded-sm rotate-45`;
    p.style.backgroundColor = color;
    p.style.boxShadow = `0 0 10px ${color}`;
    burst.appendChild(p);

    const angle = Math.random() * Math.PI * 2;
    const dist = 100 + Math.random() * 200;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;

    p.animate([
      { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
      { transform: `translate(${tx}px, ${ty}px) rotate(${Math.random() * 720}deg) scale(0)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 1000,
      easing: 'cubic-bezier(0, 0, 0.2, 1)'
    });
  }

  // Radial glow
  const glow = document.createElement('div');
  glow.className = "absolute -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.4),transparent_70%)] rounded-full blur-3xl";
  burst.appendChild(glow);
  glow.animate([
    { transform: 'scale(0)', opacity: 0 },
    { transform: 'scale(1)', opacity: 1, offset: 0.2 },
    { transform: 'scale(1.2)', opacity: 0 }
  ], {
    duration: 1500,
    easing: 'ease-out'
  });

  setTimeout(() => burst.remove(), 2500);
}
