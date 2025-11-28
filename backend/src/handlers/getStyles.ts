import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StylesResponse, StylePreset } from '../types/index.js';
import { formatSuccessResponse, formatErrorResponse } from './utils.js';

/**
 * Predefined style presets for icon generation
 * These will be used to construct prompts for the FLUX-schnell model
 */
const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'pastels',
    name: 'Pastels',
    description: 'Soft, muted colors with gentle gradients',
    promptModifiers: ['pastel colors', 'soft lighting', 'gentle gradients', 'minimalist'],
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    description: 'Glossy, bubble-like appearance with reflections',
    promptModifiers: ['glossy', 'bubble style', 'reflective', 'translucent', '3D'],
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'Clean, flat design with solid colors',
    promptModifiers: ['flat design', 'solid colors', 'minimalist', 'vector style'],
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradients and color transitions',
    promptModifiers: ['gradient', 'vibrant colors', 'color transitions', 'modern'],
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Line-based icons with minimal fill',
    promptModifiers: ['outline style', 'line art', 'minimal', 'stroke-based'],
  },
];

/**
 * Lambda handler for retrieving available style presets
 * GET /api/styles
 * 
 * Returns: { styles: StylePreset[] }
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('GetStyles handler invoked', { path: event.path, method: event.httpMethod });

  try {
    // Handle OPTIONS request for CORS preflight
    if (event.httpMethod === 'OPTIONS') {
      return formatSuccessResponse({ message: 'OK' }, 200);
    }

    // Return all available style presets
    const response: StylesResponse = {
      styles: STYLE_PRESETS,
    };

    console.log('Returning style presets', { count: STYLE_PRESETS.length });

    return formatSuccessResponse(response);

  } catch (error) {
    console.error('Error in getStyles handler:', error);

    if (error instanceof Error) {
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

// Export STYLE_PRESETS for use in other modules
export { STYLE_PRESETS };
