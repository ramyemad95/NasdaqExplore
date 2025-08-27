import { AxiosInstance, AxiosResponse } from 'axios';
import { apiClient } from './apiClient';
import { interceptorService } from './interceptors';
import { RequestConfig } from '../types';

// Setup interceptors for the API client
interceptorService.setupInterceptors(apiClient);

// Export the configured API client
export default apiClient;

// Export helper functions
export const createRequestConfig = (config?: RequestConfig) => {
  return {
    params: config?.params,
    headers: config?.headers,
    timeout: config?.timeout,
  };
};

// Export types for backward compatibility
export type { AxiosInstance, AxiosResponse };
