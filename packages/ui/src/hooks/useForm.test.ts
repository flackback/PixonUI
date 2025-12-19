import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from './useForm';

describe('useForm', () => {
  const initialValues = {
    username: '',
    email: '',
  };

  it('should initialize with initial values', () => {
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: vi.fn(),
    }));

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should update values on change', () => {
    const { result } = renderHook(() => useForm({
      initialValues,
      onSubmit: vi.fn(),
    }));

    act(() => {
      result.current.handleChange({
        target: { name: 'username', value: 'johndoe', type: 'text' }
      } as any);
    });

    expect(result.current.values.username).toBe('johndoe');
  });

  it('should handle form submission', async () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() => useForm({
      initialValues: { username: 'test' },
      onSubmit,
    }));

    const mockEvent = {
      preventDefault: vi.fn(),
      currentTarget: {
        checkValidity: () => true,
      },
    } as any;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(onSubmit).toHaveBeenCalledWith({ username: 'test' });
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle validation errors', async () => {
    const { result } = renderHook(() => useForm({
      initialValues: { username: '' },
      onSubmit: vi.fn(),
    }));

    const mockEvent = {
      preventDefault: vi.fn(),
      currentTarget: {
        checkValidity: () => false,
        elements: [
          {
            name: 'username',
            validity: { valid: false },
            validationMessage: 'Username is required',
          },
        ],
      },
    } as any;

    await act(async () => {
      await result.current.handleSubmit(mockEvent);
    });

    expect(result.current.errors.username).toBe('Username is required');
  });
});
