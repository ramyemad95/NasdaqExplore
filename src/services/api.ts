import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import Config from 'react-native-config';
import ErrorManager from '../utils/errorManager';
import { cacheManager } from '../utils/cacheManager';

// Environment check for logging
const isDevelopment = __DEV__;

// Extend the AxiosRequestConfig to include retry information
interface RetryConfig extends InternalAxiosRequestConfig {
  __retry?: boolean;
  __retryCount?: number;
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: 'https://api.polygon.io',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  async config => {
    // For GET requests, check cache first
    if (config.method?.toLowerCase() === 'get') {
      // Clean up params by removing undefined values and API key
      const cleanParams = config.params
        ? Object.fromEntries(
            Object.entries(config.params).filter(
              ([key, value]) => value !== undefined && key !== 'apiKey',
            ),
          )
        : undefined;

      const cacheKey = cacheManager.generateKey(config.url || '', cleanParams);

      if (isDevelopment) {
        console.log('🔍 Looking for cache key:', cacheKey);
      }

      const cachedData = cacheManager.get(cacheKey);

      if (cachedData) {
        if (isDevelopment) {
          console.log('📦 Serving from cache:', cacheKey);
        }

        // Store cached data in config for response interceptor to use
        (config as any).__cachedData = cachedData;
        (config as any).__isCachedRequest = true;
      } else {
        if (isDevelopment) {
          console.log('🌐 Fetching from API:', cacheKey);
        }
      }
    }

    // Add API key to all requests
    const params = config.params ?? {};
    config.params = { ...params, apiKey: Config.API_KEY };

    if (isDevelopment) {
      console.log('🚀 API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data,
        headers: config.headers,
      });
    }

    return config;
  },
  async error => {
    if (isDevelopment) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Check if this was a cached request
    if ((response.config as any).__isCachedRequest) {
      // Return cached data immediately
      return {
        ...response,
        data: (response.config as any).__cachedData,
      };
    }

    // Cache successful GET responses
    if (response.config.method?.toLowerCase() === 'get') {
      // Generate cache key from the original request (before API key was added)
      const originalParams = { ...response.config.params };
      delete originalParams.apiKey; // Remove API key for consistent caching

      // Clean up params by removing undefined values (same logic as request interceptor)
      const cleanParams = originalParams
        ? Object.fromEntries(
            Object.entries(originalParams).filter(
              ([_, value]) => value !== undefined,
            ),
          )
        : undefined;

      const cacheKey = cacheManager.generateKey(
        response.config.url || '',
        cleanParams,
      );
      cacheManager.set(cacheKey, response.data);

      if (isDevelopment) {
        console.log('💾 Cached response for:', cacheKey);
      }
    }

    if (isDevelopment) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
        headers: response.headers,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    if (isDevelopment) {
      console.log('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: error.message,
        data: error.response?.data,
      });
    }

    // Retry logic for network errors and rate limits
    const original = error.config as RetryConfig;
    if (!original || original.__retry) {
      // Process the error through ErrorManager and enhance it
      const processedError = ErrorManager.processApiError(error);

      // Add retry information to the error for the service layer to handle
      const enhancedError = {
        ...error,
        message: processedError.message,
        isRetryable: processedError.isRetryable,
        errorType: processedError.errorType,
        retryCount: original?.__retryCount || 0,
      };
      throw enhancedError;
    }

    if (original) {
      original.__retry = true;
      original.__retryCount = (original.__retryCount || 0) + 1;
      return api(original);
    }

    throw error;
  },
);

// Override the get method to add caching
const originalGet = api.get.bind(api);

// Override the get method with caching
Object.defineProperty(api, 'get', {
  value: async function <T = any>(
    url: string,
    config?: any,
  ): Promise<AxiosResponse<T>> {
    // Clean up params by removing undefined values and API key
    const cleanParams = config?.params
      ? Object.fromEntries(
          Object.entries(config.params).filter(
            ([key, value]) => value !== undefined && key !== 'apiKey',
          ),
        )
      : undefined;

    const cacheKey = cacheManager.generateKey(url, cleanParams);

    if (isDevelopment) {
      console.log('🔍 Looking for cache key:', cacheKey);
    }

    const cachedData = cacheManager.get<T>(cacheKey);

    if (cachedData) {
      if (isDevelopment) {
        console.log('📦 Serving from cache:', cacheKey);
      }

      // Return cached data without making API call
      return {
        data: cachedData,
        status: 200,
        statusText: 'OK',
        config: { url, params: cleanParams },
        headers: {},
        request: {},
      } as AxiosResponse<T>;
    }

    // If not in cache, make the actual API call
    if (isDevelopment) {
      console.log('🌐 Fetching from API:', cacheKey);
    }

    return originalGet<T>(url, config);
  },
  writable: true,
  configurable: true,
});

export default api;
