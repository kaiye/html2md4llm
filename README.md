# html2md4llm

Convert HTML to clean Markdown or JSON format, optimized for LLM processing.

## Features

- Convert HTML to Markdown or JSON
- Intelligent content extraction (list/article modes)
- Automatic HTML cleaning (removes scripts, styles, iframes)
- Preserves metadata (title, description, keywords)
- Zero dependencies - uses only Node.js built-in modules

## Installation

### NPM Package

```bash
npm install html2md4llm
```

### Standalone Script

Download `dist/html2md4llm.min.js` and include it directly:

```html
<script src="html2md4llm.min.js"></script>
<script>
  const result = html2md4llm('<h1>Hello</h1>');
</script>
```

### Dify Plugin

The plugin is available in `dist/html2md4llm-*.difypkg` after running `npm run build`.

**Features:**
- Convert HTML to Markdown or JSON in Dify workflows
- Supports attribute removal and content extraction strategies
- Built with Python for Dify compatibility

**Installation in Dify:**
1. Download the `.difypkg` file from `dist/` directory
2. In Dify, go to Plugins → Install from file
3. Select the `.difypkg` file
4. Use "HTML to Markdown" or "HTML to JSON" tools in your workflows

## Usage

```javascript
import { main } from 'html2md4llm';

// Basic conversion to Markdown
const markdown = main('<h1>Hello</h1><p>World</p>');

// Convert to JSON
const json = main('<h1>Hello</h1>', { outputFormat: 'json' });

// Extract largest list
const list = main(html, { strategy: 'list' });

// Extract article content
const article = main(html, { strategy: 'article' });
```

## API

### `main(htmlInput, options)`

**Parameters:**
- `htmlInput` (string): HTML text to convert
- `options` (object, optional):
  - `outputFormat` (string): `'markdown'` (default) or `'json'`
  - `strategy` (string): `'list'`, `'article'`, or undefined
  - `removeAttributes` (boolean): Remove HTML attributes during parsing

**Returns:** String (Markdown or JSON)

## Strategies

- **list**: Extracts the largest `<ul>` or `<ol>` element
- **article**: Filters out empty containers, keeping main content

## Project Structure

```
html2md4llm/
├── src/                    # JavaScript source code (ES2015+)
│   ├── main.js            # Main entry point and API
│   ├── parser.js          # HTML parser
│   ├── utils.js           # Utility functions
│   └── generators/
│       └── markdown.js    # Markdown generator
│
├── lib/                    # Python library (converted from JS)
│   ├── __init__.py        # Package initialization
│   ├── main.py            # Main API (equivalent to src/main.js)
│   ├── parser.py          # HTML parser
│   ├── utils.py           # Utility functions
│   └── markdown.py        # Markdown generator
│
├── plugin/                 # Dify plugin structure
│   ├── manifest.yaml      # Plugin metadata
│   ├── main.py            # Plugin entry point
│   ├── _assets/           # Plugin assets (icon)
│   ├── lib/               # Copy of Python library
│   ├── provider/          # Tool provider configuration
│   │   ├── html2md4llm.yaml
│   │   └── html2md4llm.py
│   ├── tools/             # Tool definitions
│   │   ├── markdown/      # HTML to Markdown tool
│   │   │   ├── config.yaml
│   │   │   └── invoke.py
│   │   └── json/          # HTML to JSON tool
│   │       ├── config.yaml
│   │       └── invoke.py
│   ├── pyproject.toml
│   └── requirements.txt
│
├── dist/                   # Build output
│   ├── html2md4llm.js     # ES2015 bundle
│   ├── html2md4llm.min.js # Minified bundle
│   └── *.difypkg          # Dify plugin package
│
├── tests/                  # Test files
├── specs/                  # Feature specifications
├── build.js               # Build script
└── package.json           # Node.js metadata
```

## Build

### JavaScript Bundle
```bash
npm run build
```
Creates:
- `dist/html2md4llm.js` - Full bundle (with comments)
- `dist/html2md4llm.min.js` - Minified bundle

### Dify Plugin
The build script automatically creates:
- `dist/html2md4llm-*.difypkg` - Plugin package ready for Dify

## Development

### Testing JavaScript Implementation
```bash
npm test
```

### Testing Python Implementation
```bash
python3 test_python.py
```

## Implementation Notes

- **JavaScript**: Pure ES2015+ with no external dependencies, uses only Node.js built-in modules
- **Python**: Auto-generated from JavaScript source code using manual AST-based conversion. Compatible with Python 3.12+
- **Dify Plugin**: Python-based tool plugin that leverages the converted Python library

## License

MIT
