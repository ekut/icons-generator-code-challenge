import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fc from 'fast-check';
import { ErrorDisplay } from './ErrorDisplay';
import type { APIError } from '../types';

/**
 * Property-Based Tests for ErrorDisplay component
 * 
 * Feature: icon-set-generator, Property 8: Error State Handling
 * 
 * For any failed generation request, the system should display an error message 
 * and provide a retry option.
 * 
 * Validates: Requirements 4.4, 8.3, 9.3
 */

describe('ErrorDisplay - Property-Based Tests', () => {
  /**
   * Property 8: Error State Handling
   * 
   * For any error (string or APIError), the system should:
   * 1. Display the error message
   * 2. Show a retry button for recoverable errors
   * 3. Call the retry handler when retry is clicked
   */
  it('displays error message and retry button for any recoverable error', async () => {
    // Define recoverable error codes
    const recoverableErrorCodes = [
      'RATE_LIMIT_ERROR',
      'SERVER_ERROR',
      'NETWORK_ERROR',
      'API_ERROR',
      'UNKNOWN_ERROR',
    ];

    // Generator for recoverable APIError objects
    const recoverableAPIErrorGenerator = fc.record({
      code: fc.constantFrom(...recoverableErrorCodes),
      message: fc.string({ minLength: 1, maxLength: 100 }),
      details: fc.option(fc.anything(), { nil: undefined }),
    });

    // Generator for recoverable string errors (not containing auth keywords)
    const recoverableStringErrorGenerator = fc
      .string({ minLength: 1, maxLength: 100 })
      .filter(s => {
        const trimmed = s.trim();
        if (trimmed.length === 0) return false; // Exclude whitespace-only strings
        const lower = s.toLowerCase();
        return !lower.includes('authentication') && !lower.includes('unauthorized') && !lower.includes('not authorized');
      });

    // Generator for any recoverable error (string or APIError)
    const recoverableErrorGenerator = fc.oneof(
      recoverableAPIErrorGenerator,
      recoverableStringErrorGenerator
    );

    await fc.assert(
      fc.asyncProperty(recoverableErrorGenerator, async (error) => {
        // Create a mock retry handler
        const onRetry = vi.fn();

        // Render the ErrorDisplay component with the error
        const { unmount } = render(
          <ErrorDisplay error={error} onRetry={onRetry} />
        );

        try {
          // 1. Verify error message is displayed
          const errorMessage = typeof error === 'string' ? error : error.message;
          // Use a flexible matcher that handles whitespace normalization
          const alert = screen.getByRole('alert');
          expect(alert.textContent).toContain(errorMessage.trim());

          // 2. Verify the error alert is present
          expect(alert).toBeInTheDocument();

          // 3. Verify retry button is present for recoverable errors
          const retryButton = screen.getByRole('button', { name: /retry/i });
          expect(retryButton).toBeInTheDocument();

          // 4. Verify retry button is clickable
          expect(retryButton).not.toBeDisabled();

          // 5. Click the retry button
          fireEvent.click(retryButton);

          // 6. Verify the retry handler was called exactly once
          expect(onRetry).toHaveBeenCalledTimes(1);
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Error State Handling - Non-recoverable errors
   * 
   * For any non-recoverable error, the system should:
   * 1. Display the error message
   * 2. NOT show a retry button
   */
  it('displays error message without retry button for non-recoverable errors', async () => {
    // Generator for non-recoverable APIError objects (authentication errors)
    const nonRecoverableAPIErrorGenerator = fc.record({
      code: fc.constantFrom('AUTHENTICATION_ERROR', 'AUTHORIZATION_ERROR'),
      message: fc.string({ minLength: 1, maxLength: 100 }),
      details: fc.option(fc.anything(), { nil: undefined }),
    });

    // Generator for non-recoverable string errors (containing auth keywords)
    const nonRecoverableStringErrorGenerator = fc.oneof(
      fc.constant('Authentication failed'),
      fc.constant('Unauthorized access'),
      fc.constant('Invalid authentication token'),
      fc.constant('User is not authorized'),
    );

    // Generator for any non-recoverable error
    const nonRecoverableErrorGenerator = fc.oneof(
      nonRecoverableAPIErrorGenerator,
      nonRecoverableStringErrorGenerator
    );

    await fc.assert(
      fc.asyncProperty(nonRecoverableErrorGenerator, async (error) => {
        // Create a mock retry handler
        const onRetry = vi.fn();

        // Render the ErrorDisplay component with the error
        const { unmount } = render(
          <ErrorDisplay error={error} onRetry={onRetry} />
        );

        try {
          // 1. Verify error message is displayed
          const errorMessage = typeof error === 'string' ? error : error.message;
          // Use a flexible matcher that handles whitespace normalization
          const alert = screen.getByRole('alert');
          expect(alert.textContent).toContain(errorMessage.trim());

          // 2. Verify the error alert is present
          expect(alert).toBeInTheDocument();

          // 3. Verify retry button is NOT present for non-recoverable errors
          const retryButton = screen.queryByRole('button', { name: /retry/i });
          expect(retryButton).not.toBeInTheDocument();

          // 4. Verify the retry handler was never called
          expect(onRetry).not.toHaveBeenCalled();
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Error State Handling - Dismiss functionality
   * 
   * For any error with a dismiss handler, the system should:
   * 1. Display the error message
   * 2. Show a dismiss button
   * 3. Call the dismiss handler when dismiss is clicked
   */
  it('displays dismiss button and calls handler for any error with onDismiss', async () => {
    // Generator for any error (string or APIError)
    const anyErrorGenerator = fc.oneof(
      fc.record({
        code: fc.string({ minLength: 1, maxLength: 50 }),
        message: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        details: fc.option(fc.anything(), { nil: undefined }),
      }),
      fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0)
    );

    await fc.assert(
      fc.asyncProperty(anyErrorGenerator, async (error) => {
        // Create a mock dismiss handler
        const onDismiss = vi.fn();

        // Render the ErrorDisplay component with the error
        const { unmount } = render(
          <ErrorDisplay error={error} onDismiss={onDismiss} />
        );

        try {
          // 1. Verify error message is displayed
          const errorMessage = typeof error === 'string' ? error : error.message;
          // Use a flexible matcher that handles whitespace normalization
          const alert = screen.getByRole('alert');
          expect(alert.textContent).toContain(errorMessage.trim());

          // 2. Verify dismiss button is present
          const dismissButton = screen.getByRole('button', { name: /dismiss/i });
          expect(dismissButton).toBeInTheDocument();

          // 3. Verify dismiss button is clickable
          expect(dismissButton).not.toBeDisabled();

          // 4. Click the dismiss button
          fireEvent.click(dismissButton);

          // 5. Verify the dismiss handler was called exactly once
          expect(onDismiss).toHaveBeenCalledTimes(1);
        } finally {
          // Clean up after each test run
          unmount();
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property 8: Error State Handling - Null error
   * 
   * When error is null, the system should not render anything.
   */
  it('renders nothing when error is null', () => {
    const { container } = render(<ErrorDisplay error={null} />);
    expect(container.firstChild).toBeNull();
  });

  /**
   * Property 8: Error State Handling - Error severity
   * 
   * For any error, the system should display appropriate severity:
   * - Warning for RATE_LIMIT_ERROR and VALIDATION_ERROR
   * - Error for all other error types
   */
  it('displays appropriate severity for different error types', async () => {
    // Generator for warning-level errors
    const warningErrorGenerator = fc.oneof(
      fc.record({
        code: fc.constantFrom('RATE_LIMIT_ERROR', 'VALIDATION_ERROR'),
        message: fc.string({ minLength: 1, maxLength: 100 }),
      }),
      fc.oneof(
        fc.constant('Rate limit exceeded'),
        fc.constant('Warning: Invalid input'),
      )
    );

    // Generator for error-level errors
    const errorLevelErrorGenerator = fc.oneof(
      fc.record({
        code: fc.constantFrom('SERVER_ERROR', 'NETWORK_ERROR', 'API_ERROR', 'UNKNOWN_ERROR'),
        message: fc.string({ minLength: 1, maxLength: 100 }),
      }),
      fc.string({ minLength: 1, maxLength: 100 }).filter(s => {
        const lower = s.toLowerCase();
        return !lower.includes('warning') && !lower.includes('rate limit');
      })
    );

    // Test warning-level errors
    await fc.assert(
      fc.asyncProperty(warningErrorGenerator, async (error) => {
        const { unmount } = render(<ErrorDisplay error={error} />);

        try {
          // Verify "Warning" heading is displayed
          expect(screen.getByText('Warning')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: 50 }
    );

    // Test error-level errors
    await fc.assert(
      fc.asyncProperty(errorLevelErrorGenerator, async (error) => {
        const { unmount } = render(<ErrorDisplay error={error} />);

        try {
          // Verify "Error" heading is displayed
          expect(screen.getByText('Error')).toBeInTheDocument();
        } finally {
          unmount();
        }
      }),
      { numRuns: 50 }
    );
  });
});
