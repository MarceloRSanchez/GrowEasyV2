import { QueryClient } from '@tanstack/react-query';

/**
 * Updates the eco score in the cache optimistically.
 * This function is used to immediately update the UI when a care action is performed,
 * without waiting for the server response.
 * 
 * @param queryClient The React Query client
 * @param delta The amount to increase the eco score by
 */
export function updateEcoScoreOptimistically(queryClient: QueryClient, delta: number) {
  queryClient.setQueryData(['homeSnapshot'], (old: any) => {
    if (!old) return old;
    
    // Calculate new values
    const newEcoScore = old.ecoScore + delta;
    const newDeltaWeek = old.deltaWeek + delta;
    
    // Only increase streak if delta is positive
    const newStreakDays = delta > 0 ? old.streakDays + 1 : old.streakDays;
    
    return {
      ...old,
      ecoScore: newEcoScore,
      deltaWeek: newDeltaWeek,
      streakDays: newStreakDays,
    };
  });
}

/**
 * Calculate eco points based on action type
 * 
 * @param actionType The type of care action (water, fertilize, or harvest)
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

/**
 * Formats the eco score change for display in a toast message
 * 
 * @param delta The change in eco score
 * @returns A formatted string for display
 */
export function formatEcoScoreChange(delta: number): string {
  if (delta === 0) return '';
  return delta > 0 ? `+${delta}` : `${delta}`;
}