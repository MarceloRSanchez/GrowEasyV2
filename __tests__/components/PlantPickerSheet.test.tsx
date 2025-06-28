import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PlantPickerSheet } from '@/components/home/PlantPickerSheet';
import { useHomeSnapshot } from '@/hooks/useHomeSnapshot';
import { useAuth } from '@/hooks/useAuth';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

// Mock hooks
jest.mock('@/hooks/useHomeSnapshot');
jest.mock('@/hooks/useAuth');

// Mock the BottomSheetModal component
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  const View = require('react-native').View;
  
  class MockBottomSheetModal extends React.Component {
    static present = jest.fn();
    static close = jest.fn();
    
    render() {
      return <View>{this.props.children}</View>;
    }
  }
  
  return {
    BottomSheetModal: MockBottomSheetModal,
    BottomSheetBackdrop: ({ children }) => <View>{children}</View>,
  };
});

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    View,
    useSharedValue: () => ({ value: 0 }),
    useAnimatedStyle: () => ({}),
    withSpring: () => 0,
    runOnJS: (fn) => fn,
  };
});

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    GestureDetector: ({ children }) => children,
    Gesture: {
      Pan: () => ({
        activeOffsetX: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onEnd: () => {},
        }),
      }),
    },
  };
});

// Mock Haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

const mockUseHomeSnapshot = useHomeSnapshot as jest.MockedFunction<typeof useHomeSnapshot>;
const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;

describe('PlantPickerSheet', () => {
  const mockUser = { id: 'user-123' };
  const mockPlants = [
    { id: 'plant-1', name: 'Basil', photoUrl: 'https://example.com/basil.jpg' },
    { id: 'plant-2', name: 'Mint', photoUrl: 'https://example.com/mint.jpg' },
    { id: 'plant-3', name: 'Tomato', photoUrl: 'https://example.com/tomato.jpg' },
  ];
  
  const mockBottomSheetRef = { current: null };
  const mockOnConfirm = jest.fn();
  
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
    const { getByText, getAllByRole } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    expect(getByText('Water a Plant')).toBeTruthy();
    expect(getByText('Basil')).toBeTruthy();
    expect(getByText('Mint')).toBeTruthy();
    expect(getByText('Tomato')).toBeTruthy();
    
    // Check if Log Water button is disabled initially
    const button = getByText('Log Water').parent;
    expect(button?.props.disabled).toBeTruthy();
  });
  
  it('filters plants based on search query', async () => {
    const { getByPlaceholderText, getByText, queryByText } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    const searchInput = getByPlaceholderText('Search your plants...');
    fireEvent.changeText(searchInput, 'Basil');
    
    // Wait for debounce
    await waitFor(() => {
      expect(getByText('Basil')).toBeTruthy();
      expect(queryByText('Mint')).toBeFalsy();
      expect(queryByText('Tomato')).toBeFalsy();
    });
  });
  
  it('enables Log Water button when a plant is selected', () => {
    const { getByText } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Select a plant
    fireEvent.press(getByText('Basil'));
    
    // Check if Log Water button is enabled
    const button = getByText('Log Water').parent;
    expect(button?.props.disabled).toBeFalsy();
  });
  
  it('calls onConfirm with selected plant ID when Log Water is pressed', () => {
    const { getByText } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Select a plant
    fireEvent.press(getByText('Basil'));
    
    // Press Log Water button
    fireEvent.press(getByText('Log Water'));
    
    // Check if onConfirm was called with the correct plant ID
    expect(mockOnConfirm).toHaveBeenCalledWith('plant-1');
  });
  
  it('shows loading state when data is loading', () => {
    mockUseHomeSnapshot.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });
    
    const { getByTestId } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Check if loading indicator is shown
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });
  
  it('shows empty state when no plants match search', async () => {
    const { getByPlaceholderText, getByText } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    const searchInput = getByPlaceholderText('Search your plants...');
    fireEvent.changeText(searchInput, 'Cactus');
    
    // Wait for debounce
    await waitFor(() => {
      expect(getByText('No plants found')).toBeTruthy();
      expect(getByText('No plants matching "Cactus"')).toBeTruthy();
    });
  });
  
  it('has proper accessibility attributes', () => {
    const { getByText, getByPlaceholderText } = render(
      <PlantPickerSheet
        bottomSheetRef={mockBottomSheetRef as React.RefObject<BottomSheetModal>}
        onConfirm={mockOnConfirm}
      />
    );
    
    // Check search input accessibility
    const searchInput = getByPlaceholderText('Search your plants...');
    expect(searchInput.props.accessibilityLabel).toBe('Search plants');
    
    // Check plant item accessibility
    const plantItem = getByText('Basil').parent;
    expect(plantItem.props.accessibilityRole).toBe('button');
    expect(plantItem.props.accessibilityLabel).toBe('Basil');
    
    // Check button accessibility
    const button = getByText('Log Water').parent;
    expect(button.props.accessibilityLabel).toBe('Log water button');
    expect(button.props.accessibilityHint).toContain('Select a plant first');
  });
});