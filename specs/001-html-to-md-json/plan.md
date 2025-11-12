# Implementation Plan: HTML to Markdown/JSON Converter

**Branch**: `001-html-to-md-json` | **Date**: 2025-11-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-html-to-md-json/spec.md`

## Summary

Implement a pure JavaScript HTML to Markdown/JSON converter using the parse-transform-generate pipeline approach. The converter will clean HTML (removing scripts/styles/iframes while preserving metadata), parse it into a virtual DOM tree, apply optional extraction strategies (list/article), and generate output in either Markdown or JSON format. All functionality must use only Node.js built-in modules with comprehensive test coverage using real-world HTML samples.

## Technical Context

**Language/Version**: JavaScript (ES2015+) / Node.js 18+ LTS
**Primary Dependencies**: NONE (Node.js built-in modules only: fs, path, stream, buffer, util, assert)
**Storage**: File system (input/output files)
**Testing**: Node.js assert module with test fixtures containing real HTML samples
**Target Platform**: Node.js runtime (server/CLI)
**Project Type**: Single project (CLI tool/library)
**Performance Goals**: Process typical web pages (up to 1MB) in under 2 seconds
**Constraints**: Zero external dependencies, no DOM APIs, no build steps, regex-based parsing only
**Scale/Scope**: Handle HTML documents up to 10MB, nested structures up to 50 levels deep

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All features MUST comply with the following constitutional principles (see `.specify/memory/constitution.md`):

- [x] **Zero Dependencies**: No npm packages or external dependencies proposed
- [x] **Pure JavaScript**: No browser APIs (window, document, DOM, fetch, etc.)
- [x] **No DOM API**: HTML parsing uses only string/regex, no JSDOM/Cheerio/etc.
- [x] **Standalone Executable**: No build/transpile steps required (runs via `node script.js`)
- [x] **Test Coverage**: Critical transformation logic has test cases with real HTML fixtures

**Status**: ✅ PASSED (Initial) - ✅ PASSED (Post-Design) - All constitutional principles satisfied

**Post-Design Verification**:
- ✅ Research document confirms regex-based parsing approach (no DOM libraries)
- ✅ Data model uses plain JavaScript objects (no external dependencies)
- ✅ API contract specifies Node.js built-in modules only
- ✅ Testing strategy uses Node.js assert module (no test frameworks required)
- ✅ Project structure includes tests/ with fixtures for comprehensive coverage

**Violations requiring justification**: NONE

## Project Structure

### Documentation (this feature)

```text
specs/001-html-to-md-json/
├── plan.md              # This file
├── research.md          # Phase 0: Parsing strategies and patterns
├── data-model.md        # Phase 1: Virtual DOM node structure
├── quickstart.md        # Phase 1: Usage examples
└── contracts/           # Phase 1: API contracts
    └── main-api.md      # Main function signature and behavior
```

### Source Code (repository root)

```text
src/
├── parser.js            # HTML cleaning and parsing to virtual DOM
├── transformer.js       # Virtual DOM transformation and strategies
├── generators/          # Output format generators
│   ├── markdown.js      # Markdown generator
│   └── json.js          # JSON generator
├── utils.js             # Shared utilities (HTML entity decoding, etc.)
└── main.js              # Main entry point with options handling

tests/
├── fixtures/            # Real HTML test samples
│   ├── simple.html      # Basic HTML with common elements
│   ├── complex.html     # Full web page with scripts/styles
│   ├── list-page.html   # Page with multiple lists
│   ├── article.html     # Blog post with sidebars
│   └── malformed.html   # Edge cases and malformed HTML
├── parser.test.js       # Parser unit tests
├── transformer.test.js  # Transformer unit tests
├── generators/          # Generator tests
│   ├── markdown.test.js
│   └── json.test.js
├── integration.test.js  # End-to-end integration tests
└── run-tests.js         # Test runner script
```

**Structure Decision**: Using single project structure (Option 1) as this is a standalone CLI tool/library. The src/ directory contains the parse-transform-generate pipeline components, with tests/ mirroring the structure and including real HTML fixtures for comprehensive testing.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

N/A - No constitutional violations. All requirements can be met with:
- Pure JavaScript and Node.js built-in modules
- Regex-based HTML parsing (no DOM API)
- Node.js assert module for testing
- No external dependencies required
