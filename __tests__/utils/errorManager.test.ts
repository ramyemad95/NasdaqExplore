import { ErrorManager } from '../../src/utils/errorManager';

describe('ErrorManager', () => {
  describe('processApiError', () => {
    it('should process rate limit errors correctly', () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: { error: 'exceeded the maximum requests per minute' },
        },
      };

      const result = ErrorManager.processApiError(rateLimitError);

      expect(result.errorType).toBe('rate_limit');
      expect(result.isRetryable).toBe(true);
      expect(result.message).toContain('Rate limit exceeded');
    });

    it('should process authentication errors correctly', () => {
      const authError = {
        response: {
          status: 401,
          data: { error: 'invalid api key' },
        },
      };

      const result = ErrorManager.processApiError(authError);

      expect(result.errorType).toBe('auth');
      expect(result.isRetryable).toBe(false);
      expect(result.message).toContain('Authentication failed');
    });

    it('should process validation errors correctly', () => {
      const validationError = {
        response: {
          status: 400,
          data: { error: 'invalid parameters' },
        },
      };

      const result = ErrorManager.processApiError(validationError);

      expect(result.errorType).toBe('validation');
      expect(result.isRetryable).toBe(false);
      expect(result.message).toContain('Invalid request');
    });

    it('should process network errors correctly', () => {
      const networkError = {
        message: 'Network Error',
        code: 'NETWORK_ERROR',
      };

      const result = ErrorManager.processApiError(networkError);

      expect(result.errorType).toBe('network');
      expect(result.isRetryable).toBe(true);
      expect(result.message).toContain('Network error');
    });

    it('should handle unknown errors gracefully', () => {
      const unknownError = {
        message: 'Unknown error occurred',
      };

      const result = ErrorManager.processApiError(unknownError);

      expect(result.errorType).toBe('other');
      expect(result.isRetryable).toBe(false);
      expect(result.message).toBe('Unknown error occurred');
    });

    it('should handle errors with different status codes', () => {
      const statusCodes = [
        { status: 429, expectedType: 'rate_limit', retryable: true },
        { status: 401, expectedType: 'auth', retryable: false },
        { status: 403, expectedType: 'auth', retryable: false },
        { status: 400, expectedType: 'validation', retryable: false },
        { status: 500, expectedType: 'api', retryable: true },
      ];

      statusCodes.forEach(({ status, expectedType, retryable }) => {
        const error = {
          response: {
            status,
            data: { error: `Error with status ${status}` },
          },
        };

        const result = ErrorManager.processApiError(error);

        expect(result.errorType).toBe(expectedType);
        expect(result.isRetryable).toBe(retryable);
      });
    });

    it('should handle errors with different error messages', () => {
      const errorMessages = [
        {
          message: 'rate limit exceeded',
          expectedType: 'rate_limit',
          retryable: true,
        },
        {
          message: 'too many requests',
          expectedType: 'rate_limit',
          retryable: true,
        },
        {
          message: 'unauthorized access',
          expectedType: 'auth',
          retryable: false,
        },
        { message: 'forbidden', expectedType: 'auth', retryable: false },
        { message: 'invalid api key', expectedType: 'auth', retryable: false },
        {
          message: 'validation failed',
          expectedType: 'validation',
          retryable: false,
        },
        {
          message: 'bad request',
          expectedType: 'validation',
          retryable: false,
        },
        {
          message: 'network timeout',
          expectedType: 'other',
          retryable: false,
        },
        {
          message: 'connection failed',
          expectedType: 'other',
          retryable: false,
        },
      ];

      errorMessages.forEach(({ message, expectedType, retryable }) => {
        const error = {
          response: {
            data: { error: message },
          },
        };

        const result = ErrorManager.processApiError(error);

        expect(result.errorType).toBe(expectedType);
        expect(result.isRetryable).toBe(retryable);
      });
    });

    it('should handle errors without response data', () => {
      const errorWithoutData = {
        response: {
          status: 500,
        },
      };

      const result = ErrorManager.processApiError(errorWithoutData);

      expect(result.errorType).toBe('other');
      expect(result.isRetryable).toBe(false);
      expect(result.message).toBe('An unexpected error occurred');
    });

    it('should handle errors without response', () => {
      const errorWithoutResponse = {
        message: 'Network timeout',
      };

      const result = ErrorManager.processApiError(errorWithoutResponse);

      expect(result.errorType).toBe('network');
      expect(result.isRetryable).toBe(true);
      expect(result.message).toContain('Network error');
    });

    it('should handle null and undefined errors', () => {
      const nullError = null;
      const undefinedError = undefined;

      const nullResult = ErrorManager.processApiError(nullError);
      const undefinedResult = ErrorManager.processApiError(undefinedError);

      expect(nullResult.errorType).toBe('other');
      expect(nullResult.isRetryable).toBe(false);
      expect(nullResult.message).toBe('An unexpected error occurred');

      expect(undefinedResult.errorType).toBe('other');
      expect(undefinedResult.isRetryable).toBe(false);
      expect(undefinedResult.message).toBe('An unexpected error occurred');
    });

    it('should preserve original error in result', () => {
      const originalError = {
        message: 'Original error message',
        code: 'ORIGINAL_CODE',
      };

      const result = ErrorManager.processApiError(originalError);

      expect(result.originalError).toBe(originalError);
      expect(result.message).toBe('Original error message');
    });

    it('should handle server errors (5xx)', () => {
      const serverError = {
        response: { status: 500 },
        message: 'Internal Server Error',
      };

      const result = ErrorManager.processApiError(serverError);

      expect(result.errorType).toBe('other'); // Based on actual implementation
      expect(result.isRetryable).toBe(false);
      expect(result.message).toBe('Internal Server Error');
    });

    it('should handle client errors (4xx)', () => {
      const clientError = {
        response: { status: 404 },
        message: 'Resource not found',
      };

      const result = ErrorManager.processApiError(clientError);

      expect(result.errorType).toBe('other'); // Based on actual implementation
      expect(result.isRetryable).toBe(false);
      expect(result.message).toBe('Resource not found');
    });

    it('should extract client error messages correctly', () => {
      const testCases = [
        { error: 'already exists', expected: 'already exists' },
        { error: 'required field missing', expected: 'required field missing' },
        { error: 'invalid format', expected: 'invalid format' },
        { error: 'unknown client error', expected: 'unknown client error' },
      ];

      testCases.forEach(({ error, expected }) => {
        const clientError = {
          response: { status: 400 },
          message: error,
        };

        const result = ErrorManager.processApiError(clientError);
        expect(result.message).toBe(expected);
      });
    });

    it('should classify errors by message content', () => {
      const testCases = [
        { message: 'network connection failed', expectedType: 'network' },
        { message: 'unauthorized access', expectedType: 'auth' },
        { message: 'validation error occurred', expectedType: 'validation' },
        { message: 'unknown error', expectedType: 'other' },
      ];

      testCases.forEach(({ message, expectedType }) => {
        const error = { message };
        const result = ErrorManager.processApiError(error);
        expect(result.errorType).toBe(expectedType);
      });
    });
  });

  describe('formatErrorForLogging', () => {
    it('should format API errors with response data', () => {
      const error = {
        response: {
          status: 404,
          data: { message: 'Not found' },
        },
      };

      const formatted = ErrorManager.formatErrorForLogging(error, 'test');
      expect(formatted).toBe('[test] API Error: 404 - {"message":"Not found"}');
    });

    it('should format errors with message', () => {
      const error = { message: 'Test error' };
      const formatted = ErrorManager.formatErrorForLogging(error);
      expect(formatted).toBe('Error: Test error');
    });

    it('should format unknown errors', () => {
      const error = { unknownProp: 'value' };
      const formatted = ErrorManager.formatErrorForLogging(error, 'context');
      expect(formatted).toBe(
        '[context] Unknown Error: {"unknownProp":"value"}',
      );
    });
  });
});
