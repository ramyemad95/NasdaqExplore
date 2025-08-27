import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Mock the pagination service using Jest's manual mock system
jest.mock('../../src/services/paginationService');

// Mock the stocks service using Jest's manual mock system
jest.mock('../../src/services/stocks');

// Now import the hook and slice after mocking
import useStocks from '../../src/hooks/useStocks';
import stocksSlice, { fetchStocks } from '../../src/store/stocksSlice';
import { paginationService } from '../../src/services/paginationService';
import { fetchTickers } from '../../src/services/stocks';

describe('Refactored useStocks Hook', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        stocks: stocksSlice,
      },
    });

    // Set up default mock return values
    (paginationService.hasMoreItems as jest.Mock).mockReturnValue(false);
    (paginationService.getNextPageUrl as jest.Mock).mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(Provider, { store, children }, children);

  describe('initial state', () => {
    it('should return initial state correctly', () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      expect(result.current.stocks).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.error).toBeUndefined();
      expect(result.current.errorDetails).toBeUndefined();
      expect(result.current.hasMoreStocks).toBe(false);
      expect(result.current.paginationUrl).toBeUndefined();
    });
  });

  describe('pagination service integration', () => {
    it('should use pagination service for hasMoreStocks', () => {
      (paginationService.hasMoreItems as jest.Mock).mockReturnValue(true);

      const { result } = renderHook(() => useStocks(), { wrapper });

      expect(result.current.hasMoreStocks).toBe(true);
      expect(paginationService.hasMoreItems).toHaveBeenCalledWith({
        next_url: undefined,
        count: undefined,
        hasMore: false,
      });
    });

    it('should use pagination service for paginationUrl', () => {
      const mockUrl = 'https://api.example.com/next-page';
      (paginationService.getNextPageUrl as jest.Mock).mockReturnValue(mockUrl);

      const { result } = renderHook(() => useStocks(), { wrapper });

      expect(result.current.paginationUrl).toBe(mockUrl);
      expect(paginationService.getNextPageUrl).toHaveBeenCalledWith({
        next_url: undefined,
        count: undefined,
        hasMore: false,
      });
    });
  });

  describe('loading state', () => {
    it('should return loading state correctly', async () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock the fetchTickers to return a promise that never resolves
      (fetchTickers as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      // Dispatch the async thunk
      const promise = store.dispatch(fetchStocks({ search: 'test' }));

      // Wait for the loading state to be reflected in the hook
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      expect(result.current.hasError).toBe(false);

      // Clean up the promise to avoid hanging
      promise.abort();
    });
  });

  describe('error state', () => {
    it('should return error state correctly', async () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers to throw an error
      (fetchTickers as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Dispatch the async thunk
      await act(async () => {
        await store.dispatch(fetchStocks({ search: 'test' }));
      });

      // Wait for the error state to be reflected in the hook
      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.errorDetails).toEqual({
        message: 'Network error',
        isRetryable: false,
        errorType: 'other',
      });
    });

    it('should handle enhanced error details', async () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      const enhancedError = {
        message: 'Rate limit exceeded',
        isRetryable: true,
        errorType: 'rate_limit',
      };

      // Mock fetchTickers to throw an error
      (fetchTickers as jest.Mock).mockRejectedValue(enhancedError);

      // Dispatch the async thunk
      await act(async () => {
        await store.dispatch(fetchStocks({ search: 'test' }));
      });

      // Wait for the error state to be reflected in the hook
      await waitFor(() => {
        expect(result.current.hasError).toBe(true);
      });

      expect(result.current.error).toBe('Rate limit exceeded');
      expect(result.current.errorDetails).toEqual(enhancedError);
    });
  });

  describe('successful data loading', () => {
    it('should return stocks data correctly', async () => {
      const mockStocks = [
        { ticker: 'AAPL', name: 'Apple Inc.' },
        { ticker: 'GOOGL', name: 'Alphabet Inc.' },
      ];

      // Mock the pagination service to handle the fulfilled action
      (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
      (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
        items: mockStocks,
        search: 'tech',
        filters: '{}',
        pagination: {
          next_url: undefined,
          count: 2,
          hasMore: false,
        },
      });

      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers to return the mock payload
      (fetchTickers as jest.Mock).mockResolvedValue({ results: mockStocks });

      // Dispatch the async thunk
      await act(async () => {
        await store.dispatch(fetchStocks({ search: 'tech' }));
      });

      // Wait for the data to be reflected in the hook
      await waitFor(() => {
        expect(result.current.stocks).toEqual(mockStocks);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.hasError).toBe(false);
    });
  });

  describe('action functions', () => {
    it('should dispatch searchStocks action', async () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers to return a promise that never resolves
      (fetchTickers as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      act(() => {
        result.current.searchStocks('AAPL', { sector: 'Technology' });
      });

      // Wait for the loading state to be reflected in the hook
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Clean up any pending promises
      const state = store.getState().stocks;
      if (state.status === 'loading') {
        // Abort any pending requests
        store.dispatch({ type: 'stocks/fetchStocks/abort' });
      }
    });

    it('should dispatch loadMoreStocks action', async () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers to return a promise that never resolves
      (fetchTickers as jest.Mock).mockImplementation(
        () => new Promise(() => {}),
      );

      act(() => {
        result.current.loadMoreStocks('https://api.example.com/next-page');
      });

      // Wait for the loading state to be reflected in the hook
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Clean up any pending promises
      const state = store.getState().stocks;
      if (state.status === 'loading') {
        // Abort any pending requests
        store.dispatch({ type: 'stocks/fetchStocks/abort' });
      }
    });

    it('should dispatch reset action', () => {
      const { result } = renderHook(() => useStocks(), { wrapper });

      act(() => {
        result.current.resetStocks();
      });

      // Check that the state was reset
      const state = store.getState().stocks;
      expect(state.list).toEqual([]);
      expect(state.status).toBe('idle');
      expect(state.error).toBeUndefined();
    });
  });

  describe('pagination state updates', () => {
    it('should update pagination state when data is loaded', async () => {
      const mockStocks = [{ ticker: 'AAPL', name: 'Apple Inc.' }];

      // Mock the pagination service
      (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
      (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
        items: mockStocks,
        search: 'tech',
        filters: '{}',
        pagination: {
          next_url: 'https://api.example.com/next-page',
          count: 100,
          hasMore: true,
        },
      });

      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers
      (fetchTickers as jest.Mock).mockResolvedValue({
        results: mockStocks,
        next_url: 'https://api.example.com/next-page',
        count: 100,
      });

      await act(async () => {
        await store.dispatch(fetchStocks({ search: 'tech' }));
      });

      // Wait for the data to be reflected in the hook
      await waitFor(() => {
        expect(result.current.stocks).toEqual(mockStocks);
      });
    });

    it('should handle pagination without next page', async () => {
      const mockStocks = [{ ticker: 'AAPL', name: 'Apple Inc.' }];

      // Mock the pagination service
      (paginationService.isNewSearch as jest.Mock).mockReturnValue(true);
      (paginationService.updateStateForNewSearch as jest.Mock).mockReturnValue({
        items: mockStocks,
        search: 'tech',
        filters: '{}',
        pagination: {
          next_url: undefined,
          count: 1,
          hasMore: false,
        },
      });

      const { result } = renderHook(() => useStocks(), { wrapper });

      // Mock fetchTickers
      (fetchTickers as jest.Mock).mockResolvedValue({
        results: mockStocks,
        next_url: undefined,
        count: 1,
      });

      await act(async () => {
        await store.dispatch(fetchStocks({ search: 'tech' }));
      });

      // Wait for the data to be reflected in the hook
      await waitFor(() => {
        expect(result.current.stocks).toEqual(mockStocks);
      });
    });
  });

  describe('hook memoization', () => {
    it('should not recreate functions on re-renders', () => {
      const { result, rerender } = renderHook(() => useStocks(), { wrapper });

      const initialSearchStocks = result.current.searchStocks;
      const initialLoadMoreStocks = result.current.loadMoreStocks;
      const initialResetStocks = result.current.resetStocks;

      rerender({});

      expect(result.current.searchStocks).toBe(initialSearchStocks);
      expect(result.current.loadMoreStocks).toBe(initialLoadMoreStocks);
      expect(result.current.resetStocks).toBe(initialResetStocks);
    });
  });
});
