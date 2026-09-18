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
  
  let hasConflicts = true;
  let attempts = 0;
  const maxAttempts = 200;

  while (hasConflicts && attempts < maxAttempts) {
    hasConflicts = false;
    
    for (let i = 0; i < shuffled.length - 1; i++) {
      if (shuffled[i].province && shuffled[i].province === shuffled[i + 1].province) {
        hasConflicts = true;
        
        // Helper para encontrar lugares seguros donde insertar el elemento sin causar choques
        const findSafeSpotsForIndex = (indexToMove: number) => {
          const prov = shuffled[indexToMove].province;
          const spots: number[] = [];
          for (let k = 0; k <= shuffled.length; k++) {
            if (k === indexToMove || k === indexToMove + 1) continue;
            const prevProv = k > 0 ? shuffled[k - 1].province : null;
            const nextProv = k < shuffled.length ? shuffled[k].province : null;
            // Si lo insertamos en 'k', no debe chocar ni con el anterior ni con el siguiente
            if (prevProv !== prov && nextProv !== prov) {
              spots.push(k);
            }
          }
          return spots;
        };

        // Intentar mover el orador de la derecha (i + 1)
        let safeSpots = findSafeSpotsForIndex(i + 1);
        let targetIndex = i + 1;

        // Si no hay lugar, intentar con el orador de la izquierda (i)
        if (safeSpots.length === 0) {
          safeSpots = findSafeSpotsForIndex(i);
          targetIndex = i;
        }

        if (safeSpots.length > 0) {
          // Elegir un lugar seguro al azar para mantener la aleatoriedad
          const randomK = safeSpots[Math.floor(Math.random() * safeSpots.length)];
          const element = shuffled.splice(targetIndex, 1)[0];
          // Ajustar el índice de inserción si el arreglo se corrió a la izquierda
          const insertPos = randomK > targetIndex ? randomK - 1 : randomK;
          shuffled.splice(insertPos, 0, element);
          break; // Romper el for loop y volver a escanear desde 0
        }
      }
    }
    attempts++;
  }

  return shuffled.map((speaker, index) => ({
    ...speaker,
    order: index + 1,
    status: 'WAITING' as const
  }));
};
