import { cacheManager } from '../utils/cacheManager';
import { CacheConfig } from '../types';

export class CacheService {
  private static instance: CacheService;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate a cache key from URL and parameters
   */
  generateKey(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    // Clean up params by removing undefined values and API key
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(
        ([key, value]) => value !== undefined && key !== 'apiKey',
      ),
    );

    return cacheManager.generateKey(url, cleanParams);
  }

  /**
   * Get cached data
   */
  get<T>(key: string): T | null {
    return cacheManager.get<T>(key);
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    cacheManager.set(key, data, ttl);
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    return cacheManager.has(key);
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): void {
    cacheManager.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    cacheManager.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return cacheManager.getStats();
  }

  /**
   * Check if request should be cached
   */
  shouldCache(method: string, url: string): boolean {
    return (
      method.toLowerCase() === 'get' && url.includes('/v3/reference/tickers')
    );
  }

  /**
   * Get default TTL for different endpoints
   */
  getDefaultTTL(url: string): number {
    if (url.includes('/v3/reference/tickers')) {
      return 30 * 60 * 1000; // 30 minutes for ticker data
    }
    return 5 * 60 * 1000; // 5 minutes default
  }
}

export const cacheService = CacheService.getInstance();
export default cacheService;
