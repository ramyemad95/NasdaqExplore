import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import Config from 'react-native-config';
import ErrorManager from '../utils/errorManager';

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
  config => {
    // Add API key to all requests
    const params = config.params ?? {};
    config.params = { ...params, apiKey: Config.API_KEY };

    console.log('🚀 API Request:', {
      method: config.method,
      url: config.url,
      params: config.params,
      data: config.data,
      headers: config.headers,
    });

    return config;
  },
  error => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log('✅ API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
      headers: response.headers,
    });

    return response;
  },
  async (error: AxiosError) => {
    console.log('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

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

export default api;
