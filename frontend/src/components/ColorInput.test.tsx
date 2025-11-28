import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorInput, validateHexColor } from './ColorInput'

describe('ColorInput', () => {
  // Test HEX validation (Requirement 3.2)
  describe('HEX validation', () => {
    it('validates correct 6-digit HEX codes', () => {
      expect(validateHexColor('#FF5733')).toBe(true)
      expect(validateHexColor('#000000')).toBe(true)
      expect(validateHexColor('#FFFFFF')).toBe(true)
      expect(validateHexColor('#abc123')).toBe(true)
    })

    it('validates correct 3-digit HEX codes', () => {
      expect(validateHexColor('#F57')).toBe(true)
      expect(validateHexColor('#000')).toBe(true)
      expect(validateHexColor('#FFF')).toBe(true)
      expect(validateHexColor('#abc')).toBe(true)
    })

    it('validates case-insensitive HEX codes', () => {
      expect(validateHexColor('#ff5733')).toBe(true)
      expect(validateHexColor('#FF5733')).toBe(true)
      expect(validateHexColor('#Ff5733')).toBe(true)
    })

    it('accepts empty string as valid (optional field)', () => {
      expect(validateHexColor('')).toBe(true)
    })

    it('rejects invalid HEX codes', () => {
      expect(validateHexColor('FF5733')).toBe(false) // Missing #
      expect(validateHexColor('#FF57')).toBe(false) // Wrong length
      expect(validateHexColor('#FF573')).toBe(false) // Wrong length
      expect(validateHexColor('#FF57333')).toBe(false) // Too long
      expect(validateHexColor('#GG5733')).toBe(false) // Invalid characters
      expect(validateHexColor('red')).toBe(false) // Color name
      expect(validateHexColor('#')).toBe(false) // Just hash
      expect(validateHexColor('##FF5733')).toBe(false) // Double hash
    })

    it('rejects HEX codes with spaces', () => {
      expect(validateHexColor('#FF 5733')).toBe(false)
      expect(validateHexColor(' #FF5733')).toBe(false)
      expect(validateHexColor('#FF5733 ')).toBe(false)
    })
  })

  // Test error display (Requirement 3.3)
  describe('error display', () => {
    it('displays error message for invalid HEX code', () => {
      render(<ColorInput colors={['invalid']} onChange={() => {}} />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Invalid HEX format/i)).toBeInTheDocument()
    })

    it('displays error message with correct format guidance', () => {
      render(<ColorInput colors={['FF5733']} onChange={() => {}} />)
      
      const errorMessage = screen.getByRole('alert')
      expect(errorMessage).toHaveTextContent('Invalid HEX format. Use #RGB or #RRGGBB (e.g., #F57 or #FF5733)')
    })

    it('does not display error for valid HEX code', () => {
      render(<ColorInput colors={['#FF5733']} onChange={() => {}} />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('does not display error for empty color input', () => {
      render(<ColorInput colors={['']} onChange={() => {}} />)
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    it('applies error styling to invalid input', () => {
      render(<ColorInput colors={['invalid']} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-300')
      expect(input).toHaveAttribute('aria-invalid', 'true')
    })

    it('applies normal styling to valid input', () => {
      render(<ColorInput colors={['#FF5733']} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-gray-300')
      expect(input).not.toHaveClass('border-red-300')
    })

    it('displays multiple error messages for multiple invalid colors', () => {
      render(<ColorInput colors={['invalid1', 'invalid2']} onChange={() => {}} />)
      
      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(2)
    })

    it('displays error only for invalid colors in mixed array', () => {
      render(<ColorInput colors={['#FF5733', 'invalid', '#ABC']} onChange={() => {}} />)
      
      const alerts = screen.getAllByRole('alert')
      expect(alerts).toHaveLength(1)
      expect(alerts[0]).toHaveTextContent(/Invalid HEX format/i)
    })

    it('has proper accessibility attributes for error state', () => {
      render(<ColorInput colors={['invalid']} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid', 'true')
      expect(input).toHaveAttribute('aria-describedby', 'color-error-0')
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('id', 'color-error-0')
    })
  })

  // Test multiple color inputs (Requirement 3.1)
  describe('multiple color inputs', () => {
    it('renders all provided color inputs', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} />)
      
      const inputs = screen.getAllByRole('textbox')
      expect(inputs).toHaveLength(3)
      expect(inputs[0]).toHaveValue('#FF5733')
      expect(inputs[1]).toHaveValue('#00FF00')
      expect(inputs[2]).toHaveValue('#0000FF')
    })

    it('renders add button when below max colors', () => {
      render(<ColorInput colors={['#FF5733']} onChange={() => {}} maxColors={3} />)
      
      expect(screen.getByText('+ Add Brand Color')).toBeInTheDocument()
    })

    it('does not render add button when at max colors', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} maxColors={3} />)
      
      expect(screen.queryByText('+ Add Brand Color')).not.toBeInTheDocument()
    })

    it('displays max colors message when limit reached', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} maxColors={3} />)
      
      expect(screen.getByText('Maximum of 3 colors reached')).toBeInTheDocument()
    })

    it('calls onChange when adding a new color', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['#FF5733']} onChange={handleChange} maxColors={3} />)
      
      const addButton = screen.getByText('+ Add Brand Color')
      await user.click(addButton)
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith(['#FF5733', ''])
    })

    it('calls onChange when removing a color', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['#FF5733', '#00FF00']} onChange={handleChange} />)
      
      const removeButtons = screen.getAllByLabelText(/Remove color/i)
      await user.click(removeButtons[0])
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith(['#00FF00'])
    })

    it('removes correct color when multiple colors exist', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={handleChange} />)
      
      const removeButtons = screen.getAllByLabelText(/Remove color/i)
      await user.click(removeButtons[1]) // Remove middle color
      
      expect(handleChange).toHaveBeenCalledWith(['#FF5733', '#0000FF'])
    })

    it('calls onChange when updating a color value', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['']} onChange={handleChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '#')
      
      // Verify onChange was called when typing
      expect(handleChange).toHaveBeenCalled()
      expect(handleChange.mock.calls.length).toBeGreaterThan(0)
      // Verify the call includes an array with the updated value
      const firstCall = handleChange.mock.calls[0]
      expect(Array.isArray(firstCall[0])).toBe(true)
      expect(firstCall[0]).toHaveLength(1)
      expect(firstCall[0][0]).toContain('#')
    })

    it('updates correct color when multiple colors exist', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={handleChange} />)
      
      const inputs = screen.getAllByRole('textbox')
      await user.clear(inputs[1])
      await user.type(inputs[1], '#FFFFFF')
      
      expect(handleChange).toHaveBeenCalled()
      // Verify that onChange was called with arrays that have 3 elements (preserving structure)
      const calls = handleChange.mock.calls
      expect(calls.length).toBeGreaterThan(0)
      // All calls should maintain the 3-color array structure
      calls.forEach(call => {
        expect(call[0]).toHaveLength(3)
      })
      // Verify the first and third colors remain unchanged in at least one call
      const hasPreservedColors = calls.some(call => 
        call[0][0] === '#FF5733' && call[0][2] === '#0000FF'
      )
      expect(hasPreservedColors).toBe(true)
    })

    it('respects maxColors prop', () => {
      const handleChange = vi.fn()
      
      render(<ColorInput colors={['#FF5733', '#00FF00']} onChange={handleChange} maxColors={2} />)
      
      expect(screen.queryByText('+ Add Brand Color')).not.toBeInTheDocument()
      expect(screen.getByText('Maximum of 2 colors reached')).toBeInTheDocument()
    })

    it('uses default maxColors of 3', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} />)
      
      expect(screen.getByText('Maximum of 3 colors reached')).toBeInTheDocument()
    })

    it('renders remove button for each color', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} />)
      
      const removeButtons = screen.getAllByLabelText(/Remove color/i)
      expect(removeButtons).toHaveLength(3)
    })

    it('has proper accessibility labels for remove buttons', () => {
      render(<ColorInput colors={['#FF5733', '#00FF00']} onChange={() => {}} />)
      
      expect(screen.getByLabelText('Remove color 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove color 2')).toBeInTheDocument()
    })
  })

  // Additional UI and accessibility tests
  describe('UI and accessibility', () => {
    it('renders with proper label', () => {
      render(<ColorInput colors={[]} onChange={() => {}} />)
      
      expect(screen.getByText('Brand Colors (Optional)')).toBeInTheDocument()
    })

    it('displays helper text', () => {
      render(<ColorInput colors={[]} onChange={() => {}} />)
      
      expect(screen.getByText(/Enter HEX color codes/i)).toBeInTheDocument()
      expect(screen.getByText(/e.g., #FF5733 or #F57/i)).toBeInTheDocument()
    })

    it('renders color preview swatch for valid colors', () => {
      const { container } = render(<ColorInput colors={['#FF5733']} onChange={() => {}} />)
      
      const swatch = container.querySelector('[style*="background-color"]')
      expect(swatch).toBeInTheDocument()
      expect(swatch).toHaveStyle({ backgroundColor: '#FF5733' })
    })

    it('does not render color preview for invalid colors', () => {
      const { container } = render(<ColorInput colors={['invalid']} onChange={() => {}} />)
      
      const swatch = container.querySelector('[style*="background-color"]')
      expect(swatch).not.toBeInTheDocument()
    })

    it('does not render color preview for empty colors', () => {
      const { container } = render(<ColorInput colors={['']} onChange={() => {}} />)
      
      const swatch = container.querySelector('[style*="background-color"]')
      expect(swatch).not.toBeInTheDocument()
    })

    it('has placeholder text in input fields', () => {
      render(<ColorInput colors={['']} onChange={() => {}} />)
      
      expect(screen.getByPlaceholderText('#FF5733')).toBeInTheDocument()
    })

    it('limits input length to 7 characters', () => {
      render(<ColorInput colors={['']} onChange={() => {}} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('maxLength', '7')
    })

    it('handles empty colors array', () => {
      render(<ColorInput colors={[]} onChange={() => {}} />)
      
      expect(screen.getByText('+ Add Brand Color')).toBeInTheDocument()
      expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    })

    it('renders multiple color swatches for multiple valid colors', () => {
      const { container } = render(
        <ColorInput colors={['#FF5733', '#00FF00', '#0000FF']} onChange={() => {}} />
      )
      
      const swatches = container.querySelectorAll('[style*="background-color"]')
      expect(swatches).toHaveLength(3)
    })
  })
})
