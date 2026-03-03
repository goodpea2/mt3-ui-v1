
export function renderNav(state, onTabSwitch) {
  const container = document.getElementById('nav-root');
  if (!container) return;
  
  const tabs = [
    { id: 'HOME', label: 'Home', icon: 'H' },
    { id: 'FIGURES', label: 'Figures', icon: 'F' },
    { id: 'PLAYLIST', label: 'Playlist', icon: 'P' },
    { id: 'RANK', label: 'Rank', icon: 'R' },
    { id: 'SHOP', label: 'Shop', icon: 'S' }
  ];

  container.innerHTML = `
    <div class="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black via-[#0c051d] to-transparent pointer-events-none z-50">
      <div class="absolute bottom-4 left-0 w-full flex justify-around items-end px-4 pointer-events-auto">
        ${tabs.map((tab) => {
          const isActive = state.activeCategory === tab.id;
          if (isActive) {
            return `
              <div class="relative cursor-pointer group" onclick="window.switchTab('${tab.id}')">
                <div class="absolute inset-x-[-10px] top-[-15px] bottom-[-3px] bg-gradient-to-b from-cyan-400 to-blue-600 rounded-xl shadow-2xl opacity-80 transition-all"></div>
                <div class="relative bg-gradient-to-b from-[#ff4081] to-[#e91e63] w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 border-white/40 shadow-inner">
                   <div class="flex gap-1 mb-0.5">
                     <div class="w-2 h-4 bg-white rounded-sm opacity-90 shadow-[0_0_5px_white]"></div>
                     <div class="w-2 h-4 bg-white rounded-sm opacity-90 shadow-[0_0_5px_white]"></div>
                     <div class="w-2 h-4 bg-cyan-300 rounded-sm shadow-[0_0_10px_cyan]"></div>
                   </div>
                   <span class="text-white text-[8px] font-black italic tracking-wider uppercase">${tab.label}</span>
                </div>
              </div>
            `;
          } else {
            return `
              <div onclick="window.switchTab('${tab.id}')" class="mb-1 opacity-60 hover:opacity-100 transition-all cursor-pointer flex flex-col items-center transform hover:scale-110">
                 <div class="w-10 h-10 bg-[#2d1b5e]/80 rounded-xl flex items-center justify-center border border-white/10 shadow-2xl backdrop-blur-md">
                    <div class="w-6 h-6 rounded-lg bg-[#4a2d8a]/50 flex items-center justify-center text-purple-200 text-[10px] font-black uppercase">
                       ${tab.icon}
                    </div>
                 </div>
                 <span class="text-[7px] font-black text-purple-300 mt-0.5 uppercase">${tab.label}</span>
              </div>
            `;
          }
        }).join('')}
      </div>
    </div>
  `;
}
