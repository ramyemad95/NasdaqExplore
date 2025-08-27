import api from '../../src/services/api';

// Mock console methods to avoid log spam
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_KEY: 'test-key',
}));

// Mock cacheManager
jest.mock('../../src/utils/cacheManager', () => ({
  cacheManager: {
    generateKey: jest.fn(
      (url, params) => `cache-${url}-${JSON.stringify(params)}`,
    ),
    get: jest.fn(),
    set: jest.fn(),
  },
}));

// Mock errorManager
jest.mock('../../src/utils/errorManager', () => ({
  default: {
    processApiError: jest.fn(error => ({
      message: error.message || 'Processed error',
      isRetryable: true,
      errorType: 'API_ERROR',
    })),
  },
}));

// Import the mocked modules
import { cacheManager } from '../../src/utils/cacheManager';
import ErrorManager from '../../src/utils/errorManager';

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset cache manager mocks
    (cacheManager.get as jest.Mock).mockReturnValue(null);
    (cacheManager.set as jest.Mock).mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('Configuration', () => {
    it('should have correct base URL', () => {
      expect(api.defaults.baseURL).toBe('https://api.polygon.io');
    });

    it('should have correct timeout', () => {
      expect(api.defaults.timeout).toBe(10000);
    });

    it('should have request interceptors configured', () => {
      expect(api.interceptors.request).toBeDefined();
    });

    it('should have response interceptors configured', () => {
      expect(api.interceptors.response).toBeDefined();
    });
  });

  describe('Instance Properties', () => {
    it('should be an axios instance', () => {
      expect(api.request).toBeDefined();
      expect(api.get).toBeDefined();
      expect(api.post).toBeDefined();
      expect(api.put).toBeDefined();
      expect(api.delete).toBeDefined();
    });

    it('should have interceptors property', () => {
      expect(api.interceptors).toBeDefined();
      expect(api.interceptors.request).toBeDefined();
      expect(api.interceptors.response).toBeDefined();
    });

    it('should have defaults property with expected structure', () => {
      expect(api.defaults).toBeDefined();
      expect(api.defaults.baseURL).toBeDefined();
      expect(api.defaults.timeout).toBeDefined();
    });
  });

  describe('Default Headers', () => {
    it('should not have hardcoded API key in headers', () => {
      // API key should be added by interceptor, not in defaults
      expect(api.defaults.headers?.common?.apiKey).toBeUndefined();
    });

    it('should have default content type', () => {
      expect(api.defaults.headers?.common?.['Accept']).toBeDefined();
    });
  });

  describe('Interceptor Functions', () => {
    it('should have request interceptor fulfilled function', () => {
      // Access the interceptor through the use method
      const requestInterceptor = (api.interceptors.request as any)
        .handlers?.[0];
      expect(requestInterceptor).toBeDefined();
      expect(typeof requestInterceptor?.fulfilled).toBe('function');
    });

    it('should have request interceptor rejected function', () => {
      const requestInterceptor = (api.interceptors.request as any)
        .handlers?.[0];
      expect(requestInterceptor).toBeDefined();
      expect(typeof requestInterceptor?.rejected).toBe('function');
    });

    it('should have response interceptor fulfilled function', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0];
      expect(responseInterceptor).toBeDefined();
      expect(typeof responseInterceptor?.fulfilled).toBe('function');
    });

    it('should have response interceptor rejected function', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0];
      expect(responseInterceptor).toBeDefined();
      expect(typeof responseInterceptor?.rejected).toBe('function');
    });
  });

  describe('Request Interceptor Logic', () => {
    it('should add API key to request config', async () => {
      // Create a mock config object
      const mockConfig = {
        url: '/test',
        params: {},
        method: 'get',
      };

      // Get the request interceptor function
      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;

      // Call the interceptor with the mock config
      const result = await requestInterceptor(mockConfig);

      // Check that the API key was added
      expect(result.params).toBeDefined();
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should preserve existing params when adding API key', async () => {
      // Create a mock config object with existing params
      const mockConfig = {
        url: '/test',
        params: { existing: 'param' },
        method: 'get',
      };

      // Get the request interceptor function
      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;

      // Call the interceptor with the mock config
      const result = await requestInterceptor(mockConfig);

      // Check that the API key was added and existing params preserved
      expect(result.params).toBeDefined();
      expect(result.params.apiKey).toBe('test-key');
      expect(result.params.existing).toBe('param');
    });

    it('should create params object if it does not exist', async () => {
      // Create a mock config object without params
      const mockConfig = {
        url: '/test',
        method: 'get',
        // No params property
      };

      // Get the request interceptor function
      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;

      // Call the interceptor with the mock config
      const result = await requestInterceptor(mockConfig);

      // Check that params object was created and API key added
      expect(result.params).toBeDefined();
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle GET requests with cache checking', async () => {
      const mockConfig = {
        url: '/test',
        method: 'get',
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should call cache manager to generate key
      expect(cacheManager.generateKey).toHaveBeenCalledWith('/test', {
        test: 'value',
      });
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle non-GET requests without cache checking', async () => {
      const mockConfig = {
        url: '/test',
        method: 'post',
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should not call cache manager for non-GET requests
      expect(cacheManager.generateKey).not.toHaveBeenCalled();
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should clean up params by removing undefined values and API key', async () => {
      const mockConfig = {
        url: '/test',
        method: 'get',
        params: {
          valid: 'value',
          undefined: undefined,
          null: null,
          empty: '',
          apiKey: 'old-key',
        },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should call cache manager with cleaned params
      expect(cacheManager.generateKey).toHaveBeenCalledWith('/test', {
        valid: 'value',
        null: null,
        empty: '',
      });
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle config without params for cache key generation', async () => {
      const mockConfig = {
        url: '/test',
        method: 'get',
        // No params
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should call cache manager with undefined params
      expect(cacheManager.generateKey).toHaveBeenCalledWith('/test', undefined);
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle method with undefined value', async () => {
      const mockConfig = {
        url: '/test',
        method: undefined,
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should handle undefined method gracefully
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle method with null value', async () => {
      const mockConfig = {
        url: '/test',
        method: null,
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should handle undefined method gracefully
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle cache hit scenario', async () => {
      const mockCachedData = { cached: 'data' };
      (cacheManager.get as jest.Mock).mockReturnValue(mockCachedData);

      const mockConfig = {
        url: '/test',
        method: 'get',
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should mark as cached request
      expect((result as any).__isCachedRequest).toBe(true);
      expect((result as any).__cachedData).toBe(mockCachedData);
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle cache miss scenario', async () => {
      (cacheManager.get as jest.Mock).mockReturnValue(null);

      const mockConfig = {
        url: '/test',
        method: 'get',
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      // Should not mark as cached request
      expect((result as any).__isCachedRequest).toBeUndefined();
      expect((result as any).__cachedData).toBeUndefined();
      expect(result.params.apiKey).toBe('test-key');
    });

    it('should handle development mode logging', async () => {
      // Mock __DEV__ to true to test development logging
      const originalDev = (globalThis as any).__DEV__;
      (globalThis as any).__DEV__ = true;

      const mockConfig = {
        url: '/test',
        method: 'get',
        params: { test: 'value' },
      };

      const requestInterceptor = (api.interceptors.request as any).handlers?.[0]
        ?.fulfilled;
      const result = await requestInterceptor(mockConfig);

      expect(result.params.apiKey).toBe('test-key');
      expect(consoleSpy.log).toHaveBeenCalled();

      // Restore original __DEV__ value
      (globalThis as any).__DEV__ = originalDev;
    });
  });

  describe('Response Interceptor Logic', () => {
    it('should pass through successful responses', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: { url: '/test' },
        headers: {},
      };

      const result = responseInterceptor(mockResponse);
      expect(result).toBe(mockResponse);
    });

    it('should handle cached requests by returning cached data', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockCachedData = { cached: 'data' };
      const mockResponse = {
        data: { api: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          url: '/test',
          __isCachedRequest: true,
          __cachedData: mockCachedData,
        },
        headers: {},
      };

      const result = responseInterceptor(mockResponse);
      expect(result.data).toBe(mockCachedData);
      expect(result.status).toBe(200);
    });

    it('should cache successful GET responses', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          method: 'get',
          url: '/test',
          params: { test: 'param', apiKey: 'test-key' },
        },
        headers: {},
      };

      responseInterceptor(mockResponse);

      // Should call cache manager to set data
      expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), {
        test: 'data',
      });
    });

    it('should not cache non-GET responses', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          method: 'post',
          url: '/test',
          params: { test: 'param' },
        },
        headers: {},
      };

      responseInterceptor(mockResponse);

      // Should not call cache manager for non-GET requests
      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should clean up params before caching by removing API key', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          method: 'get',
          url: '/test',
          params: {
            test: 'param',
            apiKey: 'test-key',
            undefined: undefined,
          },
        },
        headers: {},
      };

      responseInterceptor(mockResponse);

      // Should call cache manager with cleaned params (no API key, no undefined values)
      expect(cacheManager.set).toHaveBeenCalledWith(expect.any(String), {
        test: 'data',
      });
    });

    it('should handle response without params', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          method: 'get',
          url: '/test',
          // No params
        },
        headers: {},
      };

      responseInterceptor(mockResponse);

      // Should handle missing params gracefully
      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should handle response with undefined method', () => {
      const responseInterceptor = (api.interceptors.response as any)
        .handlers?.[0]?.fulfilled;
      const mockResponse = {
        data: { test: 'data' },
        status: 200,
        statusText: 'OK',
        config: {
          method: undefined,
          url: '/test',
          params: { test: 'param' },
        },
        headers: {},
      };

      responseInterceptor(mockResponse);

      // Should not cache when method is undefined
      expect(cacheManager.set).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle request interceptor errors', async () => {
      const requestErrorHandler = (api.interceptors.request as any)
        .handlers?.[0]?.rejected;
      const mockError = new Error('Request setup failed');

      await expect(requestErrorHandler(mockError)).rejects.toThrow(
        'Request setup failed',
      );
    });

    it('should handle response interceptor errors', async () => {
      const responseErrorHandler = (api.interceptors.response as any)
        .handlers?.[0]?.rejected;
      const mockError = {
        response: {
          status: 404,
          data: { error: 'Not found' },
        },
        message: 'Request failed',
      };

      // The error handler enhances the error, so we expect the enhanced version
      await expect(responseErrorHandler(mockError)).rejects.toHaveProperty(
        'message',
      );
    });

    it('should handle response interceptor errors without response property', async () => {
      const responseErrorHandler = (api.interceptors.response as any)
        .handlers?.[0]?.rejected;
      const mockError = {
        message: 'Network error',
        // No response property
      };

      await expect(responseErrorHandler(mockError)).rejects.toHaveProperty(
        'message',
      );
    });

    it('should handle response interceptor errors with minimal error object', async () => {
      const responseErrorHandler = (api.interceptors.response as any)
        .handlers?.[0]?.rejected;
      const mockError = {
        message: 'Minimal error',
        config: { url: '/test' },
      };

      await expect(responseErrorHandler(mockError)).rejects.toHaveProperty(
        'message',
      );
    });

    it('should handle response interceptor errors with undefined config', async () => {
      const responseErrorHandler = (api.interceptors.response as any)
        .handlers?.[0]?.rejected;
      const mockError = {
        message: 'No config error',
        // No config property
      };

      await expect(responseErrorHandler(mockError)).rejects.toHaveProperty(
        'message',
      );
    });
  });

  describe('API Instance Methods', () => {
    it('should have all standard HTTP methods', () => {
      expect(typeof api.get).toBe('function');
      expect(typeof api.post).toBe('function');
      expect(typeof api.put).toBe('function');
      expect(typeof api.delete).toBe('function');
      expect(typeof api.patch).toBe('function');
      expect(typeof api.head).toBe('function');
      expect(typeof api.options).toBe('function');
    });

    it('should have request method', () => {
      expect(typeof api.request).toBe('function');
    });
  });

  describe('Overridden GET Method', () => {
    it('should check cache before making API call', async () => {
      const mockCachedData = { cached: 'data' };
      (cacheManager.get as jest.Mock).mockReturnValue(mockCachedData);

      const result = await api.get('/test', { params: { test: 'param' } });

      expect(cacheManager.get).toHaveBeenCalled();
      expect(result.data).toBe(mockCachedData);
      expect(result.status).toBe(200);
    });
  });
});
