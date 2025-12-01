import { describe, it, expect } from 'vitest';
import { ReplicateService } from '../replicate.js';
import { StylePreset } from '../../types/index.js';

/**
 * ReplicateService Unit Tests
 * 
 * IMPORTANT: These tests do NOT make real API calls to Replicate.
 * We test internal logic (prompt construction, URL extraction) without
 * hitting external services to avoid unnecessary API costs.
 */
describe('ReplicateService', () => {
  const mockStylePreset: StylePreset = {
    id: 'pastels',
    name: 'Pastels',
    description: 'Soft, muted colors with gentle gradients',
    promptModifiers: ['pastel colors', 'soft lighting', 'gentle gradients', 'minimalist'],
  };

  describe('constructor', () => {
    it('should throw error when API token is not provided', () => {
      expect(() => new ReplicateService('')).toThrow('Replicate API token is required');
    });

    it('should initialize successfully with valid API token', () => {
      expect(() => new ReplicateService('test-token')).not.toThrow();
    });
  });

  describe('buildPrompt (via reflection)', () => {
    it('should construct prompt with user input and style modifiers', () => {
      const service = new ReplicateService('test-token');
      
      // Access the private method through reflection for testing
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset);
      
      expect(result).toContain('toys');
      expect(result).toContain('pastel colors');
      expect(result).toContain('soft lighting');
      expect(result).toContain('512x512 pixels');
      expect(result).toContain('icon design');
      expect(result).toContain('white background');
    });

    it('should include brand colors as natural language when provided', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset, ['#FF0000', '#0000FF']);
      
      // Should convert HEX to color names and integrate into prompt
      expect(result).toContain('toys in red and blue colors');
      expect(result).not.toContain('#FF0000');
      expect(result).not.toContain('#0000FF');
    });

    it('should handle single brand color correctly', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset, ['#FF0000']);
      
      expect(result).toContain('toys in red color');
    });

    it('should handle three or more brand colors correctly', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset, ['#FF0000', '#00FF00', '#0000FF']);
      
      expect(result).toContain('toys in red, green, and blue colors');
    });

    it('should not include color instruction when brand colors are empty', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset, []);
      
      // Should not contain the color instruction pattern " in ... color"
      // But may contain "color" as part of style modifiers like "pastel colors"
      expect(result).not.toContain(' in ');
      const hasColorInstruction = result.includes(' in ') && 
                                  result.includes('color') &&
                                  result.indexOf(' in ') < result.indexOf('color');
      expect(hasColorInstruction).toBe(false);
    });

    it('should remove conflicting color modifiers when brand colors are provided', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset, ['#FF0000']);
      
      // Should not include "pastel colors" from the style preset
      expect(result).not.toContain('pastel colors');
      // But should still include non-color modifiers
      expect(result).toContain('soft lighting');
      expect(result).toContain('gentle gradients');
      expect(result).toContain('minimalist');
    });

    it('should include all style modifiers in the prompt', () => {
      const service = new ReplicateService('test-token');
      const buildPrompt = (service as any).buildPrompt.bind(service);
      
      const result = buildPrompt('toys', mockStylePreset);
      
      mockStylePreset.promptModifiers.forEach(modifier => {
        expect(result).toContain(modifier);
      });
    });
  });

  describe('extractImageUrl (via reflection)', () => {
    it('should extract URL from array output with string', () => {
      const service = new ReplicateService('test-token');
      const extractImageUrl = (service as any).extractImageUrl.bind(service);
      
      const output = ['https://example.com/image.png'];
      const result = extractImageUrl(output);
      
      expect(result).toBe('https://example.com/image.png');
    });

    it('should extract URL from array output with object', () => {
      const service = new ReplicateService('test-token');
      const extractImageUrl = (service as any).extractImageUrl.bind(service);
      
      const output = [{ url: 'https://example.com/image.png' }];
      const result = extractImageUrl(output);
      
      expect(result).toBe('https://example.com/image.png');
    });

    it('should extract URL from direct string output', () => {
      const service = new ReplicateService('test-token');
      const extractImageUrl = (service as any).extractImageUrl.bind(service);
      
      const output = 'https://example.com/image.png';
      const result = extractImageUrl(output);
      
      expect(result).toBe('https://example.com/image.png');
    });

    it('should extract URL from object output', () => {
      const service = new ReplicateService('test-token');
      const extractImageUrl = (service as any).extractImageUrl.bind(service);
      
      const output = { url: 'https://example.com/image.png' };
      const result = extractImageUrl(output);
      
      expect(result).toBe('https://example.com/image.png');
    });

    it('should throw error for invalid output format', () => {
      const service = new ReplicateService('test-token');
      const extractImageUrl = (service as any).extractImageUrl.bind(service);
      
      expect(() => extractImageUrl(null)).toThrow('Unable to extract image URL');
      expect(() => extractImageUrl({})).toThrow('Unable to extract image URL');
      expect(() => extractImageUrl([])).toThrow('Unable to extract image URL');
    });
  });

  describe('isTransientError (via reflection)', () => {
    it('should identify 5xx status codes as transient', () => {
      const service = new ReplicateService('test-token');
      const isTransientError = (service as any).isTransientError.bind(service);
      
      expect(isTransientError({ status: 500 })).toBe(true);
      expect(isTransientError({ status: 502 })).toBe(true);
      expect(isTransientError({ status: 503 })).toBe(true);
      expect(isTransientError({ status: 504 })).toBe(true);
      expect(isTransientError({ statusCode: 500 })).toBe(true);
      expect(isTransientError({ response: { status: 500 } })).toBe(true);
    });

    it('should not identify 4xx status codes as transient', () => {
      const service = new ReplicateService('test-token');
      const isTransientError = (service as any).isTransientError.bind(service);
      
      expect(isTransientError({ status: 400 })).toBe(false);
      expect(isTransientError({ status: 401 })).toBe(false);
      expect(isTransientError({ status: 404 })).toBe(false);
      expect(isTransientError({ status: 429 })).toBe(false);
    });

    it('should identify timeout errors as transient', () => {
      const service = new ReplicateService('test-token');
      const isTransientError = (service as any).isTransientError.bind(service);
      
      expect(isTransientError({ code: 'ETIMEDOUT' })).toBe(true);
      expect(isTransientError({ code: 'ECONNRESET' })).toBe(true);
      expect(isTransientError({ code: 'ENOTFOUND' })).toBe(true);
      expect(isTransientError({ code: 'ECONNREFUSED' })).toBe(true);
    });

    it('should identify timeout messages as transient', () => {
      const service = new ReplicateService('test-token');
      const isTransientError = (service as any).isTransientError.bind(service);
      
      expect(isTransientError({ message: 'Request timeout' })).toBe(true);
      expect(isTransientError({ message: 'Connection timed out' })).toBe(true);
      expect(isTransientError({ message: 'Network error occurred' })).toBe(true);
      expect(isTransientError({ message: 'Connection reset by peer' })).toBe(true);
    });

    it('should not identify non-transient errors', () => {
      const service = new ReplicateService('test-token');
      const isTransientError = (service as any).isTransientError.bind(service);
      
      expect(isTransientError(null)).toBe(false);
      expect(isTransientError(undefined)).toBe(false);
      expect(isTransientError({ message: 'Invalid input' })).toBe(false);
      expect(isTransientError({ code: 'INVALID_REQUEST' })).toBe(false);
    });
  });

  describe('executeWithRetry (via reflection)', () => {
    it('should succeed on first attempt when operation succeeds', async () => {
      const service = new ReplicateService('test-token', 3, 100);
      const executeWithRetry = (service as any).executeWithRetry.bind(service);
      
      let attempts = 0;
      const operation = async () => {
        attempts++;
        return 'success';
      };
      
      const result = await executeWithRetry(operation);
      
      expect(result).toBe('success');
      expect(attempts).toBe(1);
    });

    it('should retry on transient errors and eventually succeed', async () => {
      const service = new ReplicateService('test-token', 3, 10);
      const executeWithRetry = (service as any).executeWithRetry.bind(service);
      
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          const error: any = new Error('Service unavailable');
          error.status = 503;
          throw error;
        }
        return 'success';
      };
      
      const result = await executeWithRetry(operation);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('should throw error after max retries on persistent transient errors', async () => {
      const service = new ReplicateService('test-token', 3, 10);
      const executeWithRetry = (service as any).executeWithRetry.bind(service);
      
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error: any = new Error('Service unavailable');
        error.status = 503;
        throw error;
      };
      
      await expect(executeWithRetry(operation)).rejects.toThrow('Service unavailable');
      expect(attempts).toBe(3);
    });

    it('should not retry on non-transient errors', async () => {
      const service = new ReplicateService('test-token', 3, 10);
      const executeWithRetry = (service as any).executeWithRetry.bind(service);
      
      let attempts = 0;
      const operation = async () => {
        attempts++;
        const error: any = new Error('Invalid request');
        error.status = 400;
        throw error;
      };
      
      await expect(executeWithRetry(operation)).rejects.toThrow('Invalid request');
      expect(attempts).toBe(1);
    });

    it('should use exponential backoff between retries', async () => {
      const service = new ReplicateService('test-token', 3, 100);
      const executeWithRetry = (service as any).executeWithRetry.bind(service);
      
      const timestamps: number[] = [];
      let attempts = 0;
      
      const operation = async () => {
        timestamps.push(Date.now());
        attempts++;
        if (attempts < 3) {
          const error: any = new Error('Timeout');
          error.code = 'ETIMEDOUT';
          throw error;
        }
        return 'success';
      };
      
      await executeWithRetry(operation);
      
      expect(attempts).toBe(3);
      expect(timestamps.length).toBe(3);
      
      // Check that delays are approximately exponential (100ms, 200ms)
      // Allow some tolerance for execution time
      const delay1 = timestamps[1] - timestamps[0];
      const delay2 = timestamps[2] - timestamps[1];
      
      expect(delay1).toBeGreaterThanOrEqual(90); // ~100ms
      expect(delay1).toBeLessThan(150);
      expect(delay2).toBeGreaterThanOrEqual(190); // ~200ms
      expect(delay2).toBeLessThan(250);
    });
  });

  describe('constructor with retry configuration', () => {
    it('should accept custom maxRetries and initialRetryDelay', () => {
      const service = new ReplicateService('test-token', 5, 2000);
      
      expect((service as any).maxRetries).toBe(5);
      expect((service as any).initialRetryDelay).toBe(2000);
    });

    it('should use default values when not provided', () => {
      const service = new ReplicateService('test-token');
      
      expect((service as any).maxRetries).toBe(3);
      expect((service as any).initialRetryDelay).toBe(1000);
    });
  });
});
