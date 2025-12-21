import React from 'react';
import { Modal, ModalHeader, ModalFooter } from './Modal';
import { Heading } from '../typography/Heading';
import { Text } from '../typography/Text';
import { Button } from '../button/Button';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

/**
 * A specialized modal for confirming destructive or important actions.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <div className="flex items-center gap-3">
          {variant === 'danger' && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
          )}
          <Heading as="h3">{title}</Heading>
        </div>
      </ModalHeader>
      
      <div className="py-2">
        <Text className="text-gray-500 dark:text-white/60">
          {description}
        </Text>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button 
          variant={variant === 'danger' ? 'danger' : 'primary'} 
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
