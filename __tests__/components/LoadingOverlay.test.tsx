import React from 'react';
import { render } from '@testing-library/react-native';
import { LoadingOverlay } from '@/components/quickActions/LoadingOverlay';

describe('LoadingOverlay', () => {
  it('should render when visible is true', () => {
    const { getByText } = render(
      <LoadingOverlay visible={true} message="Loading..." />
    );

    expect(getByText('Loading...')).toBeTruthy();
  });

  it('should not render when visible is false', () => {
    const { queryByText } = render(
      <LoadingOverlay visible={false} message="Loading..." />
    );

    expect(queryByText('Loading...')).toBeFalsy();
  });

  it('should use default message when not provided', () => {
    const { getByText } = render(
      <LoadingOverlay visible={true} />
    );

    expect(getByText('Logging action…')).toBeTruthy();
  });

  it('should use custom message when provided', () => {
    const { getByText } = render(
      <LoadingOverlay visible={true} message="Custom loading message" />
    );

    expect(getByText('Custom loading message')).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const { getByLabelText } = render(
      <LoadingOverlay visible={true} message="Processing request" />
    );

    const overlay = getByLabelText('Processing request');
    expect(overlay.props.accessibilityRole).toBe('progressbar');
    expect(overlay.props.accessibilityLiveRegion).toBe('polite');
  });

  it('should match snapshot when visible', () => {
    const tree = render(
      <LoadingOverlay visible={true} message="Test loading" />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when not visible', () => {
    const tree = render(
      <LoadingOverlay visible={false} message="Test loading" />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});