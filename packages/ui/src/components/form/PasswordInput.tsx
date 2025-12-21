import React, { useState } from 'react';
import { TextInput, type TextInputProps } from './TextInput';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../button/Button';

export interface PasswordInputProps extends Omit<TextInputProps, 'type' | 'rightIcon'> {}

/**
 * A specialized input for passwords with a built-in visibility toggle.
 */
export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <TextInput
        {...props}
        ref={ref}
        type={showPassword ? 'text' : 'password'}
        rightIcon={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-white/10"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-gray-400 dark:text-white/35" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 dark:text-white/35" />
            )}
          </Button>
        }
      />
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
