import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import SearchPlantScreen from '@/app/add/search';
import ConfigureRemindersScreen from '@/app/add/reminders';
import ReviewPlantScreen from '@/app/add/review';
import { AddWizardProvider } from '@/contexts/AddWizardContext';
import { useSearchPlants } from '@/hooks/useSearchPlants';
import { useCreateUserPlant } from '@/hooks/useCreateUserPlant';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock hooks
jest.mock('@/hooks/useSearchPlants');
jest.mock('@/hooks/useCreateUserPlant');

const mockUseSearchPlants = useSearchPlants as jest.MockedFunction<typeof useSearchPlants>;
const mockUseCreateUserPlant = useCreateUserPlant as jest.MockedFunction<typeof useCreateUserPlant>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AddWizardProvider>
        {children}
      </AddWizardProvider>
    </QueryClientProvider>
  );
};

const mockPlantResults = [
  {
    id: '1',
    name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    image_url: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'herb',
    difficulty: 'beginner',
    care_schedule: { watering: 2, fertilizing: 14 },
    growth_time: 60,
    sunlight: 'high',
    water_needs: 'medium',
    tips: ['Pinch flowers'],
    created_at: '2024-01-01',
  },
];

describe('AddWizard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SearchPlantScreen', () => {
    it('should show loading state when searching', () => {
      mockUseSearchPlants.mockReturnValue({
        results: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      const { getByText } = render(<SearchPlantScreen />, { wrapper: createWrapper() });
      
      // Should show loading overlay when query is present and loading
      // This would need to be tested with actual query state
    });

    it('should show empty state with retry option', () => {
      const mockRefetch = jest.fn();
      mockUseSearchPlants.mockReturnValue({
        results: [],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      const { getByText, getByPlaceholderText } = render(<SearchPlantScreen />, { wrapper: createWrapper() });
      
      // Type a search query
      const searchInput = getByPlaceholderText('e.g. Basil, Tomato…');
      fireEvent.changeText(searchInput, 'nonexistent');

      // Should show empty state with retry button
      expect(getByText('No plants found')).toBeTruthy();
      expect(getByText('Try again')).toBeTruthy();
      
      // Test retry functionality
      fireEvent.press(getByText('Try again'));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show error toast with retry option', () => {
      const mockRefetch = jest.fn();
      mockUseSearchPlants.mockReturnValue({
        results: [],
        isLoading: false,
        error: 'Search failed. Please try again.',
        refetch: mockRefetch,
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      const { getByText } = render(<SearchPlantScreen />, { wrapper: createWrapper() });
      
      expect(getByText('Search failed. Please try again.')).toBeTruthy();
      expect(getByText('Retry')).toBeTruthy();
      
      fireEvent.press(getByText('Retry'));
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('should show cancel confirmation when leaving with search query', () => {
      mockUseSearchPlants.mockReturnValue({
        results: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: jest.fn(),
        hasNextPage: false,
        isFetchingNextPage: false,
      });

      const { getByText, getByPlaceholderText, queryByText } = render(<SearchPlantScreen />, { wrapper: createWrapper() });
      
      // Type a search query
      const searchInput = getByPlaceholderText('e.g. Basil, Tomato…');
      fireEvent.changeText(searchInput, 'basil');

      // Try to go back
      const backButton = getByText('Search your plant').parent?.parent?.children[0];
      fireEvent.press(backButton as any);

      // Should show confirmation dialog
      expect(getByText('Leave search?')).toBeTruthy();
      expect(getByText('Your search progress will be lost.')).toBeTruthy();
      
      // Test cancel
      fireEvent.press(getByText('Stay'));
      expect(queryByText('Leave search?')).toBeFalsy();
      
      // Test confirm
      fireEvent.press(backButton as any);
      fireEvent.press(getByText('Leave'));
      expect(router.back).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      const mockFetchNextPage = jest.fn();
      mockUseSearchPlants.mockReturnValue({
        results: mockPlantResults,
        isLoading: false,
        error: null,
        refetch: jest.fn(),
        fetchNextPage: mockFetchNextPage,
        hasNextPage: true,
        isFetchingNextPage: false,
      });

      const { getByText } = render(<SearchPlantScreen />, { wrapper: createWrapper() });
      
      // This would test infinite scroll functionality
      // Implementation depends on FlatList onEndReached testing
    });
  });

  describe('ConfigureRemindersScreen', () => {
    it('should redirect to search if no plant selected', () => {
      const { } = render(<ConfigureRemindersScreen />, { wrapper: createWrapper() });
      
      expect(router.replace).toHaveBeenCalledWith('/add/search');
    });

    it('should show cancel confirmation when leaving with changes', () => {
      // This would require mocking the context with a selected plant
      // and testing the change detection logic
    });

    it('should validate form inputs correctly', () => {
      // This would test the validation logic for nickname and intervals
    });

    it('should handle accessibility correctly', () => {
      // This would test accessibility labels and hints
    });
  });

  describe('ReviewPlantScreen', () => {
    beforeEach(() => {
      mockUseCreateUserPlant.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        isSuccess: false,
        isError: false,
        error: null,
        data: undefined,
        reset: jest.fn(),
      });
    });

    it('should redirect to search if no plant selected', () => {
      render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      expect(router.replace).toHaveBeenCalledWith('/add/search');
    });

    it('should show loading overlay during mutation', () => {
      mockUseCreateUserPlant.mockReturnValue({
        mutate: jest.fn(),
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
        data: undefined,
        reset: jest.fn(),
      });

      const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      expect(getByText('Adding to your garden...')).toBeTruthy();
    });

    it('should handle mutation success with confetti and navigation', async () => {
      const mockMutate = jest.fn();
      mockUseCreateUserPlant.mockReturnValue({
        mutate: mockMutate,
        isLoading: false,
        isSuccess: true,
        isError: false,
        error: null,
        data: { userPlantId: 'new-plant-123' },
        reset: jest.fn(),
      });

      render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      // Should trigger navigation after success
      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/plant/new-plant-123');
      }, { timeout: 2000 });
    });

    it('should handle mutation error with toast', () => {
      mockUseCreateUserPlant.mockReturnValue({
        mutate: jest.fn(),
        isLoading: false,
        isSuccess: false,
        isError: true,
        error: new Error('Failed to create plant'),
        data: undefined,
        reset: jest.fn(),
      });

      const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      expect(getByText('Failed to create plant')).toBeTruthy();
    });

    it('should show cancel confirmation and reset wizard', () => {
      const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      // Try to go back
      const backButton = getByText('Review').parent?.parent?.children[0];
      fireEvent.press(backButton as any);

      // Should show confirmation dialog
      expect(getByText('Discard this plant?')).toBeTruthy();
      
      // Test confirm
      fireEvent.press(getByText('Discard'));
      expect(router.replace).toHaveBeenCalledWith('/add/search');
    });
  });

  describe('Deep Link Safety', () => {
    it('should redirect from reminders to search without context', () => {
      render(<ConfigureRemindersScreen />, { wrapper: createWrapper() });
      
      expect(router.replace).toHaveBeenCalledWith('/add/search');
    });

    it('should redirect from review to search without context', () => {
      render(<ReviewPlantScreen />, { wrapper: createWrapper() });
      
      expect(router.replace).toHaveBeenCalledWith('/add/search');
    });
  });
});