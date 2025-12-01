import Replicate from 'replicate';
import { StylePreset } from '../types/index.js';
import { hexToColorName } from '../utils/colorConverter.js';

/**
 * Service for interacting with the Replicate API
 * Handles authentication, prompt construction, and icon generation
 */
export class ReplicateService {
  private client: Replicate;
  private maxRetries: number = 3;
  private initialRetryDelay: number = 1000; // 1 second

  /**
   * Initialize the Replicate service with API token
   * @param apiToken - Replicate API authentication token
   * @param maxRetries - Maximum number of retry attempts (default: 3)
   * @param initialRetryDelay - Initial delay in milliseconds for exponential backoff (default: 1000ms)
   */
  constructor(apiToken: string, maxRetries: number = 3, initialRetryDelay: number = 1000) {
    if (!apiToken) {
      throw new Error('Replicate API token is required');
    }

    this.client = new Replicate({
      auth: apiToken,
    });
    
    this.maxRetries = maxRetries;
    this.initialRetryDelay = initialRetryDelay;
  }

  /**
   * Generate a single icon using the FLUX-schnell model
   * Includes retry logic with exponential backoff for transient failures
   * 
   * @param prompt - User's text prompt describing the icon theme
   * @param style - Style preset containing visual style parameters
   * @param brandColors - Optional array of HEX color codes to influence the palette
   * @returns URL of the generated icon image
   * 
   * Requirements: 7.1, 7.2, 7.3, 9.4
   */
  async generateIcon(
    prompt: string,
    style: StylePreset,
    brandColors?: string[]
  ): Promise<string> {
    // Construct the full prompt with style modifiers and brand colors
    const fullPrompt = this.buildPrompt(prompt, style, brandColors);

    console.log('Generating icon with prompt:', fullPrompt);

    // Use retry logic for the API call
    return this.executeWithRetry(async () => {
      try {
        // Run the FLUX-schnell model
        // Model endpoint: black-forest-labs/flux-schnell
        const output = await this.client.run(
          'black-forest-labs/flux-schnell',
          {
            input: {
              prompt: fullPrompt,
              num_outputs: 1,
              aspect_ratio: '1:1',
              output_format: 'png',
              output_quality: 100,
              megapixels: '0.25', // 0.25 megapixels = 512x512 (quarter of default 1024x1024)
            },
          }
        );

        // Extract the image URL from the output
        const imageUrl = this.extractImageUrl(output);

        console.log('Icon generated successfully:', imageUrl);

        return imageUrl;

      } catch (error) {
        console.error('Error generating icon:', error);
        
        if (error instanceof Error) {
          throw new Error(`Failed to generate icon: ${error.message}`);
        }
        
        throw new Error('Failed to generate icon: Unknown error');
      }
    });
  }

  /**
   * Build a complete prompt for the FLUX-schnell model
   * Combines user prompt, style modifiers, and optional brand colors
   * 
   * When brand colors are provided:
   * - Converts HEX codes to natural language color names (e.g., #FF5733 -> "coral red")
   * - Integrates colors directly into the object description for better adherence
   * - Removes conflicting color-related style modifiers to avoid confusion
   * 
   * Template without colors: "A simple, clean icon of {user_prompt}, {style_modifiers}, 
   *                           512x512 pixels, icon design, centered, white background"
   * 
   * Template with colors: "A simple, clean icon of {user_prompt} in {color_names} colors, 
   *                        {adapted_style_modifiers}, 512x512 pixels, icon design, centered, white background"
   * 
   * @param userPrompt - User's input describing the icon theme
   * @param style - Style preset with prompt modifiers
   * @param brandColors - Optional HEX color codes
   * @returns Fully constructed prompt string
   * 
   * Requirements: 7.3, 10.1, 10.3
   */
  private buildPrompt(
    userPrompt: string,
    style: StylePreset,
    brandColors?: string[]
  ): string {
    let colorInstruction = '';
    let adaptedModifiers = [...style.promptModifiers];

    // If brand colors are provided, convert them to natural language
    // and adapt the style modifiers to avoid conflicts
    if (brandColors && brandColors.length > 0) {
      // Convert HEX codes to natural language color names
      const colorNames = brandColors.map(hex => hexToColorName(hex));
      
      // Remove conflicting color-related modifiers from the style
      // This prevents the AI from being confused by contradictory instructions
      adaptedModifiers = adaptedModifiers.filter(modifier => {
        const lowerMod = modifier.toLowerCase();
        return !lowerMod.includes('color') && 
               !lowerMod.includes('vibrant') &&
               !lowerMod.includes('muted') &&
               !lowerMod.includes('pastel');
      });
      
      // Build color instruction integrated into the object description
      // Format: "in coral red and bright green colors"
      if (colorNames.length === 1) {
        colorInstruction = ` in ${colorNames[0]} color`;
      } else if (colorNames.length === 2) {
        colorInstruction = ` in ${colorNames[0]} and ${colorNames[1]} colors`;
      } else {
        // For 3+ colors, use comma-separated list with "and" before the last one
        const lastColor = colorNames[colorNames.length - 1];
        const otherColors = colorNames.slice(0, -1).join(', ');
        colorInstruction = ` in ${otherColors}, and ${lastColor} colors`;
      }
    }

    // Join adapted style modifiers with commas
    const styleModifiers = adaptedModifiers.join(', ');

    // Construct the full prompt
    // Color instruction is placed right after the user prompt for better adherence
    const fullPrompt = `A simple, clean icon of ${userPrompt}${colorInstruction}, ${styleModifiers}, 512x512 pixels, icon design, centered, white background`;

    return fullPrompt;
  }

  /**
   * Extract the image URL from Replicate API output
   * Handles different output formats from the API
   * 
   * @param output - Raw output from Replicate API
   * @returns Image URL string
   */
  private extractImageUrl(output: unknown): string {
    // Log the raw output for debugging
    console.log('Replicate API output type:', typeof output);
    console.log('Replicate API output:', JSON.stringify(output, null, 2));

    // Handle array output (most common)
    if (Array.isArray(output) && output.length > 0) {
      const firstItem = output[0];
      
      // If the item is a string, it's the URL
      if (typeof firstItem === 'string') {
        return firstItem;
      }
      
      // If the item is an object with a url property that's a function, call it
      if (typeof firstItem === 'object' && firstItem !== null && 'url' in firstItem) {
        const urlValue = (firstItem as any).url;
        
        // If url is a function, call it
        if (typeof urlValue === 'function') {
          return String(urlValue());
        }
        
        return String(urlValue);
      }
    }

    // Handle direct string output
    if (typeof output === 'string') {
      return output;
    }

    // Handle object with url property
    if (typeof output === 'object' && output !== null && 'url' in output) {
      const urlValue = (output as any).url;
      
      // If url is a function, call it
      if (typeof urlValue === 'function') {
        return String(urlValue());
      }
      
      return String(urlValue);
    }

    throw new Error('Unable to extract image URL from Replicate output');
  }

  /**
   * Execute an async operation with retry logic and exponential backoff
   * Retries on transient failures (5xx errors, timeouts)
   * 
   * @param operation - Async function to execute with retry logic
   * @returns Result of the operation
   * @throws Error if all retry attempts fail
   * 
   * Requirements: 9.4
   */
  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Attempt the operation
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Check if this is a transient error that should be retried
        const isTransient = this.isTransientError(error);
        const isLastAttempt = attempt === this.maxRetries - 1;

        if (!isTransient || isLastAttempt) {
          // Don't retry for non-transient errors or if this was the last attempt
          throw lastError;
        }

        // Calculate exponential backoff delay: initialDelay * 2^attempt
        const delay = this.initialRetryDelay * Math.pow(2, attempt);
        
        console.log(
          `Transient error on attempt ${attempt + 1}/${this.maxRetries}. ` +
          `Retrying in ${delay}ms...`,
          lastError.message
        );

        // Wait before retrying
        await this.delay(delay);
      }
    }

    // This should never be reached due to the throw in the loop, but TypeScript needs it
    throw lastError || new Error('Operation failed after retries');
  }

  /**
   * Determine if an error is transient and should be retried
   * Transient errors include:
   * - 5xx server errors
   * - Network timeouts (ETIMEDOUT, ECONNRESET, ENOTFOUND)
   * - Connection errors
   * 
   * @param error - Error to check
   * @returns true if the error is transient and should be retried
   */
  private isTransientError(error: unknown): boolean {
    if (!error) {
      return false;
    }

    // Check for HTTP status codes (5xx server errors)
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as any;
      
      // Check for status code in various formats
      if (errorObj.status >= 500 && errorObj.status < 600) {
        return true;
      }
      
      if (errorObj.statusCode >= 500 && errorObj.statusCode < 600) {
        return true;
      }

      // Check for response object with status
      if (errorObj.response?.status >= 500 && errorObj.response?.status < 600) {
        return true;
      }

      // Check for network timeout errors
      if (errorObj.code === 'ETIMEDOUT' || 
          errorObj.code === 'ECONNRESET' || 
          errorObj.code === 'ENOTFOUND' ||
          errorObj.code === 'ECONNREFUSED') {
        return true;
      }

      // Check for timeout in error message
      if (errorObj.message && typeof errorObj.message === 'string') {
        const message = errorObj.message.toLowerCase();
        if (message.includes('timeout') || 
            message.includes('timed out') ||
            message.includes('connection reset') ||
            message.includes('network error')) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Delay execution for a specified number of milliseconds
   * 
   * @param ms - Milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
