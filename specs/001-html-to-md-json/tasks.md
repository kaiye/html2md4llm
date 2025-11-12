# Tasks: HTML to Markdown/JSON Converter

**Input**: Design documents from `/specs/001-html-to-md-json/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as the user emphasized comprehensive test coverage with real HTML samples.
**Testing Approach**: Tests MUST use Node.js built-in assert module or minimal custom test harness (no npm test frameworks unless constitutionally approved).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths shown below assume single project structure per plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create src/ directory structure (src/generators/ subdirectory)
- [ ] T002 Create tests/ directory structure (tests/fixtures/, tests/generators/ subdirectories)
- [ ] T003 [P] Create test runner script in tests/run-tests.js using Node.js assert module

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core utilities that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Implement HTML entity decoding in src/utils.js (common entities + numeric codes)
- [ ] T005 [P] Create Virtual DOM node factory functions in src/utils.js (createElement, createText)
- [ ] T006 [P] Create test fixtures directory and add simple.html fixture in tests/fixtures/simple.html

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic HTML to Markdown Conversion (Priority: P1) 🎯 MVP

**Goal**: Convert simple HTML to Markdown format with core element support (headings, paragraphs, lists, links, emphasis, code)

**Independent Test**: Provide HTML with headings, paragraphs, bold/italic, links, lists, code blocks and verify Markdown output matches expected syntax

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T007 [P] [US1] Create test case for simple HTML to Markdown in tests/integration.test.js
- [ ] T008 [P] [US1] Create test case for inline formatting (bold, italic, links) in tests/integration.test.js
- [ ] T009 [P] [US1] Create test case for nested lists in tests/integration.test.js
- [ ] T010 [P] [US1] Create test case for code blocks and inline code in tests/integration.test.js

### Implementation for User Story 1

- [ ] T011 [US1] Implement basic HTML parser in src/parser.js (regex-based tag extraction, build virtual DOM tree)
- [ ] T012 [US1] Implement Markdown generator for headings (h1-h6) in src/generators/markdown.js
- [ ] T013 [US1] Implement Markdown generator for paragraphs and text nodes in src/generators/markdown.js
- [ ] T014 [US1] Implement Markdown generator for inline formatting (strong, em, a, code) in src/generators/markdown.js
- [ ] T015 [US1] Implement Markdown generator for lists (ul, ol, li with nesting) in src/generators/markdown.js
- [ ] T016 [US1] Implement Markdown generator for code blocks (pre) in src/generators/markdown.js
- [ ] T017 [US1] Create main function in src/main.js (accept htmlInput and options, default outputFormat='markdown')
- [ ] T018 [US1] Add input validation in src/main.js (check htmlInput is string, validate options)
- [ ] T019 [US1] Wire parser and Markdown generator in src/main.js
- [ ] T020 [US1] Run tests for User Story 1 and verify all pass

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - HTML Cleaning and Metadata Extraction (Priority: P2)

**Goal**: Filter out script/style/iframe tags while preserving title and meta tags from HTML head

**Independent Test**: Provide HTML with scripts, styles, iframes, and head metadata, verify removal and preservation

### Tests for User Story 2

- [ ] T021 [P] [US2] Create test case for script tag removal in tests/parser.test.js
- [ ] T022 [P] [US2] Create test case for style and iframe removal in tests/parser.test.js
- [ ] T023 [P] [US2] Create test case for metadata preservation (title, meta description, keywords) in tests/parser.test.js
- [ ] T024 [P] [US2] Create complex.html fixture with scripts/styles/metadata in tests/fixtures/complex.html

### Implementation for User Story 2

- [ ] T025 [US2] Implement HTML pre-cleaning in src/parser.js (remove script/style/iframe tags with regex)
- [ ] T026 [US2] Implement metadata extraction in src/parser.js (extract title, meta description, keywords)
- [ ] T027 [US2] Implement style attribute stripping in src/parser.js (remove style="" but keep content)
- [ ] T028 [US2] Update Markdown generator to include metadata in src/generators/markdown.js (prepend to output)
- [ ] T029 [US2] Run tests for User Story 2 and verify all pass

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Intelligent Content Extraction (List Mode) (Priority: P3)

**Goal**: Extract only the largest ul/ol element from HTML when strategy='list'

**Independent Test**: Provide HTML with multiple lists of varying sizes, verify only largest is returned

### Tests for User Story 3

- [ ] T030 [P] [US3] Create test case for list strategy with multiple ul elements in tests/transformer.test.js
- [ ] T031 [P] [US3] Create test case for list strategy with mixed ul/ol elements in tests/transformer.test.js
- [ ] T032 [P] [US3] Create list-page.html fixture with multiple lists in tests/fixtures/list-page.html

### Implementation for User Story 3

- [ ] T033 [US3] Implement list finder algorithm in src/transformer.js (traverse tree, count li children)
- [ ] T034 [US3] Implement strategy application logic in src/transformer.js (filter tree to selected node)
- [ ] T035 [US3] Update main function to support strategy option in src/main.js
- [ ] T036 [US3] Wire transformer into main pipeline in src/main.js (parse → transform → generate)
- [ ] T037 [US3] Run tests for User Story 3 and verify all pass

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Intelligent Content Extraction (Article Mode) (Priority: P3)

**Goal**: Extract main article content by filtering out low-text-density sibling divs when strategy='article'

**Independent Test**: Provide HTML with main content div and sidebar/nav divs, verify only main content returned

### Tests for User Story 4

- [ ] T038 [P] [US4] Create test case for article strategy with sidebars in tests/transformer.test.js
- [ ] T039 [P] [US4] Create test case for article strategy text density calculation in tests/transformer.test.js
- [ ] T040 [P] [US4] Create article.html fixture with main content and sidebars in tests/fixtures/article.html

### Implementation for User Story 4

- [ ] T041 [US4] Implement text density calculator in src/transformer.js (totalTextLength / totalHTMLLength)
- [ ] T042 [US4] Implement article finder algorithm in src/transformer.js (find divs, calculate density, select highest)
- [ ] T043 [US4] Update strategy handler to support 'article' mode in src/transformer.js
- [ ] T044 [US4] Run tests for User Story 4 and verify all pass

**Checkpoint**: All user stories 1-4 should now be independently functional

---

## Phase 7: User Story 5 - JSON Output Format (Priority: P4)

**Goal**: Generate JSON representation of virtual DOM tree when outputFormat='json'

**Independent Test**: Provide HTML, set outputFormat='json', verify valid JSON output with correct structure

### Tests for User Story 5

- [ ] T045 [P] [US5] Create test case for JSON output format in tests/generators/json.test.js
- [ ] T046 [P] [US5] Create test case for JSON structure validation in tests/generators/json.test.js
- [ ] T047 [P] [US5] Create test case for semantic equivalence (Markdown vs JSON) in tests/integration.test.js

### Implementation for User Story 5

- [ ] T048 [P] [US5] Implement JSON generator in src/generators/json.js (serialize virtual DOM, omit parent refs)
- [ ] T049 [US5] Update main function to route to JSON generator in src/main.js
- [ ] T050 [US5] Add outputFormat validation in src/main.js (must be 'markdown' or 'json')
- [ ] T051 [US5] Run tests for User Story 5 and verify all pass

**Checkpoint**: All user stories should now be independently functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T052 [P] Create malformed.html fixture for edge cases in tests/fixtures/malformed.html
- [ ] T053 [P] Add edge case tests (empty input, malformed HTML, deep nesting) in tests/integration.test.js
- [ ] T054 Add error handling for malformed HTML in src/parser.js (best-effort parsing, auto-close tags)
- [ ] T055 Add depth limit check in src/parser.js (prevent stack overflow for deeply nested HTML)
- [ ] T056 [P] Add performance test for large HTML (1MB) in tests/integration.test.js
- [ ] T057 [P] Run all tests via tests/run-tests.js and verify 100% pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Extends US1 parser but independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Requires transformer module but independently testable
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - Extends transformer but independently testable
- **User Story 5 (P4)**: Can start after Foundational (Phase 2) - Parallel generator, independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Core parsing/generation before strategies
- Validation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Create test case for simple HTML to Markdown in tests/integration.test.js"
Task: "Create test case for inline formatting (bold, italic, links) in tests/integration.test.js"
Task: "Create test case for nested lists in tests/integration.test.js"
Task: "Create test case for code blocks and inline code in tests/integration.test.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Add User Story 5 → Test independently → Deploy/Demo
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
