import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from './Badge';

describe('Badge Component', () => {
  it('renders badge children text', () => {
    render(<Badge variant="critical">High Risk</Badge>);
    expect(screen.getByText('High Risk')).toBeInTheDocument();
  });

  it('applies variant styling', () => {
    const { container } = render(<Badge variant="indigo">AI Generated</Badge>);
    expect(container.firstChild).toHaveClass('text-indigo-400');
  });

  it('renders icon when requested', () => {
    const { container } = render(<Badge variant="critical" icon={true}>Critical</Badge>);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
