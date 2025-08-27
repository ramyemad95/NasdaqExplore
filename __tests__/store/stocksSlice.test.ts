import reducer, { reset } from '../../src/store/stocksSlice';
import { fetchStocks } from '../../src/store/stocksSlice';

// Mock the pagination service
jest.mock('../../src/services/paginationService', () => ({
  paginationService: {
    isNewSearch: jest.fn(),
    updateStateForNewSearch: jest.fn(),
    updateStateForPagination: jest.fn(),
  },
}));

import { paginationService } from '../../src/services/paginationService';

describe('stocksSlice', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Setup default mock implementations
    (paginationService.isNewSearch as jest.Mock).mockReturnValue(false);
    (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
      list: [],
      pagination: { next_url: undefined, count: undefined, hasMore: false },
    });
    (paginationService.updateStateForPagination as jest.Mock).mockReturnValue({
      list: [],
      pagination: { next_url: undefined, count: undefined, hasMore: false },
    });
  });

  const initialState = {
    list: [],
    status: 'idle' as const,
    error: undefined as string | undefined,
    errorDetails: undefined as
      | { message: string; isRetryable: boolean; errorType: string }
      | undefined,
    pagination: {
      next_url: undefined,
      count: undefined,
      hasMore: false,
    },
    lastSearch: undefined as string | undefined,
    lastFilters: undefined as string | undefined,
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

    // Mock the pagination service to return new search state
    (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
    (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
      items: mockStocks,
      search: 'tech',
      filters: '{}',
      pagination: {
        next_url: 'https://api.example.com/next',
        count: 2,
        hasMore: true,
      },
    });

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

    expect(paginationService.isNewSearch).toHaveBeenCalled();
    expect(paginationService.updateStateForNewSearch).toHaveBeenCalled();
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

    // Mock the pagination service to return pagination state
    (paginationService.isNewSearch as jest.Mock).mockReturnValue(false);
    (paginationService.updateStateForPagination as jest.Mock).mockReturnValue({
      items: [...existingStocks, ...newStocks],
      pagination: {
        next_url: 'https://api.example.com/next2',
        count: 2,
        hasMore: true,
      },
    });

    const action = {
      type: fetchStocks.fulfilled.type,
      payload: {
        results: newStocks,
        next_url: 'https://api.example.com/next2',
      },
      meta: {
        arg: { next_url: 'https://api.example.com/next' },
      },
    };

    const newState = reducer(stateWithExisting, action);

    expect(paginationService.isNewSearch).toHaveBeenCalled();
    expect(paginationService.updateStateForPagination).toHaveBeenCalled();
    expect(newState.list).toEqual([...existingStocks, ...newStocks]);
    expect(newState.status).toBe('idle');
    expect(newState.pagination.next_url).toBe('https://api.example.com/next2');
  });

  it('should handle fetchStocks.rejected with message', () => {
    const errorMessage = 'API Error';
    const action = {
      type: fetchStocks.rejected.type,
      error: { message: errorMessage },
    };

    const newState = reducer(initialState, action);

    expect(newState.status).toBe('error');
    expect(newState.error).toBe(errorMessage);
    expect(newState.errorDetails).toBeDefined();
  });
});
