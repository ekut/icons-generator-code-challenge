/**
 * Error Handler Utility
 * 
 * Provides centralized error handling and mapping of errors to user-friendly messages.
 * Categorizes errors by type and determines if they are recoverable.
 * 
 * Requirements: 9.3
 */

/**
 * Error categories for classification
 */
export enum ErrorCategory {
  VALIDATION = 'validation',
  API = 'api',
  NETWORK = 'network',
  RATE_LIMIT = 'rate_limit',
  AUTHENTICATION = 'authentication',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

/**
 * User-facing error with categorization and recovery information
 */
export interface UserFacingError {
  type: ErrorCategory;
  message: string;
  recoverable: boolean;
  statusCode: number;
  code: string;
  retryAfter?: number;
  details?: any;
}

/**
 * Custom error class for validation errors
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
  public status: number;
  public code?: string;
  public retryAfter?: number;
  public response?: any;

  constructor(message: string, status: number, code?: string, retryAfter?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

/**
 * Custom error class for network errors
 */
export class NetworkError extends Error {
  public code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = 'NetworkError';
    this.code = code;
  }
}

/**
 * ErrorHandler class for centralized error handling
 * Maps various error types to user-friendly messages
 */
export class ErrorHandler {
  /**
   * Handle any error and convert it to a user-facing error
   * 
   * @param error - The error to handle
   * @returns UserFacingError with appropriate message and metadata
   */
  static handle(error: unknown): UserFacingError {
    // Handle ValidationError
    if (error instanceof ValidationError) {
      return this.handleValidationError(error);
    }

    // Handle APIError
    if (error instanceof APIError) {
      return this.handleAPIError(error);
    }

    // Handle NetworkError
    if (error instanceof NetworkError) {
      return this.handleNetworkError(error);
    }

    // Handle generic Error objects
    if (error instanceof Error) {
      return this.handleGenericError(error);
    }

    // Handle unknown error types
    return this.handleUnknownError(error);
  }

  /**
   * Handle validation errors
   */
  private static handleValidationError(error: ValidationError): UserFacingError {
    return {
      type: ErrorCategory.VALIDATION,
      message: error.message,
      recoverable: true,
      statusCode: 400,
      code: 'VALIDATION_ERROR',
    };
  }

  /**
   * Handle API errors with specific status codes
   */
  private static handleAPIError(error: APIError): UserFacingError {
    // Handle authentication errors (401)
    if (error.status === 401) {
      return {
        type: ErrorCategory.AUTHENTICATION,
        message: 'Authentication failed. Please check your API credentials.',
        recoverable: false,
        statusCode: 401,
        code: 'AUTHENTICATION_ERROR',
      };
    }

    // Handle rate limiting (429)
    if (error.status === 429) {
      const retryMessage = error.retryAfter
        ? ` Please try again in ${error.retryAfter} seconds.`
        : ' Please try again in a moment.';

      return {
        type: ErrorCategory.RATE_LIMIT,
        message: `Rate limit exceeded.${retryMessage}`,
        recoverable: true,
        statusCode: 429,
        code: 'RATE_LIMIT_ERROR',
        retryAfter: error.retryAfter,
      };
    }

    // Handle server errors (5xx)
    if (error.status >= 500 && error.status < 600) {
      return {
        type: ErrorCategory.SERVER,
        message: 'Service temporarily unavailable. Please try again.',
        recoverable: true,
        statusCode: error.status,
        code: 'SERVER_ERROR',
      };
    }

    // Handle client errors (4xx)
    if (error.status >= 400 && error.status < 500) {
      return {
        type: ErrorCategory.API,
        message: error.message || 'Invalid request. Please check your input.',
        recoverable: true,
        statusCode: error.status,
        code: error.code || 'API_ERROR',
      };
    }

    // Default API error handling
    return {
      type: ErrorCategory.API,
      message: error.message || 'An error occurred while communicating with the API.',
      recoverable: true,
      statusCode: error.status,
      code: error.code || 'API_ERROR',
    };
  }

  /**
   * Handle network errors (timeouts, connection issues)
   */
  private static handleNetworkError(error: NetworkError): UserFacingError {
    const networkMessages: Record<string, string> = {
      ETIMEDOUT: 'Request timed out. Please check your connection and try again.',
      ECONNRESET: 'Connection was reset. Please try again.',
      ENOTFOUND: 'Unable to reach the service. Please check your connection.',
      ECONNREFUSED: 'Connection refused. The service may be unavailable.',
    };

    const message = error.code && networkMessages[error.code]
      ? networkMessages[error.code]
      : 'Network error occurred. Please check your connection and try again.';

    return {
      type: ErrorCategory.NETWORK,
      message,
      recoverable: true,
      statusCode: 503,
      code: error.code || 'NETWORK_ERROR',
    };
  }

  /**
   * Handle generic Error objects
   * Attempts to categorize based on error message and properties
   */
  private static handleGenericError(error: Error): UserFacingError {
    const errorMessage = error.message.toLowerCase();

    // Check for validation-related errors
    if (
      errorMessage.includes('required') ||
      errorMessage.includes('invalid') ||
      errorMessage.includes('validation') ||
      errorMessage.includes('must be') ||
      errorMessage.includes('cannot be empty')
    ) {
      return {
        type: ErrorCategory.VALIDATION,
        message: error.message,
        recoverable: true,
        statusCode: 400,
        code: 'VALIDATION_ERROR',
      };
    }

    // Check for network-related errors
    if (
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('connection') ||
      errorMessage.includes('econnreset') ||
      errorMessage.includes('etimedout')
    ) {
      return {
        type: ErrorCategory.NETWORK,
        message: 'Network error occurred. Please try again.',
        recoverable: true,
        statusCode: 503,
        code: 'NETWORK_ERROR',
      };
    }

    // Check for authentication errors
    if (
      errorMessage.includes('unauthorized') ||
      errorMessage.includes('authentication') ||
      errorMessage.includes('api token') ||
      errorMessage.includes('api key')
    ) {
      return {
        type: ErrorCategory.AUTHENTICATION,
        message: 'Authentication failed. Please check your API credentials.',
        recoverable: false,
        statusCode: 401,
        code: 'AUTHENTICATION_ERROR',
      };
    }

    // Check for rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return {
        type: ErrorCategory.RATE_LIMIT,
        message: 'Rate limit exceeded. Please try again in a moment.',
        recoverable: true,
        statusCode: 429,
        code: 'RATE_LIMIT_ERROR',
      };
    }

    // Check if error object has status code property
    const errorObj = error as any;
    if (errorObj.status || errorObj.statusCode) {
      const status = errorObj.status || errorObj.statusCode;
      
      if (status >= 500) {
        return {
          type: ErrorCategory.SERVER,
          message: 'Service temporarily unavailable. Please try again.',
          recoverable: true,
          statusCode: status,
          code: 'SERVER_ERROR',
        };
      }
      
      if (status === 429) {
        return {
          type: ErrorCategory.RATE_LIMIT,
          message: 'Rate limit exceeded. Please try again in a moment.',
          recoverable: true,
          statusCode: 429,
          code: 'RATE_LIMIT_ERROR',
          retryAfter: errorObj.retryAfter,
        };
      }
      
      if (status === 401) {
        return {
          type: ErrorCategory.AUTHENTICATION,
          message: 'Authentication failed. Please check your API credentials.',
          recoverable: false,
          statusCode: 401,
          code: 'AUTHENTICATION_ERROR',
        };
      }
    }

    // Default to unknown error
    return {
      type: ErrorCategory.UNKNOWN,
      message: error.message || 'An unexpected error occurred. Please try again.',
      recoverable: true,
      statusCode: 500,
      code: 'INTERNAL_ERROR',
    };
  }

  /**
   * Handle completely unknown error types
   */
  private static handleUnknownError(error: unknown): UserFacingError {
    console.error('Unknown error type:', error);

    return {
      type: ErrorCategory.UNKNOWN,
      message: 'An unexpected error occurred. Please try again.',
      recoverable: true,
      statusCode: 500,
      code: 'UNKNOWN_ERROR',
      details: error,
    };
  }

  /**
   * Check if an error is recoverable (user can retry)
   * 
   * @param error - Error to check
   * @returns true if the error is recoverable
   */
  static isRecoverable(error: unknown): boolean {
    const userError = this.handle(error);
    return userError.recoverable;
  }

  /**
   * Get HTTP status code for an error
   * 
   * @param error - Error to get status code for
   * @returns HTTP status code
   */
  static getStatusCode(error: unknown): number {
    const userError = this.handle(error);
    return userError.statusCode;
  }

  /**
   * Get error code for an error
   * 
   * @param error - Error to get code for
   * @returns Error code string
   */
  static getErrorCode(error: unknown): string {
    const userError = this.handle(error);
    return userError.code;
  }

  /**
   * Get user-friendly message for an error
   * 
   * @param error - Error to get message for
   * @returns User-friendly error message
   */
  static getMessage(error: unknown): string {
    const userError = this.handle(error);
    return userError.message;
  }
}
