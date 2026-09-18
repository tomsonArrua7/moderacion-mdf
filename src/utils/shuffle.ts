import { Speaker } from '../types/debate';

/**
 * Algoritmo de Sorteo Fisher-Yates (Knuth Shuffle)
 * Garantiza una permutación matemáticamente no sesgada y uniforme.
 */
export const fisherYatesShuffle = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Aplica el sorteo a la lista de oradores y reasigna el número de orden (1..N)
 */
export const shuffleAndReorderSpeakers = (speakers: Speaker[]): Speaker[] => {
  const shuffled = fisherYatesShuffle(speakers);
  
  // Resolve consecutive provinces
  for (let i = 0; i < shuffled.length - 1; i++) {
    if (shuffled[i].province && shuffled[i].province === shuffled[i + 1].province) {
      for (let j = i + 2; j < shuffled.length; j++) {
        const jProvince = shuffled[j].province;
        const iPlus1Province = shuffled[i + 1].province;

        const jOkWithI = jProvince !== shuffled[i].province;
        const jOkWithIPlus2 = (i + 2 < shuffled.length && i + 2 !== j) ? jProvince !== shuffled[i + 2].province : true;
        const iPlus1OkWithJMinus1 = iPlus1Province !== shuffled[j - 1].province;
        const iPlus1OkWithJPlus1 = (j + 1 < shuffled.length) ? iPlus1Province !== shuffled[j + 1].province : true;

        if (jOkWithI && jOkWithIPlus2 && iPlus1OkWithJMinus1 && iPlus1OkWithJPlus1) {
          [shuffled[i + 1], shuffled[j]] = [shuffled[j], shuffled[i + 1]];
          break;
        }
      }
    }
  }

  return shuffled.map((speaker, index) => ({
    ...speaker,
    order: index + 1,
    status: 'WAITING' as const
  }));
};
