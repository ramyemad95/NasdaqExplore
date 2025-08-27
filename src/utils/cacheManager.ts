interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

  /**
   * Set a value in the cache with optional TTL
   * @param key - Cache key
   * @param data - Data to cache
   * @param ttl - Time to live in milliseconds (default: 30 minutes)
   */
  set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
    const timestamp = Date.now();
    const expiresAt = timestamp + ttl;

    this.cache.set(key, {
      data,
      timestamp,
      expiresAt,
    });

    // Clean up expired entries periodically
    this.cleanup();
  }

  /**
   * Get a value from the cache
   * @param key - Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   * @param key - Cache key
   * @returns True if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove a specific key from cache
   * @param key - Cache key to remove
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   * @returns Object with cache size and memory usage info
   */
  getStats(): { size: number; memoryUsage?: number } {
    const stats = {
      size: this.cache.size,
    };

    // Add memory usage if available (Node.js environment)
    if (typeof process !== 'undefined' && process.memoryUsage) {
      stats.memoryUsage = process.memoryUsage().heapUsed;
    }

    return stats;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Generate a cache key from URL and parameters
   * @param url - API endpoint URL
   * @param params - Query parameters
   * @returns Generated cache key
   */
  generateKey(url: string, params?: Record<string, any>): string {
    if (!params || Object.keys(params).length === 0) {
      return url;
    }

    // Sort parameters to ensure consistent key generation
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    return `${url}?${sortedParams}`;
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

// Export the class for testing purposes
export { CacheManager };
