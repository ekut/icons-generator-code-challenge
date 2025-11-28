import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

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
