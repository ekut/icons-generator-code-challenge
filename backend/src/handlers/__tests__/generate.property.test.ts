import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as generateHandler } from '../generate.js';
import { ReplicateService } from '../../services/replicate.js';

/**
 * Property-Based Tests for Generate Handler
 * 
 * These tests use fast-check to verify properties hold across many random inputs.
 * Each test runs 100 iterations with randomly generated data.
 */

/**
 * Helper to create a mock API Gateway event
 */
function createMockEvent(
  httpMethod: string,
  path: string,
  body: string | null = null
): APIGatewayProxyEvent {
  return {
    httpMethod,
    path,
    body,
    headers: {},
    multiValueHeaders: {},
    isBase64Encoded: false,
    pathParameters: null,
    queryStringParameters: null,
    multiValueQueryStringParameters: null,
    stageVariables: null,
    requestContext: {} as any,
    resource: '',
  };
}

describe('Generate Handler - Property-Based Tests', () => {
  let originalToken: string | undefined;
  let generateIconSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    // Save original token
    originalToken = process.env.REPLICATE_API_TOKEN;
    
    // Set up environment variable for tests
    process.env.REPLICATE_API_TOKEN = 'mock-token-for-testing';
    
    // Mock the ReplicateService.generateIcon method to return unique URLs
    generateIconSpy = vi.spyOn(ReplicateService.prototype, 'generateIcon').mockImplementation(
      async () => `https://replicate.delivery/mock/image-${Date.now()}-${Math.random()}.png`
    );
  });

  afterEach(() => {
    // Clean up mocks
    vi.restoreAllMocks();
    
    // Restore original token
    if (originalToken !== undefined) {
      process.env.REPLICATE_API_TOKEN = originalToken;
    } else {
      delete process.env.REPLICATE_API_TOKEN;
    }
  });

  /**
   * Feature: icon-set-generator, Property 5: Icon Set Cardinality
   * Validates: Requirements 4.1
   * 
   * Property: For any successful generation request, the system should produce 
   * exactly 4 icons, no more and no less.
   */
  describe('Property 5: Icon Set Cardinality', () => {
    it('should generate exactly 4 icons for any valid prompt and style combination', async () => {
      // Generator for valid non-empty prompts (must contain at least one alphanumeric character)
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      
      // Generator for valid style IDs
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Parse response
          expect(response.statusCode).toBe(200);
          const body = JSON.parse(response.body);
          
          // Verify exactly 4 icons are returned
          expect(body).toHaveProperty('icons');
          expect(body.icons).toHaveLength(4);
          expect(body.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should generate exactly 4 icons for any valid request with brand colors', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for valid HEX color codes
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.array(hexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Parse response
          expect(response.statusCode).toBe(200);
          const body = JSON.parse(response.body);
          
          // Verify exactly 4 icons are returned
          expect(body).toHaveProperty('icons');
          expect(body.icons).toHaveLength(4);
          expect(body.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should call ReplicateService.generateIcon exactly 4 times for any valid request', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Verify generateIcon was called exactly 4 times
          expect(generateIconSpy).toHaveBeenCalledTimes(4);
        }),
        { numRuns: 100 }
      );
    });

    it('should return 4 icons with all required properties for any valid request', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          const body = JSON.parse(response.body);
          
          // Verify all 4 icons have required properties
          expect(body.icons).toHaveLength(4);
          
          body.icons.forEach((icon: any) => {
            expect(icon).toHaveProperty('id');
            expect(icon).toHaveProperty('url');
            expect(icon).toHaveProperty('prompt');
            expect(icon).toHaveProperty('style');
            expect(icon).toHaveProperty('generatedAt');
            
            // Verify property types
            expect(typeof icon.id).toBe('string');
            expect(typeof icon.url).toBe('string');
            expect(typeof icon.prompt).toBe('string');
            expect(typeof icon.style).toBe('string');
            expect(typeof icon.generatedAt).toBe('number');
            
            // Verify values match request
            expect(icon.prompt).toBe(prompt);
            expect(icon.style).toBe(style);
          });
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain cardinality of 4 even with varying prompt lengths', async () => {
      // Test with extreme prompt lengths (must contain at least one alphanumeric character)
      const promptArb = fc.oneof(
        fc.string({ minLength: 1, maxLength: 10 }),      // Short prompts
        fc.string({ minLength: 50, maxLength: 100 }),    // Medium prompts
        fc.string({ minLength: 150, maxLength: 200 })    // Long prompts
      ).filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          const body = JSON.parse(response.body);
          
          // Cardinality should always be 4 regardless of prompt length
          expect(body.icons).toHaveLength(4);
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain cardinality of 4 with varying numbers of brand colors', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for different numbers of brand colors (0-5)
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.option(
        fc.array(hexColorArb, { minLength: 1, maxLength: 5 }),
        { nil: undefined }
      );

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody: any = {
            prompt,
            style,
          };
          
          if (brandColors) {
            requestBody.brandColors = brandColors;
          }
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          const body = JSON.parse(response.body);
          
          // Cardinality should always be 4 regardless of brand colors
          expect(body.icons).toHaveLength(4);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: icon-set-generator, Property 3: HEX Color Validation
   * Validates: Requirements 3.2, 3.3
   * 
   * Property: For any string input as a color code, the system should correctly 
   * validate whether it matches HEX format (#RRGGBB or #RGB) and display errors 
   * for invalid formats while accepting valid ones.
   */
  describe('Property 3: HEX Color Validation', () => {
    it('should accept all valid HEX color formats (#RGB and #RRGGBB)', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for valid HEX colors in both formats
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'a', 'b', 'c', 'd', 'e', 'f');
      
      // Generate both #RGB and #RRGGBB formats
      const validHexColorArb = fc.oneof(
        // #RGB format (3 hex digits)
        fc.array(hexCharArb, { minLength: 3, maxLength: 3 })
          .map(chars => `#${chars.join('')}`),
        // #RRGGBB format (6 hex digits)
        fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
          .map(chars => `#${chars.join('')}`)
      );
      
      const brandColorsArb = fc.array(validHexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Valid HEX colors should result in successful response
          expect(response.statusCode).toBe(200);
          const body = JSON.parse(response.body);
          expect(body.success).toBe(true);
          expect(body.icons).toHaveLength(4);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject all invalid HEX color formats', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for invalid HEX colors
      // Invalid formats include: missing #, wrong length, invalid characters, etc.
      const invalidHexColorArb = fc.oneof(
        // Missing # prefix
        fc.string({ minLength: 3, maxLength: 6 })
          .filter(s => /^[0-9A-Fa-f]+$/.test(s)),
        // Wrong length (not 3 or 6)
        fc.oneof(
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'), { minLength: 1, maxLength: 2 })
            .map(chars => `#${chars.join('')}`),
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'), { minLength: 4, maxLength: 5 })
            .map(chars => `#${chars.join('')}`),
          fc.array(fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'), { minLength: 7, maxLength: 10 })
            .map(chars => `#${chars.join('')}`)
        ),
        // Invalid characters
        fc.string({ minLength: 3, maxLength: 6 })
          .filter(s => /[^0-9A-Fa-f]/.test(s))
          .map(s => `#${s}`),
        // Random strings that don't match HEX format
        fc.string({ minLength: 1, maxLength: 20 })
          .filter(s => !/^#([0-9A-Fa-f]{3}){1,2}$/.test(s))
      );
      
      const brandColorsArb = fc.array(invalidHexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Invalid HEX colors should result in validation error
          expect(response.statusCode).toBe(400);
          const body = JSON.parse(response.body);
          expect(body).toHaveProperty('error');
          expect(body.code).toBe('VALIDATION_ERROR');
          expect(body.error).toContain('Invalid HEX color format');
        }),
        { numRuns: 100 }
      );
    });

    it('should validate each color in the brandColors array independently', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for valid HEX colors
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const validHexColorArb = fc.oneof(
        fc.array(hexCharArb, { minLength: 3, maxLength: 3 })
          .map(chars => `#${chars.join('')}`),
        fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
          .map(chars => `#${chars.join('')}`)
      );
      
      // Generator for invalid HEX colors
      const invalidHexColorArb = fc.string({ minLength: 1, maxLength: 20 })
        .filter(s => !/^#([0-9A-Fa-f]{3}){1,2}$/.test(s));
      
      // Mix of valid colors with at least one invalid color
      const mixedColorsArb = fc.tuple(
        fc.array(validHexColorArb, { minLength: 0, maxLength: 3 }),
        invalidHexColorArb,
        fc.array(validHexColorArb, { minLength: 0, maxLength: 3 })
      ).map(([before, invalid, after]) => [...before, invalid, ...after]);

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, mixedColorsArb, async (prompt, style, brandColors) => {
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Should reject if any color is invalid
          expect(response.statusCode).toBe(400);
          const body = JSON.parse(response.body);
          expect(body).toHaveProperty('error');
          expect(body.code).toBe('VALIDATION_ERROR');
          expect(body.error).toContain('Invalid HEX color format');
        }),
        { numRuns: 100 }
      );
    });

    it('should be case-insensitive for HEX color validation', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for HEX colors with mixed case
      const hexCharLowerArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f');
      const hexCharUpperArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexCharMixedArb = fc.oneof(hexCharLowerArb, hexCharUpperArb);
      
      const mixedCaseHexColorArb = fc.oneof(
        fc.array(hexCharMixedArb, { minLength: 3, maxLength: 3 })
          .map(chars => `#${chars.join('')}`),
        fc.array(hexCharMixedArb, { minLength: 6, maxLength: 6 })
          .map(chars => `#${chars.join('')}`)
      );
      
      const brandColorsArb = fc.array(mixedCaseHexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // Mixed case HEX colors should be accepted
          expect(response.statusCode).toBe(200);
          const body = JSON.parse(response.body);
          expect(body.success).toBe(true);
          expect(body.icons).toHaveLength(4);
        }),
        { numRuns: 100 }
      );
    });

    it('should handle edge cases: empty array, single color, maximum colors', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const validHexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      
      // Test with different array sizes
      const brandColorsArb = fc.oneof(
        fc.constant([]),  // Empty array
        fc.array(validHexColorArb, { minLength: 1, maxLength: 1 }),  // Single color
        fc.array(validHexColorArb, { minLength: 5, maxLength: 5 })   // Maximum colors
      );

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          const requestBody: any = {
            prompt,
            style,
          };
          
          // Only include brandColors if not empty
          if (brandColors.length > 0) {
            requestBody.brandColors = brandColors;
          }
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          const response = await generateHandler(event);

          // All valid edge cases should succeed
          expect(response.statusCode).toBe(200);
          const body = JSON.parse(response.body);
          expect(body.success).toBe(true);
          expect(body.icons).toHaveLength(4);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: icon-set-generator, Property 18: Style Parameter Consistency
   * Validates: Requirements 10.2
   * 
   * Property: For any icon set generation, all 4 API requests should use 
   * identical style parameters and brand colors.
   */
  describe('Property 18: Style Parameter Consistency', () => {
    it('should call generateIcon with identical style parameters for all 4 icons', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Verify generateIcon was called exactly 4 times
          expect(generateIconSpy).toHaveBeenCalledTimes(4);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract the style parameter from the first call
          const firstCallStyle = calls[0][1]; // Second argument is the style preset

          // Verify all 4 calls use the exact same style object
          for (let i = 1; i < calls.length; i++) {
            const currentCallStyle = calls[i][1];
            
            // Verify style objects are identical
            expect(currentCallStyle).toEqual(firstCallStyle);
            expect(currentCallStyle.id).toBe(firstCallStyle.id);
            expect(currentCallStyle.name).toBe(firstCallStyle.name);
            expect(currentCallStyle.description).toBe(firstCallStyle.description);
            expect(currentCallStyle.promptModifiers).toEqual(firstCallStyle.promptModifiers);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should call generateIcon with identical brand colors for all 4 icons when provided', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for valid HEX color codes
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.array(hexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Verify generateIcon was called exactly 4 times
          expect(generateIconSpy).toHaveBeenCalledTimes(4);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract the brand colors from the first call
          const firstCallBrandColors = calls[0][2]; // Third argument is brand colors

          // Verify all 4 calls use the exact same brand colors array
          for (let i = 1; i < calls.length; i++) {
            const currentCallBrandColors = calls[i][2];
            
            // Verify brand colors arrays are identical
            expect(currentCallBrandColors).toEqual(firstCallBrandColors);
            
            // Verify each color in the array matches
            if (firstCallBrandColors && currentCallBrandColors) {
              expect(currentCallBrandColors.length).toBe(firstCallBrandColors.length);
              for (let j = 0; j < firstCallBrandColors.length; j++) {
                expect(currentCallBrandColors[j]).toBe(firstCallBrandColors[j]);
              }
            }
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should call generateIcon with identical prompt for all 4 icons', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Verify generateIcon was called exactly 4 times
          expect(generateIconSpy).toHaveBeenCalledTimes(4);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract the prompt from the first call
          const firstCallPrompt = calls[0][0]; // First argument is the prompt

          // Verify all 4 calls use the exact same prompt
          for (let i = 1; i < calls.length; i++) {
            const currentCallPrompt = calls[i][0];
            expect(currentCallPrompt).toBe(firstCallPrompt);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should maintain parameter consistency across all 4 calls with varying input combinations', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      // Generator for optional brand colors
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.option(
        fc.array(hexColorArb, { minLength: 1, maxLength: 5 }),
        { nil: undefined }
      );

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody: any = {
            prompt,
            style,
          };
          
          if (brandColors) {
            requestBody.brandColors = brandColors;
          }
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Verify generateIcon was called exactly 4 times
          expect(generateIconSpy).toHaveBeenCalledTimes(4);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract parameters from the first call
          const firstCallPrompt = calls[0][0];
          const firstCallStyle = calls[0][1];
          const firstCallBrandColors = calls[0][2];

          // Verify all 4 calls use identical parameters
          for (let i = 1; i < calls.length; i++) {
            // Check prompt consistency
            expect(calls[i][0]).toBe(firstCallPrompt);
            
            // Check style consistency
            expect(calls[i][1]).toEqual(firstCallStyle);
            expect(calls[i][1].id).toBe(firstCallStyle.id);
            expect(calls[i][1].promptModifiers).toEqual(firstCallStyle.promptModifiers);
            
            // Check brand colors consistency
            expect(calls[i][2]).toEqual(firstCallBrandColors);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should use the same style preset object reference for all 4 calls', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, async (prompt, style) => {
          
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract the style preset object from the first call
          const firstCallStylePreset = calls[0][1];

          // Verify all 4 calls use the exact same style preset object reference
          // This ensures no accidental mutations or recreations
          for (let i = 1; i < calls.length; i++) {
            const currentCallStylePreset = calls[i][1];
            
            // Check that it's the same object reference
            expect(currentCallStylePreset).toBe(firstCallStylePreset);
          }
        }),
        { numRuns: 100 }
      );
    });

    it('should use the same brand colors array reference for all 4 calls when provided', async () => {
      const promptArb = fc.string({ minLength: 1, maxLength: 200 })
        .filter(s => s.trim().length > 0 && /[a-zA-Z0-9]/.test(s));
      const styleArb = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline');
      
      const hexCharArb = fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
      const hexColorArb = fc.array(hexCharArb, { minLength: 6, maxLength: 6 })
        .map(chars => `#${chars.join('')}`);
      const brandColorsArb = fc.array(hexColorArb, { minLength: 1, maxLength: 5 });

      await fc.assert(
        fc.asyncProperty(promptArb, styleArb, brandColorsArb, async (prompt, style, brandColors) => {
          
          // Clear call history before this iteration
          generateIconSpy.mockClear();
          
          const requestBody = {
            prompt,
            style,
            brandColors,
          };
          
          const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
          await generateHandler(event);

          // Get all calls to generateIcon
          const calls = generateIconSpy.mock.calls;

          // Extract the brand colors array from the first call
          const firstCallBrandColors = calls[0][2];

          // Verify all 4 calls use the exact same brand colors array reference
          for (let i = 1; i < calls.length; i++) {
            const currentCallBrandColors = calls[i][2];
            
            // Check that it's the same array reference
            expect(currentCallBrandColors).toBe(firstCallBrandColors);
          }
        }),
        { numRuns: 100 }
      );
    });
  });
});
