let pixonSheet: CSSStyleSheet | null = null;
let pixonStyleElement: HTMLStyleElement | null = null;


const ruleRegistry = new Map<string, Set<string>>();

export function getPixonSheet(): CSSStyleSheet | null {
  if (typeof document === 'undefined') return null;

  if (pixonSheet) return pixonSheet;

  // 1. Try to find existing hydrated style tag
  if (!pixonStyleElement) {
    pixonStyleElement = (document.getElementById('pixon-motion-sheet') || 
                         document.querySelector('style[data-pixon-sheet]')) as HTMLStyleElement;
  }

  // 2. Try adoptedStyleSheets if available (preferred for performance)
  if (
    !pixonStyleElement &&
    typeof CSSStyleSheet !== 'undefined' &&
    'adoptedStyleSheets' in document &&
    document.adoptedStyleSheets !== undefined
  ) {
    try {
      pixonSheet = new CSSStyleSheet();
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, pixonSheet];
      return pixonSheet;
    } catch (e) {
      // Fallback below
    }
  }

  // 3. Fallback to <style> tag
  if (!pixonStyleElement) {
    pixonStyleElement = document.createElement('style');
    pixonStyleElement.id = 'pixon-motion-sheet';
    pixonStyleElement.setAttribute('data-pixon-sheet', '');
    document.head.appendChild(pixonStyleElement);
  }

  pixonSheet = pixonStyleElement.sheet as CSSStyleSheet;
  return pixonSheet;
}

export function insertScopedRules(scopeId: string, css: string): () => void {
  if (typeof document === 'undefined') return () => {};

  const sheet = getPixonSheet();
  if (!sheet) return () => {};

  // Caller provides fully formed CSS rules (e.g. [data-pixon-id="..."]:hover { ... })
  // insertRule requires one rule at a time.
  // `insertRule` requires one rule at a time.
  const rules = css
    .split('}')
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => r + '}');

  const insertedIndices: number[] = [];
  
  if (!ruleRegistry.has(scopeId)) {
    ruleRegistry.set(scopeId, new Set());
  }

  const scopeSet = ruleRegistry.get(scopeId)!;

  rules.forEach((rule) => {
    try {
      const idx = sheet.insertRule(rule, sheet.cssRules.length);
      insertedIndices.push(idx);
      scopeSet.add(rule);
    } catch (e) {
      // Ignore parse errors from insertRule
    }
  });

  return () => {
    if (typeof document === 'undefined') return;
    const currentSheet = getPixonSheet();
    if (!currentSheet) return;

    // We must find the exact rules and delete them by index from end to start to avoid shifting issues
    const rulesToDelete = Array.from(scopeSet);
    for (let i = currentSheet.cssRules.length - 1; i >= 0; i--) {
      const ruleNode = currentSheet.cssRules[i];
      if (ruleNode && rulesToDelete.includes(ruleNode.cssText)) {
        currentSheet.deleteRule(i);
        scopeSet.delete(ruleNode.cssText);
      }
    }
    
    if (scopeSet.size === 0) {
      ruleRegistry.delete(scopeId);
    }
  };
}

export function clearStyles() {
  pixonSheet = null;
  pixonStyleElement = null;
  ruleRegistry.clear();
}
