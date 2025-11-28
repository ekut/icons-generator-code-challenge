import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Style Preset Types
export interface StylePreset {
  id: string;
  name: string;
  description: string;
  promptModifiers: string[];
  thumbnail?: string;
}

// API Request/Response Types
export interface GenerateRequest {
  prompt: string;
  style: string;
  brandColors?: string[];
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  style: string;
  generatedAt: number;
}

export interface GenerateResponse {
  success: boolean;
  icons?: GeneratedIcon[];
  error?: string;
}

export interface StylesResponse {
  styles: StylePreset[];
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

// Lambda Handler Types
export type LambdaHandler = (
  event: APIGatewayProxyEvent
) => Promise<APIGatewayProxyResult>;

// Re-export error handler types for convenience
export {
  ErrorCategory,
  UserFacingError,
  ValidationError,
  APIError as APIErrorClass,
  NetworkError,
  ErrorHandler,
} from '../handlers/errorHandler.js';

// Re-export style presets constants for convenience
export {
  STYLE_PRESETS,
  getStyleById,
  isValidStyleId,
} from '../constants/stylePresets.js';
