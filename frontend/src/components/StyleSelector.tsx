import type { StylePreset } from '../types'

export interface StyleSelectorProps {
  styles: StylePreset[];
  selectedStyle: string | null;
  onSelect: (styleId: string) => void;
  disabled?: boolean;
}

/**
 * StyleSelector component for choosing visual style presets
 * Displays all available styles and highlights the selected one
 */
export function StyleSelector({ styles, selectedStyle, onSelect, disabled = false }: StyleSelectorProps) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Visual Style
      </label>
      <div className="space-y-2">
        {styles.map((style) => {
          const isSelected = selectedStyle === style.id
          
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              className={`w-full text-left px-4 py-3 rounded-md border-2 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      isSelected ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {style.name}
                    </span>
                    {isSelected && (
                      <svg
                        className="ml-2 h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <p className={`mt-1 text-sm ${
                    isSelected ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {style.description}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
