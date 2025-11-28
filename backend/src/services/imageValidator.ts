/**
 * Image validation service
 * Validates image properties such as dimensions and format
 */

/**
 * Validate that an image has the expected dimensions
 * 
 * @param imageUrl - URL of the image to validate
 * @param expectedWidth - Expected width in pixels (default: 512)
 * @param expectedHeight - Expected height in pixels (default: 512)
 * @returns Promise<boolean> - true if dimensions are valid
 * @throws Error if unable to fetch or validate the image
 * 
 * Requirements: 5.1
 */
export async function validateImageDimensions(
  imageUrl: string,
  expectedWidth: number = 512,
  expectedHeight: number = 512
): Promise<boolean> {
  try {
    // Fetch the image to get its metadata
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // For a more thorough validation, we need to actually download and parse the image
    // Using a HEAD request only gives us content-type and size, not dimensions
    // We'll need to fetch the full image and use a library to parse dimensions
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PNG dimensions from the image buffer
    const dimensions = parsePNGDimensions(buffer);

    if (!dimensions) {
      throw new Error('Unable to parse image dimensions');
    }

    // Validate dimensions match expected values
    const isValid = dimensions.width === expectedWidth && dimensions.height === expectedHeight;

    if (!isValid) {
      console.warn(
        `Image dimension mismatch: expected ${expectedWidth}x${expectedHeight}, ` +
        `got ${dimensions.width}x${dimensions.height}`
      );
    }

    return isValid;

  } catch (error) {
    console.error('Error validating image dimensions:', error);
    throw error;
  }
}

/**
 * Parse PNG image dimensions from a buffer
 * PNG format: First 8 bytes are signature, then IHDR chunk contains dimensions
 * 
 * PNG structure:
 * - Bytes 0-7: PNG signature
 * - Bytes 8-11: IHDR chunk length (4 bytes, big-endian, value = 13)
 * - Bytes 12-15: IHDR chunk type ("IHDR" as ASCII)
 * - Bytes 16-19: Image width (4 bytes, big-endian)
 * - Bytes 20-23: Image height (4 bytes, big-endian)
 * - Bytes 24-28: Bit depth, color type, compression, filter, interlace
 * - Bytes 29-32: CRC
 * 
 * @param buffer - Image data buffer
 * @returns Object with width and height, or null if unable to parse
 */
function parsePNGDimensions(buffer: Buffer): { width: number; height: number } | null {
  try {
    // Check PNG signature (first 8 bytes)
    const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    
    // Need at least 33 bytes for a minimal PNG with IHDR
    if (buffer.length < 33) {
      console.warn(`Buffer too small: ${buffer.length} bytes, need at least 33`);
      return null;
    }

    // Verify PNG signature
    for (let i = 0; i < 8; i++) {
      if (buffer[i] !== pngSignature[i]) {
        console.warn(`Invalid PNG signature at byte ${i}: expected ${pngSignature[i]}, got ${buffer[i]}`);
        return null;
      }
    }

    // Verify IHDR chunk type (bytes 12-15 should be "IHDR")
    const chunkType = buffer.toString('ascii', 12, 16);
    if (chunkType !== 'IHDR') {
      console.warn(`Invalid chunk type: expected "IHDR", got "${chunkType}"`);
      return null;
    }

    // Read width (bytes 16-19, big-endian)
    const width = buffer.readUInt32BE(16);

    // Read height (bytes 20-23, big-endian)
    const height = buffer.readUInt32BE(20);

    return { width, height };

  } catch (error) {
    console.error('Error parsing PNG dimensions:', error);
    return null;
  }
}

/**
 * Validate image dimensions for a generated icon
 * Convenience wrapper that uses the standard 512x512 dimensions
 * 
 * @param imageUrl - URL of the generated icon
 * @returns Promise<boolean> - true if dimensions are valid (512x512)
 * 
 * Requirements: 5.1
 */
export async function validateIconDimensions(imageUrl: string): Promise<boolean> {
  return validateImageDimensions(imageUrl, 512, 512);
}

/**
 * Validate that an image is in PNG format
 * 
 * @param imageUrl - URL of the image to validate
 * @returns Promise<boolean> - true if the image is a valid PNG
 * @throws Error if unable to fetch or validate the image
 * 
 * Requirements: 5.2
 */
export async function validateImageFormat(imageUrl: string): Promise<boolean> {
  try {
    // Fetch the image to check its format
    const response = await fetch(imageUrl, { method: 'HEAD' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    // Check Content-Type header
    const contentType = response.headers.get('content-type');
    
    if (!contentType) {
      console.warn('No Content-Type header found, will verify PNG signature');
    } else if (!contentType.includes('image/png')) {
      console.warn(`Content-Type is not PNG: ${contentType}`);
      // Don't immediately fail - verify with actual file signature
    }

    // Download the image to verify PNG signature
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status} ${imageResponse.statusText}`);
    }

    const arrayBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Verify PNG signature
    const isValidPNG = verifyPNGSignature(buffer);

    if (!isValidPNG) {
      console.warn('Image does not have a valid PNG signature');
    }

    return isValidPNG;

  } catch (error) {
    console.error('Error validating image format:', error);
    throw error;
  }
}

/**
 * Verify that a buffer contains a valid PNG signature
 * PNG signature: 89 50 4E 47 0D 0A 1A 0A (8 bytes)
 * 
 * @param buffer - Image data buffer
 * @returns boolean - true if buffer starts with PNG signature
 */
function verifyPNGSignature(buffer: Buffer): boolean {
  // PNG signature (first 8 bytes)
  const pngSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  // Need at least 8 bytes for signature
  if (buffer.length < 8) {
    console.warn(`Buffer too small: ${buffer.length} bytes, need at least 8 for PNG signature`);
    return false;
  }

  // Verify each byte of the signature
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== pngSignature[i]) {
      console.warn(`Invalid PNG signature at byte ${i}: expected ${pngSignature[i]}, got ${buffer[i]}`);
      return false;
    }
  }

  return true;
}

/**
 * Validate that an icon is in PNG format
 * Convenience wrapper for icon format validation
 * 
 * @param imageUrl - URL of the generated icon
 * @returns Promise<boolean> - true if the icon is a valid PNG
 * 
 * Requirements: 5.2
 */
export async function validateIconFormat(imageUrl: string): Promise<boolean> {
  return validateImageFormat(imageUrl);
}
