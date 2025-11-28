import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { IconGrid } from './IconGrid'
import type { GeneratedIcon } from '../types'

describe('IconGrid - Unit Tests', () => {
  // Helper function to create mock icons
  const createMockIcons = (count: number): GeneratedIcon[] => {
    return Array.from({ length: count }, (_, i) => ({
      id: `icon-${i + 1}`,
      url: `https://example.com/icon-${i + 1}.png`,
      prompt: 'test prompt',
      style: 'pastels'
    }))
  }

  describe('Grid renders 4 icons', () => {
    it('should render exactly 4 icons when provided', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify 4 images are rendered
      const images = screen.getAllByRole('img')
      expect(images).toHaveLength(4)

      // Verify each image has correct src and alt attributes
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src', `https://example.com/icon-${index + 1}.png`)
        expect(img).toHaveAttribute('alt', 'Generated icon: test prompt')
      })
    })

    it('should display prompt and style for each icon', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify prompt is displayed 4 times
      const promptElements = screen.getAllByText('test prompt')
      expect(promptElements).toHaveLength(4)

      // Verify style is displayed 4 times
      const styleElements = screen.getAllByText(/Style: pastels/i)
      expect(styleElements).toHaveLength(4)
    })

    it('should render icons in a grid layout', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      const { container } = render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify grid container exists
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).toBeInTheDocument()
      expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2')
    })
  })

  describe('Download buttons are present', () => {
    it('should render individual download button for each icon', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Get all download buttons (4 individual + 1 "Download All")
      const downloadButtons = screen.getAllByRole('button', { name: /Download/i })
      expect(downloadButtons.length).toBeGreaterThanOrEqual(4)

      // Verify individual download buttons (excluding "Download All")
      const individualButtons = screen.getAllByRole('button', { name: /^Download$/i })
      expect(individualButtons).toHaveLength(4)
    })

    it('should render "Download All" button when icons are present', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify "Download All" button is present
      const downloadAllButton = screen.getByText(/Download All \(4\)/i)
      expect(downloadAllButton).toBeInTheDocument()
    })

    it('should call onDownload with correct icon ID when individual download button is clicked', async () => {
      const user = userEvent.setup()
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Click the first individual download button
      const individualButtons = screen.getAllByRole('button', { name: /^Download$/i })
      await user.click(individualButtons[0])

      // Verify onDownload was called with the correct icon ID
      expect(mockOnDownload).toHaveBeenCalledTimes(1)
      expect(mockOnDownload).toHaveBeenCalledWith('icon-1')
    })

    it('should call onDownloadAll when "Download All" button is clicked', async () => {
      const user = userEvent.setup()
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Click the "Download All" button
      const downloadAllButton = screen.getByText(/Download All \(4\)/i)
      await user.click(downloadAllButton)

      // Verify onDownloadAll was called
      expect(mockOnDownloadAll).toHaveBeenCalledTimes(1)
    })
  })

  describe('Empty state', () => {
    it('should display empty state message when no icons are provided', () => {
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      const { container } = render(
        <IconGrid
          icons={[]}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify empty state message is displayed
      expect(screen.getByText('Your generated icons will appear here')).toBeInTheDocument()

      // Verify empty state icon (SVG) is present
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('should not display download buttons in empty state', () => {
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={[]}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify no download buttons are present
      const downloadButtons = screen.queryAllByRole('button', { name: /Download/i })
      expect(downloadButtons).toHaveLength(0)
    })

    it('should not display grid layout in empty state', () => {
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      const { container } = render(
        <IconGrid
          icons={[]}
          loading={false}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify grid container does not exist
      const gridContainer = container.querySelector('.grid')
      expect(gridContainer).not.toBeInTheDocument()
    })
  })

  describe('Loading state', () => {
    it('should display loading spinner when loading is true', () => {
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={[]}
          loading={true}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify loading message is displayed
      expect(screen.getByText('Generating your icons...')).toBeInTheDocument()

      // Verify loading spinner is present
      const spinner = screen.getByRole('status', { name: 'Loading icons' })
      expect(spinner).toBeInTheDocument()
    })

    it('should not display icons or download buttons when loading', () => {
      const icons = createMockIcons(4)
      const mockOnDownload = vi.fn()
      const mockOnDownloadAll = vi.fn()

      render(
        <IconGrid
          icons={icons}
          loading={true}
          onDownload={mockOnDownload}
          onDownloadAll={mockOnDownloadAll}
        />
      )

      // Verify no images are displayed
      const images = screen.queryAllByRole('img', { hidden: false })
      expect(images).toHaveLength(0)

      // Verify no download buttons are displayed
      const downloadButtons = screen.queryAllByRole('button', { name: /Download/i })
      expect(downloadButtons).toHaveLength(0)
    })
  })
})
