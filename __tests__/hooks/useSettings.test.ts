import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useSettings } from '../../src/hooks/useSettings';
import settingsReducer from '../../src/store/settingsSlice';

const createTestStore = (initialState: any) => {
  return configureStore({
    reducer: {
      settings: settingsReducer,
    },
    preloadedState: {
      settings: initialState,
    },
  });
};

describe('useSettings', () => {
  const mockSettings = {
    theme: 'system' as const,
    language: 'en' as const,
    rtl: {
      isRTL: false,
      lastLanguage: 'en',
    },
  };

  it('should return settings from store', () => {
    const store = createTestStore(mockSettings);

    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current).toEqual(mockSettings);
  });

  it('should handle default settings', () => {
    const store = createTestStore(undefined);

    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.theme).toBe('system');
    expect(result.current.language).toBe('en');
    expect(result.current.rtl.isRTL).toBe(false);
  });

  it('should handle undefined settings', () => {
    const store = createTestStore(undefined);

    const { result } = renderHook(() => useSettings(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current).toBeDefined();
    expect(result.current.theme).toBe('system');
  });
});
