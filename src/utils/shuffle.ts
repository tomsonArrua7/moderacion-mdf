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
  // Solo sorteamos oradores que no sean excepciones fijas si hubiera alguna
  const shuffled = fisherYatesShuffle(speakers);
  
  return shuffled.map((speaker, index) => ({
    ...speaker,
    order: index + 1,
    status: 'WAITING' as const
  }));
};
