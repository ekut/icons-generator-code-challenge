import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDisplay } from './ErrorDisplay';
import type { APIError } from '../types';

/**
 * Unit tests for ErrorDisplay component
 * 
 * Requirements: 4.4, 8.3
 */

describe('ErrorDisplay', () => {
  describe('Basic Rendering', () => {
    it('should not render when error is null', () => {
      const { container } = render(<ErrorDisplay error={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render error message when error is a string', () => {
      render(<ErrorDisplay error="Something went wrong" />);
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should render error message when error is an APIError object', () => {
      const apiError: APIError = {
        code: 'SERVER_ERROR',
        message: 'Service temporarily unavailable',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Service temporarily unavailable')).toBeInTheDocument();
    });

    it('should display "Error" heading for error severity', () => {
      render(<ErrorDisplay error="Critical error" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should display "Warning" heading for warning severity', () => {
      const apiError: APIError = {
        code: 'RATE_LIMIT_ERROR',
        message: 'Rate limit exceeded',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  describe('Retry Functionality', () => {
    it('should show retry button for recoverable errors', () => {
      const apiError: APIError = {
        code: 'SERVER_ERROR',
        message: 'Service temporarily unavailable',
      };
      render(<ErrorDisplay error={apiError} onRetry={vi.fn()} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should not show retry button when onRetry is not provided', () => {
      const apiError: APIError = {
        code: 'SERVER_ERROR',
        message: 'Service temporarily unavailable',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const apiError: APIError = {
        code: 'NETWORK_ERROR',
        message: 'Network error occurred',
      };
      
      render(<ErrorDisplay error={apiError} onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it('should not show retry button for non-recoverable errors', () => {
      const apiError: APIError = {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      };
      render(<ErrorDisplay error={apiError} onRetry={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when onDismiss is provided', () => {
      render(<ErrorDisplay error="Some error" onDismiss={vi.fn()} />);
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should not show dismiss button when onDismiss is not provided', () => {
      render(<ErrorDisplay error="Some error" />);
      expect(screen.queryByRole('button', { name: /dismiss/i })).not.toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup();
      const onDismiss = vi.fn();
      
      render(<ErrorDisplay error="Some error" onDismiss={onDismiss} />);
      
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      await user.click(dismissButton);
      
      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Type Handling', () => {
    it('should handle validation errors as warnings', () => {
      const apiError: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should handle rate limit errors as warnings', () => {
      const apiError: APIError = {
        code: 'RATE_LIMIT_ERROR',
        message: 'Too many requests',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should handle server errors as errors', () => {
      const apiError: APIError = {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should handle network errors as errors', () => {
      const apiError: APIError = {
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should handle unknown errors as errors', () => {
      const apiError: APIError = {
        code: 'UNKNOWN_ERROR',
        message: 'Something unexpected happened',
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have role="alert" for screen readers', () => {
      render(<ErrorDisplay error="Error message" />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have aria-live="assertive" for immediate announcement', () => {
      const { container } = render(<ErrorDisplay error="Error message" />);
      const alert = container.querySelector('[aria-live="assertive"]');
      expect(alert).toBeInTheDocument();
    });
  });

  describe('Additional Error Scenarios', () => {
    it('should not show retry button for string errors containing "authentication"', () => {
      render(<ErrorDisplay error="Authentication failed. Please log in again." onRetry={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should not show retry button for string errors containing "unauthorized"', () => {
      render(<ErrorDisplay error="Unauthorized access" onRetry={vi.fn()} />);
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    });

    it('should show retry button for generic string errors', () => {
      render(<ErrorDisplay error="Something went wrong" onRetry={vi.fn()} />);
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should handle multiple retry button clicks', async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      const apiError: APIError = {
        code: 'SERVER_ERROR',
        message: 'Service temporarily unavailable',
      };
      
      render(<ErrorDisplay error={apiError} onRetry={onRetry} />);
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      await user.click(retryButton);
      await user.click(retryButton);
      
      expect(onRetry).toHaveBeenCalledTimes(3);
    });

    it('should show both retry and dismiss buttons when both handlers are provided', () => {
      const apiError: APIError = {
        code: 'NETWORK_ERROR',
        message: 'Connection failed',
      };
      render(<ErrorDisplay error={apiError} onRetry={vi.fn()} onDismiss={vi.fn()} />);
      
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should show only dismiss button for non-recoverable errors', () => {
      const apiError: APIError = {
        code: 'AUTHENTICATION_ERROR',
        message: 'Authentication failed',
      };
      render(<ErrorDisplay error={apiError} onRetry={vi.fn()} onDismiss={vi.fn()} />);
      
      expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
    });

    it('should handle API errors with details field', () => {
      const apiError: APIError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input provided',
        details: { field: 'prompt', reason: 'too short' },
      };
      render(<ErrorDisplay error={apiError} />);
      expect(screen.getByText('Invalid input provided')).toBeInTheDocument();
    });

    it('should treat string errors with "warning" keyword as warnings', () => {
      render(<ErrorDisplay error="Warning: Rate limit approaching" />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    it('should treat string errors with "rate limit" as warnings', () => {
      render(<ErrorDisplay error="Rate limit exceeded. Please wait." />);
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });
});
