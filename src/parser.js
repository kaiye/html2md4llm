import { createElement, createText, decodeEntities } from './utils.js';

export function parse(html) {
  // Extract metadata from head
  const metadata = {};
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch) metadata.title = titleMatch[1].trim();

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (descMatch) metadata.description = descMatch[1];

  const kwMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']*)["']/i);
  if (kwMatch) metadata.keywords = kwMatch[1];

  // Pre-clean: remove script, style, iframe
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');

  const stack = [];
  const root = createElement('root', { metadata }, []);
  stack.push(root);

  const tagRegex = /<\/?([a-z][a-z0-9]*)[^>]*>/gi;
  let lastIndex = 0;
  let match;

  while ((match = tagRegex.exec(html)) !== null) {
    // Add text before tag
    if (match.index > lastIndex) {
      const text = html.slice(lastIndex, match.index).trim();
      if (text) {
        const textNode = createText(decodeEntities(text));
        const parent = stack[stack.length - 1];
        textNode.parent = parent;
        parent.children.push(textNode);
      }
    }

    const fullTag = match[0];
    const tagName = match[1].toLowerCase();

    if (fullTag.startsWith('</')) {
      // Closing tag
      if (stack.length > 1 && stack[stack.length - 1].tag === tagName) {
        stack.pop();
      }
    } else {
      // Opening tag
      const attrs = {};
      const attrRegex = /([a-z][a-z0-9-]*)="([^"]*)"/gi;
      let attrMatch;
      while ((attrMatch = attrRegex.exec(fullTag)) !== null) {
        attrs[attrMatch[1]] = attrMatch[2];
      }

      const node = createElement(tagName, attrs, []);
      const parent = stack[stack.length - 1];
      node.parent = parent;
      parent.children.push(node);

      // Self-closing or void elements
      if (fullTag.endsWith('/>') || ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName)) {
        // Don't push to stack
      } else {
        stack.push(node);
      }
    }

    lastIndex = tagRegex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < html.length) {
    const text = html.slice(lastIndex).trim();
    if (text) {
      const textNode = createText(decodeEntities(text));
      const parent = stack[stack.length - 1];
      textNode.parent = parent;
      parent.children.push(textNode);
    }
  }

  const result = root.children.length === 1 ? root.children[0] : root;
  if (Object.keys(metadata).length > 0) {
    result.metadata = metadata;
  }
  return result;
}
