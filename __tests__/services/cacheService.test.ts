import { CacheService, cacheService } from '../../src/services/cacheService';
import { cacheManager } from '../../src/utils/cacheManager';

// Mock the cache manager
jest.mock('../../src/utils/cacheManager', () => ({
  cacheManager: {
    generateKey: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    getStats: jest.fn(),
  },
}));

describe('Cache Service', () => {
  let mockCacheManager: jest.Mocked<typeof cacheManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCacheManager = cacheManager as jest.Mocked<typeof cacheManager>;

    // Reset mock implementations
    mockCacheManager.generateKey.mockReset();
    mockCacheManager.get.mockReset();
    mockCacheManager.set.mockReset();
    mockCacheManager.has.mockReset();
    mockCacheManager.delete.mockReset();
    mockCacheManager.clear.mockReset();
    mockCacheManager.getStats.mockReset();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = CacheService.getInstance();
      const instance2 = CacheService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateKey', () => {
    it('should generate cache key from URL and params', () => {
      const url = '/test/endpoint';
      const params = { param1: 'value1', param2: 'value2' };
      const expectedKey = 'test-key';

      mockCacheManager.generateKey.mockReturnValue(expectedKey);

      const result = cacheService.generateKey(url, params);

      expect(mockCacheManager.generateKey).toHaveBeenCalledWith(url, params);
      expect(result).toBe(expectedKey);
    });

    it('should handle URL without params', () => {
      const url = '/test/endpoint';

      const result = cacheService.generateKey(url);

      // When no params, it should return the URL directly without calling cache manager
      expect(mockCacheManager.generateKey).not.toHaveBeenCalled();
      expect(result).toBe(url);
    });

    it('should filter out undefined values and API key', () => {
      const url = '/test/endpoint';
      const params = {
        param1: 'value1',
        param2: undefined,
        apiKey: 'secret-key',
        param3: 'value3',
      };

      cacheService.generateKey(url, params);

      expect(mockCacheManager.generateKey).toHaveBeenCalledWith(url, {
        param1: 'value1',
        param3: 'value3',
      });
    });
  });

  describe('get', () => {
    it('should get cached data', () => {
      const key = 'test-key';
      const cachedData = { data: 'test' };

      mockCacheManager.get.mockReturnValue(cachedData);

      const result = cacheService.get(key);

      expect(mockCacheManager.get).toHaveBeenCalledWith(key);
      expect(result).toBe(cachedData);
    });
  });

  describe('set', () => {
    it('should set data in cache with default TTL', () => {
      const key = 'test-key';
      const data = { data: 'test' };

      cacheService.set(key, data);

      expect(mockCacheManager.set).toHaveBeenCalledWith(key, data, undefined);
    });

    it('should set data in cache with custom TTL', () => {
      const key = 'test-key';
      const data = { data: 'test' };
      const ttl = 60000;

      cacheService.set(key, data, ttl);

      expect(mockCacheManager.set).toHaveBeenCalledWith(key, data, ttl);
    });
  });

  describe('has', () => {
    it('should check if key exists', () => {
      const key = 'test-key';
      mockCacheManager.has.mockReturnValue(true);

      const result = cacheService.has(key);

      expect(mockCacheManager.has).toHaveBeenCalledWith(key);
      expect(result).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete key from cache', () => {
      const key = 'test-key';

      cacheService.delete(key);

      expect(mockCacheManager.delete).toHaveBeenCalledWith(key);
    });
  });

  describe('clear', () => {
    it('should clear all cache', () => {
      cacheService.clear();

      expect(mockCacheManager.clear).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should get cache statistics', () => {
      const stats = { size: 10, memoryUsage: 1024 };
      mockCacheManager.getStats.mockReturnValue(stats);

      const result = cacheService.getStats();

      expect(mockCacheManager.getStats).toHaveBeenCalled();
      expect(result).toBe(stats);
    });
  });

  describe('shouldCache', () => {
    it('should return true for GET requests to tickers endpoint', () => {
      expect(cacheService.shouldCache('GET', '/v3/reference/tickers')).toBe(
        true,
      );
      expect(cacheService.shouldCache('get', '/v3/reference/tickers')).toBe(
        true,
      );
    });

    it('should return false for non-GET requests', () => {
      expect(cacheService.shouldCache('POST', '/v3/reference/tickers')).toBe(
        false,
      );
      expect(cacheService.shouldCache('PUT', '/v3/reference/tickers')).toBe(
        false,
      );
    });

    it('should return false for non-tickers endpoints', () => {
      expect(cacheService.shouldCache('GET', '/v3/other/endpoint')).toBe(false);
    });
  });

  describe('getDefaultTTL', () => {
    it('should return 30 minutes for ticker data', () => {
      const tickerUrl = '/v3/reference/tickers';
      const expectedTTL = 30 * 60 * 1000; // 30 minutes in milliseconds

      const result = cacheService.getDefaultTTL(tickerUrl);

      expect(result).toBe(expectedTTL);
    });

    it('should return 5 minutes for other endpoints', () => {
      const otherUrl = '/v3/other/endpoint';
      const expectedTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

      const result = cacheService.getDefaultTTL(otherUrl);

      expect(result).toBe(expectedTTL);
    });
  });
});
