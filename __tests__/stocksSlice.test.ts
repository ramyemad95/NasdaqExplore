import reducer, { reset } from '../src/store/stocksSlice';

describe('stocksSlice', () => {
  it('should return the initial state on reset', () => {
    const state = reducer(
      {
        list: [{ ticker: 'AAPL', name: 'Apple' }],
        status: 'idle',
        pagination: {},
      } as any,
      reset(),
    );
    expect(state.list).toEqual([]);
    expect(state.status).toBe('idle');
  });
});
