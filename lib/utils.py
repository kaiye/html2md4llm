"""Utility functions for HTML to Markdown conversion."""

import re
from typing import Any, Dict, List, Optional

HTML_ENTITIES = {
    '&nbsp;': ' ',
    '&lt;': '<',
    '&gt;': '>',
    '&amp;': '&',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'"
}


def decode_entity(entity: str) -> str:
    """Decode a single HTML entity."""
    if entity.startswith('&#x'):
        try:
            return chr(int(entity[3:-1], 16))
        except (ValueError, OverflowError):
            return entity
    if entity.startswith('&#'):
        try:
            return chr(int(entity[2:-1], 10))
        except (ValueError, OverflowError):
            return entity
    return HTML_ENTITIES.get(entity, entity)


def decode_entities(text: str) -> str:
    """Decode all HTML entities in text."""
    return re.sub(r'&[#\w]+;', lambda m: decode_entity(m.group(0)), text)


def create_element(tag: str, attributes: Optional[Dict[str, str]] = None, children: Optional[List[Any]] = None) -> Dict[str, Any]:
    """Create an element node."""
    return {
        'type': 'element',
        'tag': tag,
        'attributes': attributes or {},
        'children': children or [],
        'parent': None
    }


def clean_text(text: str) -> str:
    """Remove invisible Unicode characters."""
    return re.sub(r'[\u200E\u200F\u202A-\u202E]', '', text)


def create_text(text: str) -> Dict[str, Any]:
    """Create a text node."""
    return {
        'type': 'text',
        'text': clean_text(text),
        'parent': None
    }
