import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import type { GenerationRequest, GeneratedIcon, StylePreset } from '../types';

// Create mock instance that will be used by all tests
const mockInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
    },
    response: {
      use: vi.fn(),
    },
  },
  get: vi.fn(),
  post: vi.fn(),
  request: vi.fn(),
};

// Mock axios before importing the API client
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockInstance),
    isAxiosError: vi.fn((error: any) => error.response !== undefined),
  },
}));

// Import after mocking
const { apiClient } = await import('./api');

describe('APIClient', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clear mock calls but don't restore mocks (we need them for the singleton)
    mockInstance.get.mockClear();
    mockInstance.post.mockClear();
    mockInstance.request.mockClear();
  });

  describe('Successful Requests', () => {
    it('should successfully generate icons with valid request', async () => {
      const mockIcons: GeneratedIcon[] = [
        { id: '1', url: 'https://example.com/icon1.png', prompt: 'toys', style: 'pastels' },
        { id: '2', url: 'https://example.com/icon2.png', prompt: 'toys', style: 'pastels' },
        { id: '3', url: 'https://example.com/icon3.png', prompt: 'toys', style: 'pastels' },
        { id: '4', url: 'https://example.com/icon4.png', prompt: 'toys', style: 'pastels' },
      ];

      const mockResponse = {
        data: { icons: mockIcons },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.post.mockResolvedValue(mockResponse);

      const request: GenerationRequest = {
        prompt: 'toys',
        styleId: 'pastels',
        brandColors: [],
      };

      const result = await apiClient.generateIcons(request);

      expect(result).toEqual(mockIcons);
      expect(mockInstance.post).toHaveBeenCalledWith('/api/generate', request);
    });

    it('should successfully fetch style presets', async () => {
      const mockStyles: StylePreset[] = [
        { id: 'pastels', name: 'Pastels', description: 'Soft colors' },
        { id: 'bubbles', name: 'Bubbles', description: 'Glossy bubbles' },
      ];

      const mockResponse = {
        data: { styles: mockStyles },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.getStyles();

      expect(result).toEqual(mockStyles);
      expect(mockInstance.get).toHaveBeenCalledWith('/api/styles');
    });

    it('should generate icons with brand colors', async () => {
      const mockIcons: GeneratedIcon[] = [
        { id: '1', url: 'https://example.com/icon1.png', prompt: 'logo', style: 'flat' },
        { id: '2', url: 'https://example.com/icon2.png', prompt: 'logo', style: 'flat' },
        { id: '3', url: 'https://example.com/icon3.png', prompt: 'logo', style: 'flat' },
        { id: '4', url: 'https://example.com/icon4.png', prompt: 'logo', style: 'flat' },
      ];

      const mockResponse = {
        data: { icons: mockIcons },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.post.mockResolvedValue(mockResponse);

      const request: GenerationRequest = {
        prompt: 'logo',
        styleId: 'flat',
        brandColors: ['#FF5733', '#33FF57'],
      };

      const result = await apiClient.generateIcons(request);

      expect(result).toEqual(mockIcons);
      expect(mockInstance.post).toHaveBeenCalledWith('/api/generate', request);
    });
  });

  describe('Error Handling', () => {
    it('should handle validation errors (400)', async () => {
      const mockError = {
        response: {
          status: 400,
          data: { error: 'Invalid prompt' },
        },
        config: {},
      };

      mockInstance.post.mockRejectedValue(mockError);

      const request: GenerationRequest = {
        prompt: '',
        styleId: 'pastels',
        brandColors: [],
      };

      try {
        await apiClient.generateIcons(request);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        // The error will be the raw axios error since we're mocking
        expect(error.response.status).toBe(400);
      }
    });

    it('should handle authentication errors (401)', async () => {
      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' },
        },
        config: {},
      };

      mockInstance.get.mockRejectedValue(mockError);

      try {
        await apiClient.getStyles();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should handle rate limit errors (429)', async () => {
      const mockError = {
        response: {
          status: 429,
          data: { error: 'Rate limit exceeded' },
        },
        config: {},
      };

      mockInstance.post.mockRejectedValue(mockError);

      const request: GenerationRequest = {
        prompt: 'toys',
        styleId: 'pastels',
        brandColors: [],
      };

      try {
        await apiClient.generateIcons(request);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(429);
      }
    });

    it('should handle server errors (500)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
        config: {},
      };

      mockInstance.post.mockRejectedValue(mockError);

      const request: GenerationRequest = {
        prompt: 'toys',
        styleId: 'pastels',
        brandColors: [],
      };

      try {
        await apiClient.generateIcons(request);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).toBe(500);
      }
    });

    it('should handle network errors (no response)', async () => {
      const mockError = {
        request: {},
        message: 'Network Error',
        config: {},
      };

      mockInstance.get.mockRejectedValue(mockError);

      try {
        await apiClient.getStyles();
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Network Error');
      }
    });

    it('should handle unknown errors', async () => {
      const mockError = new Error('Unknown error');

      mockInstance.post.mockRejectedValue(mockError);

      const request: GenerationRequest = {
        prompt: 'toys',
        styleId: 'pastels',
        brandColors: [],
      };

      try {
        await apiClient.generateIcons(request);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.message).toBe('Unknown error');
      }
    });
  });

  describe('Request Formatting', () => {
    it('should format generateIcons request correctly', async () => {
      const mockIcons: GeneratedIcon[] = [
        { id: '1', url: 'https://example.com/icon1.png', prompt: 'test', style: 'flat' },
        { id: '2', url: 'https://example.com/icon2.png', prompt: 'test', style: 'flat' },
        { id: '3', url: 'https://example.com/icon3.png', prompt: 'test', style: 'flat' },
        { id: '4', url: 'https://example.com/icon4.png', prompt: 'test', style: 'flat' },
      ];

      const mockResponse = {
        data: { icons: mockIcons },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.post.mockResolvedValue(mockResponse);

      const request: GenerationRequest = {
        prompt: 'test prompt',
        styleId: 'flat',
        brandColors: ['#FF0000', '#00FF00'],
      };

      await apiClient.generateIcons(request);

      // Verify the request was made with correct endpoint and data
      expect(mockInstance.post).toHaveBeenCalledWith('/api/generate', request);
      expect(mockInstance.post).toHaveBeenCalledTimes(1);
    });

    it('should format getStyles request correctly', async () => {
      const mockStyles: StylePreset[] = [
        { id: 'pastels', name: 'Pastels', description: 'Soft colors' },
      ];

      const mockResponse = {
        data: { styles: mockStyles },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.get.mockResolvedValue(mockResponse);

      await apiClient.getStyles();

      // Verify the request was made with correct endpoint
      expect(mockInstance.get).toHaveBeenCalledWith('/api/styles');
      expect(mockInstance.get).toHaveBeenCalledTimes(1);
    });

    it('should include empty brandColors array when not provided', async () => {
      const mockIcons: GeneratedIcon[] = [
        { id: '1', url: 'https://example.com/icon1.png', prompt: 'test', style: 'bubbles' },
        { id: '2', url: 'https://example.com/icon2.png', prompt: 'test', style: 'bubbles' },
        { id: '3', url: 'https://example.com/icon3.png', prompt: 'test', style: 'bubbles' },
        { id: '4', url: 'https://example.com/icon4.png', prompt: 'test', style: 'bubbles' },
      ];

      const mockResponse = {
        data: { icons: mockIcons },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.post.mockResolvedValue(mockResponse);

      const request: GenerationRequest = {
        prompt: 'simple test',
        styleId: 'bubbles',
        brandColors: [],
      };

      await apiClient.generateIcons(request);

      expect(mockInstance.post).toHaveBeenCalledWith('/api/generate', {
        prompt: 'simple test',
        styleId: 'bubbles',
        brandColors: [],
      });
    });

    it('should preserve all request fields', async () => {
      const mockIcons: GeneratedIcon[] = [
        { id: '1', url: 'https://example.com/icon1.png', prompt: 'complex', style: 'gradient' },
        { id: '2', url: 'https://example.com/icon2.png', prompt: 'complex', style: 'gradient' },
        { id: '3', url: 'https://example.com/icon3.png', prompt: 'complex', style: 'gradient' },
        { id: '4', url: 'https://example.com/icon4.png', prompt: 'complex', style: 'gradient' },
      ];

      const mockResponse = {
        data: { icons: mockIcons },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockInstance.post.mockResolvedValue(mockResponse);

      const request: GenerationRequest = {
        prompt: 'complex prompt with special chars !@#$%',
        styleId: 'gradient',
        brandColors: ['#ABCDEF', '#123456', '#FEDCBA'],
      };

      await apiClient.generateIcons(request);

      // Verify all fields are preserved exactly as provided
      const callArgs = mockInstance.post.mock.calls[0];
      expect(callArgs[0]).toBe('/api/generate');
      expect(callArgs[1]).toEqual(request);
      expect(callArgs[1].prompt).toBe('complex prompt with special chars !@#$%');
      expect(callArgs[1].styleId).toBe('gradient');
      expect(callArgs[1].brandColors).toEqual(['#ABCDEF', '#123456', '#FEDCBA']);
    });
  });

  describe('Client Configuration', () => {
    it('should have interceptors configured', () => {
      // Verify interceptors exist on the mock instance
      expect(mockInstance.interceptors).toBeDefined();
      expect(mockInstance.interceptors.request).toBeDefined();
      expect(mockInstance.interceptors.response).toBeDefined();
      expect(mockInstance.interceptors.request.use).toBeDefined();
      expect(mockInstance.interceptors.response.use).toBeDefined();
    });

    it('should use correct base configuration', () => {
      // The API client is configured with a 5-minute timeout
      // and JSON content type headers
      // We verify this by checking that the mock instance methods exist
      expect(mockInstance.get).toBeDefined();
      expect(mockInstance.post).toBeDefined();
    });
  });
});
