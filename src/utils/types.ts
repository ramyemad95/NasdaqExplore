// Branded types for better type safety
export type TickerSymbol = string & { readonly __brand: 'TickerSymbol' };
export type RequestId = string & { readonly __brand: 'RequestId' };
export type ApiKey = string & { readonly __brand: 'ApiKey' };

// Utility types for API responses
export type ApiResponse<T> = {
  results: T[];
  count?: number;
  next_url?: string;
  request_id?: RequestId;
};

// Error types with better categorization
export type ApiError = {
  error: string;
  request_id?: RequestId;
  status?: number;
  details?: Record<string, any>;
};

// Pagination types
export type PaginationParams = {
  limit?: number;
  offset?: number;
  next_url?: string;
};

// Filter types
export type StockFilters = {
  market?: string;
  locale?: string;
  type?: string;
  active?: boolean;
  currency_name?: string;
};

// Search types
export type SearchParams = {
  search?: string;
  filters?: StockFilters;
} & PaginationParams;

// Component prop types
export type BaseComponentProps = {
  testID?: string;
  accessible?: boolean;
  accessibilityLabel?: string;
};

// Theme types
export type ColorScheme = 'light' | 'dark' | 'system';
export type Language = 'en' | 'ar';

// Navigation types
export type NavigationParams = {
  stock?: any;
  filters?: StockFilters;
  search?: string;
};

// Performance types
export type PerformanceMetrics = {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
};
