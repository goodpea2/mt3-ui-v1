
import { PLAY_STAT, PET_BALANCING } from './balance.js';
import { state } from './state.js';

export function simulatePlay(song, difficultyIdx = 0) {
  const levels = Array.isArray(song.level) ? song.level : [song.level];
  const starLevels = Array.isArray(song.starLevel) ? song.starLevel : [song.starLevel];
  
  const currentLevel = levels[difficultyIdx];
  const currentStarLevel = starLevels[difficultyIdx] || 0;
  
  const { starConfig, guaranteedCoins, songDuration, adDuration, idleDuration, noteConfig } = PLAY_STAT;

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

  const petContributions = {
    pet1: 0,
    pet2: 0,
    pet3: 0,
    pet4: 0,
    pet5: 0,
    pet6: 0,
    pet7: 0,
    pet8: 0,
    pet9: 0,
    pet10: 0,
    pet11: 0,
    pet12: 0
  };

  const isPetActiveInSim = (petId) => {
    const activeState = window.state || state;
    if (!activeState) return false;
    const isUnlocked = activeState.unlockedPets && activeState.unlockedPets.has(petId);
    const isSleeping = activeState.petSleepUntil && (activeState.petSleepUntil[petId] > Date.now());
    const isEquipped = activeState.equippedPetIds && activeState.equippedPetIds.includes(petId);
    return isUnlocked && !isSleeping && isEquipped;
  };

  const getPetLevelInSim = (petId) => {
    const activeState = window.state || state;
    return activeState && activeState.petLevels ? (activeState.petLevels[petId] || 1) : 1;
  };

  // 1. Pet 1: Golden Notes
  if (isPetActiveInSim(1)) {
    const p1Lvl = getPetLevelInSim(1);
    const p1Config = PET_BALANCING.pets.find(p => p.id === 1);
    const goldenVal = p1Config ? p1Config.stats[Math.min(p1Lvl - 1, p1Config.stats.length - 1)] : 200;
    const goldenNotesCount = Math.floor(totalNotes * 0.10);
    petContributions.pet1 = goldenNotesCount * goldenVal;
  }

  // 2. Pet 2: Combo Bonus
  if (isPetActiveInSim(2)) {
    const p2Lvl = getPetLevelInSim(2);
    const p2Config = PET_BALANCING.pets.find(p => p.id === 2);
    const p2Bonus = p2Config ? p2Config.stats[Math.min(p2Lvl - 1, p2Config.stats.length - 1)] : 100;
    const comboGroupCount = Math.floor(perfectCount / 5);
    petContributions.pet2 = comboGroupCount * p2Bonus;
  }

  // 3. Pet 3: Guard (Hyper Score)
  if (isPetActiveInSim(3)) {
    const p3Lvl = getPetLevelInSim(3);
    const p3Config = PET_BALANCING.pets.find(p => p.id === 3);
    const val = p3Config ? p3Config.stats[Math.min(p3Lvl - 1, p3Config.stats.length - 1)] : 10;
    petContributions.pet3 = val * 40;
  }

  // 4. Pet 4: Perfect multiplier
  if (isPetActiveInSim(4) && perfectCount >= 50) {
    const p4Lvl = getPetLevelInSim(4);
    const p4Config = PET_BALANCING.pets.find(p => p.id === 4);
    const multiplier = p4Config ? p4Config.stats[Math.min(p4Lvl - 1, p4Config.stats.length - 1)] : 2.0;
    const extraPerfects = perfectCount - 50;
    if (extraPerfects > 0) {
      petContributions.pet4 = Math.round(extraPerfects * 40 * (multiplier - 1.0));
    }
  }

  // 5. Pet 5: Final blow (Accuracy Strike)
  if (isPetActiveInSim(5)) {
    const p5Lvl = getPetLevelInSim(5);
    const p5Config = PET_BALANCING.pets.find(p => p.id === 5);
    const accuracyVal = (perfectCount + greatCount * 0.75 + goodCount * 0.5) / (totalNotes || 1);
    const finalBlowPoints = Math.round((p5Config ? p5Config.stats[Math.min(p5Lvl - 1, p5Config.stats.length - 1)] : 30) * 100 * accuracyVal);
    petContributions.pet5 = finalBlowPoints;
  }

  // 6. Pets ID 6 to 12 have TemplateAbility: +1 point per hit node
  for (let pId = 6; pId <= 12; pId++) {
    if (isPetActiveInSim(pId)) {
      petContributions[`pet${pId}`] = perfectCount + greatCount + goodCount;
    }
  }

  const baseScore = (perfectCount * 40) + (greatCount * 30) + (goodCount * 20);
  let totalPetScore = 0;
  for (let key in petContributions) {
    totalPetScore += petContributions[key] || 0;
  }
  const score = baseScore + totalPetScore;

  return {
    score,
    petContributions,
    starLevel,
    starsGained,
    totalNotes,
    perfectCount,
    greatCount,
    goodCount,
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
