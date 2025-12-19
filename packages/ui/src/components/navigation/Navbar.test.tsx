import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Navbar } from './Navbar';
import React from 'react';

describe('Navbar', () => {
  it('renders logo correctly', () => {
    render(<Navbar logo={<span data-testid="logo">Logo</span>} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders links correctly', () => {
    const links = [
      { label: 'Home', href: '/' },
      { label: 'About', href: '/about' },
    ];
    render(<Navbar links={links} />);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('About').length).toBeGreaterThan(0);
  });

  it('renders actions correctly', () => {
    render(<Navbar actions={<button data-testid="action">Action</button>} />);
    expect(screen.getAllByTestId('action').length).toBeGreaterThan(0);
  });
});
