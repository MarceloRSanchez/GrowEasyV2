import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { AnalyticsTabs } from '@/components/plant/AnalyticsTabs';

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.FadeIn = { duration: () => ({ duration: 300 }) };
  return Reanimated;
});

const mockWaterData = [
  { date: '2024-01-20', ml: 250 },
  { date: '2024-01-21', ml: 300 },
];

const mockSunData = [
  { date: '2024-01-20', hours: 6.5 },
  { date: '2024-01-21', hours: 7.2 },
];

describe('AnalyticsTabs', () => {
  it('renders water tab by default', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={false}
        error={false}
      />
    );

    // Check that all tabs are rendered
    expect(getByText('Water')).toBeTruthy();
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Humidity')).toBeTruthy();
    
    // Water tab should be selected by default
    const waterTab = getByText('Water');
    expect(waterTab.props.style).toEqual(
      expect.objectContaining({
        color: expect.any(String),
        fontWeight: '600',
      })
    );
  });

  it('switches to sun tab when clicked', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={false}
        error={false}
      />
    );

    // Click on Sun tab
    fireEvent.press(getByText('Sun'));
    
    // Sun tab should now be selected
    const sunTab = getByText('Sun');
    expect(sunTab.props.style).toEqual(
      expect.objectContaining({
        color: expect.any(String),
        fontWeight: '600',
      })
    );
  });

  it('switches to humidity tab when clicked', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={false}
        error={false}
      />
    );

    // Click on Humidity tab
    fireEvent.press(getByText('Humidity'));
    
    // Humidity tab should now be selected
    const humidityTab = getByText('Humidity');
    expect(humidityTab.props.style).toEqual(
      expect.objectContaining({
        color: expect.any(String),
        fontWeight: '600',
      })
    );
  });

  it('passes loading state to charts', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={true}
        error={false}
      />
    );

    // Water chart should be in loading state
    expect(getByText('Watering History')).toBeTruthy();
  });

  it('passes error state to charts', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={false}
        error={true}
      />
    );

    // Water chart should be in error state
    expect(getByText('Watering History')).toBeTruthy();
  });

  it('has proper accessibility attributes', () => {
    const { getByText } = render(
      <AnalyticsTabs
        water={mockWaterData}
        sun={mockSunData}
        humidity={45}
        loading={false}
        error={false}
      />
    );

    // Check tab accessibility
    const waterTab = getByText('Water').parent;
    expect(waterTab.props.accessibilityRole).toBe('tab');
    expect(waterTab.props.accessibilityState.selected).toBe(true);
    
    const sunTab = getByText('Sun').parent;
    expect(sunTab.props.accessibilityRole).toBe('tab');
    expect(sunTab.props.accessibilityState.selected).toBe(false);
  });
});