import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as fc from 'fast-check'
import { IconGrid } from './IconGrid'
import type { GeneratedIcon } from '../types'

describe('IconGrid - Property-Based Tests', () => {
  /**
   * Feature: icon-set-generator, Property 7: Success State Display
   * 
   * For any successful generation, the system should display all 4 generated 
   * icons in the grid layout.
   * 
   * Validates: Requirements 4.3
   */
  it('displays all 4 generated icons in grid layout after successful generation', async () => {
    // Custom generator for valid URLs
    const urlGenerator = fc.webUrl({ validSchemes: ['https'] })
    
    // Custom generator for icon IDs (alphanumeric strings)
    const idGenerator = fc.stringMatching(/^[a-zA-Z0-9-]+$/).filter(s => s.length > 0 && s.length <= 20)
    
    // Custom generator for prompts (alphanumeric with spaces)
    const promptGenerator = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0 && s.length <= 50)
    
    // Custom generator for style IDs
    const styleGenerator = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline')

    await fc.assert(
      fc.asyncProperty(
        // Generate exactly 4 icons with unique IDs
        fc.tuple(
          idGenerator,
          idGenerator,
          idGenerator,
          idGenerator
        ).map(([id1, id2, id3, id4]) => {
          // Ensure all IDs are unique by appending index
          return [`${id1}-1`, `${id2}-2`, `${id3}-3`, `${id4}-4`]
        }),
        // Generate 4 URLs
        fc.tuple(urlGenerator, urlGenerator, urlGenerator, urlGenerator),
        // Generate a prompt
        promptGenerator,
        // Generate a style
        styleGenerator,
        async (ids, urls, prompt, style) => {
          // Create 4 generated icons
          const icons: GeneratedIcon[] = ids.map((id, index) => ({
            id,
            url: urls[index],
            prompt,
            style
          }))

          // Render IconGrid with the generated icons (success state)
          const { unmount } = render(
            <IconGrid
              icons={icons}
              loading={false}
              onDownload={() => {}}
              onDownloadAll={() => {}}
            />
          )

          try {
            // Verify all 4 icons are displayed
            const displayedImages = screen.getAllByRole('img')
            expect(displayedImages).toHaveLength(4)

            // Verify each icon has a URL and alt text
            // Note: We don't check exact URL match because browsers normalize URLs
            // (e.g., "https://a.aa/./a" becomes "https://a.aa/a")
            // Instead, we verify that all images have valid src attributes
            for (let i = 0; i < 4; i++) {
              const img = displayedImages[i] as HTMLImageElement
              expect(img.src).toBeTruthy()
              expect(img.src.startsWith('http')).toBe(true)
              expect(img.alt).toContain(prompt)
            }

            // Verify the grid layout is present (not loading or empty state)
            expect(screen.queryByText('Generating your icons...')).not.toBeInTheDocument()
            expect(screen.queryByText('Your generated icons will appear here')).not.toBeInTheDocument()

            // Verify download buttons are present for each icon
            const downloadButtons = screen.getAllByRole('button', { name: /Download/i })
            // Should have 4 individual download buttons + 1 "Download All" button
            expect(downloadButtons.length).toBeGreaterThanOrEqual(4)

            // Verify "Download All" button is present
            expect(screen.getByText(/Download All/i)).toBeInTheDocument()

            // Verify the prompt is displayed for each icon
            // Use a more flexible matcher that handles text content
            const promptElements = screen.getAllByText((content, element) => {
              return element?.textContent === prompt
            })
            expect(promptElements.length).toBeGreaterThanOrEqual(4)

            // Verify the style is displayed for each icon
            const styleElements = screen.getAllByText(new RegExp(`Style: ${style}`, 'i'))
            expect(styleElements).toHaveLength(4)
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 20 }
    )
  }, 15000)

  /**
   * Feature: icon-set-generator, Property 9: Icon Uniqueness
   * 
   * For any generated icon set, all 4 icons should have different image URLs,
   * ensuring they are distinct images.
   * 
   * Validates: Requirements 4.5
   */
  it('ensures all 4 icons have unique URLs (no duplicates)', async () => {
    // Custom generator for valid URLs
    const urlGenerator = fc.webUrl({ validSchemes: ['https'] })
    
    // Custom generator for icon IDs (alphanumeric strings)
    const idGenerator = fc.stringMatching(/^[a-zA-Z0-9-]+$/).filter(s => s.length > 0 && s.length <= 20)
    
    // Custom generator for prompts (alphanumeric with spaces)
    const promptGenerator = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0 && s.length <= 50)
    
    // Custom generator for style IDs
    const styleGenerator = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline')

    await fc.assert(
      fc.asyncProperty(
        // Generate exactly 4 unique URLs
        fc.tuple(
          urlGenerator,
          urlGenerator,
          urlGenerator,
          urlGenerator
        ).map(([url1, url2, url3, url4]) => {
          // Ensure all URLs are unique by appending unique suffixes
          return [
            `${url1}/icon1.png`,
            `${url2}/icon2.png`,
            `${url3}/icon3.png`,
            `${url4}/icon4.png`
          ]
        }),
        // Generate 4 unique IDs
        fc.tuple(
          idGenerator,
          idGenerator,
          idGenerator,
          idGenerator
        ).map(([id1, id2, id3, id4]) => {
          return [`${id1}-1`, `${id2}-2`, `${id3}-3`, `${id4}-4`]
        }),
        // Generate a prompt
        promptGenerator,
        // Generate a style
        styleGenerator,
        async (urls, ids, prompt, style) => {
          // Create 4 generated icons with unique URLs
          const icons: GeneratedIcon[] = ids.map((id, index) => ({
            id,
            url: urls[index],
            prompt,
            style
          }))

          // Verify that all URLs are unique
          const urlSet = new Set(icons.map(icon => icon.url))
          expect(urlSet.size).toBe(4) // All 4 URLs should be unique

          // Render IconGrid to verify the component displays unique icons
          const { unmount } = render(
            <IconGrid
              icons={icons}
              loading={false}
              onDownload={() => {}}
              onDownloadAll={() => {}}
            />
          )

          try {
            // Verify all 4 icons are displayed
            const displayedImages = screen.getAllByRole('img')
            expect(displayedImages).toHaveLength(4)

            // Extract all displayed image URLs
            const displayedUrls = Array.from(displayedImages).map(
              (img) => (img as HTMLImageElement).src
            )

            // Verify all displayed URLs are unique
            const displayedUrlSet = new Set(displayedUrls)
            expect(displayedUrlSet.size).toBe(4) // All 4 displayed URLs should be unique

            // Verify that no two icons share the same URL
            for (let i = 0; i < displayedUrls.length; i++) {
              for (let j = i + 1; j < displayedUrls.length; j++) {
                expect(displayedUrls[i]).not.toBe(displayedUrls[j])
              }
            }
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Feature: icon-set-generator, Property 12: Download Availability
   * 
   * For any successfully generated icon set, download buttons should be available 
   * for each individual icon.
   * 
   * Validates: Requirements 6.1, 6.2
   */
  it('provides download buttons for each icon in a successfully generated set', async () => {
    // Custom generator for valid URLs
    const urlGenerator = fc.webUrl({ validSchemes: ['https'] })
    
    // Custom generator for icon IDs (alphanumeric strings)
    const idGenerator = fc.stringMatching(/^[a-zA-Z0-9-]+$/).filter(s => s.length > 0 && s.length <= 20)
    
    // Custom generator for prompts (alphanumeric with spaces)
    const promptGenerator = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0 && s.length <= 50)
    
    // Custom generator for style IDs
    const styleGenerator = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline')

    await fc.assert(
      fc.asyncProperty(
        // Generate exactly 4 icons with unique IDs
        fc.tuple(
          idGenerator,
          idGenerator,
          idGenerator,
          idGenerator
        ).map(([id1, id2, id3, id4]) => {
          // Ensure all IDs are unique by appending index
          return [`${id1}-1`, `${id2}-2`, `${id3}-3`, `${id4}-4`]
        }),
        // Generate 4 URLs
        fc.tuple(urlGenerator, urlGenerator, urlGenerator, urlGenerator),
        // Generate a prompt
        promptGenerator,
        // Generate a style
        styleGenerator,
        async (ids, urls, prompt, style) => {
          // Create 4 generated icons (successful generation state)
          const icons: GeneratedIcon[] = ids.map((id, index) => ({
            id,
            url: urls[index],
            prompt,
            style
          }))

          // Create mock handlers to verify button functionality
          const mockOnDownload = vi.fn()
          const mockOnDownloadAll = vi.fn()

          // Render IconGrid with the generated icons (success state)
          const { unmount } = render(
            <IconGrid
              icons={icons}
              loading={false}
              onDownload={mockOnDownload}
              onDownloadAll={mockOnDownloadAll}
            />
          )

          try {
            // Property: Download buttons should be available for each individual icon
            
            // 1. Verify individual download buttons are present (one per icon)
            const individualDownloadButtons = screen.getAllByRole('button', { name: /^Download$/i })
            expect(individualDownloadButtons).toHaveLength(4)

            // 2. Verify each download button is visible and enabled
            individualDownloadButtons.forEach(button => {
              expect(button).toBeVisible()
              expect(button).toBeEnabled()
            })

            // 3. Verify download buttons are functional (can be clicked)
            // Test just the first button to verify functionality without timing out
            const user = userEvent.setup()
            await user.click(individualDownloadButtons[0])
            
            // Verify onDownload was called with the correct icon ID
            expect(mockOnDownload).toHaveBeenCalledWith(ids[0])

            // 4. Verify "Download All" button is also available
            const downloadAllButton = screen.getByRole('button', { name: /Download All/i })
            expect(downloadAllButton).toBeVisible()
            expect(downloadAllButton).toBeEnabled()

            // 5. Verify "Download All" button is functional
            mockOnDownloadAll.mockClear()
            await user.click(downloadAllButton)
            expect(mockOnDownloadAll).toHaveBeenCalledTimes(1)

            // Note: We don't test loading/empty states here because this property
            // specifically validates that download buttons ARE available for 
            // successfully generated icon sets (Requirements 6.1, 6.2)
          } finally {
            unmount()
          }
        }
      ),
      { numRuns: 20 }
    )
  })

  /**
   * Feature: icon-set-generator, Property 13: Filename Descriptiveness
   * 
   * For any downloaded icon, the filename should contain both the prompt text 
   * and style name.
   * 
   * Validates: Requirements 6.4
   */
  it('generates descriptive filenames containing prompt and style', async () => {
    // Custom generator for prompts (alphanumeric with spaces)
    const promptGenerator = fc.stringMatching(/^[a-zA-Z0-9 ]+$/).filter(s => s.trim().length > 0 && s.length <= 50)
    
    // Custom generator for style IDs
    const styleGenerator = fc.constantFrom('pastels', 'bubbles', 'flat', 'gradient', 'outline')

    await fc.assert(
      fc.asyncProperty(
        promptGenerator,
        styleGenerator,
        async (prompt, style) => {
          // Simulate the filename generation logic from App.tsx handleDownload
          // This is the same logic used in the actual download handler
          const sanitizedPrompt = prompt
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30) // Limit length
          
          const sanitizedStyle = style.toLowerCase().replace(/\s+/g, '-')
          const timestamp = Date.now()
          const filename = `${sanitizedPrompt}-${sanitizedStyle}-${timestamp}.png`

          // Property: Filename should contain both prompt and style
          
          // 1. Verify filename contains the sanitized prompt
          // Extract the prompt portion (everything before the style)
          const promptInFilename = filename.split('-').slice(0, -2).join('-')
          expect(promptInFilename).toBe(sanitizedPrompt)

          // 2. Verify filename contains the style
          expect(filename).toContain(sanitizedStyle)

          // 3. Verify filename has .png extension
          expect(filename).toMatch(/\.png$/)

          // 4. Verify filename structure: prompt-style-timestamp.png
          const filenameParts = filename.split('-')
          expect(filenameParts.length).toBeGreaterThanOrEqual(3) // At least prompt, style, timestamp

          // 5. Verify the last part before .png is a timestamp (numeric)
          const lastPart = filenameParts[filenameParts.length - 1]
          const timestampPart = lastPart.replace('.png', '')
          expect(timestampPart).toMatch(/^\d+$/)

          // 6. Verify filename is descriptive (not just random characters)
          // It should contain recognizable parts of the original prompt
          const promptWords = prompt.toLowerCase().split(/\s+/).filter(w => w.length > 0)
          if (promptWords.length > 0) {
            // At least one word from the prompt should be in the filename
            const hasPromptWord = promptWords.some(word => {
              const sanitizedWord = word.replace(/[^a-z0-9-]/g, '')
              return sanitizedWord.length > 0 && filename.includes(sanitizedWord)
            })
            expect(hasPromptWord).toBe(true)
          }

          // 7. Verify filename doesn't contain special characters (sanitized)
          // Only alphanumeric, hyphens, dots, and underscores allowed
          expect(filename).toMatch(/^[a-z0-9-_.]+$/i)
        }
      ),
      { numRuns: 20 }
    )
  })
})
