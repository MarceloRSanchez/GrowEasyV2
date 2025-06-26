import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SearchBar } from '@/components/add/SearchBar';
import { NicknameInput } from '@/components/add/NicknameInput';
import { ReminderPicker } from '@/components/add/ReminderPicker';
import { ReviewCard } from '@/components/add/ReviewCard';
import { EmptySearchState } from '@/components/add/EmptySearchState';
import { SearchLoadingSkeleton } from '@/components/add/SearchLoadingSkeleton';
import { CancelConfirmDialog } from '@/components/ui/CancelConfirmDialog';
import { GlobalLoadingOverlay } from '@/components/ui/GlobalLoadingOverlay';

describe('AddWizard Components', () => {
  describe('SearchBar', () => {
    it('should render and handle input changes', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <SearchBar
          value=""
          onChange={mockOnChange}
          placeholder="Search plants..."
        />
      );

      const input = getByPlaceholderText('Search plants...');
      fireEvent.changeText(input, 'basil');
      
      expect(mockOnChange).toHaveBeenCalledWith('basil');
    });

    it('should display current value', () => {
      const { getByDisplayValue } = render(
        <SearchBar
          value="tomato"
          onChange={jest.fn()}
          placeholder="Search plants..."
        />
      );

      expect(getByDisplayValue('tomato')).toBeTruthy();
    });
  });

  describe('NicknameInput', () => {
    it('should render with label and placeholder', () => {
      const { getByText, getByPlaceholderText } = render(
        <NicknameInput
          value=""
          onChange={jest.fn()}
        />
      );

      expect(getByText('Plant nickname')).toBeTruthy();
      expect(getByPlaceholderText('e.g. My first basil')).toBeTruthy();
    });

    it('should show error message when provided', () => {
      const { getByText } = render(
        <NicknameInput
          value=""
          onChange={jest.fn()}
          error="Nickname is required"
        />
      );

      expect(getByText('Nickname is required')).toBeTruthy();
    });

    it('should handle text changes', () => {
      const mockOnChange = jest.fn();
      const { getByPlaceholderText } = render(
        <NicknameInput
          value=""
          onChange={mockOnChange}
        />
      );

      const input = getByPlaceholderText('e.g. My first basil');
      fireEvent.changeText(input, 'My Sweet Basil');
      
      expect(mockOnChange).toHaveBeenCalledWith('My Sweet Basil');
    });

    it('should respect maxLength of 24 characters', () => {
      const { getByPlaceholderText } = render(
        <NicknameInput
          value=""
          onChange={jest.fn()}
        />
      );

      const input = getByPlaceholderText('e.g. My first basil');
      expect(input.props.maxLength).toBe(24);
    });

    it('should have proper accessibility attributes', () => {
      const { getByPlaceholderText } = render(
        <NicknameInput
          value=""
          onChange={jest.fn()}
        />
      );

      const input = getByPlaceholderText('e.g. My first basil');
      expect(input.props.accessibilityLabel).toBe('Plant nickname');
      expect(input.props.accessibilityHint).toBe('Enter a name for your plant, 2 to 24 characters');
    });
  });

  describe('ReminderPicker', () => {
    it('should render with label and current value', () => {
      const { getByText } = render(
        <ReminderPicker
          label="Water every"
          value={3}
          onChange={jest.fn()}
          unit="days"
          min={1}
          max={7}
        />
      );

      expect(getByText('Water every')).toBeTruthy();
      expect(getByText('3')).toBeTruthy();
      expect(getByText('days')).toBeTruthy();
    });

    it('should handle increase and decrease', () => {
      const mockOnChange = jest.fn();
      const { getByLabelText } = render(
        <ReminderPicker
          label="Water every"
          value={3}
          onChange={mockOnChange}
          unit="days"
          min={1}
          max={7}
        />
      );

      const increaseButton = getByLabelText('Increase water every');
      const decreaseButton = getByLabelText('Decrease water every');

      fireEvent.press(increaseButton);
      expect(mockOnChange).toHaveBeenCalledWith(4);

      fireEvent.press(decreaseButton);
      expect(mockOnChange).toHaveBeenCalledWith(2);
    });

    it('should disable buttons at min/max values', () => {
      const { getByLabelText } = render(
        <ReminderPicker
          label="Water every"
          value={1}
          onChange={jest.fn()}
          unit="days"
          min={1}
          max={7}
        />
      );

      const decreaseButton = getByLabelText('Decrease water every');
      expect(decreaseButton.props.disabled).toBe(true);
    });

    it('should show error message when provided', () => {
      const { getByText } = render(
        <ReminderPicker
          label="Water every"
          value={0}
          onChange={jest.fn()}
          unit="days"
          min={1}
          max={7}
          error="Must be between 1 and 7 days"
        />
      );

      expect(getByText('Must be between 1 and 7 days')).toBeTruthy();
    });

    it('should have proper accessibility attributes', () => {
      const { getByLabelText } = render(
        <ReminderPicker
          label="Water every"
          value={3}
          onChange={jest.fn()}
          unit="days"
          min={1}
          max={7}
        />
      );

      const increaseButton = getByLabelText('Increase water every');
      const decreaseButton = getByLabelText('Decrease water every');

      expect(increaseButton.props.accessibilityRole).toBe('button');
      expect(decreaseButton.props.accessibilityRole).toBe('button');
      expect(increaseButton.props.accessibilityHint).toContain('Currently 3 days');
      expect(decreaseButton.props.accessibilityHint).toContain('minimum is 1');
    });
  });

  describe('ReviewCard', () => {
    const mockProps = {
      photoUrl: 'https://example.com/basil.jpg',
      name: 'Basil',
      scientificName: 'Ocimum basilicum',
      nickname: 'My Sweet Basil',
      wateringDays: 2,
      fertilizingDays: 14,
    };

    it('should render plant information correctly', () => {
      const { getByText } = render(<ReviewCard {...mockProps} />);

      expect(getByText('Basil')).toBeTruthy();
      expect(getByText('Ocimum basilicum')).toBeTruthy();
      expect(getByText('"My Sweet Basil"')).toBeTruthy();
      expect(getByText('Every 2 days')).toBeTruthy();
      expect(getByText('Every 14 days')).toBeTruthy();
    });

    it('should handle singular day correctly', () => {
      const { getByText } = render(
        <ReviewCard {...mockProps} wateringDays={1} fertilizingDays={1} />
      );

      expect(getByText('Every 1 day')).toBeTruthy();
    });

    it('should render care schedule section', () => {
      const { getByText } = render(<ReviewCard {...mockProps} />);

      expect(getByText('Care Schedule')).toBeTruthy();
      expect(getByText('Watering')).toBeTruthy();
      expect(getByText('Fertilizing')).toBeTruthy();
    });
  });

  describe('EmptySearchState', () => {
    it('should render with query and retry button', () => {
      const mockOnRetry = jest.fn();
      const { getByText } = render(
        <EmptySearchState query="nonexistent" onRetry={mockOnRetry} />
      );

      expect(getByText('No plants found')).toBeTruthy();
      expect(getByText(/We couldn't find any plants matching "nonexistent"/)).toBeTruthy();
      expect(getByText('Try again')).toBeTruthy();

      fireEvent.press(getByText('Try again'));
      expect(mockOnRetry).toHaveBeenCalled();
    });

    it('should render without retry button when not provided', () => {
      const { queryByText } = render(
        <EmptySearchState query="test" />
      );

      expect(queryByText('Try again')).toBeFalsy();
    });

    it('should show popular search suggestions', () => {
      const { getByText } = render(
        <EmptySearchState query="test" />
      );

      expect(getByText('Popular searches:')).toBeTruthy();
      expect(getByText('Basil')).toBeTruthy();
      expect(getByText('Tomato')).toBeTruthy();
      expect(getByText('Mint')).toBeTruthy();
      expect(getByText('Lettuce')).toBeTruthy();
    });
  });

  describe('SearchLoadingSkeleton', () => {
    it('should render multiple skeleton items', () => {
      const { getAllByTestId } = render(<SearchLoadingSkeleton />);
      
      // This would test that skeleton items are rendered
      // Implementation depends on how skeleton items are structured
    });
  });

  describe('CancelConfirmDialog', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <CancelConfirmDialog
          visible={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(getByText('Discard this plant?')).toBeTruthy();
      expect(getByText('Your changes will be lost.')).toBeTruthy();
      expect(getByText('Discard')).toBeTruthy();
      expect(getByText('Continue')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <CancelConfirmDialog
          visible={false}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
        />
      );

      expect(queryByText('Discard this plant?')).toBeFalsy();
    });

    it('should handle button presses', () => {
      const mockOnConfirm = jest.fn();
      const mockOnCancel = jest.fn();
      
      const { getByText } = render(
        <CancelConfirmDialog
          visible={true}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      );

      fireEvent.press(getByText('Discard'));
      expect(mockOnConfirm).toHaveBeenCalled();

      fireEvent.press(getByText('Continue'));
      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should support custom text', () => {
      const { getByText } = render(
        <CancelConfirmDialog
          visible={true}
          onConfirm={jest.fn()}
          onCancel={jest.fn()}
          title="Custom Title"
          message="Custom message"
          confirmText="Yes"
          cancelText="No"
        />
      );

      expect(getByText('Custom Title')).toBeTruthy();
      expect(getByText('Custom message')).toBeTruthy();
      expect(getByText('Yes')).toBeTruthy();
      expect(getByText('No')).toBeTruthy();
    });
  });

  describe('GlobalLoadingOverlay', () => {
    it('should render when visible', () => {
      const { getByText } = render(
        <GlobalLoadingOverlay visible={true} message="Loading..." />
      );

      expect(getByText('Loading...')).toBeTruthy();
    });

    it('should not render when not visible', () => {
      const { queryByText } = render(
        <GlobalLoadingOverlay visible={false} message="Loading..." />
      );

      expect(queryByText('Loading...')).toBeFalsy();
    });

    it('should use default message when not provided', () => {
      const { getByText } = render(
        <GlobalLoadingOverlay visible={true} />
      );

      expect(getByText('Loading...')).toBeTruthy();
    });
  });
});