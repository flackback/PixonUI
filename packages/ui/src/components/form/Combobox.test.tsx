import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Combobox, ComboboxTrigger, ComboboxContent, ComboboxInput, ComboboxList, ComboboxItem, ComboboxEmpty } from './Combobox';
import React from 'react';

describe('Combobox', () => {
  it('renders trigger and toggles content', () => {
    render(
      <Combobox>
        <ComboboxTrigger>Select Item</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="1">Item 1</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Select Item'));
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('filters items', async () => {
    render(
      <Combobox>
        <ComboboxTrigger>Select Item</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    fireEvent.click(screen.getByText('Select Item'));
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'app' } });

    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.queryByText('Banana')).not.toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(
      <Combobox>
        <ComboboxTrigger>Select Item</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxInput placeholder="Search..." />
          <ComboboxList>
            <ComboboxEmpty>No results found.</ComboboxEmpty>
            <ComboboxItem value="apple">Apple</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    fireEvent.click(screen.getByText('Select Item'));
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'xyz' } });

    expect(screen.getByText('No results found.')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  it('selects item', () => {
    const handleChange = vi.fn();
    render(
      <Combobox onValueChange={handleChange}>
        <ComboboxTrigger>Select Item</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    );

    fireEvent.click(screen.getByText('Select Item'));
    fireEvent.click(screen.getByText('Apple'));

    expect(handleChange).toHaveBeenCalledWith('apple');
    expect(screen.queryByText('Apple')).not.toBeInTheDocument(); // Should close
  });
});
