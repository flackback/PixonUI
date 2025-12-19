import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Alert } from './Alert';
import React from 'react';

describe('Alert', () => {
  it('renders correctly with title and children', () => {
    render(
      <Alert title="Alert Title">
        Alert Description
      </Alert>
    );
    expect(screen.getByText('Alert Title')).toBeInTheDocument();
    expect(screen.getByText('Alert Description')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('renders variants correctly', () => {
    const { rerender } = render(<Alert variant="error" title="Error" />);
    // Check for either light or dark mode classes
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('rose');

    rerender(<Alert variant="success" title="Success" />);
    expect(screen.getByRole('alert').className).toContain('emerald');
  });

  it('renders custom icon', () => {
    render(
      <Alert 
        icon={<span data-testid="custom-icon">Icon</span>} 
        title="Custom Icon" 
      />
    );
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});
