import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ThemeToggle from './ThemeToggle';
import { ThemeProvider } from '../../context/ThemeContext';

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query.includes('dark'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders theme toggle button properly', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showDropdown={false} />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('toggles theme when button is clicked in simple mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showDropdown={false} />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Document element class should change to light
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('opens dropdown menu when clicked in dropdown mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showDropdown={true} />
      </ThemeProvider>
    );

    const trigger = screen.getByRole('button');
    fireEvent.click(trigger);

    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });
});

