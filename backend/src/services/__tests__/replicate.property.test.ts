import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ReplicateService } from '../replicate.js';
import { StylePreset } from '../../types/index.js';

/**
 * Property-Based Tests for ReplicateService
 * 
 * These tests use fast-check to verify properties hold across many random inputs.
 * Each test runs 100 iterations with randomly generated data.
 */
describe('ReplicateService - Property-Based Tests', () => {
  
  /**
   * Feature: icon-set-generator, Property 15: Prompt Construction Completeness
   * Validates: Requirements 7.3, 10.1, 10.3
   * 
   * Property: For any generation request, the constructed prompt sent to the API 
   * should include the user prompt, style-specific descriptors, and any provided brand colors.
   */
  describe('Property 15: Prompt Construction Completeness', () => {
    it('should include user prompt in constructed prompt for any valid input', () => {
      // Generator for valid non-empty prompts
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      // Generator for style presets with at least one modifier
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      fc.assert(
        fc.property(promptArb, styleArb, (userPrompt, style) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          const result = buildPrompt(userPrompt, style);
          
          // The user prompt must be present in the constructed prompt
          expect(result).toContain(userPrompt);
        }),
        { numRuns: 100 }
      );
    });

    it('should include all style modifiers in constructed prompt for any valid style', () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      fc.assert(
        fc.property(promptArb, styleArb, (userPrompt, style) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          const result = buildPrompt(userPrompt, style);
          
          // All style modifiers must be present in the constructed prompt
          style.promptModifiers.forEach(modifier => {
            expect(result).toContain(modifier);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should include all brand colors when provided for any valid color array', () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      // Generator for valid HEX color codes (using string with hex characters)
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.array(hexColorArb, { minLength: 1, maxLength: 5 });

      fc.assert(
        fc.property(promptArb, styleArb, brandColorsArb, (userPrompt, style, brandColors) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          const result = buildPrompt(userPrompt, style, brandColors);
          
          // All brand colors must be present in the constructed prompt
          brandColors.forEach(color => {
            expect(result).toContain(color);
          });
          
          // The color instruction prefix should be present
          expect(result).toContain('using colors');
        }),
        { numRuns: 100 }
      );
    });

    it('should not include color instruction when no brand colors provided', () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      fc.assert(
        fc.property(promptArb, styleArb, (userPrompt, style) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          // Test with undefined brand colors
          const resultUndefined = buildPrompt(userPrompt, style, undefined);
          expect(resultUndefined).not.toContain('using colors');
          
          // Test with empty array
          const resultEmpty = buildPrompt(userPrompt, style, []);
          expect(resultEmpty).not.toContain('using colors');
        }),
        { numRuns: 100 }
      );
    });

    it('should include required template elements for any valid input', () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      fc.assert(
        fc.property(promptArb, styleArb, (userPrompt, style) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          const result = buildPrompt(userPrompt, style);
          
          // Required template elements must be present
          expect(result).toContain('A simple, clean icon of');
          expect(result).toContain('512x512 pixels');
          expect(result).toContain('icon design');
          expect(result).toContain('centered');
          expect(result).toContain('white background');
        }),
        { numRuns: 100 }
      );
    });

    it('should construct complete prompt with all components for any valid input combination', () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 });
      
      const styleArb = fc.record({
        id: fc.string({ minLength: 1 }),
        name: fc.string({ minLength: 1 }),
        description: fc.string(),
        promptModifiers: fc.array(fc.string({ minLength: 1 }), { minLength: 1, maxLength: 10 }),
      });

      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.option(fc.array(hexColorArb, { minLength: 1, maxLength: 5 }), { nil: undefined });

      fc.assert(
        fc.property(promptArb, styleArb, brandColorsArb, (userPrompt, style, brandColors) => {
          const service = new ReplicateService('test-token');
          const buildPrompt = (service as any).buildPrompt.bind(service);
          
          const result = buildPrompt(userPrompt, style, brandColors);
          
          // Verify completeness: all required components are present
          expect(result).toContain(userPrompt);
          
          style.promptModifiers.forEach(modifier => {
            expect(result).toContain(modifier);
          });
          
          if (brandColors && brandColors.length > 0) {
            brandColors.forEach(color => {
              expect(result).toContain(color);
            });
            expect(result).toContain('using colors');
          }
          
          // Template elements
          expect(result).toContain('A simple, clean icon of');
          expect(result).toContain('512x512 pixels');
          expect(result).toContain('icon design');
          expect(result).toContain('centered');
          expect(result).toContain('white background');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: icon-set-generator, Property 17: Retry Logic for Transient Failures
   * Validates: Requirements 9.4
   * 
   * Property: For any transient API failure (network timeout, 5xx errors), 
   * the system should automatically retry the request up to a maximum number of attempts.
   */
  describe('Property 17: Retry Logic for Transient Failures', () => {
    it('should retry transient errors up to maxRetries times for any transient error type', () => {
      // Generator for transient error types
      const transientErrorArb = fc.oneof(
        // 5xx status codes
        fc.record({
          message: fc.string(),
          status: fc.integer({ min: 500, max: 599 }),
        }),
        // Network timeout codes
        fc.record({
          message: fc.string(),
          code: fc.constantFrom('ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED'),
        }),
        // Timeout messages
        fc.record({
          message: fc.constantFrom(
            'Request timeout',
            'Connection timed out',
            'Network error occurred',
            'Connection reset by peer'
          ),
        })
      );

      // Generator for maxRetries (1-5 retries)
      const maxRetriesArb = fc.integer({ min: 1, max: 5 });

      fc.assert(
        fc.asyncProperty(transientErrorArb, maxRetriesArb, async (errorTemplate, maxRetries) => {
          const service = new ReplicateService('test-token', maxRetries, 10); // Use short delay for testing
          const executeWithRetry = (service as any).executeWithRetry.bind(service);
          
          let attempts = 0;
          const operation = async () => {
            attempts++;
            // Always throw the transient error
            const error = new Error(errorTemplate.message || 'Transient error');
            Object.assign(error, errorTemplate);
            throw error;
          };
          
          // The operation should fail after maxRetries attempts
          await expect(executeWithRetry(operation)).rejects.toThrow();
          
          // Verify that exactly maxRetries attempts were made
          expect(attempts).toBe(maxRetries);
        }),
        { numRuns: 100 }
      );
    });

    it('should succeed on first attempt for any operation that succeeds immediately', () => {
      // Generator for successful return values
      const successValueArb = fc.oneof(
        fc.string(),
        fc.integer(),
        fc.record({ url: fc.string() }),
        fc.array(fc.string())
      );

      const maxRetriesArb = fc.integer({ min: 1, max: 5 });

      fc.assert(
        fc.asyncProperty(successValueArb, maxRetriesArb, async (successValue, maxRetries) => {
          const service = new ReplicateService('test-token', maxRetries, 10);
          const executeWithRetry = (service as any).executeWithRetry.bind(service);
          
          let attempts = 0;
          const operation = async () => {
            attempts++;
            return successValue;
          };
          
          const result = await executeWithRetry(operation);
          
          // Should succeed on first attempt
          expect(attempts).toBe(1);
          expect(result).toEqual(successValue);
        }),
        { numRuns: 100 }
      );
    });

    it('should not retry non-transient errors for any non-transient error type', () => {
      // Generator for non-transient error types
      const nonTransientErrorArb = fc.oneof(
        // 4xx status codes
        fc.record({
          message: fc.string(),
          status: fc.integer({ min: 400, max: 499 }),
        }),
        // 2xx/3xx status codes (not errors, but testing the logic)
        fc.record({
          message: fc.string(),
          status: fc.integer({ min: 200, max: 399 }),
        }),
        // Generic errors without transient indicators
        fc.record({
          message: fc.constantFrom('Invalid input', 'Authentication failed', 'Not found'),
          code: fc.constantFrom('INVALID_REQUEST', 'AUTH_ERROR', 'NOT_FOUND'),
        })
      );

      const maxRetriesArb = fc.integer({ min: 2, max: 5 });

      fc.assert(
        fc.asyncProperty(nonTransientErrorArb, maxRetriesArb, async (errorTemplate, maxRetries) => {
          const service = new ReplicateService('test-token', maxRetries, 10);
          const executeWithRetry = (service as any).executeWithRetry.bind(service);
          
          let attempts = 0;
          const operation = async () => {
            attempts++;
            const error = new Error(errorTemplate.message || 'Non-transient error');
            Object.assign(error, errorTemplate);
            throw error;
          };
          
          // The operation should fail immediately without retries
          await expect(executeWithRetry(operation)).rejects.toThrow();
          
          // Verify that only 1 attempt was made (no retries)
          expect(attempts).toBe(1);
        }),
        { numRuns: 100 }
      );
    });

    it('should eventually succeed after retrying transient errors for any number of initial failures', () => {
      // Generator for number of failures before success (must be less than maxRetries)
      const maxRetriesArb = fc.integer({ min: 2, max: 5 });
      
      const transientErrorArb = fc.oneof(
        fc.record({
          message: fc.string(),
          status: fc.integer({ min: 500, max: 599 }),
        }),
        fc.record({
          message: fc.string(),
          code: fc.constantFrom('ETIMEDOUT', 'ECONNRESET'),
        })
      );

      const successValueArb = fc.string();

      fc.assert(
        fc.asyncProperty(
          maxRetriesArb,
          transientErrorArb,
          successValueArb,
          async (maxRetries, errorTemplate, successValue) => {
            // Number of failures before success (must be less than maxRetries)
            const failuresBeforeSuccess = Math.floor(Math.random() * maxRetries);
            
            const service = new ReplicateService('test-token', maxRetries, 10);
            const executeWithRetry = (service as any).executeWithRetry.bind(service);
            
            let attempts = 0;
            const operation = async () => {
              attempts++;
              if (attempts <= failuresBeforeSuccess) {
                const error = new Error(errorTemplate.message || 'Transient error');
                Object.assign(error, errorTemplate);
                throw error;
              }
              return successValue;
            };
            
            const result = await executeWithRetry(operation);
            
            // Should succeed after the specified number of failures
            expect(result).toBe(successValue);
            expect(attempts).toBe(failuresBeforeSuccess + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should use exponential backoff with correct delays for any retry attempt', () => {
      // Generator for initial delay (10-100ms for testing)
      const initialDelayArb = fc.integer({ min: 10, max: 100 });
      
      // Generator for number of retries (2-4 to keep test fast)
      const maxRetriesArb = fc.integer({ min: 2, max: 4 });

      const transientErrorArb = fc.record({
        message: fc.string(),
        status: fc.constantFrom(500, 502, 503, 504),
      });

      fc.assert(
        fc.asyncProperty(
          initialDelayArb,
          maxRetriesArb,
          transientErrorArb,
          async (initialDelay, maxRetries, errorTemplate) => {
            const service = new ReplicateService('test-token', maxRetries, initialDelay);
            const executeWithRetry = (service as any).executeWithRetry.bind(service);
            
            const timestamps: number[] = [];
            let attempts = 0;
            
            const operation = async () => {
              timestamps.push(Date.now());
              attempts++;
              const error = new Error(errorTemplate.message || 'Transient error');
              Object.assign(error, errorTemplate);
              throw error;
            };
            
            await expect(executeWithRetry(operation)).rejects.toThrow();
            
            // Verify all attempts were made
            expect(attempts).toBe(maxRetries);
            expect(timestamps.length).toBe(maxRetries);
            
            // Verify exponential backoff delays
            for (let i = 1; i < timestamps.length; i++) {
              const actualDelay = timestamps[i] - timestamps[i - 1];
              const expectedDelay = initialDelay * Math.pow(2, i - 1);
              
              // Allow 50% tolerance for timing variations
              const minDelay = expectedDelay * 0.5;
              const maxDelay = expectedDelay * 1.5;
              
              expect(actualDelay).toBeGreaterThanOrEqual(minDelay);
              expect(actualDelay).toBeLessThanOrEqual(maxDelay);
            }
          }
        ),
        { numRuns: 50 } // Fewer runs since this test involves timing
      );
    });

    it('should correctly identify transient vs non-transient errors for any error object', () => {
      // Generator for various error objects
      const errorArb = fc.oneof(
        // Transient: 5xx errors
        fc.record({
          status: fc.integer({ min: 500, max: 599 }),
          message: fc.string(),
        }).map(e => ({ error: e, expectedTransient: true })),
        
        // Non-transient: 4xx errors
        fc.record({
          status: fc.integer({ min: 400, max: 499 }),
          message: fc.string(),
        }).map(e => ({ error: e, expectedTransient: false })),
        
        // Transient: timeout codes
        fc.record({
          code: fc.constantFrom('ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED'),
          message: fc.string(),
        }).map(e => ({ error: e, expectedTransient: true })),
        
        // Non-transient: other codes
        fc.record({
          code: fc.constantFrom('INVALID', 'AUTH_ERROR', 'BAD_REQUEST'),
          message: fc.string(),
        }).map(e => ({ error: e, expectedTransient: false })),
        
        // Transient: timeout messages
        fc.record({
          message: fc.constantFrom('timeout', 'timed out', 'connection reset', 'network error'),
        }).map(e => ({ error: e, expectedTransient: true })),
        
        // Non-transient: other messages
        fc.record({
          message: fc.constantFrom('invalid', 'unauthorized', 'forbidden'),
        }).map(e => ({ error: e, expectedTransient: false }))
      );

      fc.assert(
        fc.property(errorArb, ({ error, expectedTransient }) => {
          const service = new ReplicateService('test-token');
          const isTransientError = (service as any).isTransientError.bind(service);
          
          const result = isTransientError(error);
          
          expect(result).toBe(expectedTransient);
        }),
        { numRuns: 100 }
      );
    });
  });
});
