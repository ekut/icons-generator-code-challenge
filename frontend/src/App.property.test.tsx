import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as fc from 'fast-check'
import App from './App'
import * as api from './services/api'
import type { StylePreset } from './types'

// Mock style presets matching the backend
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

describe('App - Property-Based Tests', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks()
    // Mock the getStyles API call to return mock styles
    vi.spyOn(api, 'getStyles').mockResolvedValue(mockStyles)
  })

  /**
   * Feature: icon-set-generator, Property 1: Prompt Storage Consistency
   * 
   * For any valid non-empty prompt entered by the user, the system should 
   * store and use that exact prompt in the generation request without modification.
   * 
   * Validates: Requirements 1.4
   */
  it('stores any valid non-empty prompt without modification', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate non-empty strings with various characters
        fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
        async (prompt) => {
          // Render the App component
          const { unmount } = render(<App />)
          
          try {
            // Wait for styles to load from the API
            await waitFor(() => {
              expect(screen.getByText('Pastels')).toBeInTheDocument()
            }, { timeout: 1000 })
            
            // Find the prompt input field
            const input = screen.getByLabelText('Icon Theme') as HTMLInputElement
            
            // Simulate user input by directly changing the value and firing the change event
            // This avoids userEvent.type's interpretation of special characters like { } [ ]
            fireEvent.change(input, { target: { value: prompt } })
            
            // Verify the input field contains exactly the prompt we entered
            expect(input).toHaveValue(prompt)
            
            // The prompt should be stored without any modification
            // We verify this by checking the input value matches exactly
            const storedValue = input.value
            expect(storedValue).toBe(prompt)
            expect(storedValue.length).toBe(prompt.length)
          } finally {
            // Clean up after each test run
            unmount()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: icon-set-generator, Property 2: Style Selection State
   * 
   * For any style preset selected by the user, the system should highlight 
   * that style and use it in the generation request.
   * 
   * Validates: Requirements 2.2, 2.3
   */
  it('highlights selected style and maintains selection state', async () => {
    // Map style IDs to their display names for accurate matching
    const styleMap: Record<string, string> = {
      'pastels': 'Pastels',
      'bubbles': 'Bubbles',
      'flat': 'Flat',
      'gradient': 'Gradient',
      'outline': 'Outline'
    }
    
    const availableStyles = Object.keys(styleMap)
    
    await fc.assert(
      fc.asyncProperty(
        // Generate a random style ID from the available styles
        fc.constantFrom(...availableStyles),
        async (styleId) => {
          // Render the App component
          const { unmount } = render(<App />)
          
          try {
            // Wait for styles to load from the API
            await waitFor(() => {
              expect(screen.getByText('Pastels')).toBeInTheDocument()
            }, { timeout: 1000 })
            
            // Get the display name for the selected style
            const styleName = styleMap[styleId]
            
            // Find all style buttons
            const allButtons = screen.getAllByRole('button')
            
            // Find the specific button for this style by matching the exact text
            const styleButton = allButtons.find(button => 
              button.textContent?.includes(styleName) && 
              button.textContent?.includes(mockStyles.find(s => s.id === styleId)?.description || '')
            )
            
            expect(styleButton).toBeDefined()
            
            // Click the style button to select it
            fireEvent.click(styleButton!)
            
            // Verify the button is highlighted (has aria-pressed="true")
            expect(styleButton).toHaveAttribute('aria-pressed', 'true')
            
            // Verify the button has the selected styling classes
            expect(styleButton!.className).toContain('border-blue-600')
            expect(styleButton!.className).toContain('bg-blue-50')
            
            // Verify the checkmark icon is present for the selected style
            const checkmark = styleButton!.querySelector('svg')
            expect(checkmark).toBeInTheDocument()
            
            // Verify other styles are NOT highlighted
            for (const otherId of availableStyles) {
              if (otherId !== styleId) {
                const otherName = styleMap[otherId]
                const otherButton = allButtons.find(button => 
                  button.textContent?.includes(otherName) && 
                  button.textContent?.includes(mockStyles.find(s => s.id === otherId)?.description || '')
                )
                
                if (otherButton) {
                  expect(otherButton).toHaveAttribute('aria-pressed', 'false')
                  expect(otherButton.className).not.toContain('border-blue-600')
                }
              }
            }
          } finally {
            // Clean up after each test run
            unmount()
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  /**
   * Feature: icon-set-generator, Property 4: Color Parameter Inclusion
   * 
   * For any valid HEX color codes provided, the system should include all 
   * provided colors in the generation parameters sent to the API.
   * 
   * Validates: Requirements 3.4
   */
  it('includes all valid HEX color codes in generation parameters', async () => {
    // Custom generator for hexadecimal characters
    const hexChar = fc.integer({ min: 0, max: 15 }).map(n => '0123456789ABCDEF'[n])
    
    // Custom generator for valid HEX colors
    const hexColorGenerator = fc.oneof(
      // Generate #RGB format (3 hex digits)
      fc.string({ unit: hexChar, minLength: 3, maxLength: 3 }).map(hex => `#${hex}`),
      // Generate #RRGGBB format (6 hex digits)
      fc.string({ unit: hexChar, minLength: 6, maxLength: 6 }).map(hex => `#${hex}`)
    )

    await fc.assert(
      fc.asyncProperty(
        // Generate an array of 1-3 valid HEX colors
        fc.array(hexColorGenerator, { minLength: 1, maxLength: 3 }),
        // Generate a valid prompt
        fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
        // Generate a valid style ID
        fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline'),
        async (colors, prompt, styleId) => {
          // Mock the generateIcons API call to capture the request
          let capturedRequest: any = null
          const mockGenerateIcons = vi.spyOn(api, 'generateIcons').mockImplementation(async (request) => {
            capturedRequest = request
            // Return mock icons
            return [
              { id: '1', url: 'https://example.com/1.png', prompt, style: styleId },
              { id: '2', url: 'https://example.com/2.png', prompt, style: styleId },
              { id: '3', url: 'https://example.com/3.png', prompt, style: styleId },
              { id: '4', url: 'https://example.com/4.png', prompt, style: styleId },
            ]
          })

          // Render the App component
          const { unmount } = render(<App />)
          
          try {
            // Wait for styles to load from the API
            await waitFor(() => {
              expect(screen.getByText('Pastels')).toBeInTheDocument()
            }, { timeout: 1000 })
            
            // Enter the prompt
            const promptInput = screen.getByLabelText('Icon Theme') as HTMLInputElement
            fireEvent.change(promptInput, { target: { value: prompt } })
            
            // Select the style
            const styleMap: Record<string, string> = {
              'pastels': 'Pastels',
              'bubbles': 'Bubbles',
              'flat': 'Flat',
              'gradient': 'Gradient',
              'outline': 'Outline'
            }
            const styleName = styleMap[styleId]
            const allButtons = screen.getAllByRole('button')
            const styleButton = allButtons.find(button => 
              button.textContent?.includes(styleName) && 
              button.textContent?.includes(mockStyles.find(s => s.id === styleId)?.description || '')
            )
            fireEvent.click(styleButton!)
            
            // Add the brand colors
            // First, click "Add Brand Color" button for each color
            for (let i = 0; i < colors.length; i++) {
              const addColorButton = screen.getByText('+ Add Brand Color')
              fireEvent.click(addColorButton)
            }
            
            // Now find all color input fields and set their values
            const colorInputs = screen.getAllByPlaceholderText('#FF5733')
            for (let i = 0; i < colors.length; i++) {
              fireEvent.change(colorInputs[i], { target: { value: colors[i] } })
            }
            
            // Click the generate button
            const generateButton = screen.getByText('Generate Icons')
            fireEvent.click(generateButton)
            
            // Wait for the API call to be made
            await waitFor(() => {
              expect(mockGenerateIcons).toHaveBeenCalled()
            }, { timeout: 1000 })
            
            // Verify the request includes all the provided colors
            expect(capturedRequest).toBeDefined()
            expect(capturedRequest.brandColors).toBeDefined()
            expect(capturedRequest.brandColors).toHaveLength(colors.length)
            
            // Verify each color is included in the request
            for (const color of colors) {
              expect(capturedRequest.brandColors).toContain(color)
            }
            
            // Verify the colors are in the same order
            for (let i = 0; i < colors.length; i++) {
              expect(capturedRequest.brandColors[i]).toBe(colors[i])
            }
          } finally {
            // Clean up after each test run
            mockGenerateIcons.mockRestore()
            unmount()
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
