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
