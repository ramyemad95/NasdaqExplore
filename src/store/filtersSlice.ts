import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type FiltersState = {
  market?: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices';
  order?: 'asc' | 'desc';
  sort?: string;
  active?: boolean;
};

const initialState: FiltersState = {
  market: 'stocks', // Default to stocks
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FiltersState>>) => ({
      ...state,
      ...action.payload,
    }),
    resetFilters: () => initialState,
  },
});

export const { setFilters, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
