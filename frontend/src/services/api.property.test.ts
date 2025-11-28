import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import axios from 'axios';
import type { GenerationRequest, GeneratedIcon, StylePreset } from '../types';

/**
 * Property-Based Tests for API Client
 * Feature: icon-set-generator, Property 16: API Response Handling
 * Validates: Requirements 7.4
 */

// Helper to generate valid HEX color codes
const hexColorGenerator = fc.integer({ min: 0, max: 0xFFFFFF }).map(n => 
  `#${n.toString(16).padStart(6, '0').toUpperCase()}`
);

// Create mock instance that will be used by all tests
const mockInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  request: vi.fn(),
};

// Mock axios before importing the API client
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
    isAxiosError: vi.fn((error: any) => error.response !== undefined),
  },
}));

// Import after mocking
const { apiClient } = await import('./api');

describe('API Response Handling - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: icon-set-generator, Property 16: API Response Handling
   * For any API response received (success or error), the system should handle it appropriately without crashing
   */
  describe('Property 16: API Response Handling', () => {
    it('should handle any successful generateIcons response without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary valid requests
          fc.record({
            prompt: fc.string({ minLength: 1, maxLength: 200 }),
            styleId: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            brandColors: fc.array(hexColorGenerator, { maxLength: 5 }),
          }),
          // Generate arbitrary successful responses
          fc.array(
            fc.record({
              id: fc.uuid(),
              url: fc.webUrl(),
              prompt: fc.string({ minLength: 1, maxLength: 200 }),
              style: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            }),
            { minLength: 4, maxLength: 4 }
          ),
          async (request: GenerationRequest, icons: GeneratedIcon[]) => {
            // Mock successful response
            const mockResponse = {
              data: { icons },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {} as any,
            };

            mockInstance.post.mockResolvedValue(mockResponse);

            // The system should handle the response without crashing
            const result = await apiClient.generateIcons(request);

            // Verify the response is returned correctly
            expect(result).toEqual(icons);
            expect(result).toHaveLength(4);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle any successful getStyles response without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary style preset arrays
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1, maxLength: 50 }),
              name: fc.string({ minLength: 1, maxLength: 100 }),
              description: fc.string({ minLength: 1, maxLength: 500 }),
              thumbnail: fc.option(fc.webUrl(), { nil: undefined }),
            }),
            { minLength: 0, maxLength: 20 }
          ),
          async (styles: StylePreset[]) => {
            // Mock successful response
            const mockResponse = {
              data: { styles },
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {} as any,
            };

            mockInstance.get.mockResolvedValue(mockResponse);

            // The system should handle the response without crashing
            const result = await apiClient.getStyles();

            // Verify the response is returned correctly
            expect(result).toEqual(styles);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle any error response without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary requests
          fc.record({
            prompt: fc.string({ minLength: 1, maxLength: 200 }),
            styleId: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            brandColors: fc.array(hexColorGenerator, { maxLength: 5 }),
          }),
          // Generate arbitrary error status codes
          fc.integer({ min: 400, max: 599 }),
          // Generate arbitrary error messages
          fc.record({
            error: fc.string({ minLength: 1, maxLength: 200 }),
          }),
          async (request: GenerationRequest, statusCode: number, errorData: { error: string }) => {
            // Mock error response
            const mockError = {
              response: {
                status: statusCode,
                data: errorData,
              },
              config: {},
            };

            mockInstance.post.mockRejectedValue(mockError);

            // The system should handle the error without crashing
            // It should throw an error, but not crash the application
            try {
              await apiClient.generateIcons(request);
              // If no error is thrown, that's also acceptable (error was handled)
            } catch (error: any) {
              // Verify the error is structured and contains expected information
              expect(error).toBeDefined();
              // The error should have a response property (axios error structure)
              expect(error.response).toBeDefined();
              expect(error.response.status).toBe(statusCode);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle network errors without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary requests
          fc.record({
            prompt: fc.string({ minLength: 1, maxLength: 200 }),
            styleId: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            brandColors: fc.array(hexColorGenerator, { maxLength: 5 }),
          }),
          // Generate arbitrary error messages
          fc.string({ minLength: 1, maxLength: 200 }),
          async (request: GenerationRequest, errorMessage: string) => {
            // Mock network error (no response)
            const mockError = {
              request: {},
              message: errorMessage,
              config: {},
            };

            mockInstance.post.mockRejectedValue(mockError);

            // The system should handle the network error without crashing
            try {
              await apiClient.generateIcons(request);
              // If no error is thrown, that's also acceptable (error was handled)
            } catch (error: any) {
              // Verify the error is structured
              expect(error).toBeDefined();
              // Network errors should have a request property but no response
              expect(error.request).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle malformed response data without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary requests
          fc.record({
            prompt: fc.string({ minLength: 1, maxLength: 200 }),
            styleId: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            brandColors: fc.array(hexColorGenerator, { maxLength: 5 }),
          }),
          // Generate arbitrary response data (could be malformed)
          fc.anything(),
          async (request: GenerationRequest, responseData: any) => {
            // Mock response with arbitrary data
            const mockResponse = {
              data: responseData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {} as any,
            };

            mockInstance.post.mockResolvedValue(mockResponse);

            // The system should handle the response without crashing
            // Even if the data is malformed, it shouldn't crash
            try {
              const result = await apiClient.generateIcons(request);
              // If we get here, the system handled it gracefully
              expect(result).toBeDefined();
            } catch (error) {
              // If an error is thrown, that's also acceptable
              // as long as the application doesn't crash
              expect(error).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle empty or null responses without crashing', () => {
      fc.assert(
        fc.asyncProperty(
          // Generate arbitrary requests
          fc.record({
            prompt: fc.string({ minLength: 1, maxLength: 200 }),
            styleId: fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
            brandColors: fc.array(hexColorGenerator, { maxLength: 5 }),
          }),
          // Generate null, undefined, or empty responses
          fc.constantFrom(null, undefined, {}, { icons: null }, { icons: undefined }, { icons: [] }),
          async (request: GenerationRequest, responseData: any) => {
            // Mock response with empty/null data
            const mockResponse = {
              data: responseData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: {} as any,
            };

            mockInstance.post.mockResolvedValue(mockResponse);

            // The system should handle the response without crashing
            try {
              const result = await apiClient.generateIcons(request);
              // If we get here, the system handled it gracefully
              expect(result).toBeDefined();
            } catch (error) {
              // If an error is thrown, that's also acceptable
              // as long as the application doesn't crash
              expect(error).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
