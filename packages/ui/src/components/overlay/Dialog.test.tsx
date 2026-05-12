import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Dialog';
import React from 'react';

describe('Dialog', () => {
  it('is not open when isOpen is false', () => {
    render(
      <Dialog isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    );
    const dialog = screen.queryByRole('dialog') as HTMLDialogElement;
    if (dialog) {
      expect(dialog.open).toBe(false);
    }
  });

  it('renders content when isOpen is true', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect((screen.getByRole('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Dialog isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Dialog>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('renders subcomponents correctly', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <DialogHeader>
          <DialogTitle>My Title</DialogTitle>
          <DialogDescription>My Description</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button>Action</button>
        </DialogFooter>
      </Dialog>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });

  it('renders spotlight effect by default', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Dialog>
    );

    const spotlightEl = screen.getByTestId('dialog-spotlight');
    expect(spotlightEl).toBeInTheDocument();
  });

  it('does not render spotlight when spotlight is false', () => {
    render(
      <Dialog isOpen={true} onClose={() => {}} spotlight={false}>
        <div>Content</div>
      </Dialog>
    );

    const spotlightEl = screen.queryByTestId('dialog-spotlight');
    expect(spotlightEl).not.toBeInTheDocument();
  });
});
