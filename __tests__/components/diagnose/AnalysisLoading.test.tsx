import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import { AnalysisLoading } from '@/components/diagnose/AnalysisLoading';

// Mock Animated
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

describe('AnalysisLoading', () => {
  it('should not render when not visible', () => {
    const { queryByText } = render(
      <AnalysisLoading visible={false} />
    );
    
    expect(queryByText('Analyzing your plant...')).toBeNull();
  });
  
  it('should render with default message when visible', () => {
    const { getByText } = render(
      <AnalysisLoading visible={true} />
    );
    
    expect(getByText('Analyzing your plant...')).toBeTruthy();
  });
  
  it('should render with custom message when provided', () => {
    const customMessage = 'Processing your image...';
    const { getByText } = render(
      <AnalysisLoading visible={true} message={customMessage} />
    );
    
    expect(getByText(customMessage)).toBeTruthy();
  });
  
  it('should have proper accessibility attributes', () => {
    const { getByRole } = render(
      <AnalysisLoading visible={true} />
    );
    
    const progressbar = getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.props.accessibilityLabel).toBe('Analyzing your plant...');
    expect(progressbar.props.accessibilityLiveRegion).toBe('polite');
  });
  
  it('should show tip text', () => {
    const { getByText } = render(
      <AnalysisLoading visible={true} />
    );
    
    expect(getByText(/examining leaf patterns/i)).toBeTruthy();
  });
  
  it('should start animations when visible', async () => {
    const { getByText, rerender } = render(
      <AnalysisLoading visible={false} />
    );
    
    // Initially not visible
    expect(() => getByText('Analyzing your plant...')).toThrow();
    
    // Make visible
    rerender(<AnalysisLoading visible={true} />);
    
    // Should be visible now
    expect(getByText('Analyzing your plant...')).toBeTruthy();
    
    // Wait for animations to start
    await waitFor(() => {
      // This is just to wait for the next frame
      expect(getByText('Analyzing your plant...')).toBeTruthy();
    });
  });
});