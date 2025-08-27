import api from '../../src/services/api';

// Mock environment variable
process.env.POLYGON_API_KEY = 'test-api-key';

// Mock console methods to avoid log spam
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('API Service', () => {
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
      expect(api.interceptors.request.handlers.length).toBeGreaterThan(0);
    });

    it('should have response interceptors configured', () => {
      expect(api.interceptors.response.handlers.length).toBeGreaterThan(0);
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
      const requestInterceptor = api.interceptors.request.handlers[0];
      expect(requestInterceptor).toBeDefined();
      expect(typeof requestInterceptor.fulfilled).toBe('function');
    });

    it('should have request interceptor rejected function', () => {
      const requestInterceptor = api.interceptors.request.handlers[0];
      expect(requestInterceptor).toBeDefined();
      expect(typeof requestInterceptor.rejected).toBe('function');
    });

    it('should have response interceptor fulfilled function', () => {
      const responseInterceptor = api.interceptors.response.handlers[0];
      expect(responseInterceptor).toBeDefined();
      expect(typeof responseInterceptor.fulfilled).toBe('function');
    });

    it('should have response interceptor rejected function', () => {
      const responseInterceptor = api.interceptors.response.handlers[0];
      expect(responseInterceptor).toBeDefined();
      expect(typeof responseInterceptor.rejected).toBe('function');
    });
  });

  describe('Request Interceptor Logic', () => {
    it('should add API key to request config', () => {
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
      const mockConfig = {
        url: '/test',
        params: {},
      };

      const result = requestInterceptor(mockConfig);
      expect(result.params.apiKey).toBe('test-key'); // The actual value from env
    });

    it('should preserve existing params when adding API key', () => {
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
      const mockConfig = {
        url: '/test',
        params: { existing: 'param' },
      };

      const result = requestInterceptor(mockConfig);
      expect(result.params.apiKey).toBe('test-key'); // The actual value from env
      expect(result.params.existing).toBe('param');
    });

    it('should create params object if it does not exist', () => {
      const requestInterceptor = api.interceptors.request.handlers[0].fulfilled;
      const mockConfig = {
        url: '/test',
        // No params property
      };

      const result = requestInterceptor(mockConfig);
      expect(result.params).toBeDefined();
      expect(result.params.apiKey).toBe('test-key'); // The actual value from env
    });
  });

  describe('Response Interceptor Logic', () => {
    it('should pass through successful responses', () => {
      const responseInterceptor =
        api.interceptors.response.handlers[0].fulfilled;
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
  });

  describe('Error Handling', () => {
    it('should handle request interceptor errors', async () => {
      const requestErrorHandler = api.interceptors.request.handlers[0].rejected;
      const mockError = new Error('Request setup failed');

      await expect(requestErrorHandler(mockError)).rejects.toThrow(
        'Request setup failed',
      );
    });

    it('should handle response interceptor errors', async () => {
      const responseErrorHandler =
        api.interceptors.response.handlers[0].rejected;
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
});
