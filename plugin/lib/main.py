"""Main module for HTML to Markdown/JSON conversion."""

import json
from typing import Any, Dict, List, Optional, Union

from .parser import parse
from .markdown import generate


def extract_largest_list(node: Dict[str, Any]) -> Dict[str, Any]:
    """Extract the largest list from the DOM tree."""
    largest: Optional[Dict[str, Any]] = None
    max_count = 0

    def traverse(n: Dict[str, Any]) -> None:
        nonlocal largest, max_count
        if n['type'] == 'element' and n['tag'] in ('ul', 'ol'):
            count = sum(1 for c in n.get('children', [])
                       if c['type'] == 'element' and c['tag'] == 'li')
            if count > max_count:
                max_count = count
                largest = n

        for child in n.get('children', []):
            traverse(child)

    traverse(node)
    return largest or node


def extract_article(node: Dict[str, Any]) -> Dict[str, Any]:
    """Extract article content by filtering out empty nodes."""
    def has_text(n: Dict[str, Any]) -> bool:
        if n['type'] == 'text' and n['text'].strip():
            return True
        if n.get('children'):
            return any(has_text(child) for child in n['children'])
        return False

    def filter_node(n: Dict[str, Any]) -> Dict[str, Any]:
        if n['type'] != 'element':
            return n

        filtered = n.copy()
        filtered['children'] = []
        for child in n.get('children', []):
            if child['type'] == 'text' or has_text(child):
                filtered['children'].append(filter_node(child))

        return filtered

    return filter_node(node)


def main(html_input: str, options: Optional[Dict[str, Any]] = None) -> Union[str, Dict[str, Any]]:
    """
    Convert HTML to Markdown or JSON format.

    Args:
        html_input: HTML string to convert
        options: Configuration options
            - outputFormat: 'markdown' or 'json' (default: 'markdown')
            - strategy: 'list', 'article', or None (default: None)
            - removeAttributes: List of attributes to remove from elements

    Returns:
        Markdown string or JSON object depending on outputFormat

    Raises:
        TypeError: If html_input is not a string
        ValueError: If outputFormat or strategy is invalid
    """
    if options is None:
        options = {}

    # Validate input
    if not isinstance(html_input, str):
        raise TypeError('htmlInput must be a string')

    # Validate options
    output_format = options.get('outputFormat', 'markdown')
    if output_format not in ('markdown', 'json'):
        raise ValueError("outputFormat must be 'markdown' or 'json'")

    strategy = options.get('strategy')
    if strategy and strategy not in ('list', 'article'):
        raise ValueError("strategy must be 'list', 'article', or None")

    remove_attributes = options.get('removeAttributes', [])

    # Parse HTML to virtual DOM
    tree = parse(html_input, remove_attributes)

    # Apply extraction strategy
    if strategy == 'list':
        tree = extract_largest_list(tree)
    elif strategy == 'article':
        tree = extract_article(tree)

    # Generate output
    if output_format == 'markdown':
        return generate(tree)

    # JSON output - convert tree to JSON safe format (remove parent refs)
    def remove_parent_refs(obj: Any) -> Any:
        if isinstance(obj, dict):
            return {k: remove_parent_refs(v) for k, v in obj.items() if k != 'parent'}
        if isinstance(obj, list):
            return [remove_parent_refs(item) for item in obj]
        return obj

    return json.dumps(remove_parent_refs(tree), ensure_ascii=False, indent=2)


if __name__ == '__main__':
    # Example usage
    html = '<h1>Hello</h1><p>World</p>'
    result = main(html)
    print(result)
