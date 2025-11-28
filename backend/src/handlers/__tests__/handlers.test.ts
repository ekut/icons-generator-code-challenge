import { describe, it, expect } from 'vitest';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { handler as generateHandler } from '../generate.js';
import { handler as getStylesHandler } from '../getStyles.js';

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
    it('should return all 5 style presets with CORS headers', async () => {
      const event = createMockEvent('GET', '/api/styles');
      const response = await getStylesHandler(event);

      expect(response.statusCode).toBe(200);
      expect(response.headers).toHaveProperty('Access-Control-Allow-Origin', '*');
      expect(response.headers).toHaveProperty('Content-Type', 'application/json');

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('styles');
      expect(body.styles).toHaveLength(5);
      expect(body.styles[0]).toHaveProperty('id');
      expect(body.styles[0]).toHaveProperty('name');
      expect(body.styles[0]).toHaveProperty('description');
      expect(body.styles[0]).toHaveProperty('promptModifiers');
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
  });
});
