import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import PlantDetailScreen from '@/app/plant/[userPlantId]';
import { usePlantDetail } from '@/hooks/usePlantDetail';
import { useAuth } from '@/hooks/useAuth';
import { speak, unloadSound } from '@/lib/tts';
import { AccessibilityInfo } from 'react-native';

// Mock the hooks and modules
jest.mock('@/hooks/usePlantDetail');
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/tts');
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({ userPlantId: 'test-plant-id' }),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return {
    ...Reanimated,
    useSharedValue: () => ({ value: 0 }),
    useAnimatedScrollHandler: () => ({}),
    useAnimatedStyle: () => ({}),
    withSpring: () => 1,
    interpolate: () => 1,
  };
});

// Mock AccessibilityInfo
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    AccessibilityInfo: {
      ...RN.AccessibilityInfo,
      announceForAccessibility: jest.fn(),
    },
  };
});

const mockUser = { id: 'user-123' };
const mockPlantData = {
  plant: {
    id: 'plant-1',
    nickname: 'My Sweet Basil',
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
        status: 'upcoming',
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
    waterHistory: [],
    sunExposure: [],
    soilHumidity: 45,
  },
  notes: [],
};

describe('PlantDetail Voice Guide', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock hooks
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });
    
    (usePlantDetail as jest.Mock).mockReturnValue({
      data: mockPlantData,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    // Mock TTS functions
    (speak as jest.Mock).mockResolvedValue({
      setOnPlaybackStatusUpdate: jest.fn((callback) => {
        // Simulate completion after a delay
        setTimeout(() => {
          callback({ didJustFinish: true });
        }, 100);
      }),
    });
    
    (unloadSound as jest.Mock).mockResolvedValue(undefined);
  });

  it('should render voice guide section', () => {
    const { getByText } = render(<PlantDetailScreen />);
    
    expect(getByText('Voice Guide')).toBeTruthy();
  });

  it('should call speak function when play button is pressed', async () => {
    const { getByLabelText } = render(<PlantDetailScreen />);
    
    const playButton = getByLabelText('Play voice guide');
    fireEvent.press(playButton);
    
    expect(speak).toHaveBeenCalledWith(
      'Here are care tips for My Sweet Basil. Pinch flowers. Morning harvest.'
    );
  });

  it('should show stop button while playing', async () => {
    const { getByLabelText } = render(<PlantDetailScreen />);
    
    // Press play button
    const playButton = getByLabelText('Play voice guide');
    fireEvent.press(playButton);
    
    // Should now show stop button
    const stopButton = getByLabelText('Stop voice guide');
    expect(stopButton).toBeTruthy();
  });

  it('should call unloadSound when stop button is pressed', async () => {
    const { getByLabelText } = render(<PlantDetailScreen />);
    
    // Press play button
    const playButton = getByLabelText('Play voice guide');
    fireEvent.press(playButton);
    
    // Press stop button
    const stopButton = getByLabelText('Stop voice guide');
    fireEvent.press(stopButton);
    
    expect(unloadSound).toHaveBeenCalled();
  });

  it('should announce for accessibility when playing starts', async () => {
    const { getByLabelText } = render(<PlantDetailScreen />);
    
    const playButton = getByLabelText('Play voice guide');
    fireEvent.press(playButton);
    
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Playing voice guide for My Sweet Basil'
    );
  });

  it('should clean up sound when component unmounts', () => {
    const { unmount } = render(<PlantDetailScreen />);
    
    unmount();
    
    expect(unloadSound).toHaveBeenCalled();
  });

  it('should handle errors when speaking fails', async () => {
    (speak as jest.Mock).mockRejectedValue(new Error('TTS error'));
    
    const { getByLabelText, getByText } = render(<PlantDetailScreen />);
    
    const playButton = getByLabelText('Play voice guide');
    fireEvent.press(playButton);
    
    await waitFor(() => {
      expect(getByText('Failed to play voice guide')).toBeTruthy();
    });
  });
});