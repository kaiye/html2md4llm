# Feature Specification: HTML to Markdown/JSON Converter

**Feature Branch**: `001-html-to-md-json`
**Created**: 2025-11-12
**Status**: Draft
**Input**: User description: "实现一个 main.js 里面有一个 main function，该方法接受两个参数，第一个参数是 html-like 文本，第二个参数是 options 配置，配置中有一个 outputFormat 默认值为 markdown。要实现的功能是把传入的 html 文本转换成 markdown 格式的文本。实现的思路大致如下：1. 使用正则过滤掉 html 中无关的标签，例如 script style iframe 等，需要注意的是 head 中的 title 和 meta description 与 keywords 内容我希望保留，其他的可以去除；2. 得到精简后的 html 后，我们采用 AST 的思路，遵守 parse, transform, generate 三步骤，因为我们可能需要基于这个虚拟的 dom 同时支持生成 markdown 和 json 的格式，同时有了虚拟 dom tree 我们可以对无效的 node property 进行过滤；3.该方法的 options 配置，还需要支持一种智能策略，将文章输出成 list 或者 article，例如 list 的思路是，找到 dom tree 中子节点最多的 ul 或者 ol，只输出这个节点及其子节点的内容，article 则是找到能剔除掉无关兄弟节点的，文章主体的 div 及其子节点，策略可能是过滤掉没有文本节点的兄弟节点字符串，这个我们可以后续细化"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic HTML to Markdown Conversion (Priority: P1)

A developer wants to convert a simple HTML document into clean Markdown format for documentation purposes. They call the main function with HTML text and receive formatted Markdown output.

**Why this priority**: This is the core functionality and the primary use case. Without this, no other features can be built. It establishes the fundamental conversion capability.

**Independent Test**: Can be fully tested by providing sample HTML strings (e.g., with headings, paragraphs, links, bold/italic text) and verifying the Markdown output matches expected formatting.

**Acceptance Scenarios**:

1. **Given** a simple HTML string with headings and paragraphs, **When** the main function is called with default options, **Then** it returns properly formatted Markdown text
2. **Given** HTML containing bold, italic, and link tags, **When** the function is called, **Then** the output uses correct Markdown syntax (`**bold**`, `*italic*`, `[text](url)`)
3. **Given** HTML with nested lists (ul/ol with li items), **When** converted, **Then** Markdown output uses proper list indentation and markers
4. **Given** HTML with code blocks and inline code, **When** converted, **Then** Markdown preserves code formatting with backticks

---

### User Story 2 - HTML Cleaning and Metadata Extraction (Priority: P2)

A developer processes web pages that contain scripts, styles, and other non-content elements. They need the converter to automatically filter out irrelevant tags while preserving important metadata like title, description, and keywords from the HTML head section.

**Why this priority**: Real-world HTML is messy and contains many elements that shouldn't appear in the final output. This makes the tool practical for actual web content extraction.

**Independent Test**: Can be tested by providing HTML with script tags, style blocks, iframes, and head metadata, then verifying that script/style/iframe content is removed while title and meta tags are preserved in the output.

**Acceptance Scenarios**:

1. **Given** HTML containing `<script>` tags, **When** the function is called, **Then** all script content is removed from the output
2. **Given** HTML with `<style>` blocks and `<iframe>` elements, **When** converted, **Then** these elements and their content are filtered out
3. **Given** HTML with `<head>` section containing `<title>` and meta tags (description, keywords), **When** converted, **Then** these metadata elements are preserved in the output
4. **Given** HTML with inline style attributes, **When** cleaned, **Then** style attributes are removed but element content is preserved

---

### User Story 3 - Intelligent Content Extraction (List Mode) (Priority: P3)

A developer wants to extract just the main list content from a web page (e.g., a list of articles, products, or links). They set an extraction strategy option to "list" and the converter finds and returns only the largest ul/ol element and its children.

**Why this priority**: Enables targeted extraction of structured list data, useful for scraping index pages, navigation menus, or catalog listings without surrounding noise.

**Independent Test**: Can be tested by providing HTML with multiple ul/ol elements of varying sizes, setting strategy to "list", and verifying only the ul/ol with the most child nodes is returned in the output.

**Acceptance Scenarios**:

1. **Given** HTML with multiple `<ul>` elements of different sizes, **When** strategy is set to "list", **Then** only the ul with the most li children is included in the output
2. **Given** HTML with both `<ul>` and `<ol>` elements, **When** strategy is "list", **Then** the largest list (ul or ol) by child count is selected regardless of type
3. **Given** HTML where the largest list is deeply nested, **When** strategy is "list", **Then** the function finds and extracts it along with all its descendants

---

### User Story 4 - Intelligent Content Extraction (Article Mode) (Priority: P3)

A developer needs to extract the main article content from a blog post or news page, filtering out sidebars, navigation, ads, and other non-article elements. They set the extraction strategy to "article" and the converter identifies and returns only the main content container.

**Why this priority**: Addresses a common use case of extracting clean article text from complex web pages with multiple sidebars and navigation elements.

**Independent Test**: Can be tested by providing HTML with a main content div surrounded by sibling divs containing minimal or no text (navigation, ads, etc.), setting strategy to "article", and verifying only the main content div and its descendants are returned.

**Acceptance Scenarios**:

1. **Given** HTML with multiple sibling div elements, **When** strategy is "article", **Then** divs containing no text nodes are filtered out
2. **Given** HTML with a main article div and sidebar divs, **When** strategy is "article", **Then** only the div with substantial text content is included in the output
3. **Given** HTML where the article content is in a specific semantic container, **When** strategy is "article", **Then** surrounding navigation and footer elements are excluded

---

### User Story 5 - JSON Output Format (Priority: P4)

A developer needs structured data representation instead of Markdown text. They set the outputFormat option to "json" and receive a JSON representation of the document structure that can be further processed programmatically.

**Why this priority**: Extends the tool's utility for programmatic processing and data extraction scenarios where structured data is preferable to formatted text.

**Independent Test**: Can be tested by providing HTML, setting outputFormat to "json", and verifying the output is valid JSON representing the document tree structure with nodes, properties, and relationships.

**Acceptance Scenarios**:

1. **Given** HTML input, **When** outputFormat is set to "json", **Then** the output is valid JSON (parseable)
2. **Given** HTML with nested elements, **When** converted to JSON, **Then** the hierarchical structure is preserved as nested objects/arrays
3. **Given** HTML elements with attributes, **When** converted to JSON, **Then** relevant attributes are included in the JSON representation
4. **Given** both Markdown and JSON output for the same input, **When** compared, **Then** both represent the same semantic content

---

### Edge Cases

- What happens when HTML is malformed (unclosed tags, invalid nesting)?
- How does the system handle empty HTML input or HTML with only whitespace?
- What happens if the HTML contains no valid content after cleaning (only scripts/styles)?
- How are special characters and HTML entities (e.g., `&nbsp;`, `&lt;`, `&gt;`) handled in the output?
- What happens when strategy is "list" but no ul/ol elements exist?
- What happens when strategy is "article" but all divs have no text content?
- How are deeply nested structures (e.g., 20+ levels) handled without stack overflow?
- What if HTML contains extremely large documents (e.g., 10MB+ of text)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a main function that accepts two parameters: an HTML-like text string and an options object
- **FR-002**: System MUST support an options parameter with an `outputFormat` field that defaults to "markdown"
- **FR-003**: System MUST convert HTML text to Markdown format when outputFormat is "markdown" (default)
- **FR-004**: System MUST remove script, style, and iframe tags and their content during HTML cleaning
- **FR-005**: System MUST preserve title and meta tags (description, keywords) from the HTML head section
- **FR-006**: System MUST parse cleaned HTML into a virtual DOM tree structure (AST)
- **FR-007**: System MUST transform the virtual DOM tree to filter out invalid or unwanted node properties
- **FR-008**: System MUST generate output from the transformed tree in the specified format (markdown or json)
- **FR-009**: System MUST support an options parameter with a `strategy` field that can be set to "list", "article", or undefined/default
- **FR-010**: When strategy is "list", system MUST identify the ul or ol element with the most child li elements and output only that subtree
- **FR-011**: When strategy is "article", system MUST identify the main content container by filtering out sibling nodes with no text content
- **FR-012**: System MUST support JSON output format when outputFormat is "json"
- **FR-013**: System MUST handle common HTML elements: headings (h1-h6), paragraphs (p), links (a), bold (strong/b), italic (em/i), lists (ul/ol/li), code (code/pre)
- **FR-014**: System MUST use only Node.js built-in modules and standard JavaScript (no external npm dependencies)
- **FR-015**: System MUST use regex and string manipulation for HTML parsing (no DOM API or browser-specific libraries)

### Key Entities

- **HTML Input**: Raw HTML-like text string provided as the first parameter to the main function
- **Options Configuration**: Object containing outputFormat (default: "markdown"), strategy (optional: "list", "article", or undefined), and potentially other settings
- **Virtual DOM Node**: Internal representation of an HTML element with properties like tag name, attributes, children, and text content
- **Virtual DOM Tree**: Hierarchical structure of Virtual DOM Nodes representing the parsed HTML document
- **Output Format**: The format of the generated output - either "markdown" (text) or "json" (structured data)
- **Extraction Strategy**: Optional strategy for intelligent content filtering - "list" (largest list), "article" (main content), or default (all content)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The converter successfully transforms common HTML structures (headings, paragraphs, lists, links, emphasis) into valid Markdown syntax
- **SC-002**: HTML documents containing script, style, and iframe tags are cleaned, with these elements completely removed from the output
- **SC-003**: Metadata from HTML head section (title, meta description, meta keywords) is preserved in the conversion output
- **SC-004**: When processing HTML with multiple lists, the "list" strategy correctly identifies and extracts the list with the highest child element count
- **SC-005**: When processing HTML with multiple content sections, the "article" strategy successfully filters out non-content elements (empty containers, navigation) and retains the primary text content
- **SC-006**: The same HTML input produces semantically equivalent output in both Markdown and JSON formats
- **SC-007**: The converter processes typical web page HTML (up to 1MB) in under 2 seconds
- **SC-008**: The converter handles malformed HTML gracefully without crashing, producing best-effort output
- **SC-009**: Output is deterministic - the same input always produces the same output
- **SC-010**: Zero external dependencies are used - the solution relies only on Node.js standard library

## Assumptions

- Target Node.js version is 18+ LTS
- HTML input is expected to be UTF-8 encoded text
- Malformed HTML will be handled with best-effort parsing rather than strict validation
- The "article" strategy heuristic (filtering siblings with no text nodes) is sufficient for common web page layouts
- The "list" strategy uses simple child count as the metric for "largest" list
- JSON output structure will mirror the virtual DOM tree representation
- Performance target of sub-2-second processing assumes typical web page size (under 1MB)
- Inline styles and classes can be stripped as they are not relevant to semantic content extraction
