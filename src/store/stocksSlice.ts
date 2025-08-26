import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchTickers, StocksQuery } from '../services/stocks';

export type Ticker = {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange: string;
  type: string;
  active: boolean;
  currency_name: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
  last_updated_utc: string;
};

export type Pagination = {
  count?: number;
  next_url?: string;
};

type StocksState = {
  list: Ticker[];
  status: 'idle' | 'loading' | 'error';
  error?: string;
  errorDetails?: {
    message: string;
    isRetryable: boolean;
    errorType: string;
  };
  pagination: Pagination;
  lastSearch?: string;
  lastFilters?: string;
  lastRequestedUrl?: string;
};

const initialState: StocksState = {
  list: [],
  status: 'idle',
  error: undefined,
  errorDetails: undefined,
  pagination: {},
  lastSearch: undefined,
  lastFilters: undefined,
  lastRequestedUrl: undefined,
};

// Utility functions for pagination logic
const isNewSearch = (
  currentSearch: string,
  currentFilters: string,
  lastSearch?: string,
  lastFilters?: string,
): boolean => {
  return lastSearch !== currentSearch || lastFilters !== currentFilters;
};

const mergeStocksWithoutDuplicates = (
  existingStocks: Ticker[],
  newStocks: Ticker[],
): Ticker[] => {
  const combined = [...existingStocks, ...newStocks];
  const seenTickers = new Set<string>();

  return combined.filter((item: Ticker) => {
    const key = item?.ticker ?? '';
    if (seenTickers.has(key)) {
      return false;
    }
    seenTickers.add(key);
    return true;
  });
};

const updateStateForNewSearch = (
  state: StocksState,
  results: Ticker[],
  currentSearch: string,
  currentFilters: string,
): void => {
  state.list = results;
  state.lastSearch = currentSearch;
  state.lastFilters = currentFilters;
  state.lastRequestedUrl = undefined;
};

const updateStateForPagination = (
  state: StocksState,
  results: Ticker[],
): void => {
  state.list = mergeStocksWithoutDuplicates(state.list, results);
  // Don't update lastRequestedUrl for pagination to prevent blocking
};

export const fetchStocks = createAsyncThunk(
  'stocks/fetch',
  async (
    args: {
      search?: string;
      filters?: Partial<StocksQuery>;
      next_url?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const { search, filters, next_url } = args;
      const data = await fetchTickers({ search, ...filters, next_url });
      return data;
    } catch (error: any) {
      // The service layer now provides enhanced error details
      return rejectWithValue({
        message: error.message || 'Failed to fetch stocks',
        isRetryable: error.isRetryable || false,
        errorType: error.errorType || 'other',
      });
    }
  },
);

const stocksSlice = createSlice({
  name: 'stocks',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: builder => {
    builder
      .addCase(fetchStocks.pending, (state, action) => {
        state.status = 'loading';
        state.error = undefined;
        state.errorDetails = undefined;
      })
      .addCase(
        fetchStocks.fulfilled,
        (state, action: PayloadAction<any> & { meta: { arg: any } }) => {
          state.status = 'idle';
          const results = action.payload?.results ?? [];

          // Check if this is a new search or pagination
          const currentSearch = action.meta.arg.search || '';
          const currentFilters = JSON.stringify(action.meta.arg.filters || {});
          const currentUrl = action.meta.arg.next_url || '';

          if (
            isNewSearch(
              currentSearch,
              currentFilters,
              state.lastSearch,
              state.lastFilters,
            )
          ) {
            // New search - replace the list
            updateStateForNewSearch(
              state,
              results,
              currentSearch,
              currentFilters,
            );
          } else {
            // Pagination - append to existing list
            updateStateForPagination(state, results);
          }

          state.pagination.next_url = action.payload?.next_url;
          state.pagination.count = action.payload?.count;
        },
      )
      .addCase(fetchStocks.rejected, (state, action) => {
        state.status = 'error';

        // Handle enhanced errors passed through rejectWithValue
        if (
          action.payload &&
          typeof action.payload === 'object' &&
          'message' in action.payload
        ) {
          const enhancedError = action.payload as any;
          state.error = enhancedError.message;
          state.errorDetails = {
            message: enhancedError.message,
            isRetryable: enhancedError.isRetryable || false,
            errorType: enhancedError.errorType || 'other',
          };
        } else {
          // Handle standard errors
          state.error = action.error.message;
          state.errorDetails = {
            message: action.error.message || 'An error occurred',
            isRetryable: false,
            errorType: 'other',
          };
        }
      });
  },
});

export const { reset } = stocksSlice.actions;
export default stocksSlice.reducer;
