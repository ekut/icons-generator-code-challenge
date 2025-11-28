import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GenerateRequest, GenerateResponse } from '../types/index.js';
import { formatSuccessResponse, formatErrorResponse, parseRequestBody } from './utils.js';

/**
 * Lambda handler for generating icon sets
 * POST /api/generate
 * 
 * Accepts: { prompt: string, style: string, brandColors?: string[] }
 * Returns: { success: boolean, icons?: GeneratedIcon[], error?: string }
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Generate handler invoked', { path: event.path, method: event.httpMethod });

  try {
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return formatSuccessResponse({ message: 'OK' }, 200);
    }

    // Parse and validate request body
    const request = parseRequestBody<GenerateRequest>(event.body);

    // Validate required fields
    if (!request.prompt || request.prompt.trim() === '') {
      return formatErrorResponse(
        'Prompt is required and cannot be empty',
        400,
        'VALIDATION_ERROR'
      );
    }

    if (!request.style || request.style.trim() === '') {
      return formatErrorResponse(
        'Style is required',
        400,
        'VALIDATION_ERROR'
      );
    }

    // TODO: Implement icon generation logic in subsequent tasks
    // This will be implemented in task 2.2 (Replicate API client)
    // and task 4.1 (generateIcons Lambda handler)
    
    console.log('Generation request validated', {
      prompt: request.prompt,
      style: request.style,
      hasBrandColors: !!request.brandColors,
    });

    // Placeholder response - will be replaced with actual generation
    const response: GenerateResponse = {
      success: true,
      icons: [],
    };

    return formatSuccessResponse(response);

  } catch (error) {
    console.error('Error in generate handler:', error);

    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('required') || error.message.includes('Invalid JSON')) {
        return formatErrorResponse(error.message, 400, 'VALIDATION_ERROR');
      }

      // Handle other errors
      return formatErrorResponse(
        error.message,
        500,
        'INTERNAL_ERROR'
      );
    }

    return formatErrorResponse(
      'An unexpected error occurred',
      500,
      'UNKNOWN_ERROR'
    );
  }
};
