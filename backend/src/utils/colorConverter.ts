/**
 * Color conversion utilities for transforming HEX color codes
 * into natural language color names that AI models can understand.
 */

interface ColorDefinition {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
}

/**
 * Base color palette with common color names
 * These are the colors that AI models are most likely to understand
 */
const BASE_COLORS: ColorDefinition[] = [
  { name: 'red', hex: '#FF0000', rgb: { r: 255, g: 0, b: 0 } },
  { name: 'orange', hex: '#FF8000', rgb: { r: 255, g: 128, b: 0 } },
  { name: 'yellow', hex: '#FFFF00', rgb: { r: 255, g: 255, b: 0 } },
  { name: 'green', hex: '#00FF00', rgb: { r: 0, g: 255, b: 0 } },
  { name: 'cyan', hex: '#00FFFF', rgb: { r: 0, g: 255, b: 255 } },
  { name: 'blue', hex: '#0000FF', rgb: { r: 0, g: 0, b: 255 } },
  { name: 'purple', hex: '#8000FF', rgb: { r: 128, g: 0, b: 255 } },
  { name: 'magenta', hex: '#FF00FF', rgb: { r: 255, g: 0, b: 255 } },
  { name: 'pink', hex: '#FFC0CB', rgb: { r: 255, g: 192, b: 203 } },
  { name: 'brown', hex: '#8B4513', rgb: { r: 139, g: 69, b: 19 } },
  { name: 'gray', hex: '#808080', rgb: { r: 128, g: 128, b: 128 } },
  { name: 'black', hex: '#000000', rgb: { r: 0, g: 0, b: 0 } },
  { name: 'white', hex: '#FFFFFF', rgb: { r: 255, g: 255, b: 255 } },
];

/**
 * Convert HEX color code to RGB values
 * @param hex - HEX color code (e.g., "#FF5733" or "#F57")
 * @returns RGB object with r, g, b values (0-255)
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Handle 3-digit HEX codes (e.g., #F57 -> #FF5577)
  const fullHex = cleanHex.length === 3
    ? cleanHex.split('').map(char => char + char).join('')
    : cleanHex;
  
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Calculate Euclidean distance between two RGB colors
 * @param rgb1 - First RGB color
 * @param rgb2 - Second RGB color
 * @returns Distance value (lower = more similar)
 */
function colorDistance(
  rgb1: { r: number; g: number; b: number },
  rgb2: { r: number; g: number; b: number }
): number {
  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;
  
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Determine if a color is light or dark based on perceived brightness
 * @param rgb - RGB color values
 * @returns true if the color is light, false if dark
 */
function isLightColor(rgb: { r: number; g: number; b: number }): boolean {
  // Calculate perceived brightness using the formula:
  // brightness = (0.299*R + 0.587*G + 0.114*B)
  const brightness = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
  return brightness > 128;
}

/**
 * Determine if a color is saturated or muted
 * @param rgb - RGB color values
 * @returns true if the color is saturated, false if muted
 */
function isSaturatedColor(rgb: { r: number; g: number; b: number }): boolean {
  const max = Math.max(rgb.r, rgb.g, rgb.b);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const saturation = max === 0 ? 0 : (max - min) / max;
  return saturation > 0.5;
}

/**
 * Convert HEX color code to a natural language color name
 * that AI models can understand and use in prompts.
 * 
 * @param hex - HEX color code (e.g., "#FF5733")
 * @returns Natural language color name (e.g., "coral red")
 * 
 * Examples:
 * - "#FF5733" -> "coral red"
 * - "#33FF57" -> "bright green"
 * - "#3357FF" -> "bright blue"
 * - "#FFB6C1" -> "light pink"
 * - "#8B4513" -> "brown"
 */
export function hexToColorName(hex: string): string {
  const rgb = hexToRgb(hex);
  
  // Find the closest base color
  let closestColor = BASE_COLORS[0];
  let minDistance = colorDistance(rgb, closestColor.rgb);
  
  for (const color of BASE_COLORS) {
    const distance = colorDistance(rgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closestColor = color;
    }
  }
  
  // Add descriptive modifiers based on color properties
  const modifiers: string[] = [];
  
  // Check if it's a very close match (no modifiers needed)
  if (minDistance < 50) {
    return closestColor.name;
  }
  
  // Add brightness modifier
  const isLight = isLightColor(rgb);
  const isDark = !isLight && (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) < 64;
  
  if (isLight && closestColor.name !== 'white') {
    modifiers.push('light');
  } else if (isDark && closestColor.name !== 'black') {
    modifiers.push('dark');
  }
  
  // Add saturation modifier
  const isSaturated = isSaturatedColor(rgb);
  if (isSaturated && !isLight && !isDark) {
    modifiers.push('bright');
  } else if (!isSaturated && closestColor.name !== 'gray' && closestColor.name !== 'brown') {
    modifiers.push('muted');
  }
  
  // Combine modifiers with base color name
  if (modifiers.length > 0) {
    return `${modifiers.join(' ')} ${closestColor.name}`;
  }
  
  return closestColor.name;
}

/**
 * Convert an array of HEX color codes to natural language color names
 * @param hexColors - Array of HEX color codes
 * @returns Array of natural language color names
 */
export function hexColorsToNames(hexColors: string[]): string[] {
  return hexColors.map(hex => hexToColorName(hex));
}
