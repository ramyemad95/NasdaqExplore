import reducer, {
  setFilters,
  resetFilters,
} from '../../src/store/filtersSlice';

describe('filtersSlice', () => {
  const initialState = { market: 'stocks' as const };

  it('should return initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('sets filters', () => {
    const state = reducer(initialState, setFilters({ market: 'crypto' }));
    expect(state).toEqual({ market: 'crypto' });
  });

  it('updates existing filters', () => {
    const stateWithFilters = {
      market: 'stocks' as const,
      order: 'asc' as const,
    };
    const state = reducer(stateWithFilters, setFilters({ order: 'desc' }));
    expect(state).toEqual({ market: 'stocks', order: 'desc' });
  });

  it('merges multiple filters', () => {
    const state = reducer(
      initialState,
      setFilters({
        market: 'crypto',
        order: 'asc',
        sort: 'name',
      }),
    );
    expect(state).toEqual({
      market: 'crypto',
      order: 'asc',
      sort: 'name',
    });
  });

  it('handles empty filter object', () => {
    const state = reducer(initialState, setFilters({}));
    expect(state).toEqual(initialState);
  });

  it('handles null filter values', () => {
    const stateWithFilters = {
      market: 'stocks' as const,
      order: 'asc' as const,
    };
    const state = reducer(stateWithFilters, setFilters({ order: undefined }));
    expect(state).toEqual({ market: 'stocks', order: undefined });
  });

  it('resets filters', () => {
    const state = reducer(
      { market: 'crypto' as const, order: 'asc' as const },
      resetFilters(),
    );
    expect(state).toEqual(initialState);
  });

  it('resets filters from empty state', () => {
    const state = reducer({}, resetFilters());
    expect(state).toEqual(initialState);
  });
});
