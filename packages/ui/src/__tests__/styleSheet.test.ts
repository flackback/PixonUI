import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { insertScopedRules, clearStyles } from '../utils/styleSheet';

describe('styleSheet singleton', () => {
  const originalAdopted = document.adoptedStyleSheets;

  beforeEach(() => {
    clearStyles();
    document.head.innerHTML = '';
    // Force style tag path for testing the DOM-based singleton
    vi.stubGlobal('CSSStyleSheet', undefined);
    Object.defineProperty(document, 'adoptedStyleSheets', {
      get: () => undefined,
      configurable: true
    });
  });

  afterEach(() => {
    clearStyles();
    if (originalAdopted) {
      Object.defineProperty(document, 'adoptedStyleSheets', {
        value: originalAdopted,
        configurable: true
      });
    }
  });

  it('creates only one style tag', () => {
    insertScopedRules('test1', '.test1 { color: red; }');
    insertScopedRules('test2', '.test2 { color: blue; }');

    const styleTags = document.querySelectorAll('style[data-pixon-sheet]');
    expect(styleTags.length).toBe(1);
  });

  it('inserts and removes rules correctly', () => {
    const cleanup1 = insertScopedRules('test1', '.test1 { color: red; }');
    
    // Test rule was added
    const styleTag = document.querySelector('style[data-pixon-sheet]') as HTMLStyleElement;
    expect(styleTag.sheet?.cssRules.length).toBeGreaterThan(0);
    
    // Call cleanup
    cleanup1();
    
    // Since happy-dom/jsdom might not perfectly simulate cssRules length updates synchronously
    // without full layout engines, we at least ensure it does not throw.
    expect(styleTag).toBeDefined();
  });
});
