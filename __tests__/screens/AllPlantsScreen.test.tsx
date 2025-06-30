import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AllPlantsScreen from '@/app/plants';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { router } from 'expo-router';

// Mock hooks
jest.mock('@/hooks/useHomeSnapshot');
jest.mock('@/hooks/useAuth');

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
  },
}));

const mockUseHomeSnapshot = useHomeSnapshot as jest.MockedFunction<typeof useHomeSnapshot>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockUser = { id: 'user-123' };
const mockPlants = [
  {
    id: 'plant-1',
    name: 'Basil',
    photoUrl: 'https://example.com/basil.jpg',
    species: 'Ocimum basilicum',
    progressPct: 75,
    nextActionLabel: 'Water in 2 days',
    nextActionColor: '#3DB5FF',
    createdAt: '2023-01-01T00:00:00Z',
  },
  {
    id: 'plant-2',
    name: 'Tomato',
    photoUrl: 'https://example.com/tomato.jpg',
    species: 'Solanum lycopersicum',
    progressPct: 50,
    nextActionLabel: 'Fertilize now',
    nextActionColor: '#F59E0B',
    createdAt: '2023-01-02T00:00:00Z',
  },
  {
    id: 'plant-3',
    name: 'Mint',
    photoUrl: 'https://example.com/mint.jpg',
    species: 'Mentha',
    progressPct: 90,
    nextActionLabel: 'Ready to harvest',
    nextActionColor: '#10B981',
    createdAt: '2023-01-03T00:00:00Z',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('AllPlantsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
    
    mockUseHomeSnapshot.mockReturnValue({
      data: {
        ecoScore: 100,
        deltaWeek: 10,
        streakDays: 5,
        litersSaved: 20,
        plants: mockPlants,
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
  });
  
  it('renders correctly with plants', () => {
    const { getByText, getAllByText } = render(<AllPlantsScreen />, { wrapper: createWrapper() });
    
    expect(getByText('My Plants')).toBeTruthy();
    expect(getByText('Basil')).toBeTruthy();
    expect(getByText('Tomato')).toBeTruthy();
    expect(getByText('Mint')).toBeTruthy();
    expect(getByText('3 plants')).toBeTruthy();
  });
  
  it('shows loading skeleton when loading', () => {
    mockUseHomeSnapshot.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });
    
    const { getByTestId } = render(<AllPlantsScreen />, { wrapper: createWrapper() });
    
    // This would check for loading skeleton
    // Implementation depends on how skeleton is structured
  });
  
  it('shows error toast when error occurs', () => {
    mockUseHomeSnapshot.mockReturnValue({
      data: null,
      loading: false,
      error: 'Failed to load plants',
      refetch: jest.fn(),
    });
    
    const { getByText } = render(<AllPlantsScreen />, { wrapper: createWrapper() });
    
    expect(getByText('Failed to load plants')).toBeTruthy();
  });
  
  it('filters plants based on search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    const searchInput = getByPlaceholderText('Search your plants...');
    fireEvent.changeText(searchInput, 'Basil');
    
    await waitFor(() => {
      expect(getByText('Basil')).toBeTruthy();
      expect(queryByText('Tomato')).toBeFalsy();
      expect(queryByText('Mint')).toBeFalsy();
      expect(getByText('1 plant found for "Basil"')).toBeTruthy();
    });
  });
  
  it('filters plants based on care needs', async () => {
    const { getByText, queryByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    // Filter for plants that need fertilizing
    fireEvent.press(getByText('Needs Fertilizer'));
    
    await waitFor(() => {
      expect(queryByText('Basil')).toBeFalsy();
      expect(getByText('Tomato')).toBeTruthy(); // Has "Fertilize now" label
      expect(queryByText('Mint')).toBeFalsy();
    });
  });
  
  it('sorts plants by name', async () => {
    const { getByText, getAllByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    // Sort is already set to name by default
    // Check order: Basil, Mint, Tomato (alphabetical)
    const plantNames = getAllByText(/Basil|Mint|Tomato/);
    expect(plantNames[0].props.children).toBe('Basil');
    expect(plantNames[1].props.children).toBe('Mint');
    expect(plantNames[2].props.children).toBe('Tomato');
    
    // Change sort order to descending
    fireEvent.press(getByText('Sort by:').parent.findByType('TouchableOpacity'));
    
    // Check reversed order: Tomato, Mint, Basil
    const reversedNames = getAllByText(/Basil|Mint|Tomato/);
    expect(reversedNames[0].props.children).toBe('Tomato');
    expect(reversedNames[1].props.children).toBe('Mint');
    expect(reversedNames[2].props.children).toBe('Basil');
  });
  
  it('sorts plants by growth progress', async () => {
    const { getByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    // Change sort to progress
    fireEvent.press(getByText('Growth Progress'));
    
    // Check order based on progressPct: Tomato (50%), Basil (75%), Mint (90%)
    const plantCards = getAllByTestId('plant-card');
    expect(plantCards[0].props.name).toBe('Tomato');
    expect(plantCards[1].props.name).toBe('Basil');
    expect(plantCards[2].props.name).toBe('Mint');
  });
  
  it('navigates to plant detail when plant is pressed', () => {
    const { getByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    fireEvent.press(getByText('Basil'));
    
    expect(router.push).toHaveBeenCalledWith('/plant/plant-1');
  });
  
  it('navigates to add plant screen when add button is pressed', () => {
    const { getByLabelText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    fireEvent.press(getByLabelText('Add plant'));
    
    expect(router.push).toHaveBeenCalledWith('/add-plant');
  });
  
  it('shows empty state when no plants match search', async () => {
    const { getByPlaceholderText, getByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    const searchInput = getByPlaceholderText('Search your plants...');
    fireEvent.changeText(searchInput, 'Cactus');
    
    await waitFor(() => {
      expect(getByText('No plants found')).toBeTruthy();
      expect(getByText('No plants match "Cactus". Try a different search term.')).toBeTruthy();
    });
  });
  
  it('shows empty garden state when user has no plants', () => {
    mockUseHomeSnapshot.mockReturnValue({
      data: {
        ecoScore: 0,
        deltaWeek: 0,
        streakDays: 0,
        litersSaved: 0,
        plants: [],
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    const { getByText } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    expect(getByText('Start Your Garden Journey! 🌱')).toBeTruthy();
  });
  
  it('refreshes data when pull-to-refresh is triggered', async () => {
    const mockRefetch = jest.fn().mockResolvedValue({});
    mockUseHomeSnapshot.mockReturnValue({
      data: {
        ecoScore: 100,
        deltaWeek: 10,
        streakDays: 5,
        litersSaved: 20,
        plants: mockPlants,
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
    
    const { getByTestId } = render(
      <AllPlantsScreen />, 
      { wrapper: createWrapper() }
    );
    
    // Trigger refresh
    const flatList = getByTestId('plant-list');
    fireEvent(flatList, 'refresh');
    
    expect(mockRefetch).toHaveBeenCalled();
  });
});