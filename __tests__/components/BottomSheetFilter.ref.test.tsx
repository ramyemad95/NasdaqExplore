import React, { createRef } from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BottomSheetFilter from '../../src/components/BottomSheetFilter';
import stocksReducer from '../../src/store/stocksSlice';
import filtersReducer from '../../src/store/filtersSlice';
import settingsReducer from '../../src/store/settingsSlice';

// Mock @gorhom/bottom-sheet essentials
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      const api = {
        snapToIndex: jest.fn(),
        close: jest.fn(),
      };
      React.useImperativeHandle(ref, () => api);
      return React.createElement('View', props, props.children);
    }),
    BottomSheetBackdrop: ({ children, ...p }: any) =>
      React.createElement('View', p, children),
    BottomSheetView: ({ children, ...p }: any) =>
      React.createElement('View', p, children),
  };
});

const createStore = (initialState = {}) =>
  configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      settings: {
        theme: 'light',
        language: 'en',
        rtl: { isRTL: false, lastLanguage: 'en' },
      },
      ...initialState,
    },
  });

describe('BottomSheetFilter ref methods', () => {
  it('exposes expand and close without throwing', () => {
    const ref = createRef<any>();
    const store = createStore();
    const { toJSON } = render(
      <Provider store={store}>
        <BottomSheetFilter ref={ref} />
      </Provider>,
    );
    expect(toJSON()).toBeTruthy();
    expect(() => ref.current?.expand()).not.toThrow();
    expect(() => ref.current?.close()).not.toThrow();
  });
});
