
import { PLAY_STAT } from './balance.js';

export function simulatePlay(song) {
  const currentStarLevel = song.starLevel || 0;
  const { starConfig, guaranteedCoins, songDuration, adDuration, idleDuration, noteConfig, guaranteedXpPerPlay, songDifficultyXpBonus, songDeluxeXpBonus, songOfTheDayXpBonus } = PLAY_STAT;

  // 1. Determine Star Level
  const starLevel = weightedRandom(starConfig.weightForStars);
  
  // 2. Determine Note Count
  let minNotes = noteConfig.noteCountMin[starLevel];
  let maxNotes = noteConfig.noteCountMax[starLevel];
  
  if (starLevel === 0) {
    minNotes = noteConfig.noteCountMin[0];
    maxNotes = noteConfig.noteCountMax[1];
  }
  
  const totalNotes = Math.floor(Math.random() * (maxNotes - minNotes + 1)) + minNotes;

  // 3. Accuracy Distribution
  const [perfectWeight, greatWeight, goodWeight] = noteConfig.weightForAccuracy;
  const totalWeight = perfectWeight + greatWeight + goodWeight;
  
  let perfectCount = 0;
  let greatCount = 0;
  let goodCount = 0;

  if (totalNotes > 0) {
    perfectCount = Math.floor(totalNotes * (perfectWeight / totalWeight));
    greatCount = Math.floor(totalNotes * (greatWeight / totalWeight));
    goodCount = totalNotes - perfectCount - greatCount;
  }

  // 4. XP Calculation
  const xpFromNotes = (perfectCount * noteConfig.xpPerAccuracy[0]) + 
                      (greatCount * noteConfig.xpPerAccuracy[1]) + 
                      (goodCount * noteConfig.xpPerAccuracy[2]);
  
  const baseGuaranteedXp = Math.floor(Math.random() * (guaranteedXpPerPlay[1] - guaranteedXpPerPlay[0] + 1)) + guaranteedXpPerPlay[0];
  
  let totalXp = xpFromNotes + baseGuaranteedXp;

  // Apply Multipliers
  let multiplier = 1.0;
  
  // Difficulty Bonus (level is 1-indexed, array is 0-indexed)
  const diffIndex = Math.min(song.level - 1, songDifficultyXpBonus.length - 1);
  multiplier += songDifficultyXpBonus[diffIndex];

  // Deluxe Bonus
  if (song.isDeluxe) {
    multiplier += songDeluxeXpBonus;
  }

  // SotD Bonus
  if (song.isSotd) {
    multiplier += songOfTheDayXpBonus;
  }

  totalXp = Math.round(totalXp * multiplier);

  // 5. Coin Calculation
  const baseCoins = Math.floor(Math.random() * (guaranteedCoins[1] - guaranteedCoins[0] + 1)) + guaranteedCoins[0];
  let bonusCoins = 0;
  let starsGained = 0;

  if (starLevel > 0) {
    // 1. Repeated star bonus: always count for all stars achieved in this play
    for (let i = 0; i < starLevel; i++) {
      bonusCoins += starConfig.coinForRepeatedStar[i];
    }

    // 2. New star bonus: only for stars reached for the first time
    if (starLevel > currentStarLevel) {
      starsGained = starLevel - currentStarLevel;
      for (let i = currentStarLevel; i < starLevel; i++) {
        bonusCoins += starConfig.coinForNewStar[i];
      }
    }
  }
  const totalCoins = baseCoins + bonusCoins;

  // 6. Durations
  const baseSongDur = Math.floor(Math.random() * (songDuration[1] - songDuration[0] + 1)) + songDuration[0];
  const effectiveSongDuration = Math.round((baseSongDur / 3) * starLevel);
  
  const adDur1 = Math.floor(Math.random() * (adDuration[1] - adDuration[0] + 1)) + adDuration[0];
  let adDur2 = 0;
  if (starLevel >= 4) {
    adDur2 = Math.floor(Math.random() * (adDuration[1] - adDuration[0] + 1)) + adDuration[0];
  }
  const totalAdDuration = adDur1 + adDur2;

  const idleDur = Math.floor(Math.random() * (idleDuration[1] - idleDuration[0] + 1)) + idleDuration[0];

  return {
    starLevel,
    starsGained,
    totalNotes,
    perfectCount,
    greatCount,
    goodCount,
    totalXp,
    totalCoins,
    effectiveSongDuration,
    adDuration: totalAdDuration,
    idleDuration: idleDur,
    totalTime: effectiveSongDuration + totalAdDuration + idleDur
  };
}

function weightedRandom(weights) {
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) return i;
    random -= weights[i];
  }
  return weights.length - 1;
}
