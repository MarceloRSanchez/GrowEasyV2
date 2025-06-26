import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorBanner } from '@/components/quickActions/ErrorBanner';

describe('ErrorBanner', () => {
  it('should render error message', () => {
    const { getByText } = render(
      <ErrorBanner message="Something went wrong" />
    );

    expect(getByText('Something went wrong')).toBeTruthy();
  });

  it('should render retry button when onRetry is provided', () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(
      <ErrorBanner message="Error occurred" onRetry={mockOnRetry} />
    );

    const retryButton = getByText('Retry');
    expect(retryButton).toBeTruthy();

    fireEvent.press(retryButton);
    expect(mockOnRetry).toHaveBeenCalled();
  });

  it('should render dismiss button when onDismiss is provided', () => {
    const mockOnDismiss = jest.fn();
    const { getByText } = render(
      <ErrorBanner message="Error occurred" onDismiss={mockOnDismiss} />
    );

    const dismissButton = getByText('Dismiss');
    expect(dismissButton).toBeTruthy();

    fireEvent.press(dismissButton);
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('should render both retry and dismiss buttons', () => {
    const mockOnRetry = jest.fn();
    const mockOnDismiss = jest.fn();
    const { getByText } = render(
      <ErrorBanner 
        message="Error occurred" 
        onRetry={mockOnRetry} 
        onDismiss={mockOnDismiss} 
      />
    );

    expect(getByText('Retry')).toBeTruthy();
    expect(getByText('Dismiss')).toBeTruthy();
  });

  it('should not render action buttons when callbacks are not provided', () => {
    const { queryByText } = render(
      <ErrorBanner message="Error occurred" />
    );

    expect(queryByText('Retry')).toBeFalsy();
    expect(queryByText('Dismiss')).toBeFalsy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByText, getByLabelText } = render(
      <ErrorBanner 
        message="Network error" 
        onRetry={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    );

    // Check container accessibility
    const container = getByLabelText('Error: Network error');
    expect(container.props.accessibilityRole).toBe('alert');
    expect(container.props.accessibilityLiveRegion).toBe('assertive');

    // Check button accessibility
    const retryButton = getByText('Retry').parent;
    const dismissButton = getByText('Dismiss').parent;

    expect(retryButton?.props.accessibilityRole).toBe('button');
    expect(retryButton?.props.accessibilityLabel).toBe('Retry action');
    expect(retryButton?.props.accessibilityHint).toBe('Tap to retry the failed action');

    expect(dismissButton?.props.accessibilityRole).toBe('button');
    expect(dismissButton?.props.accessibilityLabel).toBe('Dismiss error');
    expect(dismissButton?.props.accessibilityHint).toBe('Tap to dismiss this error message');
  });

  it('should match snapshot', () => {
    const tree = render(
      <ErrorBanner 
        message="Test error message" 
        onRetry={jest.fn()} 
        onDismiss={jest.fn()} 
      />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});