import { describe, expect, it } from 'vitest';
import { chatMarkupToHtml, htmlToChatMarkup } from '../components/chat/richText';

describe('chat rich text', () => {
  it('renders WhatsApp-style markup as safe inline html', () => {
    expect(chatMarkupToHtml('*bold* _italic_ ~old~ `code`')).toContain('<strong>bold</strong>');
    expect(chatMarkupToHtml('<script>*x*</script>')).not.toContain('<script>');
  });

  it('serializes rich editor html back to normalized chat markup', () => {
    const root = document.createElement('div');
    root.innerHTML = '<strong>bold</strong> <em>italic</em> <s>old</s> <code>code</code>';
    expect(htmlToChatMarkup(root)).toBe('*bold* _italic_ ~old~ `code`');
  });
});
