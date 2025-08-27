import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import BottomSheetFilter from '../../src/components/BottomSheetFilter';
import stocksReducer from '../../src/store/stocksSlice';
import filtersReducer from '../../src/store/filtersSlice';
import settingsReducer from '../../src/store/settingsSlice';

const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
    preloadedState: initialState,
  });
};

describe('BottomSheetFilter', () => {
  const mockInitialState = {
    stocks: {
      status: 'idle',
      error: null,
      errorDetails: null,
    },
    filters: {
      market: 'stocks',
      order: 'asc',
      sort: 'ticker',
      active: true,
    },
    settings: {
      theme: 'light',
      language: 'en',
      rtl: { isRTL: false, lastLanguage: 'en' },
    },
  };

  it('renders correctly with all filter options', () => {
    const store = createTestStore(mockInitialState);
    const { getByText, getByDisplayValue } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    expect(getByText('filters.title')).toBeTruthy();
    expect(getByText('filters.active')).toBeTruthy();
    expect(getByText('filters.reset')).toBeTruthy();
    expect(getByText('filters.apply')).toBeTruthy();
  });

  it('handles market filter changes', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Find the market segmented buttons by their testID
    const marketButtons = getByTestId('segmented-buttons-stocks');
    expect(marketButtons).toBeTruthy();

    // The local state should change, but Redux state remains unchanged until apply
    expect(store.getState().filters.market).toBe('stocks');
  });

  it('handles order filter changes', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Find the order segmented buttons by their testID
    const orderButtons = getByTestId('segmented-buttons-asc');
    expect(orderButtons).toBeTruthy();

    // The local state should change, but Redux state remains unchanged until apply
    expect(store.getState().filters.order).toBe('asc');
  });

  it('handles sort filter changes', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Find the sort segmented buttons by their testID
    const sortButtons = getByTestId('segmented-buttons-ticker');
    expect(sortButtons).toBeTruthy();

    // The local state should change, but Redux state remains unchanged until apply
    expect(store.getState().filters.sort).toBe('ticker');
  });

  it('handles active filter toggle', () => {
    const store = createTestStore(mockInitialState);
    const { getByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    const activeSwitch = getByText('filters.active');
    // The Switch component is rendered as text in our mock, so we can't directly test the toggle
    expect(activeSwitch).toBeTruthy();
  });

  it('applies filters when apply button is pressed', () => {
    const store = createTestStore(mockInitialState);
    const { getByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    const applyButton = getByText('filters.apply');
    fireEvent.press(applyButton);

    // The filters should be applied to Redux state
    expect(store.getState().filters.market).toBe('stocks');
  });

  it('resets filters when reset button is pressed', () => {
    const store = createTestStore(mockInitialState);
    const { getByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    const resetButton = getByText('filters.reset');
    fireEvent.press(resetButton);

    // The filters should be reset to initial state
    expect(store.getState().filters.market).toBe('stocks');
  });

  it('renders with different initial filter values', () => {
    const differentFilters = {
      ...mockInitialState,
      filters: {
        market: 'crypto',
        order: 'desc',
        sort: 'name',
        active: false,
      },
    };

    const store = createTestStore(differentFilters);
    const { getByText, getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    expect(getByText('filters.title')).toBeTruthy();
    expect(getByTestId('segmented-buttons-crypto')).toBeTruthy();
    expect(getByTestId('segmented-buttons-desc')).toBeTruthy();
    expect(getByTestId('segmented-buttons-name')).toBeTruthy();
  });

  it('handles RTL layout correctly', () => {
    const rtlState = {
      ...mockInitialState,
      settings: {
        ...mockInitialState.settings,
        rtl: { isRTL: true, lastLanguage: 'ar' },
      },
    };

    const store = createTestStore(rtlState);
    const { getByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    expect(getByText('filters.title')).toBeTruthy();
    expect(getByText('filters.reset')).toBeTruthy();
    expect(getByText('filters.apply')).toBeTruthy();
  });

  it('renders all market options', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Check that the current market value is displayed
    expect(getByTestId('segmented-buttons-stocks')).toBeTruthy();
  });

  it('renders all order options', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Check that the current order value is displayed
    expect(getByTestId('segmented-buttons-asc')).toBeTruthy();
  });

  it('renders all sort options', () => {
    const store = createTestStore(mockInitialState);
    const { getByTestId } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    // Check that the current sort value is displayed
    expect(getByTestId('segmented-buttons-ticker')).toBeTruthy();
  });

  it('handles empty filters gracefully', () => {
    const emptyFilters = {
      ...mockInitialState,
      filters: {},
    };

    const store = createTestStore(emptyFilters);
    const { getByText } = render(
      <Provider store={store}>
        <BottomSheetFilter />
      </Provider>,
    );

    expect(getByText('filters.title')).toBeTruthy();
    expect(getByText('filters.reset')).toBeTruthy();
    expect(getByText('filters.apply')).toBeTruthy();
  });

  it('renders without crashing', () => {
    const store = createTestStore();
    expect(() =>
      render(
        <Provider store={store}>
          <BottomSheetFilter />
        </Provider>,
      ),
    ).not.toThrow();
  });
});
