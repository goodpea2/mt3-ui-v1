import { state } from '../state.js';

export function showCurrencyShopPopup(onCloseCallback) {
  let layer = document.getElementById('currency-shop-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.id = 'currency-shop-layer';
    layer.className = "absolute inset-0 pointer-events-none flex items-center justify-center z-[120]";
    const container = document.querySelector('.mobile-container') || document.body;
    container.appendChild(layer);
  }

  // Make sure limit states are ready
  state.currencyShopLimits = state.currencyShopLimits || {
    keysCoin: 0,
    keysAd: 0,
    coinsFree: 0,
    coinsAd: 0
  };

  // Open popups layer
  layer.classList.remove('pointer-events-none');
  layer.classList.add('pointer-events-auto', 'bg-black/80', 'backdrop-blur-md');

  const popup = document.createElement('div');
  popup.id = 'currency-shop-popup';
  popup.className = "relative w-[360px] h-[580px] bg-gradient-to-b from-[#170a2f] via-[#0b031b] to-[#04010a] border-4 border-cyan-500/40 rounded-[40px] shadow-[0_0_80px_rgba(6,182,212,0.35)] animate-in fade-in zoom-in duration-300 flex flex-col overflow-hidden select-none font-sans text-white z-[500]";

  const renderShopContent = () => {
    const limits = state.currencyShopLimits;
    
    // Items Specs & status
    const list = [
      {
        id: 'keys_10_coin',
        title: '10 Keys Pack',
        rewardText: '10 KEYS',
        rewardIcon: '🔑',
        costText: '1,000 Coins',
        costIcon: '🪙',
        canBuy: limits.keysCoin < 3,
        statusText: `LIMIT: ${3 - limits.keysCoin}/3 daily`,
        action: () => {
          if (state.user.coins < 1000) return { success: false, msg: 'NOT ENOUGH COINS!' };
          state.user.coins -= 1000;
          state.stats.totalCoinSpent += 1000;
          state.visualUser.coins = state.user.coins;
          state.user.keys = (state.user.keys || 0) + 10;
          state.visualUser.keys = state.user.keys;
          limits.keysCoin++;
          return { success: true, msg: 'PROCESSED! +10 KEYS RECEIVED 🔑' };
        }
      },
      {
        id: 'keys_10_ad',
        title: 'Ad Voucher Keys',
        rewardText: '10 KEYS',
        rewardIcon: '🔑',
        costText: 'Watch Short Ad',
        costIcon: '📺',
        canBuy: limits.keysAd < 3,
        statusText: `LIMIT: ${3 - limits.keysAd}/3 daily`,
        action: () => {
          state.user.keys = (state.user.keys || 0) + 10;
          state.visualUser.keys = state.user.keys;
          limits.keysAd++;
          state.stats.totalAdCount = (state.stats.totalAdCount || 0) + 1;
          state.stats.totalTimeSpentWatchingAd = (state.stats.totalTimeSpentWatchingAd || 0) + 15;
          return { success: true, msg: 'AD COMPLETED! +10 KEYS RECEIVED 🔑' };
        }
      },
      {
        id: 'keys_50_usd',
        title: 'Pocket of Keys',
        rewardText: '50 KEYS',
        rewardIcon: '🔑',
        costText: '$2.99 USD',
        costIcon: '💵',
        canBuy: true,
        statusText: 'POPULAR CHOICE',
        action: () => {
          state.user.keys = (state.user.keys || 0) + 50;
          state.visualUser.keys = state.user.keys;
          return { success: true, msg: 'DEMO PASS: PURCHASE SUCCESSFUL! +50 KEYS 🔑' };
        }
      },
      {
        id: 'keys_200_usd',
        title: 'Purse of Keys',
        rewardText: '200 KEYS',
        rewardIcon: '🔑',
        costText: '$9.99 USD',
        costIcon: '💵',
        canBuy: true,
        statusText: '30% OFF STARTER',
        badge: '30% OFF',
        action: () => {
          state.user.keys = (state.user.keys || 0) + 200;
          state.visualUser.keys = state.user.keys;
          return { success: true, msg: 'DEMO PASS: PURCHASE SUCCESSFUL! +200 KEYS 🔑' };
        }
      },
      {
        id: 'keys_500_usd',
        title: 'Vault of Keys',
        rewardText: '500 KEYS',
        rewardIcon: '🔑',
        costText: '$19.99 USD',
        costIcon: '💵',
        canBuy: true,
        statusText: '50% BEST VALUE',
        badge: '50% OFF',
        action: () => {
          state.user.keys = (state.user.keys || 0) + 500;
          state.visualUser.keys = state.user.keys;
          return { success: true, msg: 'DEMO PASS: PURCHASE SUCCESSFUL! +500 KEYS 🔑' };
        }
      },
      {
        id: 'coins_1000_free',
        title: 'Daily Allowance',
        rewardText: '1,000 COINS',
        rewardIcon: '🪙',
        costText: 'FREE DAILY',
        costIcon: '🎁',
        canBuy: limits.coinsFree < 1,
        statusText: `LIMIT: ${1 - limits.coinsFree}/1 daily`,
        action: () => {
          state.user.coins += 1000;
          state.stats.totalCoinGained += 1000;
          state.visualUser.coins = state.user.coins;
          limits.coinsFree++;
          return { success: true, msg: 'CLAIMED! +1000 COINS RECEIVED 💰' };
        }
      },
      {
        id: 'coins_1000_ad',
        title: 'Ad Bonus Coins',
        rewardText: '1,000 COINS',
        rewardIcon: '🪙',
        costText: 'Watch Short Ad',
        costIcon: '📺',
        canBuy: limits.coinsAd < 3,
        statusText: `LIMIT: ${3 - limits.coinsAd}/3 daily`,
        action: () => {
          state.user.coins += 1000;
          state.stats.totalCoinGained += 1000;
          state.visualUser.coins = state.user.coins;
          limits.coinsAd++;
          state.stats.totalAdCount = (state.stats.totalAdCount || 0) + 1;
          state.stats.totalTimeSpentWatchingAd = (state.stats.totalTimeSpentWatchingAd || 0) + 15;
          return { success: true, msg: 'AD COMPLETED! +1000 COINS RECEIVED 💰' };
        }
      },
      {
        id: 'coins_5000_keys',
        title: 'Coin Exchange',
        rewardText: '5,000 COINS',
        rewardIcon: '🪙',
        costText: '60 Keys',
        costIcon: '🔑',
        canBuy: true,
        statusText: 'CONVERT EXCESS',
        action: () => {
          if ((state.user.keys || 0) < 60) return { success: false, msg: 'NOT ENOUGH KEYS!' };
          state.user.keys -= 60;
          state.visualUser.keys = state.user.keys;
          state.user.coins += 5000;
          state.stats.totalCoinGained += 5000;
          state.visualUser.coins = state.user.coins;
          return { success: true, msg: 'EXCHANGED! +5000 COINS RECEIVED 💰' };
        }
      }
    ];

    popup.innerHTML = `
      <!-- Absolute Floating Close Button -->
      <button id="shop-close-btn" class="absolute top-4 right-4 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white/70 hover:text-white flex items-center justify-center text-xs active:scale-95 transition-all duration-150 z-50">✕</button>

      <!-- Reusable HUD Counters bar from Homescreen -->
      <div class="h-16 shrink-0 bg-black/30 border-b border-white/5 px-6 flex items-center gap-2 select-none pt-2.5">
        <!-- Coins -->
        <div class="bg-[#1a0b3d] border-2 border-[#4a2d8a] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
          <div class="w-4 h-4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center shadow-lg border border-white/20 shrink-0">
             <span class="text-white font-black text-[8px] leading-none">$</span>
          </div>
          <span class="text-yellow-400 font-extrabold text-[10.5px] font-mono leading-none tracking-tight">${Math.floor(state.visualUser.coins).toLocaleString()}</span>
        </div>

        <!-- Keys -->
        <div class="bg-[#1a0b3d] border-2 border-cyan-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-inner">
          <span class="text-[11px] leading-none">🔑</span>
          <span class="text-cyan-400 font-extrabold text-[10.5px] font-mono leading-none tracking-tight">${Math.floor(state.visualUser.keys || 0).toLocaleString()}</span>
        </div>
      </div>

      <!-- Items Grid Scroll Container -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar pb-10">
        <div class="grid grid-cols-2 gap-2.5">
          ${list.map((item, idx) => {
            const badgeTag = item.badge ? `
              <div class="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-pink-600 outline outline-2 outline-[#0d041d] text-white text-[6.5px] font-black px-1.5 py-0.5 rounded-md shadow-md leading-none uppercase tracking-tighter">${item.badge}</div>
            ` : '';
            const statusColor = item.canBuy ? 'text-white/40' : 'text-red-500/80 font-black';
            const btnBg = item.canBuy 
              ? 'bg-gradient-to-r from-cyan-600 via-[#ca8a04]/0 inline-block bg-cyan-700/35 hover:scale-[1.02] active:scale-95 border border-cyan-500/30' 
              : 'bg-white/5 border-transparent opacity-45 cursor-not-allowed';

            // Show description only if it specifies a daily limit
            const hasDailyLimit = item.statusText && item.statusText.toUpperCase().includes('LIMIT');
            const statusTextHtml = hasDailyLimit 
              ? `<p class="${statusColor} text-[7.5px] leading-none mt-1 tracking-wider uppercase font-black">${item.statusText}</p>` 
              : '';

            // Color coordinate reward values matching currency aesthetic
            const colorClass = item.rewardIcon === '🔑' ? 'text-cyan-400' : 'text-yellow-400';

            return `
              <div class="relative bg-white/5 rounded-2xl border border-white/5 p-3 flex flex-col justify-between items-center text-center gap-2.5 hover:border-white/10 transition-colors">
                ${badgeTag}
                
                <!-- Package Icon -->
                <div class="w-10 h-10 rounded-full bg-gradient-to-b from-indigo-950 to-slate-950 flex items-center justify-center text-2xl shadow-inner border border-white/10 shrink-0">
                  ${item.rewardIcon}
                </div>

                <!-- Package Info -->
                <div class="flex flex-col gap-0.5 justify-center items-center h-10">
                  <p class="${colorClass} font-black text-[13px] leading-none font-mono tracking-tight">${item.rewardText}</p>
                  ${statusTextHtml}
                </div>

                <!-- Action Purchase Button -->
                <button 
                  id="buy-shop-${item.id}"
                  class="w-full py-1.5 rounded-xl text-[8px] font-black uppercase tracking-wider text-white flex items-center justify-center gap-0.5 leading-none transition-all ${btnBg}"
                >
                  <span class="mr-0.5 shrink-0">${item.costIcon}</span>
                  <span>${item.costText}</span>
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Hook events
    popup.querySelector('#shop-close-btn').onclick = () => {
      popup.remove();
      layer.classList.add('pointer-events-none');
      layer.classList.remove('pointer-events-auto', 'bg-black/80', 'backdrop-blur-md');
      if (onCloseCallback) onCloseCallback();
    };

    list.forEach(item => {
      const btn = popup.querySelector(`#buy-shop-${item.id}`);
      if (btn && item.canBuy) {
        btn.onclick = (e) => {
          e.stopPropagation();
          const res = item.action();
          if (res.success) {
            // Show custom floating visual toast
            const toast = document.createElement('div');
            toast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-cyan-950 bg-opacity-95 border border-cyan-500 font-extrabold px-5 py-3 rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.4)] text-[10.5px] uppercase text-cyan-300 font-sans text-center tracking-wide leading-relaxed z-[990] animate-bounce";
            toast.innerText = res.msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2500);

            // Re-render Shop list and main header UI sync
            renderShopContent();
            if (window.ui) {
              window.ui.header();
              window.ui.content();
            }
          } else {
            // Insufficient or error toast
            const toast = document.createElement('div');
            toast.className = "fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-rose-950 bg-opacity-95 border border-rose-500 font-extrabold px-5 py-3 rounded-2xl shadow-[0_0_50px_rgba(244,63,94,0.4)] text-[10.5px] uppercase text-rose-300 font-sans text-center tracking-wide leading-relaxed z-[990] animate-shake";
            toast.innerText = res.msg;
            document.body.appendChild(toast);
            setTimeout(() => toast.remove(), 2000);
          }
        };
      }
    });
  };

  renderShopContent();
  layer.appendChild(popup);
}
