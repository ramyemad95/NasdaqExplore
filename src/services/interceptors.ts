import {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { cacheService } from './cacheService';
import { ErrorService } from './errorService';
import { RequestConfig } from '../types';

// Extend the AxiosRequestConfig to include retry information
interface RetryConfig extends InternalAxiosRequestConfig {
  __retry?: boolean;
  __retryCount?: number;
}

export class InterceptorService {
  private static instance: InterceptorService;
  private isDevelopment = __DEV__;

  private constructor() {}

  static getInstance(): InterceptorService {
    if (!InterceptorService.instance) {
      InterceptorService.instance = new InterceptorService();
    }
    return InterceptorService.instance;
  }

  /**
   * Setup request interceptors
   */
  setupRequestInterceptors(api: AxiosInstance): void {
    api.interceptors.request.use(
      async config => {
        // For GET requests, check cache first
        if (config.method?.toLowerCase() === 'get') {
          const cacheKey = cacheService.generateKey(
            config.url || '',
            config.params,
          );

          if (this.isDevelopment) {
            console.log('🔍 Looking for cache key:', cacheKey);
          }

          const cachedData = cacheService.get(cacheKey);

          if (cachedData) {
            if (this.isDevelopment) {
              console.log('📦 Serving from cache:', cacheKey);
            }

            // Store cached data in config for response interceptor to use
            (config as any).__cachedData = cachedData;
            (config as any).__isCachedRequest = true;
          } else {
            if (this.isDevelopment) {
              console.log('🌐 Fetching from API:', cacheKey);
            }
          }
        }

        if (this.isDevelopment) {
          console.log('🚀 API Request:', {
            method: config.method,
            url: config.url,
            params: config.params,
          });
        }

        return config;
      },
      async error => {
        if (this.isDevelopment) {
          console.error('❌ Request interceptor error:', error);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Setup response interceptors
   */
  setupResponseInterceptors(api: AxiosInstance): void {
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
          this.cacheResponse(response);
        }

        if (this.isDevelopment) {
          console.log('✅ API Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        if (this.isDevelopment) {
          console.log('❌ API Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            message: error.message,
          });
        }

        // Retry logic for network errors and rate limits
        const original = error.config as RetryConfig;
        if (!original || original.__retry) {
          // Process the error through ErrorService and enhance it
          const processedError = ErrorService.processApiError(error);

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
  }

  /**
   * Cache the response data
   */
  private cacheResponse(response: AxiosResponse): void {
    try {
      // Generate cache key from the original request (before API key was added)
      const originalParams = { ...response.config.params };
      delete originalParams.apiKey; // Remove API key for consistent caching

      // Clean up params by removing undefined values
      const cleanParams = originalParams
        ? Object.fromEntries(
            Object.entries(originalParams).filter(
              ([_, value]) => value !== undefined,
            ),
          )
        : undefined;

      const cacheKey = cacheService.generateKey(
        response.config.url || '',
        cleanParams,
      );

      if (
        cacheService.shouldCache(
          response.config.method || '',
          response.config.url || '',
        )
      ) {
        const ttl = cacheService.getDefaultTTL(response.config.url || '');
        cacheService.set(cacheKey, response.data, ttl);

        if (this.isDevelopment) {
          console.log('💾 Cached response for:', cacheKey);
        }
      }
    } catch (error) {
      if (this.isDevelopment) {
        console.error('❌ Error caching response:', error);
      }
    }
  }

  /**
   * Override the get method to add caching
   */
  overrideGetMethod(api: AxiosInstance): void {
    const originalGet = api.get.bind(api);

    Object.defineProperty(api, 'get', {
      value: async function <T = any>(
        url: string,
        config?: RequestConfig,
      ): Promise<AxiosResponse<T>> {
        const cacheKey = cacheService.generateKey(url, config?.params);
        const cachedData = cacheService.get<T>(cacheKey);

        if (cachedData) {
          if (InterceptorService.getInstance().isDevelopment) {
            console.log('📦 Serving from cache:', cacheKey);
          }

          // Return cached data without making API call
          return {
            data: cachedData,
            status: 200,
            statusText: 'OK',
            config: { url, params: config?.params },
            headers: {},
            request: {},
          } as AxiosResponse<T>;
        }

        // If not in cache, make the actual API call
        if (InterceptorService.getInstance().isDevelopment) {
          console.log('🌐 Fetching from API:', cacheKey);
        }

        return originalGet<T>(url, config);
      },
      writable: true,
      configurable: true,
    });
  }

  /**
   * Setup all interceptors for an API instance
   */
  setupInterceptors(api: AxiosInstance): void {
    this.setupRequestInterceptors(api);
    this.setupResponseInterceptors(api);
    this.overrideGetMethod(api);
  }
}

export const interceptorService = InterceptorService.getInstance();
export default interceptorService;
