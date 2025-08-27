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

// Mock console.log to avoid noise in tests
const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

describe('Stocks Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('fetchTickers', () => {
    it('fetches tickers with default parameters', async () => {
      const mockResponse = {
        results: [
          { ticker: 'AAPL', name: 'Apple Inc.' },
          { ticker: 'GOOGL', name: 'Alphabet Inc.' },
        ],
        next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=abc123',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

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
      expect(result).toEqual(mockResponse);
    });

    it('fetches tickers with custom parameters', async () => {
      const params: StocksQuery = {
        market: 'crypto',
        search: 'BTC',
        limit: 50,
        sort: 'name',
        order: 'desc',
      };

      const mockResponse = {
        results: [
          { ticker: 'BTCUSD', name: 'Bitcoin' },
          { ticker: 'ETHUSD', name: 'Ethereum' },
        ],
        next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=def456',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await fetchTickers(params);

      expect(api.get).toHaveBeenCalledWith('/v3/reference/tickers', {
        params: {
          market: 'crypto',
          active: true,
          limit: 50,
          sort: 'name',
          order: 'desc',
          search: 'BTC',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('fetches tickers with next_url parameter', async () => {
      const nextUrl =
        'https://api.polygon.io/v3/reference/tickers?cursor=abc123';
      const mockResponse = {
        results: [
          { ticker: 'MSFT', name: 'Microsoft Corporation' },
          { ticker: 'AMZN', name: 'Amazon.com Inc.' },
        ],
        next_url: 'https://api.polygon.io/v3/reference/tickers?cursor=def456',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await fetchTickers({ next_url: nextUrl });

      expect(api.get).toHaveBeenCalledWith(`${nextUrl}&apiKey=test-api-key`);
      expect(result).toEqual(mockResponse);
    });

    it('handles API errors correctly', async () => {
      const mockError = {
        message: 'API Error',
        response: { status: 500 },
        isRetryable: false,
        errorType: 'api',
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
        response: undefined,
        isRetryable: true,
        errorType: 'network',
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
      const params: StocksQuery = {
        market: 'crypto',
        search: 'ETH',
        next_url:
          'https://api.polygon.io/v3/reference/tickers?cursor=abc123&market=crypto',
      };

      const mockResponse = {
        results: [
          { ticker: 'ETHUSD', name: 'Ethereum' },
          { ticker: 'ETHBTC', name: 'Ethereum/Bitcoin' },
        ],
        next_url:
          'https://api.polygon.io/v3/reference/tickers?cursor=def456&market=crypto',
      };

      (api.get as jest.Mock).mockResolvedValue({
        data: mockResponse,
        status: 200,
        statusText: 'OK',
      });

      const result = await fetchTickers(params);

      expect(api.get).toHaveBeenCalledWith(
        `${params.next_url}&apiKey=test-api-key`,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('StocksQuery type', () => {
    it('accepts valid market values', () => {
      const validMarkets: Array<StocksQuery['market']> = [
        'stocks',
        'crypto',
        'fx',
        'otc',
        'indices',
      ];
      validMarkets.forEach(market => {
        expect(market).toBeDefined();
      });
    });

    it('accepts valid order values', () => {
      const validOrders: Array<StocksQuery['order']> = ['asc', 'desc'];
      validOrders.forEach(order => {
        expect(order).toBeDefined();
      });
    });

    it('accepts optional parameters', () => {
      const query: StocksQuery = {
        search: 'AAPL',
        market: 'stocks',
        active: true,
        limit: 50,
        sort: 'ticker',
        order: 'asc',
      };

      expect(query.search).toBe('AAPL');
      expect(query.market).toBe('stocks');
      expect(query.active).toBe(true);
      expect(query.limit).toBe(50);
      expect(query.sort).toBe('ticker');
      expect(query.order).toBe('asc');
    });
  });
});
