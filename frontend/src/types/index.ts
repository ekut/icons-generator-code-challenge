// Type definitions for the Icon Set Generator application

export interface StylePreset {
  id: string;                    // Unique identifier (e.g., 'pastels', 'bubbles')
  name: string;                  // Display name (e.g., 'Pastels', 'Bubbles')
  description: string;           // User-facing description of the style
  thumbnail?: string;            // Optional: URL to preview image showing the style
}

export interface GeneratedIcon {
  id: string;
  url: string;
  prompt: string;
  style: string;
}

export interface GenerationRequest {
  prompt: string;
  style: string;
  brandColors: string[];
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}
