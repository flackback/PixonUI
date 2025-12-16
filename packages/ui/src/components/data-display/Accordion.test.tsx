import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './Accordion';
import React from 'react';

describe('Accordion', () => {
  it('renders correctly and expands item on click', () => {
    render(
      <Accordion type="single" defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    // Check initial state
    expect(screen.getByText('Content 1')).toBeVisible(); // It might be visible in DOM but hidden via CSS. 
    // Testing visibility with grid animation is tricky in jsdom.
    // We check classes or aria attributes.
    
    const trigger1 = screen.getByText('Trigger 1').closest('button');
    const trigger2 = screen.getByText('Trigger 2').closest('button');

    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    expect(trigger2).toHaveAttribute('aria-expanded', 'false');

    // Click second trigger
    fireEvent.click(trigger2!);

    expect(trigger1).toHaveAttribute('aria-expanded', 'false');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });

  it('supports multiple expansion', () => {
    render(
      <Accordion type="multiple" defaultValue={['item-1']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    );

    const trigger1 = screen.getByText('Trigger 1').closest('button');
    const trigger2 = screen.getByText('Trigger 2').closest('button');

    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    
    fireEvent.click(trigger2!);

    expect(trigger1).toHaveAttribute('aria-expanded', 'true');
    expect(trigger2).toHaveAttribute('aria-expanded', 'true');
  });
});
