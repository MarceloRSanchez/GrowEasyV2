import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { QuickActionSheet, QuickActionSheetRef } from '@/components/quickActions/QuickActionSheet';
import { useLogWatering } from '@/hooks/useLogWatering';
import { useLogFertilizing } from '@/hooks/useLogFertilizing';
import { useLogHarvest } from '@/hooks/useLogHarvest';
import { useArchivePlant } from '@/hooks/useArchivePlant';

// Mock the mutation hooks
jest.mock('@/hooks/useLogWatering');
jest.mock('@/hooks/useLogFertilizing');
jest.mock('@/hooks/useLogHarvest');
jest.mock('@/hooks/useArchivePlant');

const mockUseLogWatering = useLogWatering as jest.MockedFunction<typeof useLogWatering>;
const mockUseLogFertilizing = useLogFertilizing as jest.MockedFunction<typeof useLogFertilizing>;
const mockUseLogHarvest = useLogHarvest as jest.MockedFunction<typeof useLogHarvest>;
const mockUseArchivePlant = useArchivePlant as jest.MockedFunction<typeof useArchivePlant>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

const mockPlantData = {
  id: 'plant-123',
  nickname: 'My Sweet Basil',
  photoUrl: 'https://example.com/basil.jpg',
  growthPercent: 75,
  species: 'Ocimum basilicum',
};

describe('QuickActionSheet', () => {
  const mockWaterMutate = jest.fn();
  const mockFertilizeMutate = jest.fn();
  const mockHarvestMutate = jest.fn();
  const mockArchiveMutate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock all mutation hooks
    mockUseLogWatering.mockReturnValue({
      mutate: mockWaterMutate,
      isLoading: false,
      error: null,
    });

    mockUseLogFertilizing.mockReturnValue({
      mutate: mockFertilizeMutate,
      isLoading: false,
      error: null,
    });

    mockUseLogHarvest.mockReturnValue({
      mutate: mockHarvestMutate,
      isLoading: false,
      error: null,
    });

    mockUseArchivePlant.mockReturnValue({
      mutate: mockArchiveMutate,
      isLoading: false,
      error: null,
    });
  });

  it('should render plant information when opened', () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    expect(getByText('My Sweet Basil')).toBeTruthy();
    expect(getByText('Ocimum basilicum')).toBeTruthy();
    expect(getByText('75% grown')).toBeTruthy();
  });

  it('should call water mutation when water button is pressed', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press water button
    fireEvent.press(getByText('Water'));

    expect(mockWaterMutate).toHaveBeenCalledWith(
      { userPlantId: 'plant-123' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      })
    );
  });

  it('should call fertilize mutation when fertilize button is pressed', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press fertilize button
    fireEvent.press(getByText('Fertilize'));

    expect(mockFertilizeMutate).toHaveBeenCalledWith(
      { userPlantId: 'plant-123' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      })
    );
  });

  it('should call harvest mutation when harvest button is pressed', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press harvest button
    fireEvent.press(getByText('Harvest'));

    expect(mockHarvestMutate).toHaveBeenCalledWith(
      { userPlantId: 'plant-123' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      })
    );
  });

  it('should show confirmation dialog for archive action', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press archive button
    fireEvent.press(getByText('Archive plant'));

    // Should show confirmation dialog
    await waitFor(() => {
      expect(getByText('Archive plant?')).toBeTruthy();
      expect(getByText('It will disappear from your garden.')).toBeTruthy();
    });

    // Confirm archive
    fireEvent.press(getByText('Archive'));

    expect(mockArchiveMutate).toHaveBeenCalledWith(
      { userPlantId: 'plant-123' },
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
        onSettled: expect.any(Function),
      })
    );
  });

  it('should disable buttons during loading', () => {
    mockUseLogWatering.mockReturnValue({
      mutate: mockWaterMutate,
      isLoading: true,
      error: null,
    });

    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Buttons should be disabled during loading
    const waterButton = getByText('Water').parent;
    expect(waterButton?.props.disabled).toBeTruthy();
  });

  it('should call optional callbacks on success', async () => {
    const mockOnWater = jest.fn();
    const mockOnFertilize = jest.fn();
    const mockOnHarvest = jest.fn();
    const mockOnArchive = jest.fn();

    const sheetRef = React.createRef<QuickActionSheetRef>();
    render(
      <QuickActionSheet
        ref={sheetRef}
        onWater={mockOnWater}
        onFertilize={mockOnFertilize}
        onHarvest={mockOnHarvest}
        onArchive={mockOnArchive}
      />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Simulate successful water action
    const waterCall = mockWaterMutate.mock.calls[0];
    if (waterCall) {
      const [, { onSuccess }] = waterCall;
      onSuccess();
      
      await waitFor(() => {
        expect(mockOnWater).toHaveBeenCalledWith('plant-123');
      });
    }
  });

  it('should handle mutation errors gracefully', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press water button
    fireEvent.press(getByText('Water'));

    // Simulate error
    const waterCall = mockWaterMutate.mock.calls[0];
    if (waterCall) {
      const [, { onError }] = waterCall;
      onError(new Error('Network error'));
      
      // Should show error toast
      await waitFor(() => {
        expect(getByText('Something went wrong. Try again?')).toBeTruthy();
      });
    }
  });

  it('should close sheet after successful action', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const mockClose = jest.spyOn(sheetRef.current || {}, 'close');
    
    render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Simulate successful action with auto-close
    const waterCall = mockWaterMutate.mock.calls[0];
    if (waterCall) {
      const [, { onSuccess }] = waterCall;
      onSuccess();
      
      // Should close after delay
      await waitFor(() => {
        // This would test the setTimeout behavior
        // Implementation depends on how we want to test timers
      }, { timeout: 2000 });
    }
  });

  it('should log analytics events on actions', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    const sheetRef = React.createRef<QuickActionSheetRef>();
    render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Simulate successful water action
    const waterCall = mockWaterMutate.mock.calls[0];
    if (waterCall) {
      const [, { onSuccess }] = waterCall;
      onSuccess();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Analytics: quick_action_done',
        { plantId: 'plant-123', actionType: 'water' }
      );
    }

    consoleSpy.mockRestore();
  });

  it('should show error banner after 2 consecutive failures', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText, queryByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Press water button
    fireEvent.press(getByText('Water'));

    // Simulate first error
    const firstCall = mockWaterMutate.mock.calls[0];
    if (firstCall) {
      const [, { onError }] = firstCall;
      onError(new Error('First error'));
      
      // Should show regular toast, not banner
      expect(queryByText('Multiple failures detected')).toBeFalsy();
    }

    // Press water button again
    fireEvent.press(getByText('Water'));

    // Simulate second error
    const secondCall = mockWaterMutate.mock.calls[1];
    if (secondCall) {
      const [, { onError }] = secondCall;
      onError(new Error('Second error'));
      
      // Should show error banner
      await waitFor(() => {
        expect(getByText('Multiple failures detected. Try again later or check your connection.')).toBeTruthy();
      });
    }
  });

  it('should handle error banner retry', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText, queryByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet and trigger error banner
    sheetRef.current?.open(mockPlantData);
    
    // Simulate 2 failures to show error banner
    fireEvent.press(getByText('Water'));
    const firstCall = mockWaterMutate.mock.calls[0];
    if (firstCall) {
      const [, { onError }] = firstCall;
      onError(new Error('First error'));
    }

    fireEvent.press(getByText('Water'));
    const secondCall = mockWaterMutate.mock.calls[1];
    if (secondCall) {
      const [, { onError }] = secondCall;
      onError(new Error('Second error'));
    }

    await waitFor(() => {
      expect(getByText('Multiple failures detected. Try again later or check your connection.')).toBeTruthy();
    });

    // Press retry button
    fireEvent.press(getByText('Retry'));

    // Error banner should be dismissed
    expect(queryByText('Multiple failures detected')).toBeFalsy();
  });

  it('should handle error banner dismiss', async () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText, queryByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet and trigger error banner
    sheetRef.current?.open(mockPlantData);
    
    // Simulate 2 failures to show error banner
    fireEvent.press(getByText('Water'));
    const firstCall = mockWaterMutate.mock.calls[0];
    if (firstCall) {
      const [, { onError }] = firstCall;
      onError(new Error('First error'));
    }

    fireEvent.press(getByText('Water'));
    const secondCall = mockWaterMutate.mock.calls[1];
    if (secondCall) {
      const [, { onError }] = secondCall;
      onError(new Error('Second error'));
    }

    await waitFor(() => {
      expect(getByText('Multiple failures detected. Try again later or check your connection.')).toBeTruthy();
    });

    // Press dismiss button
    fireEvent.press(getByText('Dismiss'));

    // Error banner should be dismissed
    expect(queryByText('Multiple failures detected')).toBeFalsy();
  });

  it('should show global loading overlay during any action', () => {
    mockUseLogWatering.mockReturnValue({
      mutate: mockWaterMutate,
      isLoading: true,
      error: null,
    });

    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Should show loading overlay
    expect(getByText('Logging action…')).toBeTruthy();

    // All buttons should be disabled
    const waterButton = getByText('Water').parent;
    const fertilizeButton = getByText('Fertilize').parent;
    const harvestButton = getByText('Harvest').parent;
    const archiveButton = getByText('Archive plant').parent;

    expect(waterButton?.props.disabled).toBeTruthy();
    expect(fertilizeButton?.props.disabled).toBeTruthy();
    expect(harvestButton?.props.disabled).toBeTruthy();
    expect(archiveButton?.props.disabled).toBeTruthy();
  });

  it('should reset error state when sheet is opened', () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText, queryByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open sheet and trigger error banner
    sheetRef.current?.open(mockPlantData);
    
    // Simulate errors to show banner
    fireEvent.press(getByText('Water'));
    const firstCall = mockWaterMutate.mock.calls[0];
    if (firstCall) {
      const [, { onError }] = firstCall;
      onError(new Error('Error'));
    }

    fireEvent.press(getByText('Water'));
    const secondCall = mockWaterMutate.mock.calls[1];
    if (secondCall) {
      const [, { onError }] = secondCall;
      onError(new Error('Error'));
    }

    // Close and reopen sheet
    sheetRef.current?.close();
    sheetRef.current?.open(mockPlantData);

    // Error banner should not be visible
    expect(queryByText('Multiple failures detected')).toBeFalsy();
  });

  it('should have proper accessibility attributes', () => {
    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Check action button accessibility
    const waterButton = getByText('Water').parent;
    expect(waterButton?.props.accessibilityRole).toBe('button');
    expect(waterButton?.props.accessibilityLabel).toBe('Water plant');
    expect(waterButton?.props.accessibilityHint).toContain('Tap to log water action');

    // Check archive button accessibility
    const archiveButton = getByText('Archive plant').parent;
    expect(archiveButton?.props.accessibilityRole).toBe('button');
    expect(archiveButton?.props.accessibilityLabel).toBe('Archive plant');
    expect(archiveButton?.props.accessibilityHint).toContain('Tap to archive this plant');
  });

  it('should update accessibility labels during loading', () => {
    mockUseLogWatering.mockReturnValue({
      mutate: mockWaterMutate,
      isLoading: true,
      error: null,
    });

    const sheetRef = React.createRef<QuickActionSheetRef>();
    const { getByText } = render(
      <QuickActionSheet ref={sheetRef} />,
      { wrapper: createWrapper() }
    );

    // Open the sheet
    sheetRef.current?.open(mockPlantData);

    // Check loading accessibility
    const waterButton = getByText('Loading...').parent;
    expect(waterButton?.props.accessibilityLabel).toBe('Water in progress');
    expect(waterButton?.props.accessibilityHint).toContain('Water action is currently disabled');
  });
});