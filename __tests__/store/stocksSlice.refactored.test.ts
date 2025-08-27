import { configureStore } from '@reduxjs/toolkit';

// Mock the pagination service using Jest's manual mock system
jest.mock('../../src/services/paginationService');

// Mock the stocks service using Jest's manual mock system
jest.mock('../../src/services/stocks');

// Now import the slice after mocking
import stocksSlice, { reset, fetchStocks } from '../../src/store/stocksSlice';
import { paginationService } from '../../src/services/paginationService';
import { fetchTickers } from '../../src/services/stocks';

describe('Refactored Stocks Slice', () => {
  let store: any;

  beforeEach(() => {
    jest.clearAllMocks();

    store = configureStore({
      reducer: {
        stocks: stocksSlice,
      },
    });

    // Set up default mock return values
    (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
      items: [],
      search: '',
      filters: '',
      pagination: {
        next_url: undefined,
        count: undefined,
        hasMore: false,
      },
    });

    (paginationService.updateStateForPagination as jest.Mock).mockReturnValue({
      items: [],
      pagination: {
        next_url: undefined,
        count: undefined,
        hasMore: false,
      },
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = store.getState().stocks;

      expect(state.list).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
      expect(state.errorDetails).toBeUndefined();
      expect(state.pagination).toEqual({
        next_url: undefined,
        count: undefined,
        hasMore: false,
      });
      expect(state.lastSearch).toBeUndefined();
      expect(state.lastFilters).toBeUndefined();
    });
  });

  describe('reset action', () => {
    it('should reset state to initial values', () => {
      // First, populate some data
      store.dispatch({
        type: 'stocks/fetchStocks/fulfilled',
        payload: { results: [{ ticker: 'AAPL', name: 'Apple Inc.' }] },
        meta: { arg: { search: 'tech' } },
      });

      // Then reset
      store.dispatch(reset());

      const state = store.getState().stocks;
      expect(state.list).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
      expect(state.errorDetails).toBeUndefined();
      expect(state.pagination).toEqual({
        next_url: undefined,
        count: undefined,
        hasMore: false,
      });
      expect(state.lastSearch).toBeUndefined();
      expect(state.lastFilters).toBeUndefined();
    });
  });

  describe('fetchStocks pending', () => {
    it('should set loading status and clear errors', async () => {
      // Mock the fetchTickers to return a promise that never resolves
      (fetchTickers as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      // Dispatch the async thunk
      const promise = store.dispatch(fetchStocks({ search: 'test' }));

      // Check that the pending state is set
      const pendingState = store.getState().stocks;
      expect(pendingState.status).toBe('loading');
      expect(pendingState.error).toBeUndefined();
      expect(pendingState.errorDetails).toBeUndefined();

      // Clean up the promise to avoid hanging
      promise.abort();
    });
  });

  describe('fetchStocks fulfilled - new search', () => {
    it('should handle new search correctly', async () => {
      const mockResults = [{ ticker: 'AAPL', name: 'Apple Inc.' }];
      const mockPayload = {
        results: mockResults,
        next_url: 'https://api.example.com/next-page',
        count: 100,
      };

      (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
      (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
        items: mockResults,
        search: 'tech',
        filters: '{}',
        pagination: {
          next_url: 'https://api.example.com/next-page',
          count: 100,
          hasMore: true,
        },
      });

      // Mock fetchTickers to return the mock payload
      (fetchTickers as jest.Mock).mockResolvedValue(mockPayload);

      // Dispatch the async thunk
      await store.dispatch(fetchStocks({ search: 'tech', filters: {} }));

      const state = store.getState().stocks;
      expect(state.list).toEqual(mockResults);
      expect(state.status).toBe('idle');
      expect(state.lastSearch).toBe('tech');
      expect(state.lastFilters).toBe('{}');
      expect(state.pagination.hasMore).toBe(true);

      // Verify that the pagination service methods were called
      expect(paginationService.isNewSearch).toHaveBeenCalled();
      expect(paginationService.updateStateForNewSearch).toHaveBeenCalled();
    });
  });

  describe('fetchStocks fulfilled - pagination', () => {
    it('should handle pagination correctly', async () => {
      const existingItems = [{ ticker: 'AAPL', name: 'Apple Inc.' }];
      const newItems = [{ ticker: 'GOOGL', name: 'Alphabet Inc.' }];
      const mockPayload = {
        results: newItems,
        next_url: undefined,
        count: 2,
      };

      // Set up initial state
      (fetchTickers as jest.Mock).mockResolvedValue({ results: existingItems });
      await store.dispatch(fetchStocks({ search: 'tech' }));

      (paginationService.isNewSearch as jest.Mock).mockReturnValue(false);
      (paginationService.updateStateForPagination as jest.Mock).mockReturnValue(
        {
          items: [...existingItems, ...newItems],
          pagination: {
            next_url: undefined,
            count: 2,
            hasMore: false,
          },
        },
      );

      // Mock fetchTickers for pagination
      (fetchTickers as jest.Mock).mockResolvedValue(mockPayload);

      await store.dispatch(
        fetchStocks({ next_url: 'https://api.example.com/next-page' }),
      );

      const state = store.getState().stocks;
      expect(state.list).toEqual([...existingItems, ...newItems]);
      expect(state.pagination.hasMore).toBe(false);

      // Check that the pagination service was called correctly
      expect(paginationService.isNewSearch).toHaveBeenCalled();
      expect(paginationService.updateStateForPagination).toHaveBeenCalled();
    });
  });

  describe('fetchStocks rejected', () => {
    it('should handle enhanced errors correctly', async () => {
      const enhancedError = {
        message: 'Rate limit exceeded',
        isRetryable: true,
        errorType: 'rate_limit',
      };

      // Mock fetchTickers to throw an error
      (fetchTickers as jest.Mock).mockRejectedValue(enhancedError);

      // Dispatch the async thunk
      await store.dispatch(fetchStocks({ search: 'test' }));

      const state = store.getState().stocks;
      expect(state.status).toBe('error');
      expect(state.error).toBe('Rate limit exceeded');
      expect(state.errorDetails).toEqual(enhancedError);
    });

    it('should handle standard errors correctly', async () => {
      const standardError = new Error('Network error');

      // Mock fetchTickers to throw an error
      (fetchTickers as jest.Mock).mockRejectedValue(standardError);

      // Dispatch the async thunk
      await store.dispatch(fetchStocks({ search: 'test' }));

      const state = store.getState().stocks;
      expect(state.status).toBe('error');
      expect(state.error).toBe('Network error');
      expect(state.errorDetails).toEqual({
        message: 'Network error',
        isRetryable: false,
        errorType: 'other',
      });
    });

    it('should handle errors without message', async () => {
      const errorWithoutMessage = {};

      // Mock fetchTickers to throw an error
      (fetchTickers as jest.Mock).mockRejectedValue(errorWithoutMessage);

      // Dispatch the async thunk
      await store.dispatch(fetchStocks({ search: 'test' }));

      const state = store.getState().stocks;
      expect(state.status).toBe('error');
      expect(state.error).toBe('Failed to fetch stocks');
      expect(state.errorDetails).toEqual({
        message: 'Failed to fetch stocks',
        isRetryable: false,
        errorType: 'other',
      });
    });
  });

  describe('pagination service integration', () => {
    it('should use pagination service for state updates', async () => {
      const mockResults = [{ ticker: 'AAPL', name: 'Apple Inc.' }];
      const mockPayload = {
        results: mockResults,
        next_url: 'https://api.example.com/next-page',
        count: 100,
      };

      (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
      (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
        items: mockResults,
        search: 'tech',
        filters: '{}',
        pagination: {
          next_url: 'https://api.example.com/next-page',
          count: 100,
          hasMore: true,
        },
      });

      // Mock fetchTickers
      (fetchTickers as jest.Mock).mockResolvedValue(mockPayload);

      await store.dispatch(fetchStocks({ search: 'tech', filters: {} }));

      expect(paginationService.isNewSearch).toHaveBeenCalled();
      expect(paginationService.updateStateForNewSearch).toHaveBeenCalled();
    });
  });
});
