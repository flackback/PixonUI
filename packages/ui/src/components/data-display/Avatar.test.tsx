import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Avatar } from './Avatar';
import React from 'react';

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="https://example.com/image.jpg" alt="User" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
    expect(img).toHaveAttribute('alt', 'User');
  });

  it('renders fallback when image fails to load', () => {
    render(<Avatar src="invalid-url" alt="User" fallback="U" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('U')).toBeInTheDocument();
  });

  it('renders fallback when no src is provided', () => {
    render(<Avatar fallback="AB" />);
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('renders initials from alt text if no fallback provided', () => {
    render(<Avatar alt="John" />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('applies size classes correctly', () => {
    const { container } = render(<Avatar size="lg" />);
    expect(container.firstChild).toHaveClass('h-14 w-14');
  });
});
