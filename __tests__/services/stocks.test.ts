import { fetchTickers, StocksQuery } from '../../src/services/stocks';
import api from '../../src/services/api';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_KEY: 'test-api-key',
}));

// Mock the api module
jest.mock('../../src/services/api', () => ({
  get: jest.fn(),
}));

// Mock console.log
const originalConsole = global.console;
beforeAll(() => {
  global.console = {
    ...originalConsole,
    log: jest.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});

describe('Stocks Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTickers', () => {
    it('fetches tickers with default parameters', async () => {
      const mockResponse = {
        data: {
          results: [{ ticker: 'AAPL', name: 'Apple Inc.' }],
          count: 1,
          next_url: null,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchTickers({});

      expect(api.get).toHaveBeenCalledWith('/v3/reference/tickers', {
        params: {
          market: 'stocks',
          active: true,
          limit: 100,
          sort: 'ticker',
          order: 'asc',
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches tickers with custom parameters', async () => {
      const mockResponse = {
        data: {
          results: [{ ticker: 'GOOGL', name: 'Alphabet Inc.' }],
          count: 1,
          next_url: null,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params: StocksQuery = {
        market: 'crypto',
        search: 'BTC',
        limit: 50,
        sort: 'name',
        order: 'desc',
      };

      const result = await fetchTickers(params);

      expect(api.get).toHaveBeenCalledWith('/v3/reference/tickers', {
        params: {
          market: 'crypto',
          active: true,
          limit: 100,
          sort: 'ticker',
          order: 'asc',
          ...params,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('fetches tickers with next_url parameter', async () => {
      const nextUrl =
        'https://api.polygon.io/v3/reference/tickers?cursor=abc123';
      const mockResponse = {
        data: {
          results: [{ ticker: 'MSFT', name: 'Microsoft Corporation' }],
          count: 1,
          next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=def456',
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await fetchTickers({ next_url: nextUrl });

      expect(api.get).toHaveBeenCalledWith(`${nextUrl}&apiKey=test-api-key`);
      expect(result).toEqual(mockResponse.data);
    });

    it('handles API errors correctly', async () => {
      const mockError = {
        message: 'API Error',
        isRetryable: false,
        errorType: 'api',
        response: { status: 500 },
      };

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchTickers({})).rejects.toEqual(mockError);
      expect(console.log).toHaveBeenCalledWith('🚨 Stocks Service Error:', {
        message: 'API Error',
        isRetryable: false,
        errorType: 'api',
        status: 500,
      });
    });

    it('handles network errors correctly', async () => {
      const mockError = {
        message: 'Network Error',
        isRetryable: true,
        errorType: 'network',
        response: undefined,
      };

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchTickers({})).rejects.toEqual(mockError);
      expect(console.log).toHaveBeenCalledWith('🚨 Stocks Service Error:', {
        message: 'Network Error',
        isRetryable: true,
        errorType: 'network',
        status: undefined,
      });
    });

    it('handles errors with missing response', async () => {
      const mockError = {
        message: 'Unknown Error',
        isRetryable: false,
        errorType: 'other',
      };

      (api.get as jest.Mock).mockRejectedValue(mockError);

      await expect(fetchTickers({})).rejects.toEqual(mockError);
      expect(console.log).toHaveBeenCalledWith('🚨 Stocks Service Error:', {
        message: 'Unknown Error',
        isRetryable: false,
        errorType: 'other',
        status: undefined,
      });
    });

    it('preserves custom parameters when fetching with next_url', async () => {
      const nextUrl =
        'https://api.polygon.io/v3/reference/tickers?cursor=abc123&market=crypto';

      const mockResponse = {
        data: {
          results: [{ ticker: 'ETH', name: 'Ethereum' }],
          count: 1,
          next_url: null,
        },
      };

      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const params: StocksQuery = {
        next_url: nextUrl,
        market: 'crypto',
        search: 'ETH',
      };

      const result = await fetchTickers(params);

      // Should use next_url directly, not the base endpoint
      expect(api.get).toHaveBeenCalledWith(`${nextUrl}&apiKey=test-api-key`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('StocksQuery type', () => {
    it('accepts valid market values', () => {
      const validMarkets: Array<
        'stocks' | 'crypto' | 'fx' | 'otc' | 'indices'
      > = ['stocks', 'crypto', 'fx', 'otc', 'indices'];

      validMarkets.forEach(market => {
        const query: StocksQuery = { market };
        expect(query.market).toBe(market);
      });
    });

    it('accepts valid order values', () => {
      const validOrders: Array<'asc' | 'desc'> = ['asc', 'desc'];

      validOrders.forEach(order => {
        const query: StocksQuery = { order };
        expect(query.order).toBe(order);
      });
    });

    it('accepts optional parameters', () => {
      const query: StocksQuery = {
        search: 'AAPL',
        limit: 50,
        sort: 'name',
        cusip: '037833100',
        cik: '0000320193',
      };

      expect(query.search).toBe('AAPL');
      expect(query.limit).toBe(50);
      expect(query.sort).toBe('name');
      expect(query.cusip).toBe('037833100');
      expect(query.cik).toBe('0000320193');
    });
  });
});
