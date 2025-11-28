import { AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import type { APIError } from '../types';

/**
 * ErrorDisplay Component
 * 
 * Displays user-friendly error messages with appropriate styling and actions.
 * Shows a retry button for recoverable errors.
 * 
 * Requirements: 4.4, 8.3
 */

interface ErrorDisplayProps {
  error: string | APIError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
}

/**
 * Determine if an error is recoverable based on its error code
 */
function isRecoverableError(error: string | APIError): boolean {
  if (typeof error === 'string') {
    // String errors are generally recoverable unless they indicate auth issues
    const lowerError = error.toLowerCase();
    return !lowerError.includes('authentication') && !lowerError.includes('unauthorized') && !lowerError.includes('not authorized');
  }

  // APIError with specific codes
  const recoverableCodes = [
    'RATE_LIMIT_ERROR',
    'SERVER_ERROR',
    'NETWORK_ERROR',
    'API_ERROR',
    'UNKNOWN_ERROR',
  ];

  return recoverableCodes.includes(error.code);
}

/**
 * Get error message from error object or string
 */
function getErrorMessage(error: string | APIError): string {
  if (typeof error === 'string') {
    return error;
  }
  return error.message;
}

/**
 * Get error severity based on error type
 */
function getErrorSeverity(error: string | APIError): 'error' | 'warning' {
  if (typeof error === 'string') {
    const lowerError = error.toLowerCase();
    if (lowerError.includes('warning') || lowerError.includes('rate limit')) {
      return 'warning';
    }
    return 'error';
  }

  // APIError with specific codes
  if (error.code === 'RATE_LIMIT_ERROR' || error.code === 'VALIDATION_ERROR') {
    return 'warning';
  }

  return 'error';
}

export function ErrorDisplay({ error, onRetry, onDismiss }: ErrorDisplayProps) {
  if (!error) {
    return null;
  }

  const message = getErrorMessage(error);
  const isRecoverable = isRecoverableError(error);
  const severity = getErrorSeverity(error);

  // Determine styling based on severity
  const bgColor = severity === 'error' ? 'bg-red-50' : 'bg-yellow-50';
  const borderColor = severity === 'error' ? 'border-red-200' : 'border-yellow-200';
  const textColor = severity === 'error' ? 'text-red-800' : 'text-yellow-800';
  const iconColor = severity === 'error' ? 'text-red-500' : 'text-yellow-500';

  return (
    <div
      className={`${bgColor} ${borderColor} border rounded-lg p-3 sm:p-4 mb-4`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start">
        {/* Error Icon */}
        <div className={`flex-shrink-0 ${iconColor}`}>
          {severity === 'error' ? (
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          ) : (
            <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          )}
        </div>

        {/* Error Content */}
        <div className="ml-2 sm:ml-3 flex-1">
          <h3 className={`text-xs sm:text-sm font-medium ${textColor}`}>
            {severity === 'error' ? 'Error' : 'Warning'}
          </h3>
          <div className={`mt-1 sm:mt-2 text-xs sm:text-sm ${textColor}`}>
            <p>{message}</p>
          </div>

          {/* Action Buttons */}
          {(isRecoverable || onDismiss) && (
            <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {isRecoverable && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className={`inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm leading-4 font-medium rounded-md ${
                    severity === 'error'
                      ? 'text-red-700 bg-red-100 hover:bg-red-200 hover:shadow-sm focus:ring-red-500'
                      : 'text-yellow-700 bg-yellow-100 hover:bg-yellow-200 hover:shadow-sm focus:ring-yellow-500'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 active:scale-95`}
                >
                  <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" aria-hidden="true" />
                  Retry
                </button>
              )}

              {onDismiss && (
                <button
                  type="button"
                  onClick={onDismiss}
                  className={`inline-flex items-center justify-center px-3 py-2 border ${
                    severity === 'error'
                      ? 'border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400'
                      : 'border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400'
                  } text-xs sm:text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    severity === 'error' ? 'focus:ring-red-500' : 'focus:ring-yellow-500'
                  } transition-all duration-200 hover:shadow-sm active:scale-95`}
                >
                  Dismiss
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
