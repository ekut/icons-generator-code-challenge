import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { GenerateRequest, GenerateResponse, GeneratedIcon } from '../types/index.js';
import { formatSuccessResponse, formatErrorResponse, parseRequestBody } from './utils.js';
import { ReplicateService } from '../services/replicate.js';
import { getStyleById, isValidStyleId } from '../constants/stylePresets.js';

/**
 * Lambda handler for generating icon sets
 * POST /api/generate
 * 
 * Accepts: { prompt: string, style: string, brandColors?: string[] }
 * Returns: { success: boolean, icons?: GeneratedIcon[], error?: string }
 * 
 * Requirements: 4.1, 7.3
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

    // Validate prompt contains at least one alphanumeric character
    if (!/[a-zA-Z0-9]/.test(request.prompt)) {
      return formatErrorResponse(
        'Prompt must contain at least one letter or number',
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

    // Validate style ID exists
    if (!isValidStyleId(request.style)) {
      return formatErrorResponse(
        `Invalid style ID: ${request.style}. Must be one of: pastels, bubbles, flat, gradient, outline`,
        400,
        'VALIDATION_ERROR'
      );
    }

    // Validate brand colors if provided (HEX format)
    if (request.brandColors && request.brandColors.length > 0) {
      const hexColorRegex = /^#([0-9A-F]{3}){1,2}$/i;
      for (const color of request.brandColors) {
        if (!hexColorRegex.test(color)) {
          return formatErrorResponse(
            `Invalid HEX color format: ${color}. Expected format: #RGB or #RRGGBB`,
            400,
            'VALIDATION_ERROR'
          );
        }
      }
    }

    console.log('Generation request validated', {
      prompt: request.prompt,
      style: request.style,
      hasBrandColors: !!request.brandColors,
      brandColorsCount: request.brandColors?.length || 0,
    });

    // Get the style preset
    const stylePreset = getStyleById(request.style);
    if (!stylePreset) {
      return formatErrorResponse(
        `Style preset not found: ${request.style}`,
        500,
        'INTERNAL_ERROR'
      );
    }

    // Initialize Replicate service
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      console.error('REPLICATE_API_TOKEN environment variable is not set');
      return formatErrorResponse(
        'Service configuration error',
        500,
        'CONFIGURATION_ERROR'
      );
    }

    const replicateService = new ReplicateService(apiToken);

    // Generate 4 icons in parallel
    console.log('Starting parallel generation of 4 icons...');
    const generationStartTime = Date.now();

    // Create 4 generation promises with the same style parameters
    // Requirements: 4.1, 10.2 - All icons use identical style parameters and brand colors
    const iconPromises = Array.from({ length: 4 }, (_, index) => 
      replicateService.generateIcon(
        request.prompt,
        stylePreset,
        request.brandColors
      ).then(url => ({
        id: `${Date.now()}-${index}`,
        url,
        prompt: request.prompt,
        style: request.style,
        generatedAt: Date.now(),
      }))
    );

    // Wait for all 4 icons to be generated, handling partial failures
    // Use Promise.allSettled to capture both successes and failures
    const results = await Promise.allSettled(iconPromises);

    const generationDuration = Date.now() - generationStartTime;
    console.log(`Generation completed in ${generationDuration}ms`);

    // Extract successful icons and collect failures
    const icons: GeneratedIcon[] = [];
    const failures: string[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        icons.push(result.value);
      } else {
        const errorMessage = result.reason instanceof Error 
          ? result.reason.message 
          : 'Unknown error';
        failures.push(`Icon ${index + 1}: ${errorMessage}`);
        console.error(`Failed to generate icon ${index + 1}:`, errorMessage);
      }
    });

    console.log(`Successfully generated ${icons.length} out of 4 icons`);

    // Verify we got exactly 4 icons
    if (icons.length !== 4) {
      console.error(`Expected 4 icons but got ${icons.length}. Failures: ${failures.join('; ')}`);
      
      // If we have some successful icons, include them in the error response
      // This allows for potential retry of only failed icons in the future
      return formatErrorResponse(
        `Failed to generate complete icon set. Generated ${icons.length} out of 4 icons. Errors: ${failures.join('; ')}`,
        500,
        'GENERATION_ERROR'
      );
    }

    // Return successful response
    const response: GenerateResponse = {
      success: true,
      icons,
    };

    return formatSuccessResponse(response);

  } catch (error) {
    console.error('Error in generate handler:', error);

    if (error instanceof Error) {
      // Handle validation errors
      if (error.message.includes('required') || error.message.includes('Invalid JSON')) {
        return formatErrorResponse(error.message, 400, 'VALIDATION_ERROR');
      }

      // Handle Replicate API errors
      if (error.message.includes('Replicate') || error.message.includes('generate icon')) {
        return formatErrorResponse(
          'Failed to generate icons. Please try again.',
          500,
          'API_ERROR'
        );
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
