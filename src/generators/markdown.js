const inlineElements = ['span', 'a', 'strong', 'em', 'code', 'b', 'i'];
const blockElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'pre', 'br', 'hr', 'img', 'div', 'section', 'table'];
const tableSections = ['thead', 'tbody', 'tfoot'];

function normalizeTableCell(text) {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\n+/g, '<br>')
    .replace(/\s+/g, ' ')
    .replace(/\|/g, '\\|')
    .trim();
}

function collectTableRows(tableNode) {
  const rows = [];
  for (const child of tableNode.children || []) {
    if (child.type !== 'element') continue;

    if (child.tag === 'tr') {
      rows.push(child);
      continue;
    }

    if (tableSections.includes(child.tag)) {
      for (const row of child.children || []) {
        if (row.type === 'element' && row.tag === 'tr') {
          rows.push(row);
        }
      }
    }
  }
  return rows;
}

function renderTable(node, indent) {
  const rows = collectTableRows(node).map(row => {
    const cellNodes = (row.children || []).filter(
      child => child.type === 'element' && (child.tag === 'th' || child.tag === 'td')
    );
    const cells = cellNodes.map(cell => {
      const text = (cell.children || []).map(ch => generate(ch)).join('');
      return normalizeTableCell(text);
    });
    const hasHeaderCell = cellNodes.some(cell => cell.tag === 'th');
    return { cells, hasHeaderCell };
  }).filter(row => row.cells.length > 0);

  if (rows.length === 0) return '';

  let headerRowIndex = rows.findIndex(row => row.hasHeaderCell);
  if (headerRowIndex < 0) headerRowIndex = 0;

  const headerRow = [...rows[headerRowIndex].cells];
  const bodyRows = rows
    .filter((_, i) => i !== headerRowIndex)
    .map(row => [...row.cells]);

  const columnCount = Math.max(
    headerRow.length,
    ...bodyRows.map(row => row.length)
  );

  while (headerRow.length < columnCount) headerRow.push('');
  for (const row of bodyRows) {
    while (row.length < columnCount) row.push('');
  }

  const rowToLine = cells => `${' '.repeat(indent)}| ${cells.join(' | ')} |`;
  const separator = `${' '.repeat(indent)}| ${Array(columnCount).fill('---').join(' | ')} |`;

  const lines = [rowToLine(headerRow), separator];
  for (const row of bodyRows) {
    lines.push(rowToLine(row));
  }

  return lines.join('\n');
}

function isInline(node) {
  if (node.type === 'element' && node.tag === 'br') return false;
  if (node.type === 'element' && inlineElements.includes(node.tag)) return true;
  if (node.type === 'text' && node.flattenedTags) {
    return node.flattenedTags.every(tag => inlineElements.includes(tag));
  }
  return false;
}

function isBlock(node) {
  if (node.type === 'element' && node.tag === 'br') return false;
  if (node.flattenedTags && node.flattenedTags.length > 0) {
    return node.flattenedTags.some(tag => blockElements.includes(tag));
  }
  if (node.type === 'element') {
    return blockElements.includes(node.tag);
  }
  return false;
}

export function generate(node, indent = 0) {
  if (node.type === 'text') {
    return node.text;
  }

  if (node.type !== 'element') {
    return '';
  }

  const tag = node.tag;
  const children = node.children || [];

  // Tables
  if (tag === 'table') {
    return renderTable(node, indent);
  }

  // If only one child and no special handling for this tag, pass through transparently
  const hasSpecialHandling = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'pre', 'br', 'hr', 'strong', 'b', 'em', 'i', 'code', 'a'].includes(tag);
  if (children.length === 1 && !hasSpecialHandling) {
    return generate(children[0], indent);
  }

  // Generate children with proper spacing
  const parts = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    const childText = generate(child, indent);
    if (childText) parts.push(childText);

    // Add separator between children
    if (i < children.length - 1 && childText) {
      const nextChild = children[i + 1];
      const nextText = generate(nextChild, indent);
      if (nextText) {
        const childIsInline = isInline(child);
        const childIsBlock = isBlock(child);
        const nextIsInline = isInline(nextChild);
        const nextIsBlock = isBlock(nextChild);

        if (childIsInline && nextIsInline) {
          // inline + inline → space
          parts.push(' ');
        } else if (childIsBlock && nextIsBlock) {
          // block + block → double newline
          parts.push('\n\n');
        } else if (childIsBlock || nextIsBlock) {
          // block + anything or anything + block → single newline
          parts.push('\n');
        }
        // container + container or inline + container → no separator (transparent)
      }
    }
  }
  const childText = parts.join('');

  // Headings
  if (tag === 'h1') return `# ${childText}`;
  if (tag === 'h2') return `## ${childText}`;
  if (tag === 'h3') return `### ${childText}`;
  if (tag === 'h4') return `#### ${childText}`;
  if (tag === 'h5') return `##### ${childText}`;
  if (tag === 'h6') return `###### ${childText}`;

  // Paragraph
  if (tag === 'p') return childText;

  // Inline formatting
  if (tag === 'strong' || tag === 'b') return `**${childText}**`;
  if (tag === 'em' || tag === 'i') return `*${childText}*`;
  if (tag === 'code') return `\`${childText}\``;
  if (tag === 'a') {
    // Extract all text nodes and join with comma
    const texts = [];
    function collectText(n) {
      if (n.type === 'text') {
        const t = n.text.trim();
        if (t) texts.push(t);
      } else if (n.children) {
        n.children.forEach(collectText);
      }
    }
    children.forEach(collectText);
    const linkText = texts.join(', ');
    return `[${linkText}](${node.attributes.href || ''})`;
  }
  if (tag === 'img') {
    const alt = node.attributes.alt || '';
    const src = node.attributes.src || '';
    return `![${alt}](${src})`;
  }

  // Lists
  if (tag === 'ul' || tag === 'ol') {
    const listContent = children.map((c, i) => {
      if (c.type === 'element' && c.tag === 'li') {
        const marker = tag === 'ul' ? '-' : `${i + 1}.`;
        const content = c.children.map(ch => generate(ch, indent + 2)).join('');
        return `${' '.repeat(indent)}${marker} ${content}\n`;
      }
      return '';
    }).join('');
    return listContent.trimEnd();
  }

  // Code block
  if (tag === 'pre') return `\`\`\`\n${childText}\n\`\`\``;

  // Line break
  if (tag === 'br') return '\n';
  if (tag === 'hr') return '---';

  // Default: just return children
  return childText;
}
