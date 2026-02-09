"""HTML parser for converting HTML to virtual DOM."""

import re
from typing import Any, Dict, List, Optional, Union

from .utils import create_element, create_text, decode_entities


def clean_text(text: str) -> str:
    """Remove invisible Unicode characters."""
    return re.sub(r'[\u200E\u200F\u202A-\u202E]', '', text)


def parse(html: str, remove_attributes: Optional[List[str]] = None) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Parse HTML string to virtual DOM tree.

    Args:
        html: HTML string to parse
        remove_attributes: List of attribute names to remove from elements

    Returns:
        Root element or list of elements
    """
    if remove_attributes is None:
        remove_attributes = []

    # Default blacklist (style temporarily preserved for display:none filtering)
    default_blacklist = ['loading', 'decoding', 'fetchpriority']
    blacklist = default_blacklist + remove_attributes

    def should_remove(attr_name: str) -> bool:
        """Check if an attribute should be removed."""
        if attr_name == 'style':
            return False  # Preserve for filtering
        if attr_name.startswith('data-'):
            return True
        for pattern in blacklist:
            if pattern.endswith('-*'):
                if attr_name.startswith(pattern[:-2]):
                    return True
            elif attr_name == pattern:
                return True
        return False

    # Pre-clean: remove DOCTYPE, script, style, iframe, svg, link, source, input, comments
    html = re.sub(r'<!DOCTYPE[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<script[^>]*>[\s\S]*?</script>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<style[^>]*>[\s\S]*?</style>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<iframe[^>]*>[\s\S]*?</iframe>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<svg[^>]*>[\s\S]*?</svg>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<link[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<source[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<input[^>]*>', '', html, flags=re.IGNORECASE)
    html = re.sub(r'<!--[\s\S]*?-->', '', html)

    stack: List[Dict[str, Any]] = []
    root = create_element('root', {}, [])
    stack.append(root)

    tag_regex = re.compile(r'<\/?([a-z][a-z0-9]*)[^>]*>', re.IGNORECASE)
    last_index = 0

    void_elements = {'br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'area', 'base', 'col', 'embed', 'param', 'track', 'wbr'}

    for match in tag_regex.finditer(html):
        # Add text before tag
        if match.start() > last_index:
            text = html[last_index:match.start()].strip()
            if text:
                text_node = create_text(decode_entities(text))
                parent = stack[-1]
                text_node['parent'] = parent
                parent['children'].append(text_node)

        full_tag = match.group(0)
        tag_name = match.group(1).lower()

        if full_tag.startswith('</'):
            # Closing tag
            if len(stack) > 1 and stack[-1]['tag'] == tag_name:
                stack.pop()
        else:
            # Opening tag
            attrs: Dict[str, str] = {}
            data_src: Optional[str] = None

            attr_regex = re.compile(r'([a-z][a-z0-9-]*)="([^"]*)"', re.IGNORECASE)
            for attr_match in attr_regex.finditer(full_tag):
                attr_name = attr_match.group(1)
                attr_value = attr_match.group(2)

                if attr_name == 'data-src':
                    data_src = attr_value
                if not should_remove(attr_name):
                    attrs[attr_name] = attr_value

            # For img tags, use data-src as src if src is missing
            if tag_name == 'img' and 'src' not in attrs and data_src:
                attrs['src'] = data_src

            node = create_element(tag_name, attrs, [])
            parent = stack[-1]
            node['parent'] = parent
            parent['children'].append(node)

            # Self-closing or void elements
            if not full_tag.endswith('/>') and tag_name not in void_elements:
                stack.append(node)

        last_index = match.end()

    # Add remaining text
    if last_index < len(html):
        text = html[last_index:].strip()
        if text:
            text_node = create_text(decode_entities(text))
            parent = stack[-1]
            text_node['parent'] = parent
            parent['children'].append(text_node)

    # Post-processing: flatten pre/code, flatten containers, remove unwanted nodes
    void_elements_list = ['br', 'hr', 'img']
    flattenable_tags = {'div', 'span', 'section', 'p'}
    preserve_empty_elements = {'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'}

    def flatten_pre_code(node: Dict[str, Any]) -> None:
        """Flatten pre and code tags."""
        if node['type'] == 'element' and node['tag'] in ('pre', 'code'):
            texts: List[str] = []

            def collect_text(n: Dict[str, Any]) -> None:
                if n['type'] == 'text':
                    texts.append(n['text'])
                elif n.get('children'):
                    for child in n['children']:
                        collect_text(child)

            for child in node['children']:
                collect_text(child)
            node['children'] = [create_text(''.join(texts))]
        elif node.get('children'):
            for child in node['children']:
                flatten_pre_code(child)

    def remove_unwanted_nodes(node: Dict[str, Any]) -> None:
        """Remove unwanted nodes like hidden elements, broken links, etc."""
        if not node.get('children'):
            return

        filtered: List[Dict[str, Any]] = []

        for child in node['children']:
            should_keep = False

            if child['type'] == 'text':
                should_keep = True
            elif child['type'] == 'element':
                # Filter elements with display:none
                style = child['attributes'].get('style', '')
                if style and re.search(r'display\s*:\s*none', style, re.IGNORECASE):
                    should_keep = False
                # Filter ARIA hidden elements
                elif child['attributes'].get('aria-hidden') == 'true':
                    should_keep = False
                elif child['attributes'].get('tabindex') == '-1':
                    should_keep = False
                elif 'hidden' in child['attributes']:
                    should_keep = False
                elif child['attributes'].get('role') in ('presentation', 'none'):
                    should_keep = False
                # Filter img without src
                elif child['tag'] == 'img' and 'src' not in child['attributes']:
                    should_keep = False
                # Filter a with javascript: href
                elif child['tag'] == 'a' and child['attributes'].get('href', '').startswith('javascript:'):
                    should_keep = False
                # Keep description and keywords meta tags, remove others
                elif child['tag'] == 'meta':
                    name = child['attributes'].get('name', '')
                    should_keep = name in ('description', 'keywords')
                # Keep void elements
                elif child['tag'] in void_elements_list:
                    should_keep = True
                else:
                    # Recursively process children
                    remove_unwanted_nodes(child)
                    # Remove style attribute after filtering
                    child['attributes'].pop('style', None)
                    # Keep structural table elements even when cell content is empty
                    if child['tag'] in preserve_empty_elements:
                        should_keep = True
                    else:
                        # Remove empty nodes
                        should_keep = bool(child.get('children'))

            if should_keep:
                filtered.append(child)

        node['children'] = filtered

    def flatten_containers(node: Dict[str, Any]) -> Dict[str, Any]:
        """Flatten single-child container elements."""
        if not node.get('children'):
            return node

        new_children: List[Dict[str, Any]] = []

        for child in node['children']:
            # Collect flattened tags and classes
            tags: List[str] = []
            classes: List[str] = []
            current = child

            # Walk down single-child flattenable containers
            while (current['type'] == 'element' and
                   current['tag'] in flattenable_tags and
                   len(current.get('children', [])) == 1):
                tags.append(current['tag'])
                if current['attributes'].get('class'):
                    classes.append(current['attributes']['class'])
                current = current['children'][0]

            # If we collected any tags, attach them to the final node
            if tags:
                current['flattenedTags'] = tags
                current['flattenedClasses'] = classes

            # Recursively process the final node
            new_children.append(flatten_containers(current))

        node['children'] = new_children
        return node

    flatten_pre_code(root)
    remove_unwanted_nodes(root)
    flatten_containers(root)

    # Return single child or root
    if len(root['children']) == 1:
        return root['children'][0]
    return root
