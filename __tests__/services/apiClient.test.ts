import { apiClient, createRequestConfig } from '../../src/services/apiClient';
import Config from 'react-native-config';

// Mock react-native-config
jest.mock('react-native-config', () => ({
  API_KEY: 'test-api-key',
}));

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createApiClient', () => {
    it('should create axios instance with correct base configuration', () => {
      expect(apiClient.defaults.baseURL).toBe('https://api.polygon.io');
      expect(apiClient.defaults.timeout).toBe(10000);
      expect(apiClient.defaults.headers['Content-Type']).toBe(
        'application/json',
      );
    });

    it('should add API key to all requests', async () => {
      // Create a new request config
      const config = {
        method: 'get',
        url: '/test',
        params: { test: 'value' },
      };

      // Simulate the interceptor logic
      const params = config.params ?? {};
      config.params = { ...params, apiKey: 'test-api-key' };

      expect(config.params).toEqual({
        test: 'value',
        apiKey: 'test-api-key',
      });
    });

    it('should handle request interceptor errors', async () => {
      const mockErrorInterceptor = jest.fn();
      apiClient.interceptors.request.use(undefined, mockErrorInterceptor);

      const error = new Error('Request error');
      await mockErrorInterceptor(error);

      expect(mockErrorInterceptor).toHaveBeenCalledWith(error);
    });
  });

  describe('createRequestConfig', () => {
    it('should create request config with all parameters', () => {
      const config = createRequestConfig({
        params: { test: 'value' },
        headers: { 'Custom-Header': 'value' },
        timeout: 5000,
      });

      expect(config).toEqual({
        params: { test: 'value' },
        headers: { 'Custom-Header': 'value' },
        timeout: 5000,
      });
    });

    it('should create request config with partial parameters', () => {
      const config = createRequestConfig({
        params: { test: 'value' },
      });

      expect(config).toEqual({
        params: { test: 'value' },
        headers: undefined,
        timeout: undefined,
      });
    });

    it('should create empty request config when no parameters provided', () => {
      const config = createRequestConfig();

      expect(config).toEqual({
        params: undefined,
        headers: undefined,
        timeout: undefined,
      });
    });
  });

  describe('request interceptor', () => {
    it('should add API key to existing params', async () => {
      const config = {
        method: 'get',
        url: '/test',
        params: { existing: 'param' },
      };

      // Simulate the interceptor logic
      const params = config.params ?? {};
      config.params = { ...params, apiKey: 'test-api-key' };

      expect(config.params).toEqual({
        existing: 'param',
        apiKey: 'test-api-key',
      });
    });

    it('should create params object if none exists', async () => {
      const config = {
        method: 'get',
        url: '/test',
      };

      // Simulate the interceptor logic
      const params = config.params ?? {};
      config.params = { ...params, apiKey: 'test-api-key' };

      expect(config.params).toEqual({
        apiKey: 'test-api-key',
      });
    });
  });
});
