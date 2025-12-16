import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Popover, PopoverTrigger, PopoverContent } from './Popover';
import React from 'react';

describe('Popover', () => {
  it('renders trigger and toggles content on click', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Popover'));

    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Popover'));

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', () => {
    render(
      <div>
        <Popover>
          <PopoverTrigger>Open Popover</PopoverTrigger>
          <PopoverContent>Popover Content</PopoverContent>
        </Popover>
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.click(screen.getByText('Open Popover'));
    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });

  it('supports controlled state', () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <Popover open={true} onOpenChange={handleOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );

    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Popover'));
    expect(handleOpenChange).toHaveBeenCalledWith(false);
    
    // Since it's controlled, it shouldn't close automatically unless we update props
    expect(screen.getByText('Popover Content')).toBeInTheDocument();

    rerender(
      <Popover open={false} onOpenChange={handleOpenChange}>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    );
    expect(screen.queryByText('Popover Content')).not.toBeInTheDocument();
  });
});
