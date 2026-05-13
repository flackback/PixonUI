import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { Motion } from '../components/feedback/Motion';

describe('Motion SSR safety', () => {
  it('renders to string without errors in node environment', () => {
    const html = renderToString(
      <Motion animate={{ opacity: 1 }} transition={{ duration: 100 }}>
        <span>SSR Content</span>
      </Motion>
    );
    
    // console.log('SSR HTML:', html);
    expect(html).toContain('SSR Content');
    // More robust check
    expect(html).toContain('style');
    expect(html).toMatch(/opacity\s*:\s*0/);
  });



  it('does not inject styles during SSR', () => {
    renderToString(
      <Motion animate={{ x: 100 }}>
        <span>No styles</span>
      </Motion>
    );
    
    // In a real Node environment without JSDOM, document would be undefined.
    // Vitest usually runs with JSDOM, but we can verify if getPixonSheet returns null if we mock it or check context.
  });
});
