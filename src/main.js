import { parse } from './parser.js';
import { generate as generateMarkdown } from './generators/markdown.js';

export function main(htmlInput, options = {}) {
  // Validate input
  if (typeof htmlInput !== 'string') {
    throw new TypeError('htmlInput must be a string');
  }

  // Validate options
  const outputFormat = options.outputFormat || 'markdown';
  if (outputFormat !== 'markdown' && outputFormat !== 'json') {
    throw new Error('options.outputFormat must be \'markdown\' or \'json\'');
  }

  const strategy = options.strategy;
  if (strategy && strategy !== 'list' && strategy !== 'article') {
    throw new Error('options.strategy must be \'list\', \'article\', or undefined');
  }

  // Parse HTML to virtual DOM
  let tree = parse(htmlInput, options.removeAttributes);

  // Apply extraction strategy
  if (strategy === 'list') {
    tree = extractLargestList(tree);
  } else if (strategy === 'article') {
    tree = extractArticle(tree);
  }

  // Generate output
  if (outputFormat === 'markdown') {
    return generateMarkdown(tree);
  }

  // JSON output - remove parent refs to avoid circular structure
  return JSON.stringify(tree, (key, value) => key === 'parent' ? undefined : value, 2);
}

export const html2md4llm = main;
export default main;

function extractLargestList(node) {
  let largest = null;
  let maxCount = 0;

  function traverse(n) {
    if (n.type === 'element' && (n.tag === 'ul' || n.tag === 'ol')) {
      const count = n.children.filter(c => c.type === 'element' && c.tag === 'li').length;
      if (count > maxCount) {
        maxCount = count;
        largest = n;
      }
    }
    if (n.children) {
      n.children.forEach(traverse);
    }
  }

  traverse(node);
  return largest || node;
}

function extractArticle(node) {
  // Filter out sibling divs with no text content
  function hasText(n) {
    if (n.type === 'text' && n.text.trim()) return true;
    if (n.children) return n.children.some(hasText);
    return false;
  }

  function filterNode(n) {
    if (n.type !== 'element') return n;

    const filtered = { ...n, children: [] };
    for (const child of n.children || []) {
      if (child.type === 'text' || hasText(child)) {
        filtered.children.push(filterNode(child));
      }
    }
    return filtered;
  }

  return filterNode(node);
}
