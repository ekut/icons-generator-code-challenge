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
    
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(5)
  })

  // Test selection highlighting (Requirement 2.2)
  it('highlights the selected style preset', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const pastelsButton = screen.getByRole('radio', { name: /Pastels/i })
    
    // Check for selected styling classes
    expect(pastelsButton).toHaveClass('border-blue-600')
    expect(pastelsButton).toHaveClass('bg-blue-50')
    expect(pastelsButton).toHaveAttribute('aria-checked', 'true')
  })

  it('displays checkmark icon for selected style', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="bubbles" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('radio', { name: /Bubbles/i })
    
    // Check that the checkmark SVG is present
    const svg = bubblesButton.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveClass('text-blue-600')
  })

  it('does not highlight unselected styles', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('radio', { name: /Bubbles/i })
    
    // Check for unselected styling classes
    expect(bubblesButton).toHaveClass('border-gray-300')
    expect(bubblesButton).toHaveClass('bg-white')
    expect(bubblesButton).toHaveAttribute('aria-checked', 'false')
  })

  it('does not display checkmark for unselected styles', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={() => {}} />)
    
    const bubblesButton = screen.getByRole('radio', { name: /Bubbles/i })
    
    // Check that no checkmark SVG is present
    const svg = bubblesButton.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('handles no selection state correctly', () => {
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={() => {}} />)
    
    const radios = screen.getAllByRole('radio')
    
    // All radios should be unselected
    radios.forEach(radio => {
      expect(radio).toHaveClass('border-gray-300')
      expect(radio).toHaveAttribute('aria-checked', 'false')
    })
  })

  // Test selection changes (Requirement 2.3)
  it('calls onSelect when a style is clicked', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={handleSelect} />)
    
    const pastelsButton = screen.getByRole('radio', { name: /Pastels/i })
    await user.click(pastelsButton)
    
    expect(handleSelect).toHaveBeenCalledTimes(1)
    expect(handleSelect).toHaveBeenCalledWith('pastels')
  })

  it('calls onSelect with correct style ID for each style', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle={null} onSelect={handleSelect} />)
    
    // Get all radios and click each one
    const radios = screen.getAllByRole('radio')
    
    // Click Pastels (first radio)
    await user.click(radios[0])
    expect(handleSelect).toHaveBeenLastCalledWith('pastels')
    
    // Click Bubbles (second radio)
    await user.click(radios[1])
    expect(handleSelect).toHaveBeenLastCalledWith('bubbles')
    
    // Click Flat (third radio)
    await user.click(radios[2])
    expect(handleSelect).toHaveBeenLastCalledWith('flat')
    
    // Click Gradient (fourth radio)
    await user.click(radios[3])
    expect(handleSelect).toHaveBeenLastCalledWith('gradient')
    
    // Click Outline (fifth radio)
    await user.click(radios[4])
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
    await user.click(screen.getByRole('radio', { name: /Bubbles/i }))
    
    expect(handleSelect).toHaveBeenCalledWith('bubbles')
    
    // Rerender with new selection
    rerender(<StyleSelector styles={mockStyles} selectedStyle="bubbles" onSelect={handleSelect} />)
    
    // Verify new selection is highlighted
    const bubblesButton = screen.getByRole('radio', { name: /Bubbles/i })
    expect(bubblesButton).toHaveClass('border-blue-600')
    expect(bubblesButton).toHaveAttribute('aria-checked', 'true')
  })

  it('allows clicking the same style multiple times', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    
    render(<StyleSelector styles={mockStyles} selectedStyle="pastels" onSelect={handleSelect} />)
    
    const pastelsButton = screen.getByRole('radio', { name: /Pastels/i })
    
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
    
    const radios = screen.getAllByRole('radio')
    
    radios.forEach(radio => {
      expect(radio).toHaveAttribute('type', 'button')
    })
  })

  it('handles empty styles array', () => {
    render(<StyleSelector styles={[]} selectedStyle={null} onSelect={() => {}} />)
    
    expect(screen.getByText('Visual Style')).toBeInTheDocument()
    expect(screen.queryAllByRole('radio')).toHaveLength(0)
  })

  it('handles single style', () => {
    const singleStyle: StylePreset[] = [mockStyles[0]]
    
    render(<StyleSelector styles={singleStyle} selectedStyle={null} onSelect={() => {}} />)
    
    expect(screen.getAllByRole('radio')).toHaveLength(1)
    expect(screen.getByText('Pastels')).toBeInTheDocument()
  })
})
