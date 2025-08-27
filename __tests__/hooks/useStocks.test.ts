import React from 'react';
import { renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import useStocks from '../../src/hooks/useStocks';
import stocksReducer from '../../src/store/stocksSlice';
import filtersReducer from '../../src/store/filtersSlice';
import settingsReducer from '../../src/store/settingsSlice';

const createTestStore = (initialState: any) => {
  return configureStore({
    reducer: {
      stocks: stocksReducer,
      filters: filtersReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      stocks: initialState,
    },
  });
};

describe('useStocks', () => {
  const mockStocksState = {
    list: [
      {
        ticker: 'AAPL',
        name: 'Apple Inc.',
        market: 'stocks',
        locale: 'us',
        primary_exchange: 'XNAS',
        type: 'CS',
        active: true,
        currency_name: 'usd',
        last_updated_utc: '2023-01-01T00:00:00Z',
      },
    ],
    status: 'idle' as const,
    error: undefined,
    errorDetails: undefined,
    pagination: {
      next_url: 'https://api.example.com/next',
      count: 100,
      hasMore: true,
    },
    lastSearch: 'apple',
    lastFilters: '{"market":"stocks"}',
    lastRequestedUrl: undefined,
  };

  it('should return stocks data from store', () => {
    const store = createTestStore(mockStocksState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.stocks).toEqual(mockStocksState.list);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasError).toBe(false);
    expect(result.current.hasMoreStocks).toBe(true);
  });

  it('should return loading state correctly', () => {
    const loadingState = { ...mockStocksState, status: 'loading' as const };
    const store = createTestStore(loadingState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return error state correctly', () => {
    const errorState = {
      ...mockStocksState,
      status: 'error' as const,
      error: 'API Error',
      errorDetails: {
        message: 'API Error',
        isRetryable: true,
        errorType: 'network',
      },
    };
    const store = createTestStore(errorState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.hasError).toBe(true);
    expect(result.current.error).toBe('API Error');
    expect(result.current.errorDetails).toBeDefined();
  });

  it('should handle empty pagination', () => {
    const noPaginationState = {
      ...mockStocksState,
      pagination: {
        next_url: undefined,
        count: undefined,
        hasMore: false,
      },
    };
    const store = createTestStore(noPaginationState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.hasMoreStocks).toBe(false);
    expect(result.current.paginationUrl).toBeUndefined();
  });

  it('should handle undefined pagination', () => {
    const undefinedPaginationState = {
      ...mockStocksState,
      pagination: {
        next_url: undefined,
        count: undefined,
        hasMore: false,
      },
    };
    const store = createTestStore(undefinedPaginationState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.hasMoreStocks).toBe(false);
    expect(result.current.paginationUrl).toBeUndefined();
  });

  it('should handle empty stocks list', () => {
    const emptyStocksState = {
      ...mockStocksState,
      list: [],
    };
    const store = createTestStore(emptyStocksState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.stocks).toEqual([]);
  });

  it('should handle undefined stocks list', () => {
    const undefinedStocksState = {
      ...mockStocksState,
      list: undefined,
    };
    const store = createTestStore(undefinedStocksState);

    const { result } = renderHook(() => useStocks(), {
      wrapper: ({ children }) =>
        React.createElement(Provider, { store, children }),
    });

    expect(result.current.stocks).toEqual([]);
  });
});
