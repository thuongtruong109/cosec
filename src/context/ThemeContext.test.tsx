import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from './ThemeContext';

function TestConsumer() {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="current-theme">{theme}</span>
      <span data-testid="is-dark">{isDark ? 'yes' : 'no'}</span>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={() => setTheme('system')} data-testid="set-system">Set System</button>
      <button onClick={() => toggleTheme()} data-testid="toggle-theme">Toggle Theme</button>
    </div>
  );
}

describe('ThemeContext & ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    
    // Mock matchMedia for system preference testing
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

  it('provides default system theme and resolves to system dark preference', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('current-theme').textContent).toBe('system');
    expect(screen.getByTestId('is-dark').textContent).toBe('yes');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('allows switching to light theme and persists to localStorage', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByTestId('set-light'));

    expect(screen.getByTestId('current-theme').textContent).toBe('light');
    expect(screen.getByTestId('is-dark').textContent).toBe('no');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('codelens_theme_preference')).toBe('light');
  });

  it('toggles between dark and light themes smoothly', () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    // Initial is dark (system dark match) -> toggle should switch to light
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('is-dark').textContent).toBe('no');
    expect(document.documentElement.classList.contains('light')).toBe(true);

    // Second toggle should switch back to dark
    fireEvent.click(screen.getByTestId('toggle-theme'));
    expect(screen.getByTestId('is-dark').textContent).toBe('yes');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});

