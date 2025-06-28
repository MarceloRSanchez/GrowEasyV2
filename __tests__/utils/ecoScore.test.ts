import { updateEcoScoreOptimistically, calculateEcoPoints, formatEcoScoreChange } from '@/utils/ecoScore';
import { QueryClient } from '@tanstack/react-query';

describe('ecoScore utilities', () => {
  describe('updateEcoScoreOptimistically', () => {
    let queryClient: QueryClient;
    
    beforeEach(() => {
      queryClient = new QueryClient();
      
      // Set initial home snapshot data
      queryClient.setQueryData(['homeSnapshot'], {
        ecoScore: 100,
        deltaWeek: 10,
        streakDays: 5,
      });
    });
    
    it('should update eco score with positive delta', () => {
      updateEcoScoreOptimistically(queryClient, 2);
      
      const updatedData = queryClient.getQueryData(['homeSnapshot']);
      expect(updatedData).toEqual({
        ecoScore: 102,
        deltaWeek: 12,
        streakDays: 6,
      });
    });
    
    it('should update eco score with negative delta', () => {
      updateEcoScoreOptimistically(queryClient, -1);
      
      const updatedData = queryClient.getQueryData(['homeSnapshot']);
      expect(updatedData).toEqual({
        ecoScore: 99,
        deltaWeek: 9,
        streakDays: 5, // Streak should not decrease for negative delta
      });
    });
    
    it('should handle missing home snapshot data', () => {
      queryClient = new QueryClient(); // Reset without setting data
      
      updateEcoScoreOptimistically(queryClient, 3);
      
      const updatedData = queryClient.getQueryData(['homeSnapshot']);
      expect(updatedData).toBeUndefined();
    });
  });
  
  describe('calculateEcoPoints', () => {
    it('should return 1 for water action', () => {
      expect(calculateEcoPoints('water')).toBe(1);
    });
    
    it('should return 2 for fertilize action', () => {
      expect(calculateEcoPoints('fertilize')).toBe(2);
    });
    
    it('should return 3 for harvest action', () => {
      expect(calculateEcoPoints('harvest')).toBe(3);
    });
  });
  
  describe('formatEcoScoreChange', () => {
    it('should format positive change with plus sign', () => {
      expect(formatEcoScoreChange(5)).toBe('+5');
    });
    
    it('should format negative change with minus sign', () => {
      expect(formatEcoScoreChange(-3)).toBe('-3');
    });
    
    it('should return empty string for zero change', () => {
      expect(formatEcoScoreChange(0)).toBe('');
    });
  });
});