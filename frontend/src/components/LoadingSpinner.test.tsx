import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    render(<LoadingSpinner />)
    
    // Check that the loading indicator is present
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
    
    // Check default message
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders with custom message', () => {
    const customMessage = 'Generating your icons...'
    render(<LoadingSpinner message={customMessage} />)
    
    // Check that the loading indicator is present
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    
    // Check custom message is displayed
    expect(screen.getByText(customMessage)).toBeInTheDocument()
  })

  it('renders without message when empty string provided', () => {
    render(<LoadingSpinner message="" />)
    
    // Check that the loading indicator is present
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    
    // Check that no message paragraph is rendered
    const paragraphs = screen.queryByRole('paragraph')
    expect(paragraphs).not.toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner message="Processing..." />)
    
    // Check for screen reader text
    expect(screen.getByText('Loading')).toHaveClass('sr-only')
    
    // Check for role attribute
    const spinner = screen.getByRole('status')
    expect(spinner).toHaveAttribute('aria-label', 'Loading')
  })

  it('applies correct CSS classes for animation', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByRole('status')
    
    // Check for animation and styling classes
    expect(spinner).toHaveClass('animate-spin')
    expect(spinner).toHaveClass('rounded-full')
    expect(spinner).toHaveClass('border-b-2')
    expect(spinner).toHaveClass('border-blue-600')
  })
})
