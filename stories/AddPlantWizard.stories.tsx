import type { Meta, StoryObj } from '@storybook/react-native';
import React from 'react';
import { View } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddWizardProvider } from '@/contexts/AddWizardContext';
import SearchPlantScreen from '@/app/add/search';
import ConfigureRemindersScreen from '@/app/add/reminders';
import ReviewPlantScreen from '@/app/add/review';
import { useSearchPlants } from '@/hooks/useSearchPlants';
import { useCreateUserPlant } from '@/hooks/useCreateUserPlant';
import { setupMSW } from '@/test-utils/msw';

// Mock expo-router for Storybook
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
  },
  useLocalSearchParams: () => ({
    plantId: '1',
    nickname: 'My Sweet Basil',
    wateringDays: '2',
    fertilizingDays: '14',
  }),
}));

// Mock the search hook for different states
jest.mock('@/hooks/useSearchPlants');
jest.mock('@/hooks/useCreateUserPlant');
const mockUseSearchPlants = useSearchPlants as jest.MockedFunction<typeof useSearchPlants>;
const mockUseCreateUserPlant = useCreateUserPlant as jest.MockedFunction<typeof useCreateUserPlant>;

// Setup MSW for API mocking
setupMSW();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const mockPlantResults = [
  {
    id: '1',
    name: 'Basil',
    scientific_name: 'Ocimum basilicum',
    image_url: 'https://images.pexels.com/photos/4750270/pexels-photo-4750270.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'herb',
    difficulty: 'beginner',
    care_schedule: { watering: 2 },
    growth_time: 60,
    sunlight: 'high',
    water_needs: 'medium',
    tips: ['Pinch flowers'],
    created_at: '2024-01-01',
  },
  {
    id: '2',
    name: 'Cherry Tomato',
    scientific_name: 'Solanum lycopersicum',
    image_url: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'vegetable',
    difficulty: 'intermediate',
    care_schedule: { watering: 1 },
    growth_time: 85,
    sunlight: 'high',
    water_needs: 'high',
    tips: ['Support with stakes'],
    created_at: '2024-01-01',
  },
];

const meta: Meta = {
  title: 'Screens/AddPlantWizard',
  decorators: [
    (Story) => (
      <AddWizardProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1 }}>
            <Story />
          </View>
        </QueryClientProvider>
      </AddWizardProvider>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SearchStep: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: mockPlantResults,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Step 1: Search Plants',
};

export const RemindersStep: Story = {
  render: () => {
    // Mock selected plant for reminders step
    return <ConfigureRemindersScreen />;
  },
  name: 'Step 2: Configure Reminders',
};

export const ReviewStep: Story = {
  render: () => <ReviewPlantScreen />,
  beforeEach: () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
  },
  name: 'Step 3: Review & Confirm',
};

export const SearchLoading: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Search - Loading State',
};

export const SearchEmpty: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: [],
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Search - Empty Results',
};

export const SearchError: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: [],
      isLoading: false,
      error: 'Something went wrong. Pull to retry?',
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Search - Error State',
};

export const SearchWithCancel: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: mockPlantResults,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Search - With Cancel Dialog',
};

export const SearchPagination: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: mockPlantResults,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: true,
      isFetchingNextPage: true,
    });
    return <SearchPlantScreen />;
  },
  name: 'Search - Loading More',
};

export const RemindersInvalid: Story = {
  render: () => <ConfigureRemindersScreen />,
  name: 'Step 2: Invalid Form State',
};

export const RemindersWithTips: Story = {
  render: () => <ConfigureRemindersScreen />,
  name: 'Step 2: With Plant Tips',
};

export const ReviewLoading: Story = {
  render: () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: jest.fn(),
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    return <ReviewPlantScreen />;
  },
  name: 'Step 3: Creating Plant',
};

export const ReviewError: Story = {
  render: () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error('Failed to create plant. Please try again.'),
      data: undefined,
      reset: jest.fn(),
    });
    return <ReviewPlantScreen />;
  },
  name: 'Step 3: Error State',
};

export const ReviewSuccess: Story = {
  render: () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isSuccess: true,
      isError: false,
      error: null,
      data: { userPlantId: 'new-plant-123' },
      reset: jest.fn(),
    });
    return <ReviewPlantScreen />;
  },
  name: 'Step 3: Success State',
};
export const ReviewWithCancel: Story = {
  render: () => {
    mockUseCreateUserPlant.mockReturnValue({
      mutate: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      data: undefined,
      reset: jest.fn(),
    });
    return <ReviewPlantScreen />;
  },
  name: 'Step 3: With Cancel Dialog',
};

export const GlobalLoadingDemo: Story = {
  render: () => {
    mockUseSearchPlants.mockReturnValue({
      results: [],
      isLoading: true,
      error: null,
      refetch: jest.fn(),
      fetchNextPage: jest.fn(),
      hasNextPage: false,
      isFetchingNextPage: false,
    });
    return <SearchPlantScreen />;
  },
  name: 'Global Loading Overlay Demo',
};