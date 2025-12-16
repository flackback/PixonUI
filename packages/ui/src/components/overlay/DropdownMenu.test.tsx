import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from './DropdownMenu';
import React from 'react';

describe('DropdownMenu', () => {
  it('renders trigger and toggles content on click', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Menu'));

    expect(screen.getByText('Item 1')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open Menu'));

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('closes when clicking an item', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    fireEvent.click(screen.getByText('Item 1'));

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });

  it('closes when clicking outside', async () => {
    render(
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Item 1</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <div data-testid="outside">Outside</div>
      </div>
    );

    fireEvent.click(screen.getByText('Open Menu'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
  });
});
