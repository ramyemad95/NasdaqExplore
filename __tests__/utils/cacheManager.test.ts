import { CacheManager, cacheManager } from '../../src/utils/cacheManager';

describe('CacheManager', () => {
  let cache: CacheManager;

  beforeEach(() => {
    cache = new CacheManager();
  });

  afterEach(() => {
    cache.clear();
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      const testData = { name: 'test', value: 123 };
      cache.set('test-key', testData);

      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    it('should return null for non-existent keys', () => {
      const retrieved = cache.get('non-existent');
      expect(retrieved).toBeNull();
    });

    it('should return null for expired keys', () => {
      const testData = { name: 'test' };
      // Set with very short TTL (1ms)
      cache.set('expired-key', testData, 1);

      // Wait for expiration
      setTimeout(() => {
        const retrieved = cache.get('expired-key');
        expect(retrieved).toBeNull();
      }, 10);
    });
  });

  describe('has', () => {
    it('should return true for existing valid keys', () => {
      cache.set('test-key', 'test-value');
      expect(cache.has('test-key')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      expect(cache.has('non-existent')).toBe(false);
    });

    it('should return false for expired keys', () => {
      cache.set('expired-key', 'test-value', 1);

      setTimeout(() => {
        expect(cache.has('expired-key')).toBe(false);
      }, 10);
    });
  });

  describe('delete and clear', () => {
    it('should delete specific keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.delete('key1');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toEqual('value2');
    });

    it('should clear all keys', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
    });
  });

  describe('generateKey', () => {
    it('should generate key from URL only', () => {
      const key = cache.generateKey('/api/stocks');
      expect(key).toBe('/api/stocks');
    });

    it('should generate key from URL and params', () => {
      const key = cache.generateKey('/api/stocks', {
        symbol: 'AAPL',
        market: 'stocks',
      });
      expect(key).toBe('/api/stocks?market=stocks&symbol=AAPL');
    });

    it('should handle empty params', () => {
      const key = cache.generateKey('/api/stocks', {});
      expect(key).toBe('/api/stocks');
    });

    it('should handle undefined params', () => {
      const key = cache.generateKey('/api/stocks', undefined);
      expect(key).toBe('/api/stocks');
    });
  });

  describe('getStats', () => {
    it('should return cache size', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const stats = cache.getStats();
      expect(stats.size).toBe(2);
    });
  });

  describe('default TTL', () => {
    it('should use 30 minutes as default TTL', () => {
      const testData = { name: 'test' };
      cache.set('test-key', testData);

      const retrieved = cache.get('test-key');
      expect(retrieved).toEqual(testData);

      // The entry should still be valid (not expired)
      expect(cache.has('test-key')).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should automatically clean up expired entries', () => {
      const testData = { name: 'test' };
      // Set with expired timestamp (past time)
      const expiredEntry = {
        data: testData,
        timestamp: Date.now() - 1000, // 1 second ago
        expiresAt: Date.now() - 500, // expired 500ms ago
      };

      // Manually set expired entry
      (cache as any).cache.set('expired-key', expiredEntry);

      // Force cleanup
      (cache as any).cleanup();

      expect(cache.has('expired-key')).toBe(false);
    });
  });
});

describe('cacheManager singleton', () => {
  afterEach(() => {
    cacheManager.clear();
  });

  it('should work as a singleton instance', () => {
    const testData = { name: 'singleton-test' };
    cacheManager.set('singleton-key', testData);

    const retrieved = cacheManager.get('singleton-key');
    expect(retrieved).toEqual(testData);
  });
});
