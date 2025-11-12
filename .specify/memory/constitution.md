<!--
Sync Impact Report:
- Version change: [NEW CONSTITUTION] → 1.0.0
- Rationale: Initial constitution creation for html2md2json project
- Added sections: All (initial creation)
  * Core Principles: Zero Dependencies, Pure JavaScript, No DOM API, Standalone Executable, Test Coverage
  * Technology Constraints
  * Development Workflow
  * Governance
- Modified principles: N/A (initial version)
- Removed sections: N/A (initial version)
- Templates requiring updates:
  ✅ .specify/templates/plan-template.md - Updated Constitution Check section with concrete principles and Technical Context defaults
  ✅ .specify/templates/spec-template.md - Added constitutional constraints reminder in Requirements section
  ✅ .specify/templates/tasks-template.md - Updated testing approach and Setup phase to use Node.js assert module
  ⚠ .claude/commands/*.md - Manual review recommended to ensure agent guidance aligns with zero-dependency principle
- Follow-up TODOs:
  - Consider documenting minimum Node.js version once determined (recommended: Node.js 18+ LTS)
  - Review .claude/commands/*.md for any npm-specific guidance that conflicts with constitution
-->

# html2md2json Constitution

## Core Principles

### I. Zero Dependencies (NON-NEGOTIABLE)

This project MUST NOT include any third-party npm packages or external dependencies. All functionality
MUST be implemented using only JavaScript standard library features available in Node.js runtime.

**Rationale**: Ensures maximum portability, eliminates supply chain security risks, reduces maintenance
burden, and keeps the codebase lean and auditable.

**Enforcement**:
- No package.json dependencies or devDependencies (test frameworks excepted if explicitly approved)
- All imports must be from built-in Node.js modules (fs, path, util, etc.) or local project files
- Code reviews MUST reject any attempt to add external dependencies

### II. Pure JavaScript

All code MUST be written in pure JavaScript that executes in a JavaScript interpreter (Node.js runtime).
No browser-specific APIs, no DOM manipulation, no window/document objects.

**Rationale**: This is a server-side/CLI tool for transforming data formats. Browser APIs are not
available and not relevant to the use case.

**Enforcement**:
- No references to: window, document, DOM, XMLHttpRequest, fetch (browser version), localStorage,
  sessionStorage, or any Web API
- Node.js built-in modules only: fs, path, stream, buffer, util, etc.
- Code must be executable via `node script.js` without browser environment

### III. No DOM API

The project MUST NOT use any DOM APIs or HTML parsing libraries that depend on browser environments.
HTML parsing, if required, MUST use string manipulation, regular expressions, or custom parsing logic
built with standard JavaScript.

**Rationale**: Maintains consistency with Pure JavaScript principle and zero dependencies constraint.
DOM APIs like DOMParser, HTMLElement are browser-specific and not available in Node.js standard library.

**Enforcement**:
- No JSDOM, Cheerio, or similar HTML parsing libraries
- HTML processing via regex patterns, string methods, or hand-written parsers only
- All parsing logic MUST be deterministic and testable without browser

### IV. Standalone Executable

All scripts MUST be executable directly via Node.js interpreter without build steps, transpilation, or
bundling. The code should run as-is in any Node.js environment.

**Rationale**: Simplifies deployment, debugging, and maintenance. Users can read and modify source code
directly without toolchain knowledge.

**Enforcement**:
- No TypeScript, Babel, webpack, or compilation steps
- Use ES modules (import/export) or CommonJS (require/module.exports) as supported by target Node.js
  version
- Document minimum Node.js version required (recommend LTS)

### V. Test Coverage

Critical parsing and transformation logic MUST have test coverage. Tests verify input/output behavior
using simple assertions and Node.js assert module (or minimal test runner if justified).

**Rationale**: Ensures correctness of data transformations, prevents regressions, and serves as
executable documentation of expected behavior.

**Enforcement**:
- Core transformation functions (html→md, md→json) require tests
- Tests use only Node.js built-in assert or minimal custom test harness
- Edge cases and error handling paths must be tested
- Tests are runnable via `node test/*.js` or simple test script

## Technology Constraints

### Language & Runtime

- **Language**: JavaScript (ES2015+ syntax acceptable if Node.js LTS supports it)
- **Runtime**: Node.js (specify minimum version, e.g., Node.js 18+ LTS recommended)
- **Module System**: ES modules preferred; CommonJS acceptable
- **Standard Library Only**: fs, path, stream, buffer, util, assert, etc.

### Forbidden Dependencies

The following are explicitly PROHIBITED:

- Any npm package (except test frameworks if explicitly approved and documented in constitution
  amendment)
- Browser APIs: DOM, fetch, XMLHttpRequest, window, document
- HTML parsing libraries: JSDOM, Cheerio, parse5, htmlparser2
- Markdown libraries: marked, markdown-it, showdown (implement custom or minimal parser)
- Build tools: webpack, rollup, parcel, esbuild (unless for production packaging only, not development)

### Allowed Practices

- Custom parsing logic using regex and string methods
- State machines for complex parsing
- Stream processing for large files (Node.js streams API)
- Simple CLI argument parsing (process.argv)
- File I/O via fs promises or sync methods
- Process exit codes and stderr for error reporting

## Development Workflow

### Adding Functionality

1. Design parsing/transformation logic without external dependencies
2. Write test cases showing expected input → output transformations
3. Implement using only JavaScript standard library
4. Run tests to verify correctness
5. Document usage in README or inline comments

### Code Review Gates

All code changes MUST pass these checks:

- **Zero Dependency Check**: No new imports from npm packages
- **Pure JavaScript Check**: No browser APIs or DOM references
- **Test Check**: Core logic has corresponding tests
- **Executable Check**: Code runs via `node <file>.js` without build step

### Complexity Justification

If any of the following are proposed, they MUST be justified in writing before approval:

- Adding an npm dependency (requires constitutional amendment)
- Using a transpiler or build tool (requires clear packaging rationale)
- Skipping tests for core transformation logic (requires explicit risk acceptance)

## Governance

### Amendment Process

This constitution can be amended only by:

1. Documenting the proposed change and rationale
2. Updating the version number per semantic versioning rules below
3. Propagating changes to all dependent templates and documentation
4. Recording the amendment in the Sync Impact Report at the top of this file

### Version Semantics

- **MAJOR** (e.g., 1.x.x → 2.0.0): Backward incompatible changes such as allowing npm dependencies,
  changing from Node.js to browser runtime, removing core principles
- **MINOR** (e.g., 1.0.x → 1.1.0): Adding new principles, expanding constraints, adding new mandatory
  sections or practices
- **PATCH** (e.g., 1.0.0 → 1.0.1): Clarifications, wording improvements, fixing typos, non-semantic
  refinements

### Compliance

- All pull requests MUST verify compliance with this constitution
- Any deviation MUST be documented in "Complexity Tracking" section of plan.md
- Constitution supersedes all other coding preferences or conventions
- When in doubt, choose the simpler implementation that adheres to core principles

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2025-11-12
