import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PromptInput } from './PromptInput'

describe('PromptInput', () => {
  it('renders with label and input field', () => {
    render(<PromptInput value="" onChange={() => {}} />)
    
    expect(screen.getByLabelText('Icon Theme')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g., Toys, Food, Travel')).toBeInTheDocument()
  })

  it('displays the provided value', () => {
    render(<PromptInput value="Toys" onChange={() => {}} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('Toys')
  })

  it('calls onChange when user types', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<PromptInput value="" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'F')
    
    // Should be called once for the character typed
    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('F')
  })

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'Please enter a prompt'
    render(<PromptInput value="" onChange={() => {}} error={errorMessage} />)
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument()
    expect(screen.getByRole('alert')).toHaveTextContent(errorMessage)
  })

  it('applies error styling when error is present', () => {
    render(<PromptInput value="" onChange={() => {}} error="Error message" />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-red-400')
    expect(input).toHaveAttribute('aria-invalid', 'true')
  })

  it('applies normal styling when no error', () => {
    render(<PromptInput value="" onChange={() => {}} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('border-gray-300')
    expect(input).toHaveAttribute('aria-invalid', 'false')
  })

  it('does not display error message when error prop is undefined', () => {
    render(<PromptInput value="Test" onChange={() => {}} />)
    
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('handles empty string input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    
    render(<PromptInput value="Test" onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    await user.clear(input)
    
    expect(handleChange).toHaveBeenCalled()
  })

  it('handles multiple character input correctly', async () => {
    const user = userEvent.setup()
    let currentValue = ''
    const handleChange = vi.fn((newValue: string) => {
      currentValue = newValue
    })
    
    const { rerender } = render(<PromptInput value={currentValue} onChange={handleChange} />)
    
    const input = screen.getByRole('textbox')
    
    // Type first character
    await user.type(input, 'T')
    rerender(<PromptInput value={currentValue} onChange={handleChange} />)
    
    // Type second character
    await user.type(input, 'o')
    rerender(<PromptInput value={currentValue} onChange={handleChange} />)
    
    // Verify onChange was called
    expect(handleChange).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    const errorMessage = 'This field is required'
    render(<PromptInput value="" onChange={() => {}} error={errorMessage} />)
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'prompt-error')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    
    const errorElement = screen.getByRole('alert')
    expect(errorElement).toHaveAttribute('id', 'prompt-error')
  })
})
