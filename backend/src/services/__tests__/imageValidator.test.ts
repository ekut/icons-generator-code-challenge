import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateImageDimensions, validateIconDimensions, validateImageFormat, validateIconFormat } from '../imageValidator.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('Image Validator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateImageDimensions', () => {
    it('should validate correct 512x512 PNG dimensions', async () => {
      // Create a mock PNG buffer with 512x512 dimensions
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            // Convert Node.js Buffer to ArrayBuffer properly
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageDimensions('https://example.com/image.png', 512, 512);

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should reject incorrect dimensions', async () => {
      // Create a mock PNG buffer with 256x256 dimensions
      const mockPNGBuffer = createMockPNGBuffer(256, 256);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageDimensions('https://example.com/image.png', 512, 512);

      expect(result).toBe(false);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        validateImageDimensions('https://example.com/image.png', 512, 512)
      ).rejects.toThrow('Failed to fetch image');
    });

    it('should handle download errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

      await expect(
        validateImageDimensions('https://example.com/image.png', 512, 512)
      ).rejects.toThrow('Failed to download image');
    });

    it('should handle invalid PNG data', async () => {
      // Create an invalid buffer (not a PNG)
      const invalidBuffer = Buffer.from('not a png image');

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => invalidBuffer.buffer,
        });

      await expect(
        validateImageDimensions('https://example.com/image.png', 512, 512)
      ).rejects.toThrow('Unable to parse image dimensions');
    });

    it('should validate custom dimensions', async () => {
      // Create a mock PNG buffer with 1024x1024 dimensions
      const mockPNGBuffer = createMockPNGBuffer(1024, 1024);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageDimensions('https://example.com/image.png', 1024, 1024);

      expect(result).toBe(true);
    });
  });

  describe('validateIconDimensions', () => {
    it('should use 512x512 as default dimensions', async () => {
      // Create a mock PNG buffer with 512x512 dimensions
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateIconDimensions('https://example.com/icon.png');

      expect(result).toBe(true);
    });

    it('should reject non-512x512 icons', async () => {
      // Create a mock PNG buffer with 256x256 dimensions
      const mockPNGBuffer = createMockPNGBuffer(256, 256);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateIconDimensions('https://example.com/icon.png');

      expect(result).toBe(false);
    });
  });

  describe('validateImageFormat', () => {
    it('should validate correct PNG format', async () => {
      // Create a valid PNG buffer
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/png';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageFormat('https://example.com/image.png');

      expect(result).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should reject non-PNG format (JPEG)', async () => {
      // Create a JPEG buffer (starts with FF D8 FF)
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/jpeg';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(jpegBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < jpegBuffer.length; i++) {
              view[i] = jpegBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageFormat('https://example.com/image.jpg');

      expect(result).toBe(false);
    });

    it('should reject invalid image data', async () => {
      // Create an invalid buffer (not an image)
      const invalidBuffer = Buffer.from('not an image file');

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'text/plain';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => invalidBuffer.buffer,
        });

      const result = await validateImageFormat('https://example.com/file.txt');

      expect(result).toBe(false);
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        validateImageFormat('https://example.com/image.png')
      ).rejects.toThrow('Failed to fetch image');
    });

    it('should handle download errors', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/png';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error',
        });

      await expect(
        validateImageFormat('https://example.com/image.png')
      ).rejects.toThrow('Failed to download image');
    });

    it('should validate PNG even without Content-Type header', async () => {
      // Create a valid PNG buffer
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: () => null, // No Content-Type header
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageFormat('https://example.com/image.png');

      expect(result).toBe(true);
    });

    it('should validate PNG signature even with wrong Content-Type', async () => {
      // Create a valid PNG buffer but with wrong Content-Type
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/jpeg'; // Wrong Content-Type
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateImageFormat('https://example.com/image.png');

      // Should still pass because actual file signature is PNG
      expect(result).toBe(true);
    });
  });

  describe('validateIconFormat', () => {
    it('should validate PNG format for icons', async () => {
      // Create a valid PNG buffer
      const mockPNGBuffer = createMockPNGBuffer(512, 512);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/png';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(mockPNGBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < mockPNGBuffer.length; i++) {
              view[i] = mockPNGBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateIconFormat('https://example.com/icon.png');

      expect(result).toBe(true);
    });

    it('should reject non-PNG format for icons', async () => {
      // Create a JPEG buffer
      const jpegBuffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);

      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: {
            get: (name: string) => {
              if (name === 'content-type') return 'image/jpeg';
              return null;
            },
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          arrayBuffer: async () => {
            const arrayBuffer = new ArrayBuffer(jpegBuffer.length);
            const view = new Uint8Array(arrayBuffer);
            for (let i = 0; i < jpegBuffer.length; i++) {
              view[i] = jpegBuffer[i];
            }
            return arrayBuffer;
          },
        });

      const result = await validateIconFormat('https://example.com/icon.jpg');

      expect(result).toBe(false);
    });
  });
});

/**
 * Helper function to create a mock PNG buffer with specified dimensions
 * Creates a minimal valid PNG structure with IHDR chunk
 */
function createMockPNGBuffer(width: number, height: number): Buffer {
  // PNG signature (8 bytes)
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk length (4 bytes) - always 13 for IHDR
  const ihdrLength = Buffer.alloc(4);
  ihdrLength.writeUInt32BE(13, 0);

  // IHDR chunk type (4 bytes)
  const ihdrType = Buffer.from('IHDR');

  // IHDR chunk data (13 bytes)
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);  // Width (4 bytes)
  ihdrData.writeUInt32BE(height, 4); // Height (4 bytes)
  ihdrData.writeUInt8(8, 8);         // Bit depth (1 byte)
  ihdrData.writeUInt8(6, 9);         // Color type (1 byte) - RGBA
  ihdrData.writeUInt8(0, 10);        // Compression method (1 byte)
  ihdrData.writeUInt8(0, 11);        // Filter method (1 byte)
  ihdrData.writeUInt8(0, 12);        // Interlace method (1 byte)

  // CRC (4 bytes) - simplified, not a real CRC but needed for structure
  const ihdrCrc = Buffer.alloc(4);
  ihdrCrc.writeUInt32BE(0, 0);

  // Combine all parts to create a minimal valid PNG
  // Structure: signature + length + type + data + crc
  return Buffer.concat([
    signature,    // 8 bytes: PNG signature
    ihdrLength,   // 4 bytes: chunk length
    ihdrType,     // 4 bytes: "IHDR"
    ihdrData,     // 13 bytes: width, height, and other properties
    ihdrCrc,      // 4 bytes: CRC
  ]);
}
