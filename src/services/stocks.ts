import api from './api';
import Config from 'react-native-config';

export type StocksQuery = {
  search?: string;
  market?: 'stocks' | 'crypto' | 'fx' | 'otc' | 'indices';
  active?: boolean;
  cusip?: string;
  cik?: string;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  next_url?: string;
};

export async function fetchTickers(params: StocksQuery) {
  try {
    // If next_url is provided, make a direct request to that URL
    if (params.next_url) {
      // Extract the URL and add API key as a parameter
      const url = new URL(params.next_url);
      const response = await api.get(url.toString());
      return response.data;
    }

    // Otherwise, construct the request with the base endpoint and parameters
    const response = await api.get('/v3/reference/tickers', {
      params: {
        market: params.market || 'stocks',
        active: true,
        limit: 100,
        sort: 'ticker',
        order: 'asc',
        ...params,
      },
    });
    return response.data;
  } catch (error: any) {
    // The API layer now provides enhanced error details through ErrorManager
    console.log('🚨 Stocks Service Error:', {
      message: error.message,
      isRetryable: error.isRetryable,
      errorType: error.errorType,
      status: error.response?.status,
    });

    // Re-throw the enhanced error for the Redux layer to handle
    throw error;
  }
}
