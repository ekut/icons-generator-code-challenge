import { type ChangeEvent } from 'react'

export interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
}

/**
 * Validates if a string is a valid HEX color code
 * Accepts formats: #RGB or #RRGGBB
 */
export function validateHexColor(color: string): boolean {
  if (!color) return true; // Empty is valid (optional field)
  return /^#([0-9A-F]{3}){1,2}$/i.test(color)
}

/**
 * ColorInput component for entering brand colors in HEX format
 * Validates HEX format and shows validation errors
 * Supports multiple color inputs
 */
export function ColorInput({ colors, onChange, maxColors = 3 }: ColorInputProps) {
  // Add a new color input field
  const handleAddColor = () => {
    if (colors.length < maxColors) {
      onChange([...colors, ''])
    }
  }

  // Remove a color input field
  const handleRemoveColor = (index: number) => {
    const newColors = colors.filter((_, i) => i !== index)
    onChange(newColors)
  }

  // Update a specific color value
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors]
    newColors[index] = value
    onChange(newColors)
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Brand Colors (Optional)
      </label>
      <p className="text-xs text-gray-500 mb-3">
        Enter HEX color codes (e.g., #FF5733 or #F57) to influence the icon palette
      </p>

      <div className="space-y-2">
        {colors.map((color, index) => {
          const isValid = validateHexColor(color)
          const hasError = color.length > 0 && !isValid

          return (
            <div key={index} className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  {/* Color preview swatch */}
                  {isValid && color && (
                    <div
                      className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    />
                  )}
                  
                  {/* Color input field */}
                  <input
                    type="text"
                    value={color}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleColorChange(index, e.target.value)
                    }
                    placeholder="#FF5733"
                    maxLength={7}
                    className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
                      hasError
                        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    }`}
                    aria-invalid={hasError ? 'true' : 'false'}
                    aria-describedby={hasError ? `color-error-${index}` : undefined}
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    className="p-2 text-gray-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-colors"
                    aria-label={`Remove color ${index + 1}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Error message */}
                {hasError && (
                  <p
                    id={`color-error-${index}`}
                    className="mt-1 text-sm text-red-600"
                    role="alert"
                  >
                    Invalid HEX format. Use #RGB or #RRGGBB (e.g., #F57 or #FF5733)
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Add color button */}
        {colors.length < maxColors && (
          <button
            type="button"
            onClick={handleAddColor}
            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm text-gray-600 hover:border-gray-400 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            + Add Brand Color
          </button>
        )}

        {colors.length >= maxColors && (
          <p className="text-xs text-gray-500">
            Maximum of {maxColors} colors reached
          </p>
        )}
      </div>
    </div>
  )
}
