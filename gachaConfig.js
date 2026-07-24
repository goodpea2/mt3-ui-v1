/**
 * Gacha Loot Table Configuration
 * Reflects exact prizes and weights from the specified configuration.
 */
export const GACHA_LOOT_TABLE = [
  { item: '1 song', type: 'song', amount: 1, weight: 20 },
  { item: '1 deluxe song', type: 'deluxe_song', amount: 1, weight: 30 },
  { item: '10 pellets', type: 'pellet', amount: 10, weight: 40 },
  { item: '15 pellets', type: 'pellet', amount: 15, weight: 30 },
  { item: '25 pellets', type: 'pellet', amount: 25, weight: 25 },
  { item: '100 pellets', type: 'pellet', amount: 100, weight: 5 },
  { item: '5 shield fragments', type: 'shield', amount: 5, weight: 25 },
  { item: '10 shield fragments', type: 'shield', amount: 10, weight: 20 },
  { item: '30 shield fragments', type: 'shield', amount: 30, weight: 5 },
  { item: '2 keys', type: 'key', amount: 2, weight: 30 },
  { item: '3 keys', type: 'key', amount: 3, weight: 30 },
  { item: '5 keys', type: 'key', amount: 5, weight: 20 },
  { item: '10 keys', type: 'key', amount: 10, weight: 8 },
  { item: '15 keys', type: 'key', amount: 15, weight: 6 },
  { item: '20 keys', type: 'key', amount: 20, weight: 4 },
  { item: '30 keys', type: 'key', amount: 30, weight: 2 }
];

/**
 * Returns a randomly rolled prize from GACHA_LOOT_TABLE based on item weights.
 * Supports filtering for songs or excluding songs.
 */
export function rollGachaPrize(requireSong = null) {
  let list = GACHA_LOOT_TABLE;
  if (requireSong !== null) {
    list = GACHA_LOOT_TABLE.filter(item => {
      const isSong = item.type === 'song' || item.type === 'deluxe_song';
      return requireSong ? isSong : !isSong;
    });
  }
  const totalWeight = list.reduce((sum, item) => sum + item.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const prize of list) {
    if (randomVal < prize.weight) {
      return { ...prize };
    }
    randomVal -= prize.weight;
  }
  return { ...list[0] };
}
