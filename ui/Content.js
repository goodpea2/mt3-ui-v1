
import { getSongCardHtml } from './SongCard.js';

export function renderContent(state, getSongCost) {
  const container = document.getElementById('content-root');
  if (!container) return;
  let html = '';
  state.songs.forEach(song => {
    const displayCost = getSongCost(song);
    html += getSongCardHtml({ ...song, coinCost: displayCost }, state.expandedSongId === song.id);
  });
  container.innerHTML = html;
}
