export function generate(node, indent = 0) {
  if (node.type === 'text') {
    return node.text;
  }

  if (node.type !== 'element') {
    return '';
  }

  const tag = node.tag;
  const children = node.children || [];
  const childText = children.map(c => generate(c, indent)).join('');

  // Headings
  if (tag === 'h1') return `# ${childText}\n\n`;
  if (tag === 'h2') return `## ${childText}\n\n`;
  if (tag === 'h3') return `### ${childText}\n\n`;
  if (tag === 'h4') return `#### ${childText}\n\n`;
  if (tag === 'h5') return `##### ${childText}\n\n`;
  if (tag === 'h6') return `###### ${childText}\n\n`;

  // Paragraph
  if (tag === 'p') return `${childText}\n\n`;

  // Inline formatting
  if (tag === 'strong' || tag === 'b') return `**${childText}**`;
  if (tag === 'em' || tag === 'i') return `*${childText}*`;
  if (tag === 'code') return `\`${childText}\``;
  if (tag === 'a') return `[${childText}](${node.attributes.href || ''})`;

  // Lists
  if (tag === 'ul' || tag === 'ol') {
    return children.map((c, i) => {
      if (c.type === 'element' && c.tag === 'li') {
        const marker = tag === 'ul' ? '-' : `${i + 1}.`;
        const content = c.children.map(ch => generate(ch, indent + 2)).join('');
        return `${' '.repeat(indent)}${marker} ${content}\n`;
      }
      return '';
    }).join('') + (indent === 0 ? '\n' : '');
  }

  // Code block
  if (tag === 'pre') return `\`\`\`\n${childText}\n\`\`\`\n\n`;

  // Line break
  if (tag === 'br') return '\n';

  // Default: just return children
  return childText;
}
