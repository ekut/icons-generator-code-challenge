import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { StylesResponse } from '../types/index.js';
import { STYLE_PRESETS } from '../constants/stylePresets.js';
import { formatSuccessResponse } from './utils.js';

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

    // This endpoint is simple and shouldn't fail, but handle errors gracefully
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        error: 'Failed to retrieve style presets',
        code: 'INTERNAL_ERROR',
      }),
    };
  }
};
