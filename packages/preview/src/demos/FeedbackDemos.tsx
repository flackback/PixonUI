import React from 'react';
import { Button, useToast } from '@pixonui/react';

export function ToastDemo() {
  const { toast, promise } = useToast();

  const handlePromise = () => {
    const myPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.5) resolve('Success!');
        else reject(new Error('Failed!'));
      }, 2000);
    });

    promise(myPromise, {
      loading: 'Saving changes...',
      success: 'Changes saved successfully!',
      error: 'Failed to save changes.',
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="success" onClick={() => toast({ title: 'Success', description: 'Action completed successfully.', variant: 'success' })}>
        Success Toast
      </Button>
      <Button variant="alert" onClick={() => toast({ title: 'Warning', description: 'Please check your input.', variant: 'warning' })}>
        Warning Toast
      </Button>
      <Button variant="danger" onClick={() => toast({ title: 'Error', description: 'Something went wrong.', variant: 'error' })}>
        Error Toast
      </Button>
      <Button variant="secondary" onClick={handlePromise}>
        Promise Toast
      </Button>
    </div>
  );
}
