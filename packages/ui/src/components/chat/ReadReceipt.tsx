import React from 'react';
import { cn } from '../../utils/cn';
import { Check, CheckCheck } from 'lucide-react';
import type { MessageStatus } from './types';

interface ReadReceiptProps extends React.HTMLAttributes<HTMLDivElement> {
  status: MessageStatus;
}

export function ReadReceipt({ status, className, ...props }: ReadReceiptProps) {
  if (status === 'sending') {
    return (
      <div className={cn("w-3 h-3 border border-current border-t-transparent rounded-full animate-spin opacity-50", className)} {...props} />
    );
  }

  if (status === 'failed') {
    return (
      <span className={cn("text-red-500 text-[10px] font-bold", className)} {...props}>!</span>
    );
  }

  return (
    <div className={cn("flex items-center", className)} {...props}>
      {status === 'sent' && <Check className="h-3 w-3 opacity-50" />}
      {status === 'delivered' && <CheckCheck className="h-3 w-3 opacity-50" />}
      {status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
    </div>
  );
}
