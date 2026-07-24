import { MOCK_SONGS } from './songs.js';

export const FIGURES_DATA = MOCK_SONGS.map((song) => ({
  id: song.id,
  img: song.coverUrl,
  title: song.title,
  artist: song.artist,
  description: `A legendary vinyl figure representing "${song.title}" by ${song.artist}. Displays an elegant rhythmic aura.`,
  decoCoinCost: 0 // Free or deprecated, as figures are unlocked by star accumulation
}));

export const SET_FIGURES_DATA = [
  {
    id: 1,
    setName: 'Neon Nights',
    figures: ['song-0', 'song-1', 'song-2', 'song-3', 'song-4'],
    reward: { type: 'pet', petId: 13 }
  },
  {
    id: 2,
    setName: 'Retro Beats',
    figures: ['song-5', 'song-6', 'song-7', 'song-8', 'song-9'],
    reward: { type: 'pet', petId: 14 }
  },
  {
    id: 3,
    setName: 'Cyber Punk',
    figures: ['song-10', 'song-11', 'song-12', 'song-13', 'song-14'],
    reward: { type: 'pet', petId: 15 }
  },
  {
    id: 4,
    setName: 'Disco Fever',
    figures: ['song-15', 'song-16', 'song-17', 'song-18', 'song-19'],
    reward: { type: 'pet', petId: 16 }
  },
  {
    id: 5,
    setName: 'Synth Wave',
    figures: ['song-20', 'song-21', 'song-22', 'song-23', 'song-24'],
    reward: { type: 'pet', petId: 17 }
  },
  {
    id: 6,
    setName: 'Lo-Fi Chill',
    figures: ['song-25', 'song-26', 'song-27', 'song-28', 'song-29'],
    reward: { type: 'pet', petId: 18 }
  }
];
