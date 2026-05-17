import React from 'react';
import { cn } from '../../utils/cn';

type ChatFormat = 'bold' | 'italic' | 'strike' | 'code';

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export function chatMarkupToHtml(text: string): string {
  const escaped = escapeHtml(text);
  return escaped
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*([^*]+)\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>')
    .replace(/~([^~]+)~/g, '<s>$1</s>')
    .replace(/\n/g, '<br>');
}

export function htmlToChatMarkup(root: HTMLElement): string {
  const visit = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const element = node as HTMLElement;
    if (element.tagName === 'BR') return '\n';

    const content = Array.from(element.childNodes).map(visit).join('');
    switch (element.tagName) {
      case 'B':
      case 'STRONG':
        return content ? `*${content}*` : '';
      case 'I':
      case 'EM':
        return content ? `_${content}_` : '';
      case 'S':
      case 'STRIKE':
      case 'DEL':
        return content ? `~${content}~` : '';
      case 'CODE':
        return content ? `\`${content}\`` : '';
      case 'DIV':
      case 'P':
        return `${content}\n`;
      default:
        return content;
    }
  };

  return Array.from(root.childNodes).map(visit).join('').replace(/\n$/, '');
}

export function applyChatFormatting(format: ChatFormat) {
  if (format === 'code') {
    const selection = window.getSelection();
    const selectedText = selection?.toString() ?? '';
    if (selectedText) {
      document.execCommand('insertHTML', false, `<code>${escapeHtml(selectedText)}</code>`);
    }
    return;
  }
  const command = format === 'bold' ? 'bold' : format === 'italic' ? 'italic' : 'strikeThrough';
  document.execCommand(command, false);
}

export function renderChatFormattedText(text: string, isOwn = false) {
  if (!text) return '';

  const regex = /(`[^`]+`|\*[^*]+\*|_[^_]+_|~[^~]+~)/g;
  return text.split(regex).map((part, index) => {
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index} className="font-bold">{part.slice(1, -1)}</strong>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <em key={index} className="italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('~') && part.endsWith('~')) {
      return <span key={index} className="line-through opacity-70">{part.slice(1, -1)}</span>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={index}
          className={cn(
            'px-1.5 py-0.5 rounded font-mono text-xs',
            isOwn ? 'bg-black/20 text-white font-semibold' : 'bg-black/10 dark:bg-black/30 text-rose-600 dark:text-rose-400'
          )}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
