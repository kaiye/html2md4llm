import { createElement, createText, decodeEntities } from './utils.js';

function cleanText(text) {
  return text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
}

export function parse(html, removeAttributes = []) {
  // Default blacklist (style temporarily preserved for display:none filtering)
  const defaultBlacklist = ['loading', 'decoding', 'fetchpriority'];
  const blacklist = [...defaultBlacklist, ...removeAttributes];

  function shouldRemove(attrName) {
    if (attrName === 'style') return false; // Preserve for filtering
    if (attrName.startsWith('data-')) return true;
    return blacklist.some(pattern => {
      if (pattern.endsWith('-*')) {
        return attrName.startsWith(pattern.slice(0, -1));
      }
      return attrName === pattern;
    });
  }

  // Pre-clean: remove DOCTYPE, script, style, iframe, svg, link, source, input, comments
  html = html.replace(/<!DOCTYPE[^>]*>/gi, '');
  html = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '');
  html = html.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '');
  html = html.replace(/<link[^>]*>/gi, '');
  html = html.replace(/<source[^>]*>/gi, '');
  html = html.replace(/<input[^>]*>/gi, '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');

  const stack = [];
  const root = createElement('root', {}, []);
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
      let dataSrc = null;
      while ((attrMatch = attrRegex.exec(fullTag)) !== null) {
        const attrName = attrMatch[1];
        if (attrName === 'data-src') dataSrc = attrMatch[2];
        if (shouldRemove(attrName)) continue;
        attrs[attrName] = attrMatch[2];
      }

      // For img tags, use data-src as src if src is missing
      if (tagName === 'img' && !attrs.src && dataSrc) {
        attrs.src = dataSrc;
      }

      const node = createElement(tagName, attrs, []);
      const parent = stack[stack.length - 1];
      node.parent = parent;
      parent.children.push(node);

      // Self-closing or void elements
      const voidElements = ['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'];
      if (fullTag.endsWith('/>') || voidElements.includes(tagName)) {
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

  // Post-processing: flatten pre/code, flatten containers, remove unwanted nodes
  const voidElements = ['br', 'hr', 'img'];
  const flattenableTags = ['div', 'span', 'section', 'p'];

  function flattenPreCode(node) {
    if (node.type === 'element' && (node.tag === 'pre' || node.tag === 'code')) {
      const texts = [];
      function collectText(n) {
        if (n.type === 'text') texts.push(n.text);
        else if (n.children) n.children.forEach(collectText);
      }
      node.children.forEach(collectText);
      node.children = [createText(texts.join(''))];
    } else if (node.children) {
      node.children.forEach(flattenPreCode);
    }
  }

  function removeUnwantedNodes(node) {
    if (!node.children) return;

    node.children = node.children.filter(child => {
      if (child.type === 'text') return true;
      if (child.type === 'element') {
        // Filter elements with display:none
        const style = child.attributes.style;
        if (style && /display\s*:\s*none/i.test(style)) return false;

        // Filter ARIA hidden elements
        if (child.attributes['aria-hidden'] === 'true') return false;
        if (child.attributes.tabindex === '-1') return false;
        if (child.attributes.hidden !== undefined) return false;
        const role = child.attributes.role;
        if (role === 'presentation' || role === 'none') return false;

        // Filter img without src
        if (child.tag === 'img' && !child.attributes.src) return false;

        // Filter a with javascript: href
        if (child.tag === 'a' && child.attributes.href?.startsWith('javascript:')) return false;

        // Keep description and keywords meta tags, remove others
        if (child.tag === 'meta') {
          const name = child.attributes.name;
          if (name === 'description' || name === 'keywords') {
            return true;
          }
          return false;
        }
        // Keep void elements
        if (voidElements.includes(child.tag)) return true;
        // Recursively process children
        removeUnwantedNodes(child);
        // Remove style attribute after filtering
        delete child.attributes.style;
        // Remove empty nodes
        if (child.children && child.children.length === 0) return false;
      }
      return true;
    });
  }

  function flattenContainers(node) {
    if (!node.children) return node;

    node.children = node.children.map(child => {
      // Collect flattened tags and classes
      const tags = [];
      const classes = [];
      let current = child;

      // Walk down single-child flattenable containers
      while (current.type === 'element' &&
             flattenableTags.includes(current.tag) &&
             current.children?.length === 1) {
        tags.push(current.tag);
        if (current.attributes.class) {
          classes.push(current.attributes.class);
        }
        current = current.children[0];
      }

      // If we collected any tags, attach them to the final node
      if (tags.length > 0) {
        current.flattenedTags = tags;
        current.flattenedClasses = classes;
      }

      // Recursively process the final node
      return flattenContainers(current);
    });

    return node;
  }

  flattenPreCode(root);
  removeUnwantedNodes(root);
  flattenContainers(root);

  return root.children.length === 1 ? root.children[0] : root;
}
