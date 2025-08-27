import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchTickers, StocksQuery } from '../services/stocks';
import { paginationService } from '../services/paginationService';
import { PaginationState } from '../types';

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

type StocksState = {
  list: Ticker[];
  status: 'idle' | 'loading' | 'error';
  error?: string;
  errorDetails?: {
    message: string;
    isRetryable: boolean;
    errorType: string;
  };
  pagination: PaginationState;
  lastSearch?: string;
  lastFilters?: string;
};

const initialState: StocksState = {
  list: [],
  status: 'idle',
  error: undefined,
  errorDetails: undefined,
  pagination: {
    next_url: undefined,
    count: undefined,
    hasMore: false,
  },
  lastSearch: undefined,
  lastFilters: undefined,
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
            paginationService.isNewSearch(
              currentSearch,
              currentFilters,
              state.lastSearch,
              state.lastFilters,
            )
          ) {
            // New search - replace the list
            const newState = paginationService.updateStateForNewSearch(
              state.list,
              results,
              currentSearch,
              currentFilters,
              action.payload,
            );

            state.list = newState.items;
            state.lastSearch = newState.search;
            state.lastFilters = newState.filters;
            state.pagination = newState.pagination;
          } else {
            // Pagination - append to existing list
            const paginationState = paginationService.updateStateForPagination(
              state.list,
              results,
              action.payload,
            );

            state.list = paginationState.items;
            state.pagination = paginationState.pagination;
          }
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
