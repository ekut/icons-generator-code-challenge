import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { validateImageDimensions, validateIconDimensions, validateImageFormat, validateIconFormat } from '../imageValidator.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

/**
 * Feature: icon-set-generator, Property 10: Image Resolution Invariant
 * 
 * For any generated icon, the image dimensions should be exactly 512x512 pixels.
 * 
 * Validates: Requirements 5.1
 */
describe('Image Validator - Property-Based Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Property 10: Image Resolution Invariant', () => {
    it('should validate that 512x512 images always pass validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(), // Generate random valid URLs
          async (imageUrl) => {
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

            // Property: Any image with 512x512 dimensions should pass validation
            const result = await validateIconDimensions(imageUrl);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that non-512x512 images always fail validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(), // Generate random valid URLs
          fc.integer({ min: 1, max: 2048 }).filter(w => w !== 512), // Width != 512
          fc.integer({ min: 1, max: 2048 }).filter(h => h !== 512), // Height != 512
          async (imageUrl, width, height) => {
            // Create a mock PNG buffer with non-512x512 dimensions
            const mockPNGBuffer = createMockPNGBuffer(width, height);

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

            // Property: Any image with dimensions other than 512x512 should fail validation
            const result = await validateIconDimensions(imageUrl);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should correctly validate arbitrary dimensions against expected values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          fc.integer({ min: 1, max: 2048 }), // Actual width
          fc.integer({ min: 1, max: 2048 }), // Actual height
          fc.integer({ min: 1, max: 2048 }), // Expected width
          fc.integer({ min: 1, max: 2048 }), // Expected height
          async (imageUrl, actualWidth, actualHeight, expectedWidth, expectedHeight) => {
            // Create a mock PNG buffer with actual dimensions
            const mockPNGBuffer = createMockPNGBuffer(actualWidth, actualHeight);

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

            // Property: Validation should return true if and only if dimensions match
            const result = await validateImageDimensions(imageUrl, expectedWidth, expectedHeight);
            const shouldPass = actualWidth === expectedWidth && actualHeight === expectedHeight;
            expect(result).toBe(shouldPass);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 11: Image Format Invariant', () => {
    it('should validate that valid PNG images always pass format validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(), // Generate random valid URLs
          fc.integer({ min: 1, max: 2048 }), // Random width
          fc.integer({ min: 1, max: 2048 }), // Random height
          async (imageUrl, width, height) => {
            // Create a valid PNG buffer with random dimensions
            const mockPNGBuffer = createMockPNGBuffer(width, height);

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

            // Property: Any valid PNG image should pass format validation
            const result = await validateImageFormat(imageUrl);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that non-PNG images always fail format validation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(), // Generate random valid URLs
          fc.constantFrom('image/jpeg', 'image/gif', 'image/webp', 'image/bmp', 'text/plain'), // Non-PNG content types
          async (imageUrl, contentType) => {
            // Create a non-PNG buffer based on content type
            const nonPNGBuffer = createNonPNGBuffer(contentType);

            mockFetch
              .mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                  get: (name: string) => {
                    if (name === 'content-type') return contentType;
                    return null;
                  },
                },
              })
              .mockResolvedValueOnce({
                ok: true,
                status: 200,
                arrayBuffer: async () => {
                  const arrayBuffer = new ArrayBuffer(nonPNGBuffer.length);
                  const view = new Uint8Array(arrayBuffer);
                  for (let i = 0; i < nonPNGBuffer.length; i++) {
                    view[i] = nonPNGBuffer[i];
                  }
                  return arrayBuffer;
                },
              });

            // Property: Any non-PNG image should fail format validation
            const result = await validateImageFormat(imageUrl);
            expect(result).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate PNG format based on file signature regardless of Content-Type', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          fc.boolean(), // Whether the file is actually a PNG
          fc.constantFrom('image/png', 'image/jpeg', 'image/gif', 'text/plain', null), // Various content types
          async (imageUrl, isPNG, contentType) => {
            // Create buffer based on whether it's actually a PNG
            const buffer = isPNG 
              ? createMockPNGBuffer(512, 512) 
              : createNonPNGBuffer('image/jpeg');

            mockFetch
              .mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                headers: {
                  get: (name: string) => {
                    if (name === 'content-type') return contentType;
                    return null;
                  },
                },
              })
              .mockResolvedValueOnce({
                ok: true,
                status: 200,
                arrayBuffer: async () => {
                  const arrayBuffer = new ArrayBuffer(buffer.length);
                  const view = new Uint8Array(arrayBuffer);
                  for (let i = 0; i < buffer.length; i++) {
                    view[i] = buffer[i];
                  }
                  return arrayBuffer;
                },
              });

            // Property: Validation should be based on actual file signature, not Content-Type
            const result = await validateImageFormat(imageUrl);
            expect(result).toBe(isPNG);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should validate that icon format validation works for any URL', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.webUrl(),
          async (imageUrl) => {
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

            // Property: validateIconFormat should work the same as validateImageFormat
            const result = await validateIconFormat(imageUrl);
            expect(result).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Helper function to create a non-PNG buffer based on content type
 * Creates buffers with appropriate file signatures for different formats
 */
function createNonPNGBuffer(contentType: string): Buffer {
  switch (contentType) {
    case 'image/jpeg':
      // JPEG signature: FF D8 FF
      return Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    case 'image/gif':
      // GIF signature: GIF89a or GIF87a
      return Buffer.from('GIF89a');
    case 'image/webp':
      // WebP signature: RIFF....WEBP
      return Buffer.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]);
    case 'image/bmp':
      // BMP signature: BM
      return Buffer.from([0x42, 0x4D]);
    default:
      // Plain text or unknown
      return Buffer.from('not an image file');
  }
}

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
  return Buffer.concat([
    signature,    // 8 bytes: PNG signature
    ihdrLength,   // 4 bytes: chunk length
    ihdrType,     // 4 bytes: "IHDR"
    ihdrData,     // 13 bytes: width, height, and other properties
    ihdrCrc,      // 4 bytes: CRC
  ]);
}
