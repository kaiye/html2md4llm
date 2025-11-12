# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

**Language/Version**: JavaScript (ES2015+) / Node.js 18+ LTS
**Primary Dependencies**: NONE (Node.js built-in modules only: fs, path, stream, buffer, util, assert)
**Storage**: File system (input/output files)
**Testing**: Node.js assert module or minimal custom test harness
**Target Platform**: Node.js runtime (server/CLI)
**Project Type**: Single project (CLI tool)
**Performance Goals**: [domain-specific, e.g., process 10k lines/sec or NEEDS CLARIFICATION]
**Constraints**: Zero external dependencies, no DOM APIs, no build steps
**Scale/Scope**: [domain-specific, e.g., file sizes up to X MB or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

All features MUST comply with the following constitutional principles (see `.specify/memory/constitution.md`):

- [ ] **Zero Dependencies**: No npm packages or external dependencies proposed
- [ ] **Pure JavaScript**: No browser APIs (window, document, DOM, fetch, etc.)
- [ ] **No DOM API**: HTML parsing uses only string/regex, no JSDOM/Cheerio/etc.
- [ ] **Standalone Executable**: No build/transpile steps required (runs via `node script.js`)
- [ ] **Test Coverage**: Critical transformation logic has test cases

**Violations requiring justification** (document in Complexity Tracking section):
- Proposing any npm dependency (requires constitutional amendment)
- Using browser-specific APIs
- Adding build toolchain for development (production packaging may differ)
- Skipping tests for core parsing/transformation logic

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
