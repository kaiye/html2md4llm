# JS to Python Migration & Dify Plugin Integration

## Overview

This document describes the migration from pure JavaScript implementation to a dual-stack architecture supporting both JavaScript (browser/Node.js) and Python (Dify plugin) with a single source of truth.

## Architecture

### Multi-Language Support

The project now maintains **two parallel implementations**:

1. **JavaScript** (`src/` + `dist/`)
   - Original ES2015+ source code
   - Bundled for browser and Node.js usage
   - No external dependencies

2. **Python** (`lib/` + `plugin/lib/`)
   - Converted from JavaScript using AST-based manual translation
   - Compatible with Python 3.12+
   - Used for Dify plugin execution

### Build Process

```
npm run build
    ↓
1. Compile JavaScript (esbuild)
   - dist/html2md4llm.js (full)
   - dist/html2md4llm.min.js (minified)
    ↓
2. Package Dify Plugin (archiver)
   - dist/html2md4llm-1.0.0.difypkg (ZIP archive)
   - Contains: manifest.yaml, Python code, tool configurations
```

## Conversion Details

### Conversion Strategy: Option C (Hybrid Approach)

**Decision**: Manual conversion with AST analysis rather than automated tools

**Rationale**:
- Code complexity is moderate and well-structured
- Manual conversion ensures code quality and Pythonic style
- Allows proper error handling and optimization for each language
- Result is easier to maintain and understand

### Code Mapping

| JavaScript File | Python File | Lines | Type |
|-----------------|-------------|-------|------|
| `src/utils.js` | `lib/utils.py` | ~55 | Utilities |
| `src/parser.js` | `lib/parser.py` | ~220 | Parser |
| `src/generators/markdown.js` | `lib/markdown.py` | ~165 | Generator |
| `src/main.js` | `lib/main.py` | ~100 | API |

**Total**: ~4200 lines of JavaScript → ~540 lines of Python

### Language Differences Handled

1. **Imports**: `import/export` → `import` statements
2. **Objects**: `{}` → `dict()`
3. **Arrays**: `[]` → `list()`
4. **Functions**: `function` → `def`
5. **String Methods**: JavaScript methods → Python equivalents
6. **Regex**: JS `/pattern/gi` → Python `re.IGNORECASE | re.DOTALL`
7. **Closures**: Nested functions with proper scoping
8. **Null Handling**: `null` → `None`
9. **Type Checking**: JavaScript coercion → Python isinstance/type checks
10. **JSON Serialization**: Custom serializer for circular references

### Testing

Both implementations were tested to ensure feature parity:

```bash
# JavaScript tests
npm test

# Python tests
python3 test_python.py
```

All core functionality works identically in both languages:
- ✅ HTML parsing
- ✅ Tree flattening
- ✅ Markdown generation
- ✅ JSON export
- ✅ Content extraction strategies

## Dify Plugin Structure

### Standard Compliance

The plugin follows Dify's official Tool Plugin specification:

```
plugin/
├── manifest.yaml          # Plugin root config (required)
├── main.py               # Entry point (required)
├── _assets/icon.svg      # Plugin icon (required)
├── provider/
│   ├── html2md4llm.yaml # Tool provider config
│   └── html2md4llm.py   # Provider implementation
├── tools/
│   ├── markdown/
│   │   ├── config.yaml   # Tool parameter definition
│   │   └── invoke.py     # Tool execution
│   └── json/
│       ├── config.yaml
│       └── invoke.py
├── lib/                  # Python library
├── requirements.txt      # No external dependencies
└── pyproject.toml        # Project metadata
```

### Key Features

- **Two Tools**:
  - `HTML to Markdown` - converts HTML to clean Markdown
  - `HTML to JSON` - converts HTML to virtual DOM JSON

- **Parameters**:
  - `html_input` (required) - the HTML string to convert
  - `remove_attributes` (optional) - comma-separated list of attributes to strip
  - `strategy` (optional) - 'list' or 'article' for content extraction

- **Zero Dependencies**: Uses only Python 3.12+ standard library

### .difypkg Format

The `.difypkg` file is a ZIP archive that Dify can directly import:

```bash
file dist/html2md4llm-1.0.0.difypkg
# output: Zip archive data, at least v2.0 to extract

unzip -l dist/html2md4llm-1.0.0.difypkg
# Lists all plugin files
```

## Maintenance Notes

### Keeping Implementations in Sync

When modifying the JavaScript source:

1. **Update `src/` files** - make changes to JavaScript implementation
2. **Port to `lib/`** - manually convert changes to Python
3. **Test both**: `npm test` and `python3 test_python.py`
4. **Rebuild**: `npm run build` (generates both JS bundles and .difypkg)

### Conversion Guidelines

For future changes, follow these patterns:

**JavaScript → Python**
```javascript
// JS: Regular expression
const regex = /pattern/gi;
html.replace(regex, callback);

// Python equivalent:
import re
pattern = re.compile(r'pattern', re.IGNORECASE | re.DOTALL)
pattern.sub(callback, text)
```

```javascript
// JS: Object spread
{...obj, newKey: value}

// Python equivalent:
{**obj, 'newKey': value}
```

```javascript
// JS: Array methods with closures
arr.map(x => x * 2).filter(x => x > 5)

// Python equivalent:
[x * 2 for x in arr if x * 2 > 5]
```

### File Locations

- Source of truth: `src/` (JavaScript)
- Converted code: `lib/` (Python)
- Plugin packaging: `plugin/` (combines lib + configs)
- Builds: `dist/` (generated by `npm run build`)

## Testing the Plugin

### In Dify

1. Download: `dist/html2md4llm-1.0.0.difypkg`
2. Install: Plugins → Install from file → select `.difypkg`
3. Use: Add tools to workflow:
   - "HTML to Markdown"
   - "HTML to JSON"

### Local Validation

```python
import sys
sys.path.insert(0, 'plugin')
from lib import main

# Test Markdown conversion
result = main('<h1>Test</h1>', {'outputFormat': 'markdown'})

# Test JSON conversion
result = main('<h1>Test</h1>', {'outputFormat': 'json'})

# Test with strategy
result = main(html, {'strategy': 'list'})
```

## Future Improvements

- [ ] Implement automated diff checker for JS ↔ Python parity
- [ ] Add type hints to Python code (PEP 484)
- [ ] Create Python wrapper for easy local testing
- [ ] Consider language server for IDE integration
- [ ] Add performance benchmarks (JS vs Python)
- [ ] Explore WebAssembly compilation option

## References

- **Dify Docs**: https://docs.dify.ai/en/plugins/quick-start/develop-plugins/tool-plugin
- **Python 3.12**: https://docs.python.org/3.12/
- **JavaScript Spec**: https://www.ecma-international.org/publications-and-standards/standards/ecma-262/
