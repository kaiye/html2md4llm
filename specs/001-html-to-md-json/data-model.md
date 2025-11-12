# Data Model: HTML to Markdown/JSON Converter

**Feature**: HTML to Markdown/JSON Converter
**Date**: 2025-11-12
**Purpose**: Define internal data structures for virtual DOM representation

## Overview

The converter uses a virtual DOM tree to represent parsed HTML. This intermediate representation enables:
1. Format-agnostic processing (parse once, generate to multiple formats)
2. Tree transformations (filtering, extraction strategies)
3. JSON serialization for structured output

## Core Entities

### 1. Virtual DOM Node

**Purpose**: Represent a single HTML element or text content in the parse tree

**Structure**:

```javascript
// Element Node
{
  type: 'element',
  tag: string,              // 'div', 'p', 'h1', 'ul', 'li', etc.
  attributes: object,       // { href: 'url', class: 'foo', ... }
  children: Node[],         // Array of child nodes
  parent: Node | null       // Reference to parent (optional, for upward traversal)
}

// Text Node
{
  type: 'text',
  text: string,             // Raw text content (entities decoded)
  parent: Node | null       // Reference to parent
}
```

**Properties**:

| Property   | Type          | Required | Description                                           |
|------------|---------------|----------|-------------------------------------------------------|
| type       | string        | Yes      | Node type: 'element' or 'text'                        |
| tag        | string        | If element| HTML tag name (lowercase)                            |
| attributes | object        | If element| Key-value pairs of HTML attributes                   |
| children   | Node[]        | If element| Child nodes (empty array if no children)             |
| text       | string        | If text   | Text content with HTML entities decoded              |
| parent     | Node \| null  | No       | Parent node reference (null for root)                |

**Validation Rules**:
- `type` must be either 'element' or 'text'
- Element nodes MUST have `tag`, `attributes`, and `children`
- Text nodes MUST have `text` property
- `tag` should be lowercase for consistency
- `children` array may be empty but not null
- `attributes` may be empty object `{}` but not null

**Example - Simple Paragraph**:
```javascript
{
  type: 'element',
  tag: 'p',
  attributes: {},
  children: [
    {
      type: 'text',
      text: 'Hello world',
      parent: <ref to p node>
    }
  ],
  parent: null
}
```

**Example - Link with Attributes**:
```javascript
{
  type: 'element',
  tag: 'a',
  attributes: {
    href: 'https://example.com',
    title: 'Example'
  },
  children: [
    {
      type: 'text',
      text: 'Click here',
      parent: <ref to a node>
    }
  ],
  parent: <ref to parent node>
}
```

**Example - Nested List**:
```javascript
{
  type: 'element',
  tag: 'ul',
  attributes: {},
  children: [
    {
      type: 'element',
      tag: 'li',
      attributes: {},
      children: [
        { type: 'text', text: 'Item 1' },
        {
          type: 'element',
          tag: 'ul',
          attributes: {},
          children: [
            {
              type: 'element',
              tag: 'li',
              attributes: {},
              children: [
                { type: 'text', text: 'Nested item' }
              ]
            }
          ]
        }
      ]
    }
  ],
  parent: null
}
```

### 2. Options Configuration

**Purpose**: Control converter behavior and output format

**Structure**:

```javascript
{
  outputFormat: 'markdown' | 'json',  // Default: 'markdown'
  strategy: 'list' | 'article' | undefined,  // Optional extraction strategy
  // Future extensions:
  // preserveAttributes: string[],    // Attributes to keep (e.g., ['id', 'class'])
  // markdownFlavor: 'gfm' | 'commonmark',
  // includeMetadata: boolean
}
```

**Properties**:

| Property     | Type   | Required | Default    | Description                                     |
|--------------|--------|----------|------------|-------------------------------------------------|
| outputFormat | string | No       | 'markdown' | Output format: 'markdown' or 'json'             |
| strategy     | string | No       | undefined  | Extraction: 'list', 'article', or none          |

**Validation Rules**:
- `outputFormat` must be 'markdown' or 'json'
- `strategy` must be 'list', 'article', or undefined/null
- Invalid options should throw descriptive error

**Example - Default Options**:
```javascript
{
  outputFormat: 'markdown'
}
```

**Example - List Extraction to JSON**:
```javascript
{
  outputFormat: 'json',
  strategy: 'list'
}
```

### 3. Metadata Object

**Purpose**: Store preserved HTML head metadata (title, meta tags)

**Structure**:

```javascript
{
  title: string | null,
  description: string | null,
  keywords: string[] | null
}
```

**Properties**:

| Property    | Type           | Description                                      |
|-------------|----------------|--------------------------------------------------|
| title       | string \| null | Content of `<title>` tag                         |
| description | string \| null | Content of `<meta name="description">`           |
| keywords    | string[] \| null | Content of `<meta name="keywords">` split by comma |

**Example**:
```javascript
{
  title: 'My Blog Post',
  description: 'An article about HTML parsing',
  keywords: ['html', 'parsing', 'javascript']
}
```

**Usage**: Metadata is extracted during parsing and can be:
- Prepended to Markdown output (e.g., as YAML frontmatter)
- Included in JSON output as top-level property
- Omitted if no metadata found (all fields null)

## State Transitions

### Parser State Machine

**States**:
1. **INIT**: Starting state, no content processed
2. **READING_TAG**: Inside `<tag>`, reading tag name and attributes
3. **READING_TEXT**: Between tags, accumulating text content
4. **CLOSING_TAG**: Processing `</tag>`

**Transitions**:
- INIT → READING_TAG: Encounter `<`
- READING_TAG → READING_TEXT: Encounter `>`
- READING_TEXT → READING_TAG: Encounter `<`
- READING_TAG → CLOSING_TAG: Encounter `</`
- CLOSING_TAG → READING_TEXT: Encounter `>`

**Stack Management**:
- Opening tag: Push node to stack
- Closing tag: Pop from stack, add as child to new top
- Self-closing tag: Create node, add to current top, don't push

## Relationships

### Parent-Child Relationships

**Rule**: Children know their parent, parent knows all children

**Traversal Patterns**:

1. **Depth-First (Pre-Order)**:
   ```javascript
   function traverse(node, callback) {
     callback(node);
     if (node.type === 'element') {
       node.children.forEach(child => traverse(child, callback));
     }
   }
   ```

2. **Find All Nodes by Tag**:
   ```javascript
   function findByTag(root, tagName) {
     const results = [];
     traverse(root, node => {
       if (node.type === 'element' && node.tag === tagName) {
         results.push(node);
       }
     });
     return results;
   }
   ```

3. **Calculate Text Content**:
   ```javascript
   function getTextContent(node) {
     if (node.type === 'text') return node.text;
     if (node.type === 'element') {
       return node.children.map(getTextContent).join('');
     }
     return '';
   }
   ```

## Constraints and Invariants

### Tree Constraints

1. **Root is Element**: Top-level node must be type='element' (typically `<html>` or synthetic root)
2. **Text Nodes are Leaves**: Text nodes never have children
3. **No Empty Text**: Text nodes with empty string should be omitted
4. **Parent Consistency**: If A.parent = B, then B.children includes A
5. **Single Root**: The tree has exactly one root node

### Attribute Constraints

1. **Lowercase Keys**: Attribute keys should be lowercase for consistency
2. **String Values**: All attribute values are strings (even for numbers like `width="100"`)
3. **No Special Attributes**: Attributes like `style`, `onclick` are preserved in tree but may be filtered during generation

### Tag Name Constraints

1. **Lowercase**: All tag names stored in lowercase
2. **Valid HTML Tags**: While any string is accepted, output generators should handle standard HTML5 tags
3. **Self-Closing Tags**: Tags like `<br>`, `<img>`, `<hr>` are represented as element nodes with empty children array

## Example: Complete Document Tree

**Input HTML**:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Test Page</title>
  <meta name="description" content="A test page">
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a <strong>test</strong>.</p>
</body>
</html>
```

**Virtual DOM Tree**:
```javascript
{
  type: 'element',
  tag: 'html',
  attributes: {},
  children: [
    {
      type: 'element',
      tag: 'head',
      attributes: {},
      children: [
        {
          type: 'element',
          tag: 'title',
          attributes: {},
          children: [
            { type: 'text', text: 'Test Page' }
          ]
        },
        {
          type: 'element',
          tag: 'meta',
          attributes: { name: 'description', content: 'A test page' },
          children: []
        }
      ]
    },
    {
      type: 'element',
      tag: 'body',
      attributes: {},
      children: [
        {
          type: 'element',
          tag: 'h1',
          attributes: {},
          children: [
            { type: 'text', text: 'Welcome' }
          ]
        },
        {
          type: 'element',
          tag: 'p',
          attributes: {},
          children: [
            { type: 'text', text: 'This is a ' },
            {
              type: 'element',
              tag: 'strong',
              attributes: {},
              children: [
                { type: 'text', text: 'test' }
              ]
            },
            { type: 'text', text: '.' }
          ]
        }
      ]
    }
  ],
  parent: null
}
```

**Extracted Metadata**:
```javascript
{
  title: 'Test Page',
  description: 'A test page',
  keywords: null
}
```

## Implementation Notes

### Memory Management

- **Circular References**: The `parent` property creates circular references. When serializing to JSON, omit parent references or use a custom serializer.
- **Large Documents**: For very large HTML (10MB+), consider:
  - Streaming parser (process chunks)
  - Limit tree depth to prevent stack overflow
  - Garbage collect unused node references

### Type Safety

While using plain JavaScript objects, maintain type consistency:
```javascript
// Helper to create element node
function createElement(tag, attributes = {}, children = []) {
  return { type: 'element', tag, attributes, children, parent: null };
}

// Helper to create text node
function createText(text) {
  return { type: 'text', text, parent: null };
}
```

### Future Extensions

The data model can be extended without breaking changes:
- Add `meta` property to nodes for source location tracking
- Add `processed` flag to track transformation state
- Add `depth` property for quick nesting level checks
