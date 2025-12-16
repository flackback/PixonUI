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
    expect(screen.getByRole('alert')).toHaveClass('border-rose-500/20');

    rerender(<Alert variant="success" title="Success" />);
    expect(screen.getByRole('alert')).toHaveClass('border-emerald-500/20');
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
