import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Config from 'react-native-config';
import { RequestConfig } from '../types';

// Environment check for logging
const isDevelopment = __DEV__;

// Create axios instance with basic configuration
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: 'https://api.polygon.io',
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add API key to all requests
  client.interceptors.request.use(
    config => {
      const params = config.params ?? {};
      config.params = { ...params, apiKey: Config.API_KEY };

      if (isDevelopment) {
        console.log('🚀 API Request:', {
          method: config.method,
          url: config.url,
          params: config.params,
        });
      }

      return config;
    },
    error => {
      if (isDevelopment) {
        console.error('❌ Request interceptor error:', error);
      }
      return Promise.reject(error);
    },
  );

  return client;
};

// Export the configured client
export const apiClient = createApiClient();

// Helper function to create request config
export const createRequestConfig = (
  config?: RequestConfig,
): AxiosRequestConfig => {
  return {
    params: config?.params,
    headers: config?.headers,
    timeout: config?.timeout,
  };
};

export default apiClient;
