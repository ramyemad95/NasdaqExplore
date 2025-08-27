export interface BaseComponentProps {
  testID?: string;
  accessibilityLabel?: string;
}

export interface StockFilters {
  market?: string;
  locale?: string;
  type?: string;
  search?: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginationParams {
  next_url?: string;
  count?: number;
}

export interface PaginationState {
  next_url?: string;
  count?: number;
  hasMore: boolean;
}

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  isRetryable: boolean;
}

export interface CacheConfig {
  ttl: number;
  key: string;
}

export interface RequestConfig {
  params?: Record<string, any>;
  headers?: Record<string, string>;
  timeout?: number;
}
