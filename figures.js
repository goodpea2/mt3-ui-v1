
export const FIGURES_DATA = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  img: `https://picsum.photos/seed/fig${i+1}/200/200`,
  description: `Figure #${i + 1}: A legendary mascot from the rhythm universe. Known for its incredible beat-matching skills.`,
  decoCoinCost: 50
}));

export const SET_FIGURES_DATA = [
  {
    id: 1,
    setName: 'Neon Nights',
    figures: [1, 2, 3, 4, 5],
    reward: { type: 'coin', amount: 500 }
  },
  {
    id: 2,
    setName: 'Retro Beats',
    figures: [6, 7, 8, 9, 10],
    reward: { type: 'coin', amount: 600 }
  },
  {
    id: 3,
    setName: 'Cyber Punk',
    figures: [11, 12, 13, 14, 15],
    reward: { type: 'coin', amount: 750 }
  },
  {
    id: 4,
    setName: 'Disco Fever',
    figures: [16, 17, 18, 19, 20],
    reward: { type: 'coin', amount: 800 }
  },
  {
    id: 5,
    setName: 'Synth Wave',
    figures: [21, 22, 23, 24, 25],
    reward: { type: 'coin', amount: 1000 }
  },
  {
    id: 6,
    setName: 'Lo-Fi Chill',
    figures: [26, 27, 28, 29, 30],
    reward: { type: 'coin', amount: 500 }
  },
  {
    id: 7,
    setName: 'Heavy Metal',
    figures: [31, 32, 33, 34, 35],
    reward: { type: 'coin', amount: 1200 }
  },
  {
    id: 8,
    setName: 'Pop Stars',
    figures: [36, 37, 38, 39, 40],
    reward: { type: 'coin', amount: 1500 }
  }
];
