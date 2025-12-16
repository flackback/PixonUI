import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TextInput } from './TextInput';

describe('TextInput', () => {
  it('renders correctly', () => {
    render(<TextInput placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders label when provided', () => {
    render(<TextInput label="Email Address" />);
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('shows error message when error prop is set', () => {
    render(<TextInput error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('applies error styles when error is present', () => {
    render(<TextInput error="Error" placeholder="input" />);
    const input = screen.getByPlaceholderText('input');
    expect(input).toHaveClass('border-rose-500/50');
  });

  it('renders icons when provided', () => {
    render(<TextInput leftIcon={<span data-testid="left-icon">L</span>} />);
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<TextInput disabled placeholder="input" />);
    expect(screen.getByPlaceholderText('input')).toBeDisabled();
  });
});
