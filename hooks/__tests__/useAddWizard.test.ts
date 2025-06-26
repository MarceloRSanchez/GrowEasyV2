import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { AddWizardProvider, useAddWizard, PlantSelection } from '@/contexts/AddWizardContext';

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <AddWizardProvider>{children}</AddWizardProvider>
  );
};

const mockPlant: PlantSelection = {
  id: '1',
  name: 'Basil',
  scientificName: 'Ocimum basilicum',
  imageUrl: 'https://example.com/basil.jpg',
  category: 'herb',
  difficulty: 'beginner',
  careSchedule: { watering: 2, fertilizing: 14 },
  growthTime: 60,
  sunlight: 'high',
  waterNeeds: 'medium',
  tips: ['Pinch flowers'],
};

describe('useAddWizard', () => {
  it('should throw error when used outside provider', () => {
    const { result } = renderHook(() => useAddWizard());
    
    expect(result.error).toBeDefined();
  });

  it('should provide initial state', () => {
    const { result } = renderHook(() => useAddWizard(), {
      wrapper: createWrapper(),
    });

    expect(result.current.selectedPlant).toBe(null);
    expect(result.current.configuration).toEqual({
      nickname: '',
      wateringDays: 2,
      fertilizingDays: 14,
    });
  });

  it('should set selected plant and update configuration', () => {
    const { result } = renderHook(() => useAddWizard(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedPlant(mockPlant);
    });

    expect(result.current.selectedPlant).toEqual(mockPlant);
    expect(result.current.configuration).toEqual({
      nickname: 'Basil',
      wateringDays: 2,
      fertilizingDays: 14,
    });
  });

  it('should update configuration partially', () => {
    const { result } = renderHook(() => useAddWizard(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedPlant(mockPlant);
    });

    act(() => {
      result.current.updateConfiguration({ nickname: 'My Sweet Basil' });
    });

    expect(result.current.configuration).toEqual({
      nickname: 'My Sweet Basil',
      wateringDays: 2,
      fertilizingDays: 14,
    });
  });

  it('should reset wizard state', () => {
    const { result } = renderHook(() => useAddWizard(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedPlant(mockPlant);
    });

    act(() => {
      result.current.updateConfiguration({ nickname: 'My Sweet Basil' });
    });

    act(() => {
      result.current.resetWizard();
    });

    expect(result.current.selectedPlant).toBe(null);
    expect(result.current.configuration).toEqual({
      nickname: '',
      wateringDays: 2,
      fertilizingDays: 14,
    });
  });

  it('should handle plant with missing care schedule', () => {
    const plantWithoutSchedule = {
      ...mockPlant,
      careSchedule: {},
    };

    const { result } = renderHook(() => useAddWizard(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setSelectedPlant(plantWithoutSchedule);
    });

    expect(result.current.configuration).toEqual({
      nickname: 'Basil',
      wateringDays: 2, // fallback
      fertilizingDays: 14, // fallback
    });
  });
});