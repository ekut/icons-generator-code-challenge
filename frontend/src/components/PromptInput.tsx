import { type ChangeEvent } from 'react'

export interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

/**
 * PromptInput component for entering icon theme descriptions
 * Validates that input is not empty and provides error feedback
 */
export function PromptInput({ value, onChange, error, disabled = false }: PromptInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div>
      <label 
        htmlFor="prompt" 
        className="block text-sm font-medium text-gray-900 mb-2"
      >
        Icon Theme
      </label>
      <input
        id="prompt"
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="e.g., Toys, Food, Travel"
        disabled={disabled}
        className={`w-full px-4 py-2.5 text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-all duration-200 ${
          error
            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:bg-white'
            : 'border-gray-300 bg-white focus:border-blue-500 hover:border-gray-400'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'prompt-error' : undefined}
        aria-required="true"
      />
      {error && (
        <p 
          id="prompt-error" 
          className="mt-2 text-sm text-red-600 font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
