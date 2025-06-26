import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ArchiveButton } from '@/components/quickActions/ArchiveButton';

describe('ArchiveButton', () => {
  it('should render archive button correctly', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} />
    );

    expect(getByText('Archive plant')).toBeTruthy();
  });

  it('should call onArchive when pressed', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} />
    );

    fireEvent.press(getByText('Archive plant'));
    expect(mockOnArchive).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} disabled={true} />
    );

    const button = getByText('Archive plant').parent;
    expect(button?.props.disabled).toBeTruthy();
    
    fireEvent.press(getByText('Archive plant'));
    expect(mockOnArchive).not.toHaveBeenCalled();
  });

  it('should show loading state when loading prop is true', () => {
    const mockOnArchive = jest.fn();
    const { getByText, queryByText } = render(
      <ArchiveButton onArchive={mockOnArchive} loading={true} />
    );

    expect(getByText('Archiving...')).toBeTruthy();
    expect(queryByText('Archive plant')).toBeFalsy();
  });

  it('should be disabled when loading', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} loading={true} />
    );

    const button = getByText('Archiving...').parent;
    expect(button?.props.disabled).toBeTruthy();
  });

  it('should have proper accessibility attributes', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} />
    );

    const button = getByText('Archive plant').parent;
    expect(button?.props.accessibilityRole).toBe('button');
    expect(button?.props.accessibilityLabel).toBe('Archive plant');
    expect(button?.props.accessibilityHint).toBe('Tap to archive this plant and remove it from your active garden');
    expect(button?.props.accessibilityState).toEqual({ disabled: false });
  });

  it('should update accessibility attributes when disabled', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} disabled={true} />
    );

    const button = getByText('Archive plant').parent;
    expect(button?.props.accessibilityHint).toBe('Archive action is currently disabled');
    expect(button?.props.accessibilityState).toEqual({ disabled: true });
  });

  it('should update accessibility attributes when loading', () => {
    const mockOnArchive = jest.fn();
    const { getByText } = render(
      <ArchiveButton onArchive={mockOnArchive} loading={true} />
    );

    const button = getByText('Archiving...').parent;
    expect(button?.props.accessibilityLabel).toBe('Archiving plant');
    expect(button?.props.accessibilityHint).toBe('Archive action is currently disabled');
  });

  it('should match snapshot', () => {
    const mockOnArchive = jest.fn();
    const tree = render(
      <ArchiveButton onArchive={mockOnArchive} />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when loading', () => {
    const mockOnArchive = jest.fn();
    const tree = render(
      <ArchiveButton onArchive={mockOnArchive} loading={true} />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });

  it('should match snapshot when disabled', () => {
    const mockOnArchive = jest.fn();
    const tree = render(
      <ArchiveButton onArchive={mockOnArchive} disabled={true} />
    ).toJSON();
    
    expect(tree).toMatchSnapshot();
  });
});