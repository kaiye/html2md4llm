# API Contract: Main Function

**Feature**: HTML to Markdown/JSON Converter
**Date**: 2025-11-12
**Purpose**: Define the public API for the main conversion function

## Function Signature

```javascript
function main(htmlInput, options = {})
```

### Parameters

#### 1. htmlInput (required)

**Type**: `string`

**Description**: The HTML content to be converted. Can be a complete HTML document or an HTML fragment.

**Examples**:
```javascript
// Complete document
const html1 = `<!DOCTYPE html><html><body><p>Hello</p></body></html>`;

// Fragment
const html2 = `<div><h1>Title</h1><p>Content</p></div>`;

// Simple element
const html3 = `<p>Just a paragraph</p>`;
```

**Constraints**:
- Must be a string (not Buffer or Stream)
- Empty string is valid input (returns empty output)
- Very large strings (>100MB) may cause performance issues

**Error Conditions**:
- `TypeError` if not a string
- No error for malformed HTML (best-effort parsing)

#### 2. options (optional)

**Type**: `object`

**Description**: Configuration object controlling output format and extraction strategy

**Default**: `{ outputFormat: 'markdown' }`

**Properties**:

| Property     | Type   | Required | Default    | Values                          |
|--------------|--------|----------|------------|---------------------------------|
| outputFormat | string | No       | 'markdown' | 'markdown' \| 'json'            |
| strategy     | string | No       | undefined  | 'list' \| 'article' \| undefined|

**Examples**:
```javascript
// Default (Markdown output, no strategy)
main(html);

// Explicitly specify Markdown
main(html, { outputFormat: 'markdown' });

// JSON output
main(html, { outputFormat: 'json' });

// List extraction to Markdown
main(html, { outputFormat: 'markdown', strategy: 'list' });

// Article extraction to JSON
main(html, { outputFormat: 'json', strategy: 'article' });
```

**Error Conditions**:
- `Error` if `outputFormat` is not 'markdown' or 'json'
- `Error` if `strategy` is not 'list', 'article', null, or undefined
- Other unknown properties are ignored (forward compatibility)

### Return Value

**Type**: `string`

**Description**: The converted output in the specified format

#### Markdown Output

**Format**: Plain text string with Markdown syntax

**Characteristics**:
- Block elements separated by double newlines `\n\n`
- Inline formatting: `**bold**`, `*italic*`, `` `code` ``, `[link](url)`
- Lists use `-` for unordered, `1.` for ordered
- Headings use `#` syntax (`#`, `##`, `###`, etc.)
- Code blocks use triple backticks ` ``` `

**Example**:
```javascript
const html = '<h1>Title</h1><p>Text with <strong>bold</strong>.</p>';
const result = main(html);
// Returns:
// "# Title\n\nText with **bold**.\n\n"
```

#### JSON Output

**Format**: JSON string (serialized object)

**Structure**: Represents the virtual DOM tree structure

**Example**:
```javascript
const html = '<p>Hello</p>';
const result = main(html, { outputFormat: 'json' });
// Returns:
// '{"type":"element","tag":"p","attributes":{},"children":[{"type":"text","text":"Hello"}]}'
```

**Characteristics**:
- Valid JSON (parseable with `JSON.parse()`)
- Pretty-printed with 2-space indentation
- No circular references (parent pointers omitted)
- All nodes follow the Virtual DOM Node structure (see data-model.md)

## Behavior Specifications

### 1. HTML Cleaning

**Process**:
1. Remove `<script>...</script>` blocks (including content)
2. Remove `<style>...</style>` blocks (including content)
3. Remove `<iframe>...</iframe>` elements (including content)
4. Extract and preserve `<title>` from `<head>`
5. Extract and preserve `<meta name="description">` content
6. Extract and preserve `<meta name="keywords">` content
7. Strip `style=""` attributes from all elements

**Examples**:

```javascript
// Script removal
const input1 = '<div>Text</div><script>alert("x")</script><p>More</p>';
const output1 = main(input1);
// Output contains "Text" and "More", but no script content

// Metadata preservation
const input2 = '<html><head><title>My Page</title></head><body><p>Content</p></body></html>';
const output2 = main(input2);
// Output includes "My Page" (exact position depends on implementation)

// Style attribute stripping
const input3 = '<p style="color: red;">Text</p>';
const output3 = main(input3);
// Output: "Text\n\n" (style attribute removed, content preserved)
```

### 2. List Strategy

**Trigger**: `options.strategy === 'list'`

**Behavior**:
1. Parse entire HTML into virtual DOM tree
2. Find all `<ul>` and `<ol>` elements
3. Count direct `<li>` children for each list
4. Select the list with the most `<li>` children
5. Generate output from that list node only (ignoring rest of document)

**Examples**:

```javascript
const html = `
  <div>
    <ul><li>A</li><li>B</li></ul>
    <p>Some text</p>
    <ul>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
      <li>Item 4</li>
    </ul>
  </div>
`;

const result = main(html, { strategy: 'list' });
// Returns: "- Item 1\n- Item 2\n- Item 3\n- Item 4\n\n"
// (The second list is selected because it has 4 items vs 2)
```

**Edge Cases**:
- No lists found: Return empty string or minimal output
- Multiple lists with same count: Return the first one encountered (deterministic)
- Nested lists: Count only direct `<li>` children of each list element

### 3. Article Strategy

**Trigger**: `options.strategy === 'article'`

**Behavior**:
1. Parse entire HTML into virtual DOM tree
2. Find all top-level `<div>` elements (direct children of `<body>` or root)
3. Calculate text density for each div: `totalTextLength / totalHTMLLength`
4. Filter out divs with text density below threshold (e.g., < 0.05)
5. Among remaining divs, select the one with the highest total text length
6. Generate output from that div node only

**Examples**:

```javascript
const html = `
  <body>
    <div id="nav"><a href="#">Link1</a><a href="#">Link2</a></div>
    <div id="main">
      <h1>Article Title</h1>
      <p>This is the main article content with lots of text.</p>
      <p>More paragraphs of actual content here.</p>
    </div>
    <div id="sidebar"><a href="#">Ad</a></div>
  </body>
`;

const result = main(html, { strategy: 'article' });
// Returns the content of #main div only:
// "# Article Title\n\nThis is the main article content with lots of text.\n\nMore paragraphs of actual content here.\n\n"
```

**Edge Cases**:
- No divs found: Return entire body content
- All divs have low text density: Return the one with highest density anyway
- Single div: Return that div's content

### 4. Default Behavior (No Strategy)

**Trigger**: `options.strategy` is undefined, null, or omitted

**Behavior**:
1. Parse entire HTML into virtual DOM tree
2. Generate output from the entire tree
3. No filtering or extraction applied

**Example**:

```javascript
const html = `<html><body><h1>Title</h1><p>Content</p></body></html>`;
const result = main(html);
// Returns: "# Title\n\nContent\n\n"
// (Entire document converted)
```

## Error Handling

### Input Validation Errors

**Error**: `TypeError: htmlInput must be a string`

**When**: First parameter is not a string

**Example**:
```javascript
main(123); // Throws TypeError
main(null); // Throws TypeError
main(Buffer.from('html')); // Throws TypeError
```

**Error**: `Error: options.outputFormat must be 'markdown' or 'json'`

**When**: Invalid outputFormat value

**Example**:
```javascript
main(html, { outputFormat: 'xml' }); // Throws Error
```

**Error**: `Error: options.strategy must be 'list', 'article', or undefined`

**When**: Invalid strategy value

**Example**:
```javascript
main(html, { strategy: 'paragraph' }); // Throws Error
```

### Parsing Errors

**Behavior**: No errors thrown for malformed HTML

**Rationale**: Best-effort parsing approach, as specified in constitution

**Examples**:
```javascript
// Unclosed tags
main('<p>Text'); // Returns: "Text\n\n" (auto-closed)

// Invalid nesting
main('<p><div>Text</div></p>'); // Parses and outputs (structure preserved in tree)

// Empty input
main(''); // Returns: "" (empty string)

// Only whitespace
main('   \n  '); // Returns: "" or minimal whitespace (implementation choice)
```

### Runtime Errors

**Error**: `Error: Stack overflow - HTML nesting too deep`

**When**: HTML structure exceeds maximum nesting depth (e.g., 100 levels)

**Mitigation**: Set reasonable depth limit to prevent stack overflow

**Example**:
```javascript
// Extremely nested HTML (100+ levels)
const deepHtml = '<div>'.repeat(200) + 'Text' + '</div>'.repeat(200);
main(deepHtml); // May throw Error after depth limit
```

## Performance Characteristics

### Time Complexity

- **Parsing**: O(n) where n = HTML length
- **Tree traversal**: O(m) where m = number of nodes
- **Markdown generation**: O(m) where m = number of nodes
- **List strategy**: O(m) to find all lists
- **Article strategy**: O(m) to analyze divs

**Overall**: O(n + m) ≈ O(n) for typical HTML

### Space Complexity

- **Virtual DOM tree**: O(m) where m = number of nodes
- **Output string**: O(k) where k = output length
- **Temporary buffers**: O(1) constant space

**Overall**: O(n) for tree storage

### Performance Targets

| Input Size | Expected Time | Notes                              |
|------------|---------------|------------------------------------|
| < 10 KB    | < 10ms        | Simple pages, fragments            |
| 10-100 KB  | < 50ms        | Typical web pages                  |
| 100KB-1MB  | < 500ms       | Large articles, documentation      |
| 1-10 MB    | < 2s          | Very large documents (edge case)   |

## Examples

### Example 1: Simple Conversion

```javascript
const html = `
  <h1>My Blog Post</h1>
  <p>This is an <em>introduction</em> with a <a href="https://example.com">link</a>.</p>
  <ul>
    <li>First point</li>
    <li>Second point</li>
  </ul>
`;

const markdown = main(html);
console.log(markdown);
```

**Output**:
```markdown
# My Blog Post

This is an *introduction* with a [link](https://example.com).

- First point
- Second point

```

### Example 2: JSON Output

```javascript
const html = '<p>Hello <strong>world</strong>!</p>';
const json = main(html, { outputFormat: 'json' });
console.log(JSON.parse(json));
```

**Output**:
```json
{
  "type": "element",
  "tag": "p",
  "attributes": {},
  "children": [
    {
      "type": "text",
      "text": "Hello "
    },
    {
      "type": "element",
      "tag": "strong",
      "attributes": {},
      "children": [
        {
          "type": "text",
          "text": "world"
        }
      ]
    },
    {
      "type": "text",
      "text": "!"
    }
  ]
}
```

### Example 3: List Extraction

```javascript
const html = `
  <html>
    <body>
      <nav>
        <ul><li><a href="#1">Nav 1</a></li></ul>
      </nav>
      <main>
        <h1>Products</h1>
        <ul>
          <li>Product A</li>
          <li>Product B</li>
          <li>Product C</li>
          <li>Product D</li>
          <li>Product E</li>
        </ul>
      </main>
    </body>
  </html>
`;

const result = main(html, { strategy: 'list' });
console.log(result);
```

**Output**:
```markdown
- Product A
- Product B
- Product C
- Product D
- Product E

```

### Example 4: Article Extraction

```javascript
const html = `
  <body>
    <header>
      <nav><a href="/">Home</a> | <a href="/about">About</a></nav>
    </header>
    <aside>
      <h3>Ads</h3>
      <a href="/ad1">Ad 1</a>
      <a href="/ad2">Ad 2</a>
    </aside>
    <article>
      <h1>Understanding JavaScript</h1>
      <p>JavaScript is a programming language that enables interactive web pages.</p>
      <p>It is one of the core technologies of the World Wide Web.</p>
      <h2>Key Features</h2>
      <p>JavaScript supports object-oriented, imperative, and functional programming styles.</p>
    </article>
    <footer>
      <p>&copy; 2025 Example Corp</p>
    </footer>
  </body>
`;

const result = main(html, { strategy: 'article' });
console.log(result);
```

**Output**:
```markdown
# Understanding JavaScript

JavaScript is a programming language that enables interactive web pages.

It is one of the core technologies of the World Wide Web.

## Key Features

JavaScript supports object-oriented, imperative, and functional programming styles.

```

## Testing Contract

Each of these behaviors MUST be verified by tests:

1. **Input validation tests**: Verify all TypeError and Error cases
2. **HTML cleaning tests**: Verify script/style/iframe removal, metadata preservation
3. **Parsing tests**: Verify tree structure for various HTML inputs
4. **Markdown generation tests**: Verify correct syntax for all supported tags
5. **JSON generation tests**: Verify valid JSON output and structure
6. **List strategy tests**: Verify correct list selection logic
7. **Article strategy tests**: Verify correct content extraction
8. **Edge case tests**: Malformed HTML, empty input, deep nesting, large documents
9. **Performance tests**: Verify time/space complexity on sample data
10. **Integration tests**: End-to-end with real HTML fixtures

## Versioning and Compatibility

**Current Version**: 1.0.0

**Semantic Versioning**:
- MAJOR: Breaking changes to function signature or output format
- MINOR: New options or features (backward compatible)
- PATCH: Bug fixes, performance improvements

**Backward Compatibility Promise**:
- Function signature will not change in minor/patch versions
- New options will be optional (default to current behavior)
- Output format may be refined but semantically equivalent
