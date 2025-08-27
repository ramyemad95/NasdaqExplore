import reducer, { reset } from '../../src/store/stocksSlice';
import { fetchStocks } from '../../src/store/stocksSlice';

describe('stocksSlice', () => {
  const initialState = {
    list: [],
    status: 'idle' as const,
    error: undefined,
    errorDetails: undefined,
    pagination: {},
    lastSearch: undefined,
    lastFilters: undefined,
    lastRequestedUrl: undefined,
  };

  const mockTicker = {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    market: 'stocks',
    locale: 'us',
    primary_exchange: 'XNAS',
    type: 'CS',
    active: true,
    currency_name: 'usd',
    last_updated_utc: '2023-01-01T00:00:00Z',
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle reset action', () => {
    const state = {
      ...initialState,
      list: [mockTicker],
      status: 'loading' as const,
      error: 'Some error',
    };

    const newState = reducer(state, reset());

    expect(newState.list).toEqual([]);
    expect(newState.status).toBe('idle');
    expect(newState.error).toBeUndefined();
  });

  it('should handle fetchStocks.pending', () => {
    const action = { type: fetchStocks.pending.type };
    const newState = reducer(initialState, action);

    expect(newState.status).toBe('loading');
    expect(newState.error).toBeUndefined();
    expect(newState.errorDetails).toBeUndefined();
  });

  it('should handle fetchStocks.fulfilled for new search', () => {
    const mockStocks = [
      mockTicker,
      { ...mockTicker, ticker: 'GOOGL', name: 'Alphabet Inc.' },
    ];

    const action = {
      type: fetchStocks.fulfilled.type,
      payload: {
        results: mockStocks,
        next_url: 'https://api.example.com/next',
      },
      meta: {
        arg: { search: 'tech' },
      },
    };

    const newState = reducer(initialState, action);

    expect(newState.list).toEqual(mockStocks);
    expect(newState.status).toBe('idle');
    expect(newState.lastSearch).toBe('tech');
    expect(newState.pagination.next_url).toBe('https://api.example.com/next');
  });

  it('should handle fetchStocks.fulfilled for pagination', () => {
    const existingStocks = [mockTicker];

    const newStocks = [
      { ...mockTicker, ticker: 'GOOGL', name: 'Alphabet Inc.' },
    ];

    const stateWithExisting = {
      ...initialState,
      list: existingStocks,
      lastSearch: 'tech',
      lastFilters: '{"type":"CS"}',
    };

    const action = {
      type: fetchStocks.fulfilled.type,
      payload: {
        results: newStocks,
        next_url: 'https://api.example.com/next2',
      },
      meta: {
        arg: { search: 'tech', filters: { type: 'CS' } },
      },
    };

    const newState = reducer(stateWithExisting, action);

    // Since search and filters are the same, this should be treated as pagination
    // and the new stocks should be appended to existing ones
    expect(newState.list).toHaveLength(2);
    expect(newState.list).toContainEqual(existingStocks[0]);
    expect(newState.list).toContainEqual(newStocks[0]);
    expect(newState.pagination.next_url).toBe('https://api.example.com/next2');
  });

  it('should handle fetchStocks.rejected', () => {
    const action = {
      type: fetchStocks.rejected.type,
      error: { message: 'API Error' },
    };

    const newState = reducer(initialState, action);

    expect(newState.status).toBe('error');
    expect(newState.error).toBe('API Error');
  });

  it('should handle fetchStocks.rejected with enhanced error details', () => {
    const action = {
      type: fetchStocks.rejected.type,
      payload: {
        message: 'Network Error',
        isRetryable: true,
        errorType: 'network',
      },
    };

    const newState = reducer(initialState, action);

    expect(newState.status).toBe('error');
    expect(newState.error).toBe('Network Error');
    expect(newState.errorDetails).toEqual({
      message: 'Network Error',
      isRetryable: true,
      errorType: 'network',
    });
  });

  it('should handle unknown action types', () => {
    const state = { ...initialState, status: 'loading' as const };
    const newState = reducer(state, { type: 'UNKNOWN_ACTION' });

    expect(newState).toEqual(state);
  });

  describe('fetchStocks.fulfilled - pagination scenarios', () => {
    it('should append results for pagination with same search', () => {
      const existingStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
      ];

      const state = {
        ...initialState,
        list: existingStocks,
        lastSearch: 'tech',
        lastFilters: '{"market":"stocks"}',
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.fulfilled.type,
        payload: {
          results: [
            { ticker: 'MSFT', name: 'Microsoft Corporation' },
            { ticker: 'AMZN', name: 'Amazon.com Inc.' },
          ],
          next_url: 'https://api.example.com/next',
          count: 4,
        },
        meta: {
          arg: {
            search: 'tech',
            filters: { market: 'stocks' },
            next_url: 'https://api.example.com/page2',
          },
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('idle');
      expect(newState.list).toHaveLength(4);
      expect(newState.list[0].ticker).toBe('AAPL');
      expect(newState.list[2].ticker).toBe('MSFT');
      expect(newState.pagination.next_url).toBe('https://api.example.com/next');
      expect(newState.pagination.count).toBe(4);
    });

    it('should handle pagination with duplicate results', () => {
      const existingStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
      ];

      const state = {
        ...initialState,
        list: existingStocks,
        lastSearch: 'tech',
        lastFilters: '{"market":"stocks"}',
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.fulfilled.type,
        payload: {
          results: [
            { ticker: 'AAPL', name: 'Apple Inc.' }, // Duplicate
            { ticker: 'MSFT', name: 'Microsoft Corporation' },
          ],
          next_url: null,
          count: 3,
        },
        meta: {
          arg: {
            search: 'tech',
            filters: { market: 'stocks' },
            next_url: 'https://api.example.com/page2',
          },
        },
      };

      const newState = reducer(state, action);

      expect(newState.list).toHaveLength(3); // Should not duplicate AAPL
      expect(
        newState.list.filter(stock => stock.ticker === 'AAPL'),
      ).toHaveLength(1);
    });

    it('should replace results for new search', () => {
      const existingStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
      ];

      const state = {
        ...initialState,
        list: existingStocks,
        lastSearch: 'tech',
        lastFilters: '{"market":"stocks"}',
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.fulfilled.type,
        payload: {
          results: [
            { ticker: 'JPM', name: 'JPMorgan Chase & Co.' },
            { ticker: 'BAC', name: 'Bank of America Corp' },
          ],
          next_url: 'https://api.example.com/next',
          count: 2,
        },
        meta: {
          arg: {
            search: 'bank', // Different search
            filters: { market: 'stocks' },
          },
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('idle');
      expect(newState.list).toHaveLength(2);
      expect(newState.list[0].ticker).toBe('JPM');
      expect(newState.lastSearch).toBe('bank');
      expect(newState.lastFilters).toBe('{"market":"stocks"}');
      expect(newState.lastRequestedUrl).toBeUndefined();
    });

    it('should handle empty results', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.fulfilled.type,
        payload: {
          results: [],
          next_url: null,
          count: 0,
        },
        meta: {
          arg: {
            search: 'nonexistent',
            filters: {},
          },
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('idle');
      expect(newState.list).toHaveLength(0);
      expect(newState.pagination.next_url).toBeNull();
      expect(newState.pagination.count).toBe(0);
    });

    it('should handle payload without results property', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.fulfilled.type,
        payload: {
          // Missing results property
          next_url: null,
          count: 0,
        },
        meta: {
          arg: {
            search: '',
            filters: {},
          },
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('idle');
      expect(newState.list).toHaveLength(0);
    });
  });

  describe('fetchStocks.rejected - error handling variations', () => {
    it('should handle standard error without payload', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.rejected.type,
        error: {
          message: 'Request failed',
        },
        payload: undefined,
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.error).toBe('Request failed');
      expect(newState.errorDetails).toEqual({
        message: 'Request failed',
        isRetryable: false,
        errorType: 'other',
      });
    });

    it('should handle error without message', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.rejected.type,
        error: {
          // No message property
        },
        payload: undefined,
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.errorDetails?.message).toBe('An error occurred');
      expect(newState.errorDetails?.isRetryable).toBe(false);
      expect(newState.errorDetails?.errorType).toBe('other');
    });

    it('should handle enhanced error with all properties', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.rejected.type,
        payload: {
          message: 'API rate limit exceeded',
          isRetryable: true,
          errorType: 'rate_limit',
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.error).toBe('API rate limit exceeded');
      expect(newState.errorDetails).toEqual({
        message: 'API rate limit exceeded',
        isRetryable: true,
        errorType: 'rate_limit',
      });
    });

    it('should handle enhanced error with missing properties', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.rejected.type,
        payload: {
          message: 'Something went wrong',
          // Missing isRetryable and errorType
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.error).toBe('Something went wrong');
      expect(newState.errorDetails).toEqual({
        message: 'Something went wrong',
        isRetryable: false,
        errorType: 'other',
      });
    });

    it('should handle payload that is not an object', () => {
      const state = {
        ...initialState,
        status: 'loading' as const,
      };

      const action = {
        type: fetchStocks.rejected.type,
        payload: 'string error',
        error: {
          message: 'Fallback error',
        },
      };

      const newState = reducer(state, action);

      expect(newState.status).toBe('error');
      expect(newState.error).toBe('Fallback error');
      expect(newState.errorDetails?.isRetryable).toBe(false);
      expect(newState.errorDetails?.errorType).toBe('other');
    });
  });

  describe('Reset action', () => {
    it('should reset state to initial state', () => {
      const modifiedState = {
        ...initialState,
        list: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
        status: 'error' as const,
        error: 'Some error',
        lastSearch: 'apple',
        pagination: { next_url: 'some-url', count: 1 },
      };

      const newState = reducer(modifiedState, reset());

      expect(newState).toEqual(initialState);
    });
  });
});
