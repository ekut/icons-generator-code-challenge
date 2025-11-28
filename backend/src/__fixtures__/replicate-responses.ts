/**
 * Mock data for Replicate API responses
 * Use these in tests instead of making real API calls
 */

/**
 * Mock image URLs that Replicate API would return
 */
export const mockIconUrls = [
  'https://replicate.delivery/mock/icon-1.png',
  'https://replicate.delivery/mock/icon-2.png',
  'https://replicate.delivery/mock/icon-3.png',
  'https://replicate.delivery/mock/icon-4.png',
];

/**
 * Mock successful Replicate API output (array format)
 */
export const mockReplicateOutputArray = [mockIconUrls[0]];

/**
 * Mock successful Replicate API output (object format)
 */
export const mockReplicateOutputObject = {
  url: mockIconUrls[0],
};

/**
 * Mock successful Replicate API output (string format)
 */
export const mockReplicateOutputString = mockIconUrls[0];

/**
 * Mock Replicate API error responses
 */
export const mockReplicateErrors = {
  authentication: {
    status: 401,
    message: 'Invalid API token',
  },
  rateLimited: {
    status: 429,
    message: 'Rate limit exceeded',
    retryAfter: 60,
  },
  serverError: {
    status: 500,
    message: 'Internal server error',
  },
  timeout: {
    code: 'ETIMEDOUT',
    message: 'Request timeout',
  },
};

/**
 * Mock generation parameters
 */
export const mockGenerationParams = {
  prompt: 'toys',
  style: 'pastels',
  brandColors: ['#FF5733', '#33FF57', '#3357FF'],
};

/**
 * Helper to create a mock Replicate client
 * Use this in tests that need to mock the entire client
 */
export function createMockReplicateClient() {
  return {
    run: async () => mockReplicateOutputArray,
  };
}
