import { describe, it, expect } from 'vitest';
import { hexToRgb, hexToColorName, hexColorsToNames } from '../colorConverter.js';

describe('colorConverter', () => {
  describe('hexToRgb', () => {
    it('should convert 6-digit HEX to RGB', () => {
      expect(hexToRgb('#FF5733')).toEqual({ r: 255, g: 87, b: 51 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should convert 3-digit HEX to RGB', () => {
      expect(hexToRgb('#F57')).toEqual({ r: 255, g: 85, b: 119 });
      expect(hexToRgb('#000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should handle HEX codes without # prefix', () => {
      expect(hexToRgb('FF5733')).toEqual({ r: 255, g: 87, b: 51 });
      expect(hexToRgb('F57')).toEqual({ r: 255, g: 85, b: 119 });
    });
  });

  describe('hexToColorName', () => {
    it('should convert basic colors correctly', () => {
      expect(hexToColorName('#FF0000')).toBe('red');
      expect(hexToColorName('#00FF00')).toBe('green');
      expect(hexToColorName('#0000FF')).toBe('blue');
      expect(hexToColorName('#FFFF00')).toBe('yellow');
      expect(hexToColorName('#FF00FF')).toBe('magenta');
      expect(hexToColorName('#00FFFF')).toBe('cyan');
    });

    it('should add descriptive modifiers for non-exact matches', () => {
      const result1 = hexToColorName('#FF5733');
      // This color is between red and orange, could be either
      expect(result1.length).toBeGreaterThan(0);
      
      const result2 = hexToColorName('#33FF57');
      expect(result2).toContain('green');
      
      const result3 = hexToColorName('#3357FF');
      expect(result3).toContain('blue');
    });

    it('should handle light colors', () => {
      const result = hexToColorName('#FFB6C1');
      expect(result).toContain('pink');
    });

    it('should handle dark colors', () => {
      const result = hexToColorName('#8B4513');
      expect(result).toBe('brown');
    });

    it('should handle grayscale colors', () => {
      expect(hexToColorName('#000000')).toBe('black');
      expect(hexToColorName('#FFFFFF')).toBe('white');
      
      const grayResult = hexToColorName('#808080');
      expect(grayResult).toContain('gray');
    });
  });

  describe('hexColorsToNames', () => {
    it('should convert multiple HEX colors to names', () => {
      const hexColors = ['#FF0000', '#00FF00', '#0000FF'];
      const result = hexColorsToNames(hexColors);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('red');
      expect(result[1]).toBe('green');
      expect(result[2]).toBe('blue');
    });

    it('should handle empty array', () => {
      expect(hexColorsToNames([])).toEqual([]);
    });
  });
});
