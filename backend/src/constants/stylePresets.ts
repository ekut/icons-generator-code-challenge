import { StylePreset } from '../types/index.js';

/**
 * Predefined style presets for icon generation.
 * Each preset includes prompt modifiers that guide the AI model
 * to generate icons in the specified visual style.
 */
export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'pastels',
    name: 'Pastels',
    description: 'Soft, muted colors with gentle gradients',
    promptModifiers: [
      'pastel colors',
      'soft lighting',
      'gentle gradients',
      'minimalist',
    ],
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    description: 'Glossy, bubble-like appearance with reflections',
    promptModifiers: [
      'glossy',
      'bubble style',
      'reflective',
      'translucent',
      '3D',
    ],
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'Clean, flat design with solid colors',
    promptModifiers: [
      'flat design',
      'solid colors',
      'minimalist',
      'vector style',
    ],
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradients and color transitions',
    promptModifiers: [
      'gradient',
      'vibrant colors',
      'color transitions',
      'modern',
    ],
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Line-based icons with minimal fill',
    promptModifiers: [
      'outline style',
      'line art',
      'minimal',
      'stroke-based',
    ],
  },
];

/**
 * Helper function to get a style preset by ID
 * @param styleId - The unique identifier of the style preset
 * @returns The style preset if found, undefined otherwise
 */
export function getStyleById(styleId: string): StylePreset | undefined {
  return STYLE_PRESETS.find((style) => style.id === styleId);
}

/**
 * Helper function to validate if a style ID exists
 * @param styleId - The style ID to validate
 * @returns True if the style exists, false otherwise
 */
export function isValidStyleId(styleId: string): boolean {
  return STYLE_PRESETS.some((style) => style.id === styleId);
}
