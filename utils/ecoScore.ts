import { QueryClient } from '@tanstack/react-query';

/**
 * Updates the eco score in the cache optimistically
 * 
 * @param queryClient The React Query client
 * @param delta The amount to increase the eco score by
 */
export function updateEcoScoreOptimistically(queryClient: QueryClient, delta: number) {
  queryClient.setQueryData(['homeSnapshot'], (old: any) => {
    if (!old) return old;
    
    return {
      ...old,
      ecoScore: Math.max(0, old.ecoScore + delta),
      deltaWeek: old.deltaWeek + delta,
      streakDays: old.streakDays + 1,
    };
  });
}

/**
 * Calculate eco points based on action type
 * 
 * @param actionType The type of care action
 * @returns The number of eco points to award
 */
export function calculateEcoPoints(actionType: 'water' | 'fertilize' | 'harvest'): number {
  switch (actionType) {
    case 'water': return 1;
    case 'fertilize': return 2;
    case 'harvest': return 3;
    default: return 0;
  }
}