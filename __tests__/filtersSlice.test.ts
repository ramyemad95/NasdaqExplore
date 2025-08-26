import reducer, { setFilters, resetFilters } from '../src/store/filtersSlice';

describe('filtersSlice', () => {
  it('sets filters', () => {
    const state = reducer(undefined, setFilters({ type: 'CS', order: 'asc' }));
    expect(state.type).toBe('CS');
    expect(state.order).toBe('asc');
  });

  it('resets filters', () => {
    const state = reducer({ type: 'ETF' } as any, resetFilters());
    expect(state).toEqual({});
  });
});
