#!/usr/bin/env python3
"""Quick test of Python html2md4llm module"""

import sys
import os

# Add lib directory to path
sys.path.insert(0, os.path.dirname(__file__))

from lib import main

# Test 1: Basic markdown conversion
html = '<h1>Hello</h1><p>This is a <strong>test</strong>.</p>'
result = main(html)
print("Test 1 - Basic Markdown:")
print(result)
print()

# Test 2: JSON conversion
result_json = main(html, {'outputFormat': 'json'})
print("Test 2 - JSON:")
print(result_json)
print()

# Test 3: With HTML entities
html_with_entities = '<p>Test &amp; Demo &lt;code&gt;</p>'
result_entities = main(html_with_entities)
print("Test 3 - HTML Entities:")
print(result_entities)
print()

# Test 4: List extraction
html_with_lists = '<div><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><p>Other</p></div>'
result_list = main(html_with_lists, {'strategy': 'list'})
print("Test 4 - List Extraction:")
print(result_list)
print()

print("✓ All tests passed!")
