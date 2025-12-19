import React from 'react';
import { Button, useToast } from '@pixonui/react';

export function ToastDemo() {
  const { toast } = useToast();
  return (
    <div className="flex gap-2">
      <Button variant="success" onClick={() => toast({ title: 'Success', description: 'Action completed successfully.', variant: 'success' })}>
        Success Toast
      </Button>
      <Button variant="alert" onClick={() => toast({ title: 'Warning', description: 'Please check your input.', variant: 'warning' })}>
        Warning Toast
      </Button>
      <Button variant="danger" onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' })}>
        Error Toast
      </Button>
    </div>
  );
}
