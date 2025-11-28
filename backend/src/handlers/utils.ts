import { APIGatewayProxyResult } from 'aws-lambda';

/**
 * CORS headers for API Gateway responses
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Content-Type': 'application/json',
};

/**
 * Format a successful API Gateway response with CORS headers
 */
export function formatSuccessResponse<T>(
  data: T,
  statusCode: number = 200
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(data),
  };
}

/**
 * Format an error API Gateway response with CORS headers
 */
export function formatErrorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: any
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify({
      error: message,
      code,
      details,
    }),
  };
}

/**
 * Parse and validate JSON body from API Gateway event
 */
export function parseRequestBody<T>(body: string | null): T {
  if (!body) {
    throw new Error('Request body is required');
  }

  try {
    return JSON.parse(body) as T;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}
