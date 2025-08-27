import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import StockList from '../../../../src/screens/Explore/components/StockList';
import filtersSlice from '../../../../src/store/filtersSlice';
import settingsSlice from '../../../../src/store/settingsSlice';
import stocksReducer from '../../../../src/store/stocksSlice';

// Mock StockItem to keep test simple
jest.mock('../../../../src/components/StockItem', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return ({ ticker, name }: any) =>
    React.createElement(Text, null, ticker || name);
});

const baseState = {
  filters: {},
  settings: {
    theme: 'light',
    language: 'en',
    rtl: { isRTL: false, lastLanguage: 'en' },
  },
  stocks: {
    list: [],
    status: 'idle',
    error: undefined,
    errorDetails: undefined,
    pagination: { next_url: null, count: 0 },
    lastSearch: '',
    lastFilters: '{}',
  },
};

const renderWithStore = (stateOverride: any) => {
  const store = configureStore({
    reducer: {
      filters: filtersSlice,
      settings: settingsSlice,
      stocks: stocksReducer,
    },
    preloadedState: { ...baseState, ...stateOverride },
  });
  return render(
    <Provider store={store}>
      <StockList />
    </Provider>,
  );
};

describe('StockList', () => {
  it('renders loading state with initial shimmer', () => {
    const { toJSON } = renderWithStore({
      stocks: { ...baseState.stocks, status: 'loading', list: [] },
    });

    expect(toJSON()).toBeTruthy();
  });

  it('renders empty state message when no results', () => {
    const { getByText } = renderWithStore({
      stocks: { ...baseState.stocks, status: 'idle', list: [] },
    });

    expect(getByText('explore.noResults')).toBeTruthy();
    expect(getByText('explore.noResultsSubtitle')).toBeTruthy();
  });

  it('renders list and footer when results available and more pages', () => {
    const { getByText, getByTestId } = renderWithStore({
      stocks: {
        ...baseState.stocks,
        list: [
          { ticker: 'AAPL', name: 'Apple Inc.' },
          { ticker: 'MSFT', name: 'Microsoft' },
        ],
        status: 'idle',
        pagination: { next_url: 'next', count: 2 },
      },
    });

    expect(getByText('AAPL')).toBeTruthy();
    expect(getByText('MSFT')).toBeTruthy();
    expect(getByTestId('stock-list')).toBeTruthy();
    expect(getByText('2 results found')).toBeTruthy();
    expect(getByText('Scroll down for more results')).toBeTruthy();
  });

  it('renders end-of-results footer when no more pages', () => {
    const { getByText } = renderWithStore({
      stocks: {
        ...baseState.stocks,
        list: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
        status: 'idle',
        pagination: { next_url: null, count: 1 },
      },
    });

    expect(getByText('1 result found')).toBeTruthy();
    expect(getByText('No more results available')).toBeTruthy();
  });

  it('renders retry button when error is retryable', () => {
    const { getByText } = renderWithStore({
      stocks: {
        ...baseState.stocks,
        status: 'error',
        error: 'Network Error',
        errorDetails: {
          message: 'Network Error',
          isRetryable: true,
          errorType: 'network',
        },
      },
    });

    expect(getByText('common.error')).toBeTruthy();
    expect(getByText('Network Error')).toBeTruthy();
    expect(getByText('common.retry')).toBeTruthy();
  });
});
