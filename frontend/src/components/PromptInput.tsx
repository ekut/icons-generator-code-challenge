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
    <div className="mb-4">
      <label 
        htmlFor="prompt" 
        className="block text-sm font-medium text-gray-700 mb-2"
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
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors ${
          error
            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        } ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? 'prompt-error' : undefined}
      />
      {error && (
        <p 
          id="prompt-error" 
          className="mt-2 text-sm text-red-600"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
