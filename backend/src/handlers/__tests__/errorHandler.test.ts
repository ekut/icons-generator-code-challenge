import { describe, it, expect } from 'vitest';
import {
  ErrorHandler,
  ValidationError,
  APIError,
  NetworkError,
  ErrorCategory,
  UserFacingError,
} from '../errorHandler.js';

/**
 * Unit tests for ErrorHandler
 * 
 * Tests error categorization, message generation, and recoverable vs non-recoverable errors
 * Requirements: 9.3
 */

describe('ErrorHandler', () => {
  describe('Error Categorization', () => {
    it('should categorize ValidationError correctly', () => {
      const error = new ValidationError('Prompt cannot be empty');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.VALIDATION);
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should categorize APIError with 401 as authentication error', () => {
      const error = new APIError('Unauthorized', 401);
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.statusCode).toBe(401);
      expect(result.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should categorize APIError with 429 as rate limit error', () => {
      const error = new APIError('Too many requests', 429, 'RATE_LIMIT', 60);
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.statusCode).toBe(429);
      expect(result.code).toBe('RATE_LIMIT_ERROR');
      expect(result.retryAfter).toBe(60);
    });

    it('should categorize APIError with 500 as server error', () => {
      const error = new APIError('Internal server error', 500);
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.SERVER);
      expect(result.statusCode).toBe(500);
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should categorize APIError with 503 as server error', () => {
      const error = new APIError('Service unavailable', 503);
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.SERVER);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should categorize APIError with 400 as API error', () => {
      const error = new APIError('Bad request', 400, 'BAD_REQUEST');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.API);
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe('BAD_REQUEST');
    });

    it('should categorize NetworkError with ETIMEDOUT correctly', () => {
      const error = new NetworkError('Request timed out', 'ETIMEDOUT');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.NETWORK);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('ETIMEDOUT');
    });

    it('should categorize NetworkError with ECONNRESET correctly', () => {
      const error = new NetworkError('Connection reset', 'ECONNRESET');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.NETWORK);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('ECONNRESET');
    });

    it('should categorize NetworkError with ENOTFOUND correctly', () => {
      const error = new NetworkError('Host not found', 'ENOTFOUND');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.NETWORK);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('ENOTFOUND');
    });

    it('should categorize NetworkError with ECONNREFUSED correctly', () => {
      const error = new NetworkError('Connection refused', 'ECONNREFUSED');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.NETWORK);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('ECONNREFUSED');
    });

    it('should categorize generic Error with validation keywords as validation error', () => {
      const error = new Error('Field is required');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.VALIDATION);
      expect(result.statusCode).toBe(400);
      expect(result.code).toBe('VALIDATION_ERROR');
    });

    it('should categorize generic Error with network keywords as network error', () => {
      const error = new Error('Network timeout occurred');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.NETWORK);
      expect(result.statusCode).toBe(503);
      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('should categorize generic Error with authentication keywords as authentication error', () => {
      const error = new Error('Unauthorized - API token missing');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.AUTHENTICATION);
      expect(result.statusCode).toBe(401);
      expect(result.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should categorize generic Error with rate limit keywords as rate limit error', () => {
      const error = new Error('Rate limit exceeded');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.RATE_LIMIT);
      expect(result.statusCode).toBe(429);
      expect(result.code).toBe('RATE_LIMIT_ERROR');
    });

    it('should categorize generic Error with status property as server error', () => {
      const error = new Error('Server error') as any;
      error.status = 502;
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.SERVER);
      expect(result.statusCode).toBe(502);
      expect(result.code).toBe('SERVER_ERROR');
    });

    it('should categorize unknown error types as unknown', () => {
      const error = { weird: 'object' };
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.UNKNOWN);
      expect(result.statusCode).toBe(500);
      expect(result.code).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Error Message Generation', () => {
    it('should generate user-friendly message for ValidationError', () => {
      const error = new ValidationError('Prompt cannot be empty');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Prompt cannot be empty');
    });

    it('should generate user-friendly message for authentication error', () => {
      const error = new APIError('Unauthorized', 401);
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Authentication failed. Please check your API credentials.');
    });

    it('should generate user-friendly message for rate limit error without retryAfter', () => {
      const error = new APIError('Too many requests', 429);
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Rate limit exceeded. Please try again in a moment.');
    });

    it('should generate user-friendly message for rate limit error with retryAfter', () => {
      const error = new APIError('Too many requests', 429, 'RATE_LIMIT', 120);
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Rate limit exceeded. Please try again in 120 seconds.');
      expect(result.retryAfter).toBe(120);
    });

    it('should generate user-friendly message for server error', () => {
      const error = new APIError('Internal server error', 500);
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Service temporarily unavailable. Please try again.');
    });

    it('should generate user-friendly message for ETIMEDOUT network error', () => {
      const error = new NetworkError('Timeout', 'ETIMEDOUT');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Request timed out. Please check your connection and try again.');
    });

    it('should generate user-friendly message for ECONNRESET network error', () => {
      const error = new NetworkError('Connection reset', 'ECONNRESET');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Connection was reset. Please try again.');
    });

    it('should generate user-friendly message for ENOTFOUND network error', () => {
      const error = new NetworkError('Host not found', 'ENOTFOUND');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Unable to reach the service. Please check your connection.');
    });

    it('should generate user-friendly message for ECONNREFUSED network error', () => {
      const error = new NetworkError('Connection refused', 'ECONNREFUSED');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Connection refused. The service may be unavailable.');
    });

    it('should generate generic network message for unknown network error code', () => {
      const error = new NetworkError('Unknown network error', 'EUNKNOWN');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Network error occurred. Please check your connection and try again.');
    });

    it('should use custom message from APIError when provided', () => {
      const error = new APIError('Custom error message', 400, 'CUSTOM_ERROR');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('Custom error message');
    });

    it('should generate default message for unknown error', () => {
      const error = { unknown: 'error' };
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should preserve error message from generic Error', () => {
      const error = new Error('Something went wrong');
      const result = ErrorHandler.handle(error);

      expect(result.message).toContain('Something went wrong');
    });
  });

  describe('Recoverable vs Non-Recoverable Errors', () => {
    it('should mark ValidationError as recoverable', () => {
      const error = new ValidationError('Invalid input');
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark authentication error (401) as non-recoverable', () => {
      const error = new APIError('Unauthorized', 401);
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(false);
    });

    it('should mark rate limit error (429) as recoverable', () => {
      const error = new APIError('Too many requests', 429);
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark server error (5xx) as recoverable', () => {
      const error = new APIError('Internal server error', 500);
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark network errors as recoverable', () => {
      const error = new NetworkError('Timeout', 'ETIMEDOUT');
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark client errors (4xx except 401) as recoverable', () => {
      const error = new APIError('Bad request', 400);
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark unknown errors as recoverable', () => {
      const error = { unknown: 'error' };
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark generic validation errors as recoverable', () => {
      const error = new Error('Field is required');
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(true);
    });

    it('should mark generic authentication errors as non-recoverable', () => {
      const error = new Error('Unauthorized - API key missing');
      const result = ErrorHandler.handle(error);

      expect(result.recoverable).toBe(false);
    });
  });

  describe('Helper Methods', () => {
    it('should return correct recoverable status via isRecoverable', () => {
      const recoverableError = new ValidationError('Invalid input');
      const nonRecoverableError = new APIError('Unauthorized', 401);

      expect(ErrorHandler.isRecoverable(recoverableError)).toBe(true);
      expect(ErrorHandler.isRecoverable(nonRecoverableError)).toBe(false);
    });

    it('should return correct status code via getStatusCode', () => {
      const validationError = new ValidationError('Invalid input');
      const authError = new APIError('Unauthorized', 401);
      const serverError = new APIError('Server error', 500);

      expect(ErrorHandler.getStatusCode(validationError)).toBe(400);
      expect(ErrorHandler.getStatusCode(authError)).toBe(401);
      expect(ErrorHandler.getStatusCode(serverError)).toBe(500);
    });

    it('should return correct error code via getErrorCode', () => {
      const validationError = new ValidationError('Invalid input');
      const authError = new APIError('Unauthorized', 401);
      const customError = new APIError('Custom', 400, 'CUSTOM_CODE');

      expect(ErrorHandler.getErrorCode(validationError)).toBe('VALIDATION_ERROR');
      expect(ErrorHandler.getErrorCode(authError)).toBe('AUTHENTICATION_ERROR');
      expect(ErrorHandler.getErrorCode(customError)).toBe('CUSTOM_CODE');
    });

    it('should return correct message via getMessage', () => {
      const error = new ValidationError('Prompt cannot be empty');
      const message = ErrorHandler.getMessage(error);

      expect(message).toBe('Prompt cannot be empty');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null error', () => {
      const result = ErrorHandler.handle(null);

      expect(result.type).toBe(ErrorCategory.UNKNOWN);
      expect(result.recoverable).toBe(true);
    });

    it('should handle undefined error', () => {
      const result = ErrorHandler.handle(undefined);

      expect(result.type).toBe(ErrorCategory.UNKNOWN);
      expect(result.recoverable).toBe(true);
    });

    it('should handle string error', () => {
      const result = ErrorHandler.handle('Something went wrong');

      expect(result.type).toBe(ErrorCategory.UNKNOWN);
      expect(result.recoverable).toBe(true);
    });

    it('should handle number error', () => {
      const result = ErrorHandler.handle(404);

      expect(result.type).toBe(ErrorCategory.UNKNOWN);
      expect(result.recoverable).toBe(true);
    });

    it('should handle Error with empty message', () => {
      const error = new Error('');
      const result = ErrorHandler.handle(error);

      expect(result.message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle APIError with statusCode property instead of status', () => {
      const error = new Error('Server error') as any;
      error.statusCode = 503;
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.SERVER);
      expect(result.statusCode).toBe(503);
    });

    it('should handle generic Error with multiple matching keywords', () => {
      const error = new Error('Invalid required field - validation failed');
      const result = ErrorHandler.handle(error);

      expect(result.type).toBe(ErrorCategory.VALIDATION);
    });

    it('should preserve details for unknown errors', () => {
      const error = { custom: 'data', nested: { value: 123 } };
      const result = ErrorHandler.handle(error);

      expect(result.details).toEqual(error);
    });
  });
});
