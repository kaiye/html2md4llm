# html2md4llm

Convert HTML to clean Markdown or JSON format, optimized for LLM processing.

## Features

- Convert HTML to Markdown or JSON
- Intelligent content extraction (list/article modes)
- Automatic HTML cleaning (removes scripts, styles, iframes)
- Preserves metadata (title, description, keywords)
- Zero dependencies - uses only Node.js built-in modules

## Installation

```bash
npm install html2md4llm
```

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

## License

MIT
