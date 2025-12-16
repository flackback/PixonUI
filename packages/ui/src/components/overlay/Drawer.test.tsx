import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Drawer, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from './Drawer';
import React from 'react';

describe('Drawer', () => {
  it('renders content when isOpen is true', async () => {
    render(
      <Drawer isOpen={true} onClose={() => {}}>
        <DrawerHeader>
          <DrawerTitle>Title</DrawerTitle>
          <DrawerDescription>Description</DrawerDescription>
        </DrawerHeader>
        <div>Content</div>
        <DrawerFooter>Footer</DrawerFooter>
      </Drawer>
    );

    await waitFor(() => {
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Description')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });
  });

  it('does not render when isOpen is false', () => {
    render(
      <Drawer isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Drawer>
    );

    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  it('calls onClose when clicking backdrop', async () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    // The backdrop is the outer div
    // We need to find it. It has role="dialog"
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);

    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', async () => {
    const onClose = vi.fn();
    render(
      <Drawer isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Drawer>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });
});
