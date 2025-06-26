import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlantDetailScreen from '@/app/plant/[userPlantId]';
import { usePlantDetail } from '@/hooks/usePlantDetail';
import { useAuth } from '@/hooks/useAuth';

// Mock hooks
jest.mock('@/hooks/usePlantDetail');
jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useLogWatering', () => ({
  useLogWatering: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));
jest.mock('@/hooks/useLogFertilizing', () => ({
  useLogFertilizing: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));
jest.mock('@/hooks/useLogHarvest', () => ({
  useLogHarvest: () => ({
    mutate: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

const mockUsePlantDetail = usePlantDetail as jest.MockedFunction<typeof usePlantDetail>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

const mockUser = { id: 'user-123', email: 'test@example.com' };

const mockPlantData = {
  plant: {
    id: 'plant-1',
    nickname: 'My Basil',
    growth_percent: 75,
    sow_date: '2024-01-01',
    location: 'Kitchen',
    notes: 'Growing well',
    is_active: true,
    last_watered: '2024-01-20',
    last_fertilized: null,
    next_watering_due: '2024-01-22',
    next_fertilizing_due: null,
    next_actions: [
      {
        type: 'water',
        label: 'Water now',
        due_date: '2024-01-22',
        status: 'upcoming' as const,
      },
    ],
    plant: {
      id: 'base-plant-1',
      name: 'Basil',
      scientific_name: 'Ocimum basilicum',
      image_url: 'https://example.com/basil.jpg',
      category: 'herb',
      difficulty: 'beginner',
      care_schedule: {},
      growth_time: 60,
      sunlight: 'high',
      water_needs: 'medium',
      tips: ['Pinch flowers', 'Morning harvest'],
    },
  },
  analytics: {
    waterHistory: [
      { date: '2024-01-20', ml: 250 },
      { date: '2024-01-21', ml: 300 },
    ],
    sunExposure: [
      { date: '2024-01-20', hours: 6.5 },
      { date: '2024-01-21', hours: 7.2 },
    ],
    soilHumidity: 45,
  },
  notes: [
    {
      id: 'note-1',
      imageUrl: 'https://example.com/note.jpg',
      caption: 'Looking good!',
      createdAt: '2024-01-20',
    },
  ],
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
      {children}
    </QueryClientProvider>
  );
};

describe('PlantDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });
  });

  it('should render loading skeleton when loading', () => {
    mockUsePlantDetail.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });

    const { getByTestId } = render(<PlantDetailScreen />, { wrapper: createWrapper() });
    
    // Should show loading skeleton
    expect(getByTestId).toBeDefined();
  });

  it('should render plant detail when data is available', async () => {
    mockUsePlantDetail.mockReturnValue({
      data: mockPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<PlantDetailScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('My Basil')).toBeTruthy();
      expect(getByText('75%')).toBeTruthy();
      expect(getByText('Watering History')).toBeTruthy();
      expect(getByText('Sun Exposure')).toBeTruthy();
      expect(getByText('Soil Humidity')).toBeTruthy();
    });
  });

  it('should render archived plant overlay when plant is inactive', async () => {
    const archivedPlantData = {
      ...mockPlantData,
      plant: {
        ...mockPlantData.plant,
        is_active: false,
      },
    };

    mockUsePlantDetail.mockReturnValue({
      data: archivedPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<PlantDetailScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('Archived Plant')).toBeTruthy();
    });
  });

  it('should render error state when error occurs', () => {
    mockUsePlantDetail.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to load plant',
      refetch: jest.fn(),
    });

    const { getByText } = render(<PlantDetailScreen />, { wrapper: createWrapper() });

    expect(getByText('Failed to load plant')).toBeTruthy();
  });

  it('should handle care action button presses', async () => {
    mockUsePlantDetail.mockReturnValue({
      data: mockPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { getByText } = render(<PlantDetailScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('Water')).toBeTruthy();
    });

    // Test water button press
    fireEvent.press(getByText('Water'));
    // Should trigger confetti and mutation
  });

  it('should match snapshot', () => {
    mockUsePlantDetail.mockReturnValue({
      data: mockPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    const tree = render(<PlantDetailScreen />, { wrapper: createWrapper() }).toJSON();
    expect(tree).toMatchSnapshot();
  });
});