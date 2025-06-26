import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../useDebounce';

// Mock timers
jest.useFakeTimers();

describe('useDebounce', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300));
    
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Fast forward time by 299ms (less than delay)
    act(() => {
      jest.advanceTimersByTime(299);
    });
    
    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward time by 1ms more (total 300ms)
    act(() => {
      jest.advanceTimersByTime(1);
    });
    
    // Value should now be updated
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 },
      }
    );

    // Change value multiple times rapidly
    rerender({ value: 'first', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    rerender({ value: 'second', delay: 300 });
    
    act(() => {
      jest.advanceTimersByTime(100);
    });
    
    rerender({ value: 'final', delay: 300 });

    // Value should still be initial
    expect(result.current).toBe('initial');

    // Fast forward full delay
    act(() => {
      jest.advanceTimersByTime(300);
    });

    // Should have the final value
    expect(result.current).toBe('final');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    rerender({ value: 'updated', delay: 500 });

    // Should not update after 300ms
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe('initial');

    // Should update after 500ms
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });
});