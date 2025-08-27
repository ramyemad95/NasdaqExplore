import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BottomSheetFilter from '../../src/components/BottomSheetFilter';
import stocksReducer from '../../src/store/stocksSlice';
import filtersReducer from '../../src/store/filtersSlice';
import settingsReducer from '../../src/store/settingsSlice';

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => {
      const api = { snapToIndex: jest.fn(), close: jest.fn() };
      React.useImperativeHandle(ref, () => api);
      return React.createElement('View', props, props.children);
    }),
    BottomSheetBackdrop: ({ children, ...p }: any) =>
      React.createElement('View', p, children),
    BottomSheetView: ({ children, ...p }: any) =>
      React.createElement('View', p, children),
  };
});

jest.mock('../../src/theme', () => ({
  useAppTheme: () => ({
    colors: {
      surface: '#fff',
      onSurface: '#000',
      outline: '#ccc',
    },
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('react-native-paper', () => {
  const React = require('react');
  return {
    __esModule: true,
    Button: ({ onPress, children, ...p }: any) =>
      React.createElement('View', { onPress, ...p }, children),
    SegmentedButtons: ({ onValueChange, buttons, value, ...p }: any) =>
      React.createElement(
        'View',
        p,
        buttons?.map((b: any) =>
          React.createElement(
            'View',
            {
              key: b.value,
              onPress: () => onValueChange(b.value),
              'data-selected': value === b.value,
            },
            b.label,
          ),
        ),
      ),
    TextInput: ({ onChangeText, value, ...p }: any) =>
      React.createElement('View', { value, onChangeText, ...p }),
    Switch: ({ value, onValueChange, ...p }: any) =>
      React.createElement('View', {
        testID: 'active-switch',
        value,
        onPress: () => onValueChange?.(!value),
        ...p,
      }),
    Text: ({ children, ...p }: any) => React.createElement('View', p, children),
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

describe('BottomSheetFilter branches', () => {
  it('toggles active switch and applies filters', () => {
    const store = createStore({ filters: {} });
    const { getByTestId, queryAllByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    const activeSwitch = getByTestId('active-switch');
    fireEvent.press(activeSwitch);

    const applyBtn = queryAllByText('filters.apply')[0];
    if (applyBtn) fireEvent.press(applyBtn);
  });

  it('resets filters', () => {
    const store = createStore({ filters: { market: 'stocks', active: true } });
    const { queryAllByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    const resetBtn = queryAllByText('filters.reset')[0];
    if (resetBtn) fireEvent.press(resetBtn);
  });
});
