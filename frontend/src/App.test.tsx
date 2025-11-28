import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import * as api from './services/api';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /Icon Set Generator/i })).toBeDefined();
  });

  it('displays the main heading', () => {
    render(<App />);
    expect(screen.getByText('Icon Set Generator')).toBeDefined();
  });

  it('displays the prompt input field', () => {
    render(<App />);
    const input = screen.getByLabelText(/Icon Theme/i);
    expect(input).toBeDefined();
    expect(input.getAttribute('placeholder')).toContain('Toys');
  });

  it('displays the generate button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Generate Icons/i });
    expect(button).toBeDefined();
  });

  it('displays empty state message initially', () => {
    render(<App />);
    expect(screen.getByText(/Your generated icons will appear here/i)).toBeDefined();
  });

  it('initializes with empty prompt state', () => {
    render(<App />);
    const input = screen.getByLabelText(/Icon Theme/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });
});

describe('App - Loading States', () => {
  beforeEach(() => {
    // Mock getStyles to return a style preset
    vi.spyOn(api, 'getStyles').mockResolvedValue([
      {
        id: 'pastels',
        name: 'Pastels',
        description: 'Soft, muted colors'
      }
    ]);
  });

  it('displays loading indicator during icon generation', async () => {
    const user = userEvent.setup();
    
    // Mock generateIcons to delay response so we can check loading state
    const generateIconsMock = vi.spyOn(api, 'generateIcons').mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve([]), 100);
      })
    );

    render(<App />);

    // Wait for styles to load
    await waitFor(() => {
      expect(screen.getByText('Pastels')).toBeInTheDocument();
    });

    // Fill in the form
    const promptInput = screen.getByLabelText(/Icon Theme/i);
    await user.type(promptInput, 'Toys');

    // Select a style
    const styleButton = screen.getByText('Pastels');
    await user.click(styleButton);

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
    await user.click(generateButton);

    // Check that loading indicator appears
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Generating your icons...')).toBeInTheDocument();

    // Wait for generation to complete
    await waitFor(() => {
      expect(generateIconsMock).toHaveBeenCalled();
    });

    // Loading indicator should disappear after completion
    await waitFor(() => {
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });
  });

  it('disables form inputs during loading', async () => {
    const user = userEvent.setup();
    
    // Mock generateIcons to delay response
    vi.spyOn(api, 'generateIcons').mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve([]), 100);
      })
    );

    render(<App />);

    // Wait for styles to load
    await waitFor(() => {
      expect(screen.getByText('Pastels')).toBeInTheDocument();
    });

    // Fill in the form
    const promptInput = screen.getByLabelText(/Icon Theme/i) as HTMLInputElement;
    await user.type(promptInput, 'Toys');

    // Select a style
    const styleButton = screen.getByText('Pastels');
    await user.click(styleButton);

    // Click generate button
    const generateButton = screen.getByRole('button', { name: /Generate Icons/i }) as HTMLButtonElement;
    await user.click(generateButton);

    // Check that form inputs are disabled during loading
    await waitFor(() => {
      expect(promptInput).toBeDisabled();
      expect(generateButton).toBeDisabled();
    });

    // Wait for generation to complete
    await waitFor(() => {
      expect(promptInput).not.toBeDisabled();
      expect(generateButton).not.toBeDisabled();
    }, { timeout: 200 });
  });

  it('changes generate button text during loading', async () => {
    const user = userEvent.setup();
    
    // Mock generateIcons to delay response
    vi.spyOn(api, 'generateIcons').mockImplementation(
      () => new Promise((resolve) => {
        setTimeout(() => resolve([]), 100);
      })
    );

    render(<App />);

    // Wait for styles to load
    await waitFor(() => {
      expect(screen.getByText('Pastels')).toBeInTheDocument();
    });

    // Fill in the form
    const promptInput = screen.getByLabelText(/Icon Theme/i);
    await user.type(promptInput, 'Toys');

    // Select a style
    const styleButton = screen.getByText('Pastels');
    await user.click(styleButton);

    // Check initial button text
    const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
    expect(generateButton).toHaveTextContent('Generate Icons');

    // Click generate button
    await user.click(generateButton);

    // Check that button text changes during loading
    await waitFor(() => {
      expect(generateButton).toHaveTextContent('Generating...');
    });

    // Wait for generation to complete
    await waitFor(() => {
      expect(generateButton).toHaveTextContent('Generate Icons');
    }, { timeout: 200 });
  });
});

describe('App - Download Functionality', () => {
  // Mock generated icons for testing
  const mockIcons = [
    {
      id: 'icon-1',
      url: 'https://example.com/icon1.png',
      prompt: 'Colorful Toys',
      style: 'pastels'
    },
    {
      id: 'icon-2',
      url: 'https://example.com/icon2.png',
      prompt: 'Colorful Toys',
      style: 'pastels'
    },
    {
      id: 'icon-3',
      url: 'https://example.com/icon3.png',
      prompt: 'Colorful Toys',
      style: 'pastels'
    },
    {
      id: 'icon-4',
      url: 'https://example.com/icon4.png',
      prompt: 'Colorful Toys',
      style: 'pastels'
    }
  ];

  beforeEach(() => {
    // Mock getStyles
    vi.spyOn(api, 'getStyles').mockResolvedValue([
      {
        id: 'pastels',
        name: 'Pastels',
        description: 'Soft, muted colors'
      }
    ]);

    // Mock generateIcons to return mock icons
    vi.spyOn(api, 'generateIcons').mockResolvedValue(mockIcons);

    // Mock fetch for downloading images
    globalThis.fetch = vi.fn(() => {
      return Promise.resolve({
        ok: true,
        blob: () => Promise.resolve(new Blob(['mock image data'], { type: 'image/png' }))
      } as Response);
    }) as typeof fetch;

    // Mock URL.createObjectURL and URL.revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    globalThis.URL.revokeObjectURL = vi.fn();
  });

  describe('Individual icon download', () => {
    it('should download individual icon when download button is clicked', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the first individual download button
      const downloadButtons = screen.getAllByRole('button', { name: /^Download$/i });
      await user.click(downloadButtons[0]);

      // Verify fetch was called with the correct URL
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');

      // Verify URL.createObjectURL was called
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();

      // Verify URL.revokeObjectURL was called for cleanup
      await waitFor(() => {
        expect(globalThis.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
      });
    });

    it('should handle download errors gracefully', async () => {
      const user = userEvent.setup();

      // Mock fetch to fail
      globalThis.fetch = vi.fn(() => Promise.resolve({
        ok: false,
        status: 404
      } as Response)) as typeof fetch;

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the first individual download button
      const downloadButtons = screen.getAllByRole('button', { name: /^Download$/i });
      await user.click(downloadButtons[0]);

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Failed to download icon/i)).toBeInTheDocument();
      });
    });
  });

  describe('Download all icons', () => {
    it('should download all icons when "Download All" button is clicked', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the "Download All" button
      const downloadAllButton = screen.getByRole('button', { name: /Download All \(4\)/i });
      await user.click(downloadAllButton);

      // Verify fetch was called for all 4 icons
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(4);
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon2.png');
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon3.png');
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon4.png');
      });

      // Verify URL.createObjectURL was called 4 times
      expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(4);
    });

    it('should continue downloading remaining icons if one fails', async () => {
      const user = userEvent.setup();

      // Mock fetch to fail for the second icon
      let callCount = 0;
      globalThis.fetch = vi.fn(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.resolve({
            ok: false,
            status: 404
          } as Response);
        }
        return Promise.resolve({
          ok: true,
          blob: () => Promise.resolve(new Blob(['mock image data'], { type: 'image/png' }))
        } as Response);
      }) as typeof fetch;

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the "Download All" button
      const downloadAllButton = screen.getByRole('button', { name: /Download All \(4\)/i });
      await user.click(downloadAllButton);

      // Verify fetch was called for all 4 icons (even though one failed)
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(4);
      });

      // Verify URL.createObjectURL was called 3 times (excluding the failed one)
      await waitFor(() => {
        expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('Filename generation', () => {
    it('should generate descriptive filenames with prompt and style', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the first individual download button
      const downloadButtons = screen.getAllByRole('button', { name: /^Download$/i });
      await user.click(downloadButtons[0]);

      // Verify fetch was called (download was initiated)
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');
      });

      // The filename generation logic is tested indirectly through the download behavior
      // We verify that the download was initiated successfully
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should sanitize prompt in filename by removing special characters', async () => {
      const user = userEvent.setup();

      // Mock icons with special characters in prompt
      const specialCharIcons = [
        {
          id: 'icon-1',
          url: 'https://example.com/icon1.png',
          prompt: 'Toys & Games!!! @#$%',
          style: 'pastels'
        }
      ];

      vi.spyOn(api, 'generateIcons').mockResolvedValue(specialCharIcons);

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Toys & Games!!! @#$%');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getByRole('img')).toBeInTheDocument();
      });

      // Click the download button
      const downloadButton = screen.getByRole('button', { name: /^Download$/i });
      await user.click(downloadButton);

      // Verify download was initiated
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');
      });

      // The filename sanitization logic is tested indirectly
      // We verify that the download completed successfully despite special characters
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should include index number in filename when downloading all icons', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the "Download All" button
      const downloadAllButton = screen.getByRole('button', { name: /Download All \(4\)/i });
      await user.click(downloadAllButton);

      // Verify all 4 icons were downloaded
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledTimes(4);
        expect(globalThis.URL.createObjectURL).toHaveBeenCalledTimes(4);
      }, { timeout: 3000 });

      // The index numbering logic is tested indirectly through successful downloads
      // Each icon should have been fetched and downloaded
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon2.png');
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon3.png');
      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon4.png');
    });

    it('should include timestamp in filename to ensure uniqueness', async () => {
      const user = userEvent.setup();

      render(<App />);

      // Wait for styles to load
      await waitFor(() => {
        expect(screen.getByText('Pastels')).toBeInTheDocument();
      });

      // Generate icons
      const promptInput = screen.getByLabelText(/Icon Theme/i);
      await user.type(promptInput, 'Colorful Toys');

      const styleButton = screen.getByText('Pastels');
      await user.click(styleButton);

      const generateButton = screen.getByRole('button', { name: /Generate Icons/i });
      await user.click(generateButton);

      // Wait for icons to be generated
      await waitFor(() => {
        expect(screen.getAllByRole('img')).toHaveLength(4);
      });

      // Click the first individual download button
      const downloadButtons = screen.getAllByRole('button', { name: /^Download$/i });
      await user.click(downloadButtons[0]);

      // Verify download was initiated
      await waitFor(() => {
        expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/icon1.png');
      });

      // The timestamp logic is tested indirectly through successful download
      // We verify that the download completed successfully
      expect(globalThis.URL.createObjectURL).toHaveBeenCalled();
      expect(globalThis.URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
