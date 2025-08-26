export type ErrorType =
  | 'network'
  | 'rate_limit'
  | 'api'
  | 'auth'
  | 'validation'
  | 'other';

export interface ProcessedError {
  message: string;
  isRetryable: boolean;
  errorType: ErrorType;
  originalError?: any;
}

export interface ApiErrorResponse {
  error: string;
  request_id?: string;
  status?: string;
}

/**
 * Centralized error manager for processing and categorizing errors
 */
export class ErrorManager {
  /**
   * Process API errors and return user-friendly error information
   */
  static processApiError(error: any): ProcessedError {
    let errorMessage = 'An unexpected error occurred';
    let isRetryable = false;
    let errorType: ErrorType = 'other';

    // Handle API response errors
    if (error.response?.data?.error) {
      const apiError = error.response.data as ApiErrorResponse;
      errorMessage = apiError.error;

      // Classify error based on content and status
      if (this.isRateLimitError(apiError, error.response.status)) {
        errorType = 'rate_limit';
        isRetryable = true;
        errorMessage =
          'Rate limit exceeded. Please wait a moment before trying again.';
      } else if (this.isAuthError(apiError, error.response.status)) {
        errorType = 'auth';
        isRetryable = false;
        errorMessage = 'Authentication failed. Please check your API key.';
      } else if (this.isValidationError(apiError, error.response.status)) {
        errorType = 'validation';
        isRetryable = false;
        errorMessage = 'Invalid request. Please check your parameters.';
      } else if (this.isServerError(error.response.status)) {
        errorType = 'api';
        isRetryable = true;
        errorMessage = 'Server error. Please try again later.';
      } else if (this.isClientError(error.response.status)) {
        errorType = 'api';
        isRetryable = false;
        errorMessage = this.extractClientErrorMessage(apiError);
      }
    } else if (this.isNetworkError(error)) {
      // Handle network errors
      errorType = 'network';
      isRetryable = true;
      errorMessage =
        'Network error. Please check your connection and try again.';
    } else if (error.message) {
      // Handle other errors with messages
      errorMessage = error.message;
      errorType = this.classifyErrorByMessage(error.message);
      isRetryable = this.isRetryableByType(errorType);
    }

    return {
      message: errorMessage,
      isRetryable,
      errorType,
      originalError: error,
    };
  }

  /**
   * Check if error is a rate limit error
   */
  private static isRateLimitError(
    apiError: ApiErrorResponse,
    status?: number,
  ): boolean {
    return (
      status === 429 ||
      apiError.error.includes('exceeded the maximum requests per minute') ||
      apiError.error.includes('rate limit') ||
      apiError.error.includes('too many requests')
    );
  }

  /**
   * Check if error is an authentication error
   */
  private static isAuthError(
    apiError: ApiErrorResponse,
    status?: number,
  ): boolean {
    return (
      status === 401 ||
      status === 403 ||
      apiError.error.includes('unauthorized') ||
      apiError.error.includes('forbidden') ||
      apiError.error.includes('invalid api key') ||
      apiError.error.includes('authentication')
    );
  }

  /**
   * Check if error is a validation error
   */
  private static isValidationError(
    apiError: ApiErrorResponse,
    status?: number,
  ): boolean {
    return (
      status === 400 ||
      apiError.error.includes('invalid') ||
      apiError.error.includes('validation') ||
      apiError.error.includes('bad request')
    );
  }

  /**
   * Check if error is a server error (5xx)
   */
  private static isServerError(status?: number): boolean {
    return status !== undefined && status >= 500;
  }

  /**
   * Check if error is a client error (4xx)
   */
  private static isClientError(status?: number): boolean {
    return status !== undefined && status >= 400 && status < 500;
  }

  /**
   * Check if error is a network error
   */
  private static isNetworkError(error: any): boolean {
    return (
      error.code === 'NETWORK_ERROR' ||
      error.message?.includes('Network Error') ||
      error.message?.includes('timeout') ||
      error.message?.includes('connection')
    );
  }

  /**
   * Extract user-friendly message from client errors
   */
  private static extractClientErrorMessage(apiError: ApiErrorResponse): string {
    // Try to extract meaningful part of the error message
    const error = apiError.error;

    if (error.includes('not found')) {
      return 'The requested resource was not found.';
    } else if (error.includes('already exists')) {
      return 'The resource already exists.';
    } else if (error.includes('required')) {
      return 'Required information is missing.';
    } else if (error.includes('invalid format')) {
      return 'Invalid data format provided.';
    }

    // Default client error message
    return 'Invalid request. Please check your parameters and try again.';
  }

  /**
   * Classify error by message content
   */
  private static classifyErrorByMessage(message: string): ErrorType {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection')
    ) {
      return 'network';
    } else if (lowerMessage.includes('timeout')) {
      return 'network';
    } else if (
      lowerMessage.includes('auth') ||
      lowerMessage.includes('unauthorized')
    ) {
      return 'auth';
    } else if (
      lowerMessage.includes('validation') ||
      lowerMessage.includes('invalid')
    ) {
      return 'validation';
    }

    return 'other';
  }

  /**
   * Determine if error is retryable based on type
   */
  private static isRetryableByType(errorType: ErrorType): boolean {
    switch (errorType) {
      case 'network':
      case 'rate_limit':
        return true;
      case 'api':
        // Some API errors might be retryable, but we'll be conservative
        return false;
      case 'auth':
      case 'validation':
      case 'other':
      default:
        return false;
    }
  }

  /**
   * Format error for logging
   */
  static formatErrorForLogging(error: any, context?: string): string {
    const contextStr = context ? `[${context}] ` : '';

    if (error.response?.data) {
      return `${contextStr}API Error: ${
        error.response.status
      } - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      return `${contextStr}Error: ${error.message}`;
    } else {
      return `${contextStr}Unknown Error: ${JSON.stringify(error)}`;
    }
  }
}

export default ErrorManager;
