import { type ChangeEvent } from 'react'

export interface ColorInputProps {
  colors: string[];
  onChange: (colors: string[]) => void;
  maxColors?: number;
  disabled?: boolean;
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
export function ColorInput({ colors, onChange, maxColors = 3, disabled = false }: ColorInputProps) {
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
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">
        Brand Colors (Optional)
      </label>
      <p className="text-xs text-gray-600 mb-3">
        Enter HEX color codes (e.g., #FF5733 or #F57) to influence the icon palette
      </p>

      <div className="space-y-2.5">
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
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm flex-shrink-0"
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
                    disabled={disabled}
                    className={`flex-1 px-4 py-2.5 text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 ${
                      hasError
                        ? 'border-red-400 bg-red-50 focus:border-red-500 focus:bg-white'
                        : 'border-gray-300 bg-white focus:border-blue-500 hover:border-gray-400'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
                    aria-invalid={hasError ? 'true' : 'false'}
                    aria-describedby={hasError ? `color-error-${index}` : undefined}
                    aria-label={`Brand color ${index + 1}`}
                  />

                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => handleRemoveColor(index)}
                    disabled={disabled}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent flex-shrink-0 active:scale-90"
                    aria-label={`Remove color ${index + 1}`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Error message */}
                {hasError && (
                  <p
                    id={`color-error-${index}`}
                    className="mt-2 text-sm text-red-600 font-medium"
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
            disabled={disabled}
            className="w-full px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-gray-300 active:scale-[0.98]"
          >
            + Add Brand Color
          </button>
        )}

        {colors.length >= maxColors && (
          <p className="text-xs text-gray-600 mt-2">
            Maximum of {maxColors} colors reached
          </p>
        )}
      </div>
    </div>
  )
}
