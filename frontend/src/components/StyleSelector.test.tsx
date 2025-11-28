import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StyleSelector } from './StyleSelector'
import type { StylePreset } from '../types'

// Mock style presets for testing
const mockStyles: StylePreset[] = [
  {
    id: 'pastels',
    name: 'Pastels',
    description: 'Soft, muted colors with gentle gradients',
  },
  {
    id: 'bubbles',
    name: 'Bubbles',
    description: 'Glossy, bubble-like appearance with reflections',
  },
  {
    id: 'flat',
    name: 'Flat',
    description: 'Clean, flat design with solid colors',
  },
  {
    id: 'gradient',
    name: 'Gradient',
    description: 'Vibrant gradients and color transitions',
  },
  {
    id: 'outline',
    name: 'Outline',
    description: 'Line-based icons with minimal fill',
  },
]

describe('StyleSelector', () => {
  // Test that all styles are displayed (Requirement 2.1)
  it('displays all 5 style presets', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    // Verify all 5 styles are rendered
    expect(screen.getByText('Pastels')).toBeInTheDocument()
    expect(screen.getByText('Bubbles')).toBeInTheDocument()
    expect(screen.getByText('Flat')).toBeInTheDocument()
    expect(screen.getByText('Gradient')).toBeInTheDocument()
    expect(screen.getByText('Outline')).toBeInTheDocument()
  })

  it('displays all style descriptions', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    // Verify all descriptions are rendered
    expect(screen.getByText('Soft, muted colors with gentle gradients')).toBeInTheDocument()
    expect(screen.getByText('Glossy, bubble-like appearance with reflections')).toBeInTheDocument()
    expect(screen.getByText('Clean, flat design with solid colors')).toBeInTheDocument()
    expect(screen.getByText('Vibrant gradients and color transitions')).toBeInTheDocument()
    expect(screen.getByText('Line-based icons with minimal fill')).toBeInTheDocument()
  })

  it('renders correct number of style buttons', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(5)
  })

  // Test selection highlighting (Requirement 2.2)
  it('highlights the selected style preset', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const pastelsButton = screen.getByRole('button', { name: /Pastels/i })
    
    // Check for selected styling classes
    expect(pastelsButton).toHaveClass('border-blue-600')
    expect(pastelsButton).toHaveClass('bg-blue-50')
    expect(pastelsButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('displays checkmark icon for selected style', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="bubbles" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('button', { name: /Bubbles/i })
    
    // Check that the checkmark SVG is present
    const svg = bubblesButton.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('text-blue-600')
  })

  it('does not highlight unselected styles', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('button', { name: /Bubbles/i })
    
    // Check for unselected styling classes
    expect(bubblesButton).toHaveClass('border-gray-200')
    expect(bubblesButton).toHaveClass('bg-white')
    expect(bubblesButton).toHaveAttribute('aria-pressed', 'false')
  })

  it('does not display checkmark for unselected styles', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('button', { name: /Bubbles/i })
    
    // Check that no checkmark SVG is present
    const svg = bubblesButton.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('handles no selection state correctly', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    const buttons = screen.getAllByRole('button')
    
    // All buttons should be unselected
    buttons.forEach(button => {
      expect(button).toHaveClass('border-gray-200')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  // Test selection changes (Requirement 2.3)
  it('calls onSelect when a style is clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={handleSelect} />)
    
    const pastelsButton = screen.getByRole('button', { name: /Pastels/i })
    await user.click(pastelsButton)
    
    expect(handleSelect).toHaveBeenCalledTimes(1)
    expect(handleSelect).toHaveBeenCalledWith('pastels')
  })

  it('calls onSelect with correct style ID for each style', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={handleSelect} />)
    
    // Get all buttons and click each one
    const buttons = screen.getAllByRole('button')
    
    // Click Pastels (first button)
    await user.click(buttons[0])
    expect(handleSelect).toHaveBeenLastCalledWith('pastels')
    
    // Click Bubbles (second button)
    await user.click(buttons[1])
    expect(handleSelect).toHaveBeenLastCalledWith('bubbles')
    
    // Click Flat (third button)
    await user.click(buttons[2])
    expect(handleSelect).toHaveBeenLastCalledWith('flat')
    
    // Click Gradient (fourth button)
    await user.click(buttons[3])
    expect(handleSelect).toHaveBeenLastCalledWith('gradient')
    
    // Click Outline (fifth button)
    await user.click(buttons[4])
    expect(handleSelect).toHaveBeenLastCalledWith('outline')
    
    expect(handleSelect).toHaveBeenCalledTimes(5)
  })

  it('allows changing selection from one style to another', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    const { rerender } = render(
      <StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={handleSelect} />
    )
    
    // Click a different style
    await user.click(screen.getByRole('button', { name: /Bubbles/i }))
    
    expect(handleSelect).toHaveBeenCalledWith('bubbles')
    
    // Rerender with new selection
    rerender(<StyleSelector styles={mockStyles} selectedStyle="bubbles" onSelect={handleSelect} />)
    
    // Verify new selection is highlighted
    const bubblesButton = screen.getByRole('button', { name: /Bubbles/i })
    expect(bubblesButton).toHaveClass('border-blue-600')
    expect(bubblesButton).toHaveAttribute('aria-pressed', 'true')
  })

  it('allows clicking the same style multiple times', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={handleSelect} />)
    
    const pastelsButton = screen.getByRole('button', { name: /Pastels/i })
    
    // Click the already selected style
    await user.click(pastelsButton)
    
    expect(handleSelect).toHaveBeenCalledWith('pastels')
  })

  // Additional accessibility and UI tests
  it('renders with proper label', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    expect(screen.getByText('Visual Style')).toBeInTheDocument()
  })

  it('has proper button type attributes', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    const buttons = screen.getAllByRole('button')
    
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button')
    })
  })

  it('handles empty styles array', () => {
    render(<StyleSelector styles={[]} selectedStyle={null} onSelect={() => {}} />)
    
    expect(screen.getByText('Visual Style')).toBeInTheDocument()
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('handles single style', () => {
    const singleStyle: StylePreset[] = [mockStyles[0]]
    
    render(<StyleSelector styles={singleStyle} selectedStyle={null} onSelect={() => {}} />)
    
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByText('Pastels')).toBeInTheDocument()
  })
})
