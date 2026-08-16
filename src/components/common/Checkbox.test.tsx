import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Checkbox from './Checkbox';

describe('Checkbox Component', () => {
  it('renders correctly with label and description', () => {
    render(
      <Checkbox
        id="test-check"
        label="Enable AI Security"
        description="Scans code for vulnerabilities"
        checked={false}
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Enable AI Security')).toBeInTheDocument();
    expect(screen.getByText('Scans code for vulnerabilities')).toBeInTheDocument();
  });

  it('triggers onChange when clicked', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        id="test-check"
        label="Accept Terms"
        checked={false}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('checkbox');
    fireEvent.click(input);

    expect(handleChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it('reflects checked state properly', () => {
    const { rerender } = render(
      <Checkbox
        id="test-check"
        label="Test Item"
        checked={true}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.checked).toBe(true);

    rerender(
      <Checkbox
        id="test-check"
        label="Test Item"
        checked={false}
        onChange={() => {}}
      />
    );

    expect(input.checked).toBe(false);
  });

  it('renders disabled state and does not trigger onChange', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        id="test-check"
        label="Disabled Checkbox"
        disabled={true}
        checked={false}
        onChange={handleChange}
      />
    );

    const input = screen.getByRole('checkbox');
    expect(input).toBeDisabled();

    fireEvent.click(input);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('handles indeterminate state correctly', () => {
    render(
      <Checkbox
        id="test-check"
        label="Select All"
        indeterminate={true}
        checked={false}
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('checkbox') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });
});
