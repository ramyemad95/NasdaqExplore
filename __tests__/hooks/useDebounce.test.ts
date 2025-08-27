import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { useDebounce } from '../../src/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } },
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'changed', delay: 100 });
    expect(result.current).toBe('initial'); // Should still be initial due to debouncing

    // Wait for debounce delay
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current).toBe('changed');
  });

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 200 } },
    );

    rerender({ value: 'changed', delay: 200 });

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('initial'); // Should not have changed yet

    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(result.current).toBe('changed'); // Should have changed now
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } },
    );

    // With zero delay, value should change on next tick
    rerender({ value: 'changed', delay: 0 });

    // Need to wait for the next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('changed');
  });

  it('should handle negative delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }: { value: string; delay: number }) =>
        useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: -100 } },
    );

    // With negative delay, value should change on next tick
    rerender({ value: 'changed', delay: -100 });

    // Need to wait for the next tick
    act(() => {
      jest.advanceTimersByTime(0);
    });

    expect(result.current).toBe('changed');
  });

  it('should handle undefined value', () => {
    const { result } = renderHook(() => useDebounce(undefined, 100));
    expect(result.current).toBeUndefined();
  });

  it('should handle null value', () => {
    const { result } = renderHook(() => useDebounce(null, 100));
    expect(result.current).toBeNull();
  });

  it('should handle object values', () => {
    const obj = { key: 'value' };
    const { result } = renderHook(() => useDebounce(obj, 100));
    expect(result.current).toEqual(obj);
  });

  it('should handle array values', () => {
    const arr = [1, 2, 3];
    const { result } = renderHook(() => useDebounce(arr, 100));
    expect(result.current).toEqual(arr);
  });
});
