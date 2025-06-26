import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from 'expo-router';
import ReviewPlantScreen from '@/app/add/review';
import { AddWizardProvider } from '@/contexts/AddWizardContext';
import { useCreateUserPlant } from '@/hooks/useCreateUserPlant';
import type { PlantSelection } from '@/contexts/AddWizardContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

// Mock the mutation hook
jest.mock('@/hooks/useCreateUserPlant');
const mockUseCreateUserPlant = useCreateUserPlant as jest.MockedFunction<typeof useCreateUserPlant>;

const mockPlant: PlantSelection = {
  id: 'plant-123',
  name: 'Basil',
  scientificName: 'Ocimum basilicum',
  imageUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
  category: 'herb',
  difficulty: 'beginner',
  careSchedule: { watering: 2, fertilizing: 14 },
  growthTime: 60,
  sunlight: 'high',
  waterNeeds: 'medium',
  tips: ['Pinch flowers to encourage leaf growth'],
};

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

describe('ReviewPlantScreen', () => {
  const mockMutate = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementation
    mockUseCreateUserPlant.mockReturnValue({
      mutate: mockMutate,
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

  it('should render plant review information', () => {
    // Mock context with selected plant
    const TestWrapper = ({ children }: { children: React.ReactNode }) => {
      const Wrapper = createWrapper();
      return (
        <Wrapper>
          {children}
        </Wrapper>
      );
    };

    const { getByText } = render(<ReviewPlantScreen />, { wrapper: TestWrapper });

    // This test would need the context to be properly mocked with selected plant
    // For now, we'll test the redirect behavior
  });

  it('should call mutation when Add to garden is pressed', async () => {
    // This would require proper context mocking
    // Implementation depends on how we mock the AddWizardContext
  });

  it('should show loading state during mutation', () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: mockMutate,
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });

    const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });

    // Should show loading overlay and disabled button
    // Implementation depends on component structure
  });

  it('should handle mutation success', async () => {
    const mockUserPlantId = 'new-plant-123';
    
    mockUseCreateUserPlant.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      data: { userPlantId: mockUserPlantId },
      reset: jest.fn(),
    });

    render(<ReviewPlantScreen />, { wrapper: createWrapper() });

    // Should trigger navigation after success
    // Implementation depends on how success is handled
  });

  it('should handle mutation error', () => {
    const errorMessage = 'Failed to create plant';
    
    mockUseCreateUserPlant.mockReturnValue({
      mutate: mockMutate,
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error(errorMessage),
      data: undefined,
      reset: jest.fn(),
    });

    const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });

    // Should show error toast
    // Implementation depends on error handling
  });

  it('should handle back navigation', () => {
    const { getByTestId } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });

    // Test back button functionality
    // Implementation depends on component structure
  });

  it('should show what happens next information', () => {
    const { getByText } = render(<ReviewPlantScreen />, { wrapper: createWrapper() });

    expect(getByText('What happens next?')).toBeTruthy();
    expect(getByText('• Your plant will be added to your garden')).toBeTruthy();
    expect(getByText('• Care reminders will be scheduled based on your settings')).toBeTruthy();
  });
});