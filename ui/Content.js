
import { getSongCardHtml } from './SongCard.js';
import { playSongCardUnlockedVFX } from '../vfx/SongCardUnlocked.js';
import { playSongCardNewDifficultyUnlockedVFX } from '../vfx/SongCardNewDifficultyUnlocked.js';

export function renderContent(state, getSongCost) {
  const container = document.getElementById('content-root');
  if (!container) return;
  
  let html = '';
  state.songs.forEach(song => {
    const displayCost = getSongCost(song);
    html += getSongCardHtml({ ...song, coinCost: displayCost }, state.expandedSongId === song.id);
  });
  container.innerHTML = html;

  // Setup IntersectionObserver for VFX
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('data-id');
        
        // Check for newly unlocked song
        if (state.newlyUnlockedSongs.has(id)) {
          playSongCardUnlockedVFX(entry.target);
          state.newlyUnlockedSongs.delete(id);
        }
        
        // Check for newly unlocked difficulty
        if (state.newlyUnlockedDifficulties[id] && state.newlyUnlockedDifficulties[id].size > 0) {
          playSongCardNewDifficultyUnlockedVFX(entry.target);
          state.newlyUnlockedDifficulties[id].clear();
        }
      }
    });
  }, { threshold: 0.5 });

  container.querySelectorAll('.card-wrapper').forEach(card => {
    observer.observe(card);
  });
}
