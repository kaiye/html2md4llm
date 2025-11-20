"""Markdown generator for converting virtual DOM to Markdown."""

from typing import Any, Dict, List, Optional

INLINE_ELEMENTS = {'span', 'a', 'strong', 'em', 'code', 'b', 'i'}
BLOCK_ELEMENTS = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'pre', 'br', 'div', 'section'}


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
