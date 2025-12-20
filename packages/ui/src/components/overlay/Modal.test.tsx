import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from './Modal';
import React from 'react';

describe('Modal', () => {
  it('is not open when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    const dialog = screen.queryByRole('dialog') as HTMLDialogElement;
    if (dialog) {
      expect(dialog.open).toBe(false);
    }
  });

  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <div>Content</div>
      </Modal>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect((screen.getByRole('dialog') as HTMLDialogElement).open).toBe(true);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when pressing Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );
    
    const dialog = screen.getByRole('dialog');
    fireEvent(dialog, new Event('cancel'));
    expect(onClose).toHaveBeenCalled();
  });

  it('renders subcomponents correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <ModalHeader>
          <ModalTitle>My Title</ModalTitle>
          <ModalDescription>My Description</ModalDescription>
        </ModalHeader>
        <ModalFooter>
          <button>Action</button>
        </ModalFooter>
      </Modal>
    );

    expect(screen.getByText('My Title')).toBeInTheDocument();
    expect(screen.getByText('My Description')).toBeInTheDocument();
    expect(screen.getByText('Action')).toBeInTheDocument();
  });
});
