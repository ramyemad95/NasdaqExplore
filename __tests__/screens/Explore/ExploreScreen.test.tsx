import React from 'react';
import { render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import ExploreScreen from '../../../src/screens/Explore/ExploreScreen';
import stocksReducer from '../../../src/store/stocksSlice';
import filtersReducer from '../../../src/store/filtersSlice';
import settingsReducer from '../../../src/store/settingsSlice';

// Mock the child components
jest.mock('../../../src/screens/Explore/components/ExploreHeader', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ filterSheetRef }: any) =>
    React.createElement(View, { testID: 'explore-header' }, 'ExploreHeader');
});

jest.mock('../../../src/screens/Explore/components/StockList', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'stock-list' }, 'StockList');
});

jest.mock('../../../src/components/BottomSheetFilter', () => {
  const React = require('react');
  const { View } = require('react-native');
  return React.forwardRef((props: any, ref: any) =>
    React.createElement(
      View,
      { testID: 'bottom-sheet-filter', ref },
      'BottomSheetFilter',
    ),
  );
});

const createTestStore = () => {
  return configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
  });
};

describe('ExploreScreen', () => {
  it('renders correctly with all components', () => {
    const store = createTestStore();

    const { getByTestId, toJSON } = render(
      <Provider store={store}>
        <ExploreScreen />
      </Provider>,
    );

    expect(getByTestId('explore-header')).toBeTruthy();
    expect(getByTestId('stock-list')).toBeTruthy();
    expect(getByTestId('bottom-sheet-filter')).toBeTruthy();
    expect(toJSON()).toBeTruthy();
  });

  it('renders without crashing', () => {
    const store = createTestStore();

    expect(() =>
      render(
        <Provider store={store}>
          <ExploreScreen />
        </Provider>,
      ),
    ).not.toThrow();
  });

  it('has correct structure', () => {
    const store = createTestStore();

    const { getByTestId } = render(
      <Provider store={store}>
        <ExploreScreen />
      </Provider>,
    );

    // Verify all expected components are present
    const header = getByTestId('explore-header');
    const stockList = getByTestId('stock-list');
    const filterSheet = getByTestId('bottom-sheet-filter');

    expect(header).toBeTruthy();
    expect(stockList).toBeTruthy();
    expect(filterSheet).toBeTruthy();
  });
});
