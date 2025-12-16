import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Toast } from './Toast';
import { ToastProvider } from './ToastProvider';
import { useToast } from '../../hooks/useToast';
import React, { useEffect } from 'react';
import userEvent from '@testing-library/user-event';

// Helper component to test hook
const TestComponent = ({ onMount }: { onMount?: () => void }) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (onMount) onMount();
  }, [onMount]);

  return (
    <button onClick={() => toast({ title: 'Test Toast', description: 'Description' })}>
      Show Toast
    </button>
  );
};

describe('Toast', () => {
  it('renders correctly', () => {
    const onDismiss = vi.fn();
    render(
      <Toast 
        id="1" 
        title="Title" 
        description="Description" 
        onDismiss={onDismiss} 
      />
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('calls onDismiss after duration', () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    render(
      <Toast 
        id="1" 
        title="Title" 
        onDismiss={onDismiss} 
        duration={1000} 
      />
    );
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(onDismiss).toHaveBeenCalledWith('1');
    vi.useRealTimers();
  });
});

describe('ToastProvider', () => {
  it('shows toast when triggered', async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    await user.click(screen.getByText('Show Toast'));
    expect(screen.getByText('Test Toast')).toBeInTheDocument();
  });
});
