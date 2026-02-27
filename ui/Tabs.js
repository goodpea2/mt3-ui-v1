
import { CATEGORIES } from '../constants.js';

export function renderTabs(state, onTabClick) {
  const container = document.getElementById('tabs-root');
  if (!container) return;
  container.className = "w-full bg-[#130829] py-1 border-y border-white/5 relative z-20";
  const scrollArea = document.createElement('div');
  scrollArea.className = "flex overflow-x-auto px-2 no-scrollbar gap-2 items-center h-8";
  CATEGORIES.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = `whitespace-nowrap text-[10px] font-black tracking-widest px-3 py-1.5 rounded-xl transition-all duration-200 ${
      state.activeCategory === cat 
        ? 'bg-[#3b2175] text-[#ff00ff] border border-[#ff00ff30] shadow-[0_0_15px_rgba(255,0,255,0.2)]' 
        : 'text-gray-400 hover:text-gray-200'
    }`;
    btn.innerText = cat;
    btn.onclick = () => onTabClick(cat);
    scrollArea.appendChild(btn);
  });
  container.innerHTML = '';
  container.appendChild(scrollArea);
}
