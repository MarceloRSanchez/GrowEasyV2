import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ActionButton } from '@/components/quickActions/ActionButton';

describe('ActionButton', () => {
  it('should render water button correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} />
    );

    expect(getByText('Water')).toBeTruthy();
  });

  it('should render fertilize button correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="fertilize" onPress={mockOnPress} />
    );

    expect(getByText('Fertilize')).toBeTruthy();
  });

  it('should render harvest button correctly', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="harvest" onPress={mockOnPress} />
    );

    expect(getByText('Harvest')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Water'));
    expect(mockOnPress).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Water').parent;
    expect(button?.props.disabled).toBeTruthy();
    
    fireEvent.press(getByText('Water'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText, queryByText } = render(
      <ActionButton type="water" onPress={mockOnPress} loading={true} />
    );

    expect(getByText('Loading...')).toBeTruthy();
    expect(queryByText('Water')).toBeFalsy();
  });

  it('should be disabled when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} loading={true} />
    );

    const button = getByText('Loading...').parent;
    expect(button?.props.disabled).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} />
    );

    const button = getByText('Water').parent;
    expect(button?.props.accessibilityRole).toBe('button');
    expect(button?.props.accessibilityLabel).toBe('Water plant');
    expect(button?.props.accessibilityHint).toBe('Tap to log water action for this plant');
    expect(button?.props.accessibilityState).toEqual({ disabled: false });
  });

  it('should update accessibility attributes when disabled', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} disabled={true} />
    );

    const button = getByText('Water').parent;
    expect(button?.props.accessibilityHint).toBe('Water action is currently disabled');
    expect(button?.props.accessibilityState).toEqual({ disabled: true });
  });

  it('should update accessibility attributes when loading', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <ActionButton type="water" onPress={mockOnPress} loading={true} />
    );

    const button = getByText('Loading...').parent;
    expect(button?.props.accessibilityLabel).toBe('Water in progress');
    expect(button?.props.accessibilityHint).toBe('Water action is currently disabled');
  });

  it('should match snapshot for each button type', () => {
    const mockOnPress = jest.fn();
    
    const waterTree = render(
      <ActionButton type="water" onPress={mockOnPress} />
    ).toJSON();
    expect(waterTree).toMatchSnapshot();

    const fertilizeTree = render(
      <ActionButton type="fertilize" onPress={mockOnPress} />
    ).toJSON();
    expect(fertilizeTree).toMatchSnapshot();

    const harvestTree = render(
      <ActionButton type="harvest" onPress={mockOnPress} />
    ).toJSON();
    expect(harvestTree).toMatchSnapshot();
  });
});