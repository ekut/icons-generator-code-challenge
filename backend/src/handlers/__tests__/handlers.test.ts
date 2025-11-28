import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as generateHandler } from '../generate.js';
import { handler as getStylesHandler } from '../getStyles.js';
import { ReplicateService } from '../../services/replicate.js';

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

describe('Lambda Handlers', () => {
  describe('getStyles handler', () => {
    it('should return all 5 style presets', async () => {
      const event = createMockEvent('GET', '/api/styles');
      const response = await getStylesHandler(event);

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('styles');
      expect(body.styles).toHaveLength(5);

      // Verify all 5 expected styles are present
      const styleIds = body.styles.map((s: any) => s.id);
      expect(styleIds).toContain('pastels');
      expect(styleIds).toContain('bubbles');
      expect(styleIds).toContain('flat');
      expect(styleIds).toContain('gradient');
      expect(styleIds).toContain('outline');

      // Verify structure of each style preset
      body.styles.forEach((style: any) => {
        expect(style).toHaveProperty('id');
        expect(style).toHaveProperty('name');
        expect(style).toHaveProperty('description');
        expect(style).toHaveProperty('promptModifiers');
        expect(typeof style.id).toBe('string');
        expect(typeof style.name).toBe('string');
        expect(typeof style.description).toBe('string');
        expect(Array.isArray(style.promptModifiers)).toBe(true);
        expect(style.promptModifiers.length).toBeGreaterThan(0);
      });
    });

    it('should return proper API Gateway response format', async () => {
      const event = createMockEvent('GET', '/api/styles');
      const response = await getStylesHandler(event);

      // Verify response has required API Gateway fields
      expect(response).toHaveProperty('statusCode');
      expect(response).toHaveProperty('headers');
      expect(response).toHaveProperty('body');
      expect(response.statusCode).toBe(200);
      expect(typeof response.body).toBe('string');

      // Verify body is valid JSON
      expect(() => JSON.parse(response.body)).not.toThrow();
    });

    it('should include all required CORS headers', async () => {
      const event = createMockEvent('GET', '/api/styles');
      const response = await getStylesHandler(event);

      // Verify all CORS headers are present
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Headers');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');

      // Verify CORS methods include GET
      const allowedMethods = response.headers?.['Access-Control-Allow-Methods'] as string;
      expect(allowedMethods).toContain('GET');
    });

    it('should handle OPTIONS request for CORS preflight', async () => {
      const event = createMockEvent('OPTIONS', '/api/styles');
      const response = await getStylesHandler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods');
    });
  });

  describe('generate handler', () => {
    beforeEach(() => {
      // Set up environment variable for tests
      process.env.REPLICATE_API_TOKEN = 'mock-token-for-testing';
      
      // Mock the ReplicateService.generateIcon method
      vi.spyOn(ReplicateService.prototype, 'generateIcon').mockResolvedValue(
        'https://replicate.delivery/mock/image.png'
      );
    });

    afterEach(() => {
      // Clean up mocks
      vi.restoreAllMocks();
      delete process.env.REPLICATE_API_TOKEN;
    });

    it('should validate and accept valid request with CORS headers', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'pastels',
        brandColors: ['#FF5733'],
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('success');
      expect(body.success).toBe(true);
      expect(body).toHaveProperty('icons');
      expect(body.icons).toHaveLength(4);
    });

    it('should reject empty prompt with validation error', async () => {
      const requestBody = {
        prompt: '',
        style: 'pastels',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(400);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing style with validation error', async () => {
      const requestBody = {
        prompt: 'toys',
        style: '',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid JSON with validation error', async () => {
      const event = createMockEvent('POST', '/api/generate', 'invalid json');
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
    });

    it('should handle OPTIONS request for CORS preflight', async () => {
      const event = createMockEvent('OPTIONS', '/api/generate');
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Access-Control-Allow-Methods');
    });

    it('should reject invalid style ID', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'invalid-style',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.error).toContain('Invalid style ID');
    });

    it('should reject invalid HEX color format', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'pastels',
        brandColors: ['invalid-color'],
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      expect(body.code).toBe('VALIDATION_ERROR');
      expect(body.error).toContain('Invalid HEX color format');
    });

    it('should accept valid HEX colors in both formats', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'pastels',
        brandColors: ['#FF5733', '#ABC'],
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.success).toBe(true);
      expect(body.icons).toHaveLength(4);
    });

    it('should generate exactly 4 icons', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'bubbles',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.icons).toHaveLength(4);
      
      // Verify each icon has required properties
      body.icons.forEach((icon: any) => {
        expect(icon).toHaveProperty('id');
        expect(icon).toHaveProperty('url');
        expect(icon).toHaveProperty('prompt');
        expect(icon).toHaveProperty('style');
        expect(icon).toHaveProperty('generatedAt');
        expect(icon.prompt).toBe('toys');
        expect(icon.style).toBe('bubbles');
      });
    });

    it('should call ReplicateService.generateIcon 4 times in parallel', async () => {
      const requestBody = {
        prompt: 'toys',
        style: 'flat',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      
      const generateIconSpy = vi.spyOn(ReplicateService.prototype, 'generateIcon');
      
      await generateHandler(event);

      expect(generateIconSpy).toHaveBeenCalledTimes(4);
    });

    it('should handle API errors gracefully', async () => {
      // Mock generateIcon to throw an error
      vi.spyOn(ReplicateService.prototype, 'generateIcon').mockRejectedValue(
        new Error('Failed to generate icon: API error')
      );

      const requestBody = {
        prompt: 'toys',
        style: 'pastels',
      };
      const event = createMockEvent('POST', '/api/generate', JSON.stringify(requestBody));
      const response = await generateHandler(event);

      expect(response.statusCode).toBe(500);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('error');
      // With Promise.allSettled, all failures result in GENERATION_ERROR
      expect(body.code).toBe('GENERATION_ERROR');
      expect(body.error).toContain('Generated 0 out of 4 icons');
    });
  });
});
