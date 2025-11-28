import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { GenerationRequest, GeneratedIcon, StylePreset, APIError } from '../types';

/**
 * API Client for Icon Set Generator
 * Handles communication with the backend Lambda functions via API Gateway
 */
class APIClient {
  private client: AxiosInstance;
  private maxRetries: number = 3;
  private retryDelay: number = 1000; // ms

  constructor() {
    const baseURL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3000';

    this.client = axios.create({
      baseURL,
      timeout: 300000, // 5 minutes for image generation
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set up request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Log request for debugging
        console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error: AxiosError) => {
        console.error('[API Request Error]', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API Response] ${response.status} ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        const config = error.config as InternalAxiosRequestConfig & { _retryCount?: number };

        // Handle transient errors with retry logic
        if (this.isTransientError(error) && config && !config._retryCount) {
          config._retryCount = 0;
        }

        if (
          config &&
          config._retryCount !== undefined &&
          config._retryCount < this.maxRetries &&
          this.isTransientError(error)
        ) {
          config._retryCount += 1;
          const delay = this.retryDelay * Math.pow(2, config._retryCount - 1);

          console.log(
            `[API Retry] Attempt ${config._retryCount}/${this.maxRetries} after ${delay}ms`
          );

          await this.delay(delay);
          return this.client.request(config);
        }

        // Transform error to user-friendly format
        const apiError = this.handleError(error);
        return Promise.reject(apiError);
      }
    );
  }

  /**
   * Check if error is transient and should be retried
   */
  private isTransientError(error: AxiosError): boolean {
    if (!error.response) {
      // Network errors (no response received)
      return true;
    }

    const status = error.response.status;
    // Retry on 5xx server errors and 429 rate limiting
    return status >= 500 || status === 429;
  }

  /**
   * Delay helper for retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Transform Axios errors to user-friendly API errors
   */
  private handleError(error: AxiosError): APIError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;

      if (status === 400) {
        return {
          code: 'VALIDATION_ERROR',
          message: data?.error || 'Invalid request parameters',
          details: data,
        };
      }

      if (status === 401) {
        return {
          code: 'AUTHENTICATION_ERROR',
          message: 'Authentication failed',
          details: data,
        };
      }

      if (status === 429) {
        return {
          code: 'RATE_LIMIT_ERROR',
          message: 'Rate limit exceeded. Please try again in a moment.',
          details: data,
        };
      }

      if (status >= 500) {
        return {
          code: 'SERVER_ERROR',
          message: 'Service temporarily unavailable. Please try again.',
          details: data,
        };
      }

      return {
        code: 'API_ERROR',
        message: data?.error || 'An error occurred',
        details: data,
      };
    }

    if (error.request) {
      // Request made but no response received
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        details: error.message,
      };
    }

    // Something else happened
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error,
    };
  }

  /**
   * Generate 4 icons based on prompt, style, and optional brand colors
   */
  async generateIcons(request: GenerationRequest): Promise<GeneratedIcon[]> {
    const response = await this.client.post<{ icons: GeneratedIcon[] }>(
      '/api/generate',
      request
    );
    return response.data.icons;
  }

  /**
   * Fetch available style presets
   */
  async getStyles(): Promise<StylePreset[]> {
    const response = await this.client.get<{ styles: StylePreset[] }>('/api/styles');
    return response.data.styles;
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;
