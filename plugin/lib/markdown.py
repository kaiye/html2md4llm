"""Markdown generator for converting virtual DOM to Markdown."""

import re
from typing import Any, Dict, List, Optional

INLINE_ELEMENTS = {'span', 'a', 'strong', 'em', 'code', 'b', 'i'}
BLOCK_ELEMENTS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'pre', 'br', 'div', 'section', 'table'}
TABLE_SECTIONS = {'thead', 'tbody', 'tfoot'}


def _normalize_table_cell(text: str) -> str:
    """Normalize table cell content for Markdown tables."""
    text = text.replace('\r\n', '\n')
    text = re.sub(r'\n+', '<br>', text)
    text = re.sub(r'\s+', ' ', text)
    text = text.replace('|', '\\|')
    return text.strip()


def _collect_table_rows(table_node: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Collect tr nodes from table and common section wrappers."""
    rows: List[Dict[str, Any]] = []
    for child in table_node.get('children', []):
        if child.get('type') != 'element':
            continue

        tag = child.get('tag')
        if tag == 'tr':
            rows.append(child)
            continue

        if tag in TABLE_SECTIONS:
            for row in child.get('children', []):
                if row.get('type') == 'element' and row.get('tag') == 'tr':
                    rows.append(row)

    return rows


def _render_table(node: Dict[str, Any], indent: int) -> str:
    """Render HTML table nodes as Markdown table text."""
    rows: List[Dict[str, Any]] = []
    for row in _collect_table_rows(node):
        cell_nodes = [
            child for child in row.get('children', [])
            if child.get('type') == 'element' and child.get('tag') in ('th', 'td')
        ]

        cells = [
            _normalize_table_cell(''.join(generate(ch) for ch in cell.get('children', [])))
            for cell in cell_nodes
        ]
        if not cells:
            continue

        rows.append({
            'cells': cells,
            'has_header_cell': any(cell.get('tag') == 'th' for cell in cell_nodes)
        })

    if not rows:
        return ''

    header_row_index = next((i for i, row in enumerate(rows) if row['has_header_cell']), 0)
    header_row: List[str] = list(rows[header_row_index]['cells'])
    body_rows: List[List[str]] = [
        list(row['cells']) for i, row in enumerate(rows) if i != header_row_index
    ]

    column_count = max([len(header_row)] + [len(row) for row in body_rows])

    while len(header_row) < column_count:
        header_row.append('')
    for row in body_rows:
        while len(row) < column_count:
            row.append('')

    prefix = ' ' * indent

    def row_to_line(cells: List[str]) -> str:
        return f'{prefix}| {" | ".join(cells)} |'

    separator = f'{prefix}| {" | ".join(["---"] * column_count)} |'
    lines = [row_to_line(header_row), separator]
    lines.extend(row_to_line(row) for row in body_rows)
    return '\n'.join(lines)


def is_inline(node: Dict[str, Any]) -> bool:
    """Check if a node should be treated as inline."""
    if node['type'] == 'element' and node['tag'] == 'br':
        return False
    if node['type'] == 'element' and node['tag'] in INLINE_ELEMENTS:
        return True
    if node['type'] == 'text' and node.get('flattenedTags'):
        return all(tag in INLINE_ELEMENTS for tag in node['flattenedTags'])
    return False


def is_block(node: Dict[str, Any]) -> bool:
    """Check if a node should be treated as block."""
    if node['type'] == 'element' and node['tag'] == 'br':
        return False
    if node.get('flattenedTags') and len(node['flattenedTags']) > 0:
        return any(tag in BLOCK_ELEMENTS for tag in node['flattenedTags'])
    if node['type'] == 'element':
        return node['tag'] in BLOCK_ELEMENTS
    return False


def generate(node: Dict[str, Any], indent: int = 0) -> str:
    """
    Generate Markdown from virtual DOM node.

    Args:
        node: Virtual DOM node
        indent: Current indentation level (for lists)

    Returns:
        Markdown string
    """
    if node['type'] == 'text':
        return node['text']

    if node['type'] != 'element':
        return ''

    tag = node['tag']
    children = node.get('children', [])

    # Tables
    if tag == 'table':
        return _render_table(node, indent)

    # If only one child and no special handling for this tag, pass through transparently
    special_tags = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'pre', 'br', 'strong', 'b', 'em', 'i', 'code', 'a'}
    if len(children) == 1 and tag not in special_tags:
        return generate(children[0], indent)

    # Generate children with proper spacing
    parts: List[str] = []
    for i, child in enumerate(children):
        child_text = generate(child, indent)
        if child_text:
            parts.append(child_text)

            # Add separator between children
            if i < len(children) - 1:
                next_child = children[i + 1]
                next_text = generate(next_child, indent)
                if next_text:
                    child_is_inline = is_inline(child)
                    child_is_block = is_block(child)
                    next_is_inline = is_inline(next_child)
                    next_is_block = is_block(next_child)

                    if child_is_inline and next_is_inline:
                        # inline + inline → space
                        parts.append(' ')
                    elif child_is_block and next_is_block:
                        # block + block → double newline
                        parts.append('\n\n')
                    elif child_is_block or next_is_block:
                        # block + anything or anything + block → single newline
                        parts.append('\n')
                    # container + container or inline + container → no separator (transparent)

    child_text = ''.join(parts)

    # Headings
    if tag == 'h1':
        return f'# {child_text}'
    if tag == 'h2':
        return f'## {child_text}'
    if tag == 'h3':
        return f'### {child_text}'
    if tag == 'h4':
        return f'#### {child_text}'
    if tag == 'h5':
        return f'##### {child_text}'
    if tag == 'h6':
        return f'###### {child_text}'

    # Paragraph
    if tag == 'p':
        return child_text

    # Inline formatting
    if tag in ('strong', 'b'):
        return f'**{child_text}**'
    if tag in ('em', 'i'):
        return f'*{child_text}*'
    if tag == 'code':
        return f'`{child_text}`'

    # Link
    if tag == 'a':
        # Extract all text nodes and join with comma
        texts: List[str] = []

        def collect_text(n: Dict[str, Any]) -> None:
            if n['type'] == 'text':
                t = n['text'].strip()
                if t:
                    texts.append(t)
            elif n.get('children'):
                for child_node in n['children']:
                    collect_text(child_node)

        for child_node in children:
            collect_text(child_node)

        link_text = ', '.join(texts)
        href = node['attributes'].get('href', '')
        return f'[{link_text}]({href})'

    # Image
    if tag == 'img':
        alt = node['attributes'].get('alt', '')
        src = node['attributes'].get('src', '')
        return f'![{alt}]({src})'

    # Lists
    if tag in ('ul', 'ol'):
        list_content: List[str] = []
        for i, child in enumerate(children):
            if child['type'] == 'element' and child['tag'] == 'li':
                marker = '-' if tag == 'ul' else f'{i + 1}.'
                content = ''.join(generate(ch, indent + 2) for ch in child.get('children', []))
                list_content.append(f'{" " * indent}{marker} {content}\n')
        return ''.join(list_content).rstrip()

    # Code block
    if tag == 'pre':
        return f'```\n{child_text}\n```'

    # Line break
    if tag == 'br':
        return '\n'

    # Default: just return children
    return child_text
