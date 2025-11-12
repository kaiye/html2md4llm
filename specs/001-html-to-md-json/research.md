# Research: HTML to Markdown/JSON Converter

**Feature**: HTML to Markdown/JSON Converter
**Date**: 2025-11-12
**Purpose**: Research technical approaches for regex-based HTML parsing, virtual DOM construction, and output generation

## HTML Parsing Strategies (Without DOM API)

### Decision: Regex-Based Tag Extraction with State Machine

**Rationale**:
- Must avoid DOM APIs (JSDOM, Cheerio, browser DOMParser) per constitution
- HTML structure is regular enough for regex-based extraction when handling common cases
- State machine approach handles nested tags and maintains parent-child relationships
- Tolerant of malformed HTML (best-effort parsing)

**Approach**:

1. **Pre-cleaning Phase**: Use regex to remove unwanted tags before parsing
   - Remove `<script>...</script>` blocks (including content)
   - Remove `<style>...</style>` blocks (including content)
   - Remove `<iframe>...</iframe>` elements
   - Extract and preserve `<title>` and `<meta name="description|keywords">` from head
   - Strip inline `style=""` attributes but preserve element structure

2. **Parsing Phase**: Extract tags and build tree
   - Regex pattern to match opening tags: `/<(\w+)([^>]*)>/g`
   - Regex pattern to match closing tags: `/<\/(\w+)>/g`
   - Regex pattern to match self-closing tags: `/<(\w+)([^>]*?)\/>/g`
   - Track stack of open elements to build parent-child relationships
   - Handle text nodes between tags as children

3. **Edge Case Handling**:
   - Unclosed tags: Auto-close when encountering EOF or parent close
   - Invalid nesting (e.g., `<p><div></div></p>`): Allow and represent in tree
   - HTML entities (`&nbsp;`, `&lt;`, etc.): Decode using lookup map

**Alternatives Considered**:
- **Full HTML5 parser library**: Rejected due to zero-dependency constraint
- **XML parser (sax-like)**: Rejected as overly complex for this use case and may require dependencies
- **Character-by-character parsing**: Rejected as too slow and complex; regex sufficient for our needs

### HTML Entity Decoding

**Decision**: Use lookup map for common entities, fallback to numeric codes

**Implementation**:
```javascript
const htmlEntities = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  // Add more as needed
};

// Handle numeric entities: &#65; or &#x41;
function decodeEntity(entity) {
  if (entity.startsWith('&#x')) {
    return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
  } else if (entity.startsWith('&#')) {
    return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
  }
  return htmlEntities[entity] || entity;
}
```

## Virtual DOM Node Structure

### Decision: Simple Object-Based Node Representation

**Rationale**:
- No need for complex class hierarchy
- JSON-serializable by default (supports JSON output format)
- Easy to traverse and transform
- Minimal memory footprint

**Node Structure**:
```javascript
{
  type: 'element' | 'text',
  tag: 'div' | 'p' | 'h1' | etc.,  // only for type='element'
  attributes: { href: '...', ... }, // only for type='element'
  children: [ /* child nodes */ ],  // only for type='element'
  text: 'content',                  // only for type='text'
  parent: <reference>               // optional, for upward traversal
}
```

## Extraction Strategies

### List Strategy: Find Largest List

**Decision**: Recursive tree walk, count direct li children

**Algorithm**:
1. Traverse entire tree
2. For each `<ul>` or `<ol>` node, count direct children with tag='li'
3. Track node with maximum count
4. Return that node (or null if no lists found)

**Complexity**: O(n) where n = number of nodes

### Article Strategy: Filter Empty Siblings

**Decision**: Heuristic-based content detection

**Algorithm**:
1. Find all top-level `<div>` elements (direct children of body or root)
2. For each div, calculate "text density" = total text length / total HTML length
3. Filter out divs with text density below threshold (e.g., < 0.1)
4. Return div with highest text content length
5. Fallback: If no divs, return entire body

**Rationale**: Sidebars, navigation, ads typically have low text density (mostly links, images, structure)

## Markdown Generation Patterns

### Decision: Recursive Tree Walk with Context

**Approach**:
- Traverse virtual DOM depth-first
- Maintain context: indentation level, list type, parent tags
- Map HTML tags to Markdown syntax:
  - `<h1>` → `# `, `<h2>` → `## `, etc.
  - `<p>` → newline-separated paragraphs
  - `<strong>`, `<b>` → `**text**`
  - `<em>`, `<i>` → `*text*`
  - `<a href="url">` → `[text](url)`
  - `<ul><li>` → `- item` (with indentation)
  - `<ol><li>` → `1. item` (with indentation)
  - `<code>` → `` `code` ``
  - `<pre>` → ` ```\ncode\n``` `

**Line Breaking Rules**:
- Block elements (h1-h6, p, div, ul, ol, pre) get surrounding newlines
- Inline elements (strong, em, a, code) do not add newlines
- Nested lists increase indentation by 2 spaces

## JSON Generation

### Decision: Direct Serialization of Virtual DOM

**Rationale**:
- Virtual DOM is already JSON-compatible
- Can optionally filter out internal properties (e.g., parent references)
- Allows downstream tools to process structure programmatically

**Output Options**:
1. **Full tree**: Include all nodes and attributes
2. **Simplified**: Omit empty attributes, parent references
3. **Pretty-printed**: `JSON.stringify(tree, null, 2)`

## Testing Strategy

### Decision: Fixture-Based Testing with Expected Outputs

**Test Structure**:
```javascript
// tests/fixtures/test-cases.js
export const testCases = [
  {
    name: 'Simple paragraph',
    input: '<p>Hello world</p>',
    expectedMarkdown: 'Hello world\n\n',
    expectedTree: { type: 'element', tag: 'p', children: [...] }
  },
  {
    name: 'Nested list',
    input: '<ul><li>Item 1<ul><li>Nested</li></ul></li></ul>',
    expectedMarkdown: '- Item 1\n  - Nested\n\n',
    expectedTree: { ... }
  },
  // ... more cases
];
```

**Test Coverage Areas**:
1. **Parser Tests**: HTML → Virtual DOM tree accuracy
2. **Transformer Tests**: Strategy application (list, article filtering)
3. **Generator Tests**: Virtual DOM → Markdown/JSON correctness
4. **Integration Tests**: End-to-end HTML → Markdown/JSON with real samples
5. **Edge Cases**: Malformed HTML, empty input, large documents, deep nesting

**Real HTML Fixtures**:
- User will provide actual HTML samples and expected outputs
- Store in `tests/fixtures/*.html` with corresponding `.expected.md` or `.expected.json`
- Tests read fixtures, run converter, compare output

## Performance Considerations

### Decision: Optimize for Readability First, Then Performance

**Approach**:
1. Initial implementation: Focus on correctness and code clarity
2. Profile with realistic HTML samples (1MB test cases)
3. Optimize hot paths only if needed:
   - Regex compilation (compile once, reuse)
   - String concatenation (use array join for large outputs)
   - Tree traversal (iterative vs recursive for deep nesting)

**Expected Performance**:
- Simple HTML (< 10KB): < 10ms
- Typical web page (100KB - 1MB): < 500ms
- Large document (5MB+): < 2 seconds

**Memory Management**:
- Virtual DOM tree is O(n) space where n = number of HTML nodes
- For very large documents, consider streaming or chunking (future enhancement)

## Open Questions Requiring User Input

### 1. Test Fixture Format

**Question**: How would you like to provide the test HTML samples and expected outputs?

**Options**:
- **A**: Separate files: `input.html` + `expected.md` + `expected.json`
- **B**: JSON file with test cases: `{ name, input, expectedMd, expectedJson }`
- **C**: JavaScript module exporting test case objects

**Recommendation**: Option A for readability, or Option B for easy batch addition

### 2. HTML Entity Handling Completeness

**Question**: Should we support all HTML5 entities (2000+) or just common ones (~50)?

**Options**:
- **A**: Common entities only (faster, smaller code)
- **B**: Complete HTML5 entity list (comprehensive but adds ~100KB data)
- **C**: Common entities + numeric codes (&#65;, &#x41;)

**Recommendation**: Option C - covers 99% of real-world cases

### 3. Markdown Flavor

**Question**: Which Markdown syntax should we use for edge cases?

**Options**:
- **A**: GitHub Flavored Markdown (GFM) - most popular
- **B**: CommonMark - strict standard
- **C**: Basic Markdown - maximum compatibility

**Example difference**: Code blocks with language
- GFM: ` ```javascript\ncode\n``` `
- Basic: ` ```\ncode\n``` `

**Recommendation**: Option A (GFM) for modern tooling compatibility

## Summary

All technical approaches are feasible within constitutional constraints:
- ✅ Zero dependencies (regex + built-in modules)
- ✅ No DOM API (custom regex parser)
- ✅ Pure JavaScript (no browser features)
- ✅ Testable (fixture-based approach)

**Next Steps**:
1. Resolve open questions (test format, entity handling, markdown flavor)
2. Create data model document with final virtual DOM structure
3. Define API contracts for main function
4. Begin implementation with parser module
