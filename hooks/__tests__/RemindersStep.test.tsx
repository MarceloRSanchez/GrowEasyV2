import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import ConfigureRemindersScreen from '@/app/add/reminders';
import { AddWizardProvider } from '@/contexts/AddWizardContext';
import { PlantSelection } from '@/contexts/AddWizardContext';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

const mockPlant: PlantSelection = {
  id: '1',
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

const renderWithProvider = (selectedPlant: PlantSelection | null = mockPlant) => {
  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AddWizardProvider>{children}</AddWizardProvider>
  );

  const component = render(<ConfigureRemindersScreen />, { wrapper: TestWrapper });
  
  // Set the selected plant if provided
  if (selectedPlant) {
    // This would normally be done through navigation from search screen
    // For testing, we'll need to mock the context state
  }
  
  return component;
};

describe('ConfigureRemindersScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should redirect to search if no plant selected', () => {
    renderWithProvider(null);
    
    expect(router.replace).toHaveBeenCalledWith('/add/search');
  });

  it('should render plant information and form', () => {
    const { getByText, getByDisplayValue } = renderWithProvider();

    // Plant header
    expect(getByText('Basil')).toBeTruthy();
    expect(getByText('Ocimum basilicum')).toBeTruthy();

    // Form fields
    expect(getByDisplayValue('Basil')).toBeTruthy(); // Pre-filled nickname
    expect(getByText('Water every')).toBeTruthy();
    expect(getByText('Fertilize every')).toBeTruthy();
  });

  it('should validate nickname input', async () => {
    const { getByDisplayValue, getByText, queryByText } = renderWithProvider();

    const nicknameInput = getByDisplayValue('Basil');
    
    // Clear nickname
    fireEvent.changeText(nicknameInput, '');
    
    // Try to proceed
    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(queryByText('Plant nickname is required')).toBeTruthy();
    });

    // Test too short
    fireEvent.changeText(nicknameInput, 'A');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(queryByText('Nickname must be at least 2 characters')).toBeTruthy();
    });

    // Test too long
    fireEvent.changeText(nicknameInput, 'A'.repeat(25));
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(queryByText('Nickname must be 24 characters or less')).toBeTruthy();
    });
  });

  it('should handle reminder picker changes', () => {
    const { getByText } = renderWithProvider();

    // Find watering increase button
    const wateringSection = getByText('Water every').parent;
    const increaseButtons = wateringSection?.findAllByType('TouchableOpacity');
    
    // This would test the picker functionality
    // Implementation depends on how the picker is structured
  });

  it('should enable Next button when form is valid', async () => {
    const { getByDisplayValue, getByText } = renderWithProvider();

    const nicknameInput = getByDisplayValue('Basil');
    const nextButton = getByText('Next');

    // Form should be valid by default
    expect(nextButton.props.disabled).toBeFalsy();

    // Make form invalid
    fireEvent.changeText(nicknameInput, '');
    
    await waitFor(() => {
      expect(nextButton.props.disabled).toBeTruthy();
    });

    // Make form valid again
    fireEvent.changeText(nicknameInput, 'My Basil');
    
    await waitFor(() => {
      expect(nextButton.props.disabled).toBeFalsy();
    });
  });

  it('should navigate to review when Next is pressed with valid form', async () => {
    const { getByText } = renderWithProvider();

    const nextButton = getByText('Next');
    fireEvent.press(nextButton);

    await waitFor(() => {
      expect(router.push).toHaveBeenCalledWith('/add/review');
    });
  });

  it('should show plant-specific tips', () => {
    const { getByText } = renderWithProvider();

    expect(getByText('💡 Care Tips')).toBeTruthy();
    expect(getByText('Plant-specific tips:')).toBeTruthy();
    expect(getByText('• Pinch flowers to encourage leaf growth')).toBeTruthy();
  });

  it('should handle back navigation', () => {
    const { getByTestId } = renderWithProvider();

    // This would test the back button functionality
    // Implementation depends on how the back button is structured
  });
});