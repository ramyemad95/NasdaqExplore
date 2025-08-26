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

// Error classification rules
const ERROR_RULES = {
  rate_limit: {
    statuses: [429] as const,
    keywords: [
      'exceeded the maximum requests per minute',
      'rate limit',
      'too many requests',
    ] as const,
    isRetryable: true,
    defaultMessage:
      'Rate limit exceeded. Please wait a moment before trying again.',
  },
  auth: {
    statuses: [401, 403] as const,
    keywords: [
      'unauthorized',
      'forbidden',
      'invalid api key',
      'authentication',
    ] as const,
    isRetryable: false,
    defaultMessage: 'Authentication failed. Please check your API key.',
  },
  validation: {
    statuses: [400] as const,
    keywords: ['invalid', 'validation', 'bad request'] as const,
    isRetryable: false,
    defaultMessage: 'Invalid request. Please check your parameters.',
  },
  network: {
    keywords: ['network', 'connection', 'timeout'] as const,
    isRetryable: true,
    defaultMessage:
      'Network error. Please check your connection and try again.',
  },
} as const;

type ErrorRule = (typeof ERROR_RULES)[keyof typeof ERROR_RULES];

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
      const status = error.response.status;

      const classification = this.classifyError(apiError.error, status);
      errorType = classification.type;
      isRetryable = classification.isRetryable;
      errorMessage = classification.message;
    } else if (this.isNetworkError(error)) {
      errorType = 'network';
      isRetryable = true;
      errorMessage = ERROR_RULES.network.defaultMessage;
    } else if (error.message) {
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
   * Classify error based on status and message content
   */
  private static classifyError(
    errorMessage: string,
    status?: number,
  ): { type: ErrorType; isRetryable: boolean; message: string } {
    const lowerMessage = errorMessage.toLowerCase();

    for (const [type, rules] of Object.entries(ERROR_RULES)) {
      if (type === 'network') continue; // Network errors are handled separately

      const errorRule = rules as ErrorRule & { statuses?: readonly number[] };
      const statusMatch =
        errorRule.statuses && status && errorRule.statuses.includes(status);
      const keywordMatch = errorRule.keywords.some(keyword =>
        lowerMessage.includes(keyword.toLowerCase()),
      );

      if (statusMatch || keywordMatch) {
        return {
          type: type as ErrorType,
          isRetryable: errorRule.isRetryable,
          message: errorRule.defaultMessage,
        };
      }
    }

    // Handle server errors (5xx)
    if (status && status >= 500) {
      return {
        type: 'api',
        isRetryable: true,
        message: 'Server error. Please try again later.',
      };
    }

    // Handle client errors (4xx)
    if (status && status >= 400 && status < 500) {
      return {
        type: 'api',
        isRetryable: false,
        message: this.extractClientErrorMessage(errorMessage),
      };
    }

    return {
      type: 'other',
      isRetryable: false,
      message: 'An unexpected error occurred.',
    };
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
  private static extractClientErrorMessage(error: string): string {
    const lowerError = error.toLowerCase();

    if (lowerError.includes('not found')) {
      return 'The requested resource was not found.';
    } else if (lowerError.includes('already exists')) {
      return 'The resource already exists.';
    } else if (lowerError.includes('required')) {
      return 'Required information is missing.';
    } else if (lowerError.includes('invalid format')) {
      return 'Invalid data format provided.';
    }

    return 'Invalid request. Please check your parameters and try again.';
  }

  /**
   * Classify error by message content
   */
  private static classifyErrorByMessage(message: string): ErrorType {
    const lowerMessage = message.toLowerCase();

    if (
      lowerMessage.includes('network') ||
      lowerMessage.includes('connection') ||
      lowerMessage.includes('timeout')
    ) {
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
    return ['network', 'rate_limit'].includes(errorType);
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
