import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DayTasksSheet } from '@/components/calendar/DayTasksSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

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

describe('DayTasksSheet', () => {
  const mockTasks = [
    {
      id: 'task-1',
      userPlantId: 'plant-1',
      type: 'watering',
      dueDate: '2025-06-20',
      completed: false,
      notes: 'Water the basil plant',
    },
    {
      id: 'task-2',
      userPlantId: 'plant-2',
      type: 'fertilizing',
      dueDate: '2025-06-20',
      completed: true,
      notes: 'Fertilize the tomato plant',
    },
  ];
  
  const mockRef = { current: null };
  const mockOnTaskComplete = jest.fn();
  
  it('renders correctly with tasks', () => {
    const { getByText, getAllByRole } = render(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date="2025-06-20"
      />
    );
    
    // Check title and subtitle
    expect(getByText('Today')).toBeTruthy();
    expect(getByText('2 tasks scheduled')).toBeTruthy();
    
    // Check task items
    expect(getByText('Watering')).toBeTruthy();
    expect(getByText('Water the basil plant')).toBeTruthy();
    expect(getByText('Fertilizing')).toBeTruthy();
    expect(getByText('Fertilize the tomato plant')).toBeTruthy();
    
    // Check checkboxes
    const checkboxes = getAllByRole('checkbox');
    expect(checkboxes.length).toBe(2);
    expect(checkboxes[0].props.accessibilityState.checked).toBe(false);
    expect(checkboxes[1].props.accessibilityState.checked).toBe(true);
  });
  
  it('renders empty state when no tasks', () => {
    const { getByText } = render(
      <DayTasksSheet
        tasks={[]}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date="2025-06-20"
      />
    );
    
    expect(getByText('No tasks for this day')).toBeTruthy();
  });
  
  it('calls onTaskComplete when checkbox is pressed', () => {
    const { getAllByRole } = render(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date="2025-06-20"
      />
    );
    
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    
    expect(mockOnTaskComplete).toHaveBeenCalledWith('task-1');
  });
  
  it('does not call onTaskComplete for already completed tasks', () => {
    const { getAllByRole } = render(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date="2025-06-20"
      />
    );
    
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[1]); // This is the completed task
    
    expect(mockOnTaskComplete).not.toHaveBeenCalledWith('task-2');
  });
  
  it('formats date correctly', () => {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const futureDate = '2025-06-25';
    
    // Today
    const { getByText, rerender } = render(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date={today}
      />
    );
    
    expect(getByText('Today')).toBeTruthy();
    
    // Tomorrow
    rerender(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date={tomorrow}
      />
    );
    
    expect(getByText('Tomorrow')).toBeTruthy();
    
    // Future date
    rerender(
      <DayTasksSheet
        tasks={mockTasks}
        onTaskComplete={mockOnTaskComplete}
        bottomSheetRef={mockRef as React.RefObject<BottomSheetModal>}
        date={futureDate}
      />
    );
    
    // This will depend on the date format, but should include the month and day
    expect(getByText(/June 25, 2025/)).toBeTruthy();
  });
});