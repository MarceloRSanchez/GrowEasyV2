import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PlantDetailScreen from '@/app/plant/[userPlantId]';
import { usePlantDetail } from '@/hooks/usePlantDetail';
import { useAuth } from '@/hooks/useAuth';

// Mock the hooks for Storybook
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

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUsePlantDetail = usePlantDetail as jest.MockedFunction<typeof usePlantDetail>;

// Mock user
const mockUser = { id: 'user-123', email: 'test@example.com' };

// Mock plant data
const mockPlantData = {
  plant: {
    id: 'plant-1',
    nickname: 'My Sweet Basil',
    growth_percent: 75,
    sow_date: '2024-01-01',
    location: 'Kitchen windowsill',
    notes: 'Growing beautifully',
    is_active: true,
    last_watered: '2024-01-20',
    last_fertilized: '2024-01-15',
    next_watering_due: '2024-01-22',
    next_fertilizing_due: '2024-01-29',
    next_actions: [
      {
        type: 'water',
        label: 'Water now',
        due_date: '2024-01-22',
        status: 'upcoming' as const,
      },
      {
        type: 'fertilize',
        label: 'Fertilize in 3 days',
        due_date: '2024-01-25',
        status: 'scheduled' as const,
      },
    ],
    plant: {
      id: 'base-plant-1',
      name: 'Basil',
      scientific_name: 'Ocimum basilicum',
      image_url: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
      category: 'herb',
      difficulty: 'beginner',
      care_schedule: { watering: 2, fertilizing: 14 },
      growth_time: 60,
      sunlight: 'high',
      water_needs: 'medium',
      tips: [
        'Pinch flowers to encourage leaf growth',
        'Harvest in the morning for best flavor',
        'Likes warm, humid conditions'
      ],
    },
  },
  analytics: {
    waterHistory: [
      { date: '2024-01-15', ml: 250 },
      { date: '2024-01-17', ml: 300 },
      { date: '2024-01-19', ml: 200 },
      { date: '2024-01-21', ml: 275 },
    ],
    sunExposure: [
      { date: '2024-01-15', hours: 6.5 },
      { date: '2024-01-16', hours: 7.2 },
      { date: '2024-01-17', hours: 5.8 },
      { date: '2024-01-18', hours: 8.1 },
      { date: '2024-01-19', hours: 6.9 },
      { date: '2024-01-20', hours: 7.5 },
      { date: '2024-01-21', hours: 6.3 },
    ],
    soilHumidity: 45,
  },
  notes: [
    {
      id: 'note-1',
      imageUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'First leaves appearing!',
      createdAt: '2024-01-10',
    },
    {
      id: 'note-2',
      imageUrl: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=400',
      caption: 'Growing strong',
      createdAt: '2024-01-15',
    },
  ],
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const meta: Meta<typeof PlantDetailScreen> = {
  title: 'Screens/PlantDetailScreen',
  component: PlantDetailScreen,
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }}>
          <Story />
        </View>
      </QueryClientProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  beforeEach: () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockUsePlantDetail.mockReturnValue({
      data: mockPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  },
};

export const Loading: Story = {
  beforeEach: () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockUsePlantDetail.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
      refetch: jest.fn(),
    });
  },
};

export const Archived: Story = {
  beforeEach: () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockUsePlantDetail.mockReturnValue({
      data: {
        ...mockPlantData,
        plant: {
          ...mockPlantData.plant,
          is_active: false,
        },
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  },
};

export const EmptyDatasets: Story = {
  beforeEach: () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockUsePlantDetail.mockReturnValue({
      data: {
        ...mockPlantData,
        analytics: {
          waterHistory: [],
          sunExposure: [],
          soilHumidity: null,
        },
        notes: [],
      },
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
  },
};

export const Error: Story = {
  beforeEach: () => {
    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signIn: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
    });

    mockUsePlantDetail.mockReturnValue({
      data: null,
      isLoading: false,
      error: 'Failed to load plant details',
      refetch: jest.fn(),
    });
  },
};