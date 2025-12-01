#!/usr/bin/env node

/**
 * Quick test script to see how HEX colors are converted to natural language
 * Usage: node test-colors.mjs
 */

import { hexToColorName } from './dist/utils/colorConverter.js';

console.log('🎨 Color Conversion Test\n');
console.log('Testing how HEX codes are converted to natural language for AI prompts:\n');

const testColors = [
  // Primary colors
  { hex: '#FF0000', description: 'Pure red' },
  { hex: '#00FF00', description: 'Pure green' },
  { hex: '#0000FF', description: 'Pure blue' },
  
  // Secondary colors
  { hex: '#FFFF00', description: 'Yellow' },
  { hex: '#FF00FF', description: 'Magenta' },
  { hex: '#00FFFF', description: 'Cyan' },
  
  // Common brand colors
  { hex: '#FF5733', description: 'Coral/Orange-red' },
  { hex: '#33FF57', description: 'Bright green' },
  { hex: '#3357FF', description: 'Bright blue' },
  
  // Pastels
  { hex: '#FFB6C1', description: 'Light pink' },
  { hex: '#E6E6FA', description: 'Lavender' },
  { hex: '#FFDAB9', description: 'Peach' },
  
  // Corporate colors
  { hex: '#1E90FF', description: 'Dodger blue' },
  { hex: '#32CD32', description: 'Lime green' },
  { hex: '#FF1493', description: 'Deep pink' },
  
  // Neutrals
  { hex: '#000000', description: 'Black' },
  { hex: '#FFFFFF', description: 'White' },
  { hex: '#808080', description: 'Gray' },
  { hex: '#8B4513', description: 'Brown' },
];

console.log('HEX Code  | Description        | AI-Friendly Name');
console.log('----------|--------------------|-----------------');

testColors.forEach(({ hex, description }) => {
  const colorName = hexToColorName(hex);
  const paddedHex = hex.padEnd(9);
  const paddedDesc = description.padEnd(18);
  console.log(`${paddedHex} | ${paddedDesc} | ${colorName}`);
});

console.log('\n✅ All colors converted successfully!');
console.log('\nExample prompt with colors:');
console.log('Before: "A simple, clean icon of toys, ..., using colors #FF5733, #33FF57"');
console.log(`After:  "A simple, clean icon of toys in ${hexToColorName('#FF5733')} and ${hexToColorName('#33FF57')} colors, ..."`);
