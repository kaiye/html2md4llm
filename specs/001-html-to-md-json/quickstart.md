# Quickstart Guide: HTML to Markdown/JSON Converter

**Feature**: HTML to Markdown/JSON Converter
**Date**: 2025-11-12
**Purpose**: Quick reference for using the converter

## Installation

No installation required! This is a zero-dependency pure JavaScript tool.

**Requirements**:
- Node.js 18+ LTS

**Setup**:
```bash
# Clone or copy the project files
git clone <repository-url>
cd html2md2json

# No npm install needed - uses only built-in modules
```

## Basic Usage

### 1. Convert HTML to Markdown (Default)

```javascript
import { main } from './src/main.js';

const html = `
  <h1>Welcome</h1>
  <p>This is a simple example.</p>
`;

const markdown = main(html);
console.log(markdown);
```

**Output**:
```markdown
# Welcome

This is a simple example.

```

### 2. Convert HTML to JSON

```javascript
import { main } from './src/main.js';

const html = '<p>Hello <strong>world</strong>!</p>';
const json = main(html, { outputFormat: 'json' });

// Parse and inspect the structure
const tree = JSON.parse(json);
console.log(tree);
```

**Output**:
```json
{
  "type": "element",
  "tag": "p",
  "attributes": {},
  "children": [
    { "type": "text", "text": "Hello " },
    {
      "type": "element",
      "tag": "strong",
      "attributes": {},
      "children": [
        { "type": "text", "text": "world" }
      ]
    },
    { "type": "text", "text": "!" }
  ]
}
```

## Advanced Usage

### 3. Extract Largest List

Perfect for scraping product listings, article indexes, or navigation menus.

```javascript
const html = `
  <body>
    <nav>
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
      </ul>
    </nav>
    <main>
      <h1>Our Products</h1>
      <ul>
        <li>Product A - Premium quality</li>
        <li>Product B - Best seller</li>
        <li>Product C - New arrival</li>
        <li>Product D - Limited edition</li>
        <li>Product E - Customer favorite</li>
      </ul>
    </main>
  </body>
`;

const result = main(html, { strategy: 'list' });
console.log(result);
```

**Output** (only the largest list):
```markdown
- Product A - Premium quality
- Product B - Best seller
- Product C - New arrival
- Product D - Limited edition
- Product E - Customer favorite

```

### 4. Extract Article Content

Perfect for extracting the main content from blog posts or news articles, filtering out navigation, ads, and sidebars.

```javascript
const html = `
  <body>
    <header>
      <nav>
        <a href="/">Home</a> |
        <a href="/blog">Blog</a> |
        <a href="/contact">Contact</a>
      </nav>
    </header>

    <aside id="sidebar">
      <h3>Recent Posts</h3>
      <a href="/post1">Post 1</a>
      <a href="/post2">Post 2</a>
    </aside>

    <article>
      <h1>Understanding JavaScript Closures</h1>
      <p>A closure is the combination of a function bundled together with references to its surrounding state.</p>
      <p>Closures are created every time a function is created, at function creation time.</p>
      <h2>Example</h2>
      <p>Here's a practical example of how closures work in JavaScript.</p>
    </article>

    <footer>
      <p>&copy; 2025 My Blog. All rights reserved.</p>
    </footer>
  </body>
`;

const result = main(html, { strategy: 'article' });
console.log(result);
```

**Output** (only the article content):
```markdown
# Understanding JavaScript Closures

A closure is the combination of a function bundled together with references to its surrounding state.

Closures are created every time a function is created, at function creation time.

## Example

Here's a practical example of how closures work in JavaScript.

```

### 5. Process HTML File

```javascript
import { readFileSync } from 'fs';
import { main } from './src/main.js';

// Read HTML from file
const html = readFileSync('./input.html', 'utf-8');

// Convert to Markdown
const markdown = main(html);

// Save result
import { writeFileSync } from 'fs';
writeFileSync('./output.md', markdown, 'utf-8');

console.log('Conversion complete!');
```

## Common Patterns

### Pattern 1: Batch Convert Multiple Files

```javascript
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { main } from './src/main.js';

const inputDir = './html-files';
const outputDir = './markdown-files';

const files = readdirSync(inputDir).filter(f => f.endsWith('.html'));

for (const file of files) {
  const html = readFileSync(`${inputDir}/${file}`, 'utf-8');
  const markdown = main(html);
  const outFile = file.replace('.html', '.md');
  writeFileSync(`${outputDir}/${outFile}`, markdown, 'utf-8');
  console.log(`Converted: ${file} -> ${outFile}`);
}
```

### Pattern 2: Extract Structured Data to JSON

```javascript
const html = `
  <ul id="products">
    <li>Product A - $19.99</li>
    <li>Product B - $29.99</li>
    <li>Product C - $39.99</li>
  </ul>
`;

const json = main(html, {
  strategy: 'list',
  outputFormat: 'json'
});

const tree = JSON.parse(json);

// Process the structured data
function extractItems(node) {
  if (node.type === 'element' && node.tag === 'li') {
    return node.children
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('');
  }
  if (node.type === 'element' && node.children) {
    return node.children.flatMap(extractItems);
  }
  return [];
}

const items = extractItems(tree);
console.log(items);
// ['Product A - $19.99', 'Product B - $29.99', 'Product C - $39.99']
```

### Pattern 3: Clean Web Page for Documentation

```javascript
import fetch from 'https'; // Node.js built-in
import { main } from './src/main.js';

// Fetch HTML from URL (implementation details omitted for brevity)
const html = await fetchHtml('https://example.com/article');

// Convert to clean Markdown
const markdown = main(html, { strategy: 'article' });

// Save to docs
writeFileSync('./docs/article.md', markdown, 'utf-8');
```

## Options Reference

### `outputFormat`

**Type**: `string`
**Default**: `'markdown'`
**Values**: `'markdown'` | `'json'`

Controls the output format.

```javascript
// Markdown (default)
main(html);
main(html, { outputFormat: 'markdown' });

// JSON
main(html, { outputFormat: 'json' });
```

### `strategy`

**Type**: `string | undefined`
**Default**: `undefined`
**Values**: `'list'` | `'article'` | `undefined`

Controls content extraction strategy.

```javascript
// No strategy (convert entire document)
main(html);

// Extract largest list
main(html, { strategy: 'list' });

// Extract main article content
main(html, { strategy: 'article' });
```

## Supported HTML Elements

### Block Elements

| HTML Tag | Markdown Output | Notes |
|----------|-----------------|-------|
| `<h1>`   | `# text`        | |
| `<h2>`   | `## text`       | |
| `<h3>`   | `### text`      | |
| `<h4>`   | `#### text`     | |
| `<h5>`   | `##### text`    | |
| `<h6>`   | `###### text`   | |
| `<p>`    | `text\n\n`      | Separated by blank lines |
| `<div>`  | `content`       | No special formatting |
| `<ul>`   | Unordered list  | Uses `-` marker |
| `<ol>`   | Ordered list    | Uses `1.` marker |
| `<li>`   | `- item` / `1. item` | Depends on parent |
| `<pre>`  | ` ```\ncode\n``` ` | Code block |
| `<br>`   | `\n`            | Line break |

### Inline Elements

| HTML Tag | Markdown Output | Notes |
|----------|-----------------|-------|
| `<strong>` | `**text**`    | Bold |
| `<b>`      | `**text**`    | Bold (same as strong) |
| `<em>`     | `*text*`      | Italic |
| `<i>`      | `*text*`      | Italic (same as em) |
| `<a>`      | `[text](url)` | Link |
| `<code>`   | `` `text` ``  | Inline code |

### Removed Elements

These elements and their content are completely removed during cleaning:

- `<script>...</script>` - JavaScript code
- `<style>...</style>` - CSS styles
- `<iframe>...</iframe>` - Embedded frames

### Preserved Metadata

These elements are extracted and preserved (exact placement depends on implementation):

- `<title>` - Page title
- `<meta name="description">` - Page description
- `<meta name="keywords">` - Page keywords

## Running Tests

```bash
# Run all tests
node tests/run-tests.js

# Run specific test file
node tests/parser.test.js
node tests/integration.test.js
```

**Test Output**:
```
✓ Parser: Simple paragraph
✓ Parser: Nested list
✓ Markdown Generator: Headings
✓ Integration: HTML to Markdown
...
All tests passed!
```

## Troubleshooting

### Issue: Output has extra whitespace

**Solution**: This is expected behavior. Block elements are separated by double newlines (`\n\n`) for proper Markdown rendering.

### Issue: HTML entities not decoded

**Solution**: Common entities like `&nbsp;`, `&lt;`, `&gt;` should be decoded automatically. If you encounter an unsupported entity, it will be preserved as-is.

### Issue: Malformed HTML produces unexpected output

**Solution**: The parser uses best-effort parsing. It will attempt to handle unclosed tags and invalid nesting, but the output may not be perfect for severely malformed HTML.

### Issue: Large HTML file causes slowness

**Solution**: For files larger than 10MB, consider:
- Processing in chunks
- Extracting only the relevant section first (using strategy)
- Optimizing the HTML before processing

## Performance Tips

1. **Use strategies for large documents**: If you only need a specific section, use `strategy: 'list'` or `strategy: 'article'` to reduce processing time.

2. **Pre-clean HTML if possible**: Remove unnecessary markup before passing to the converter.

3. **Process files in parallel**: Use Node.js worker threads or child processes for batch processing.

4. **Stream large files**: For very large files, consider processing in chunks (future enhancement).

## Next Steps

- **Read the full API contract**: See `contracts/main-api.md` for detailed behavior specifications
- **Explore the data model**: See `data-model.md` to understand the virtual DOM structure
- **Review research**: See `research.md` for implementation decisions and alternatives considered
- **Run the tests**: Check `tests/` directory for comprehensive test coverage examples

## Example: Complete Workflow

```javascript
import { readFileSync, writeFileSync } from 'fs';
import { main } from './src/main.js';

// 1. Read HTML from file
const html = readFileSync('./blog-post.html', 'utf-8');

// 2. Convert to Markdown with article extraction
const markdown = main(html, {
  outputFormat: 'markdown',
  strategy: 'article'
});

// 3. Save to file
writeFileSync('./blog-post.md', markdown, 'utf-8');

// 4. Also generate JSON for structured data
const json = main(html, {
  outputFormat: 'json',
  strategy: 'article'
});
writeFileSync('./blog-post.json', json, 'utf-8');

console.log('Conversion complete!');
console.log(`Markdown: ${markdown.length} bytes`);
console.log(`JSON: ${json.length} bytes`);
```

## Support

For questions, issues, or feature requests, please refer to:
- API Contract: `contracts/main-api.md`
- Data Model: `data-model.md`
- Research Document: `research.md`
- Test Examples: `tests/` directory
