# Testing Patterns

**Analysis Date:** 2026-04-13

## Test Framework

**Runner:**
- **Jest** is provided through **Create React App** / **`react-scripts` 3.4.1** and invoked via **`react-app-rewired test`** (`package.json` script `test`).
- The **`npm test`** script is **`react-app-rewired test --evn=jsdom`** — the flag appears to be a typo for **`--env=jsdom`**; fix if Jest environment selection misbehaves.

**Assertion library:**
- **Jest** built-in **`expect`**.
- **`toBeInTheDocument`** appears in `src/components/YouTube/YouTubeRecordingForm.test.js` (expects **jest-dom** matchers).

**Run commands:**
```bash
npm test                                    # CRA interactive Jest (react-app-rewired)
CI=true npm test -- --watchAll=false        # Single non-interactive run
```

**Root `jest.config.js` (not wired to `npm test`):**
- A full **`jest.config.js`** exists at the repository root with **`testEnvironment: 'jsdom'`**, **`coverageThreshold` 80% global**, **`moduleNameMapper`** for `@/` and static assets, and **`setupFilesAfterEnv: ['<rootDir>/jest.setup.js']`**.
- **`react-app-rewired`** in this project **does not override Jest** in `config-overrides.js`, so **`npm test` uses CRA’s embedded Jest config**, not `jest.config.js`.
- **`jest.setup.js`** is **referenced by `jest.config.js` but is not present** in the repo (would break any run that used that config).
- **`jest.config.js`** references **`<rootDir>/__mocks__/styleMock.js`** and **`fileMock.js`** — those paths are **not present** under `__mocks__/` at analysis time.

## Test File Organization

**Location:**
- **Co-located under `src/`:** `src/components/YouTube/YouTubeRecordingForm.test.js` (matches CRA default discovery).
- **Top-level `test/` tree:** `test/components/Jobs/FMEAHierarchy.test.js` — **not** matched by CRA’s default **`src/**`** test patterns, so it is **not run** by `npm test` as configured.

**Naming:**
- **`*.test.js`** for both existing files.

**Structure:**
```
src/components/YouTube/
  YouTubeRecordingForm.js
  YouTubeRecordingForm.test.js
test/components/Jobs/
  FMEAHierarchy.test.js
test/setup.js              # jest-dom import; not wired into active npm test path
```

## Test Structure

**Suite organization:**

*Component test (Testing Library style — intended):*
```javascript
import React from 'react';
import { render, screen } from '@testing-library/react';
import YouTubeRecordingForm from './YouTubeRecordingForm';

global.fetch = jest.fn();

describe('YouTubeRecordingForm', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('renders YouTube recording form', () => {
    render(<YouTubeRecordingForm />);
    expect(screen.getByText('YouTube Recording')).toBeInTheDocument();
  });
});
```
(Source: `src/components/YouTube/YouTubeRecordingForm.test.js`.)

*Pure-logic style (inlined helper, no component mount):*
```javascript
describe('findConnectedTreeNodes', () => {
  const findConnectedTreeNodes = (startNodeId, links) => { /* ... */ };

  test('should find single direct connection', () => {
    const links = [{ sourceId: 1, targetId: 2 }];
    const result = findConnectedTreeNodes(1, links);
    expect(result).toEqual(new Set([1, 2]));
  });
});
```
(Source: `test/components/Jobs/FMEAHierarchy.test.js`.)

**Patterns:**
- Use **`describe`** for grouping and **`test`** (or `it`) for cases.
- **`beforeEach`** for resetting mocks where used (`YouTubeRecordingForm.test.js`).
- **Duplicated logic tests:** FMEAHierarchy duplicates an algorithm inline instead of importing from `src/components/Jobs/` — if the implementation changes, tests can **drift** unless extracted to a shared module.

## Mocking

**Framework:**
- **Jest** mocks: **`jest.fn()`**, **`global.fetch = jest.fn()`** in `src/components/YouTube/YouTubeRecordingForm.test.js`.
- **`clearMocks: true`** is set in root **`jest.config.js`** (again, only if that config is used).

**Patterns:**
```javascript
global.fetch = jest.fn();

beforeEach(() => {
  fetch.mockClear();
});
```
(Source: `src/components/YouTube/YouTubeRecordingForm.test.js`.)

**What to mock:**
- **Network:** `fetch` for components that call the API.
- **Okta / auth:** mock `@okta/okta-react` or wrap with a test provider when testing components that call **`useOktaAuth`** (e.g. consumers of `src/context/JobsProvider.js`).

**What not to mock:**
- **Pure helpers** under test in isolation (FMEAHierarchy-style) — no mocks needed.

## Fixtures and Factories

**Test data:**
- **Inline objects and arrays** in tests (link lists, Sets) — see `test/components/Jobs/FMEAHierarchy.test.js`.
- **No shared `tests/fixtures/` or factory modules** detected.

**Location:**
- Keep small data **inline**; introduce **`src/**/*.test.js`** factories only if duplication grows.

## Coverage

**Requirements (root `jest.config.js` only):**
- **`coverageThreshold.global`**: **80%** branches, functions, lines, statements.
- **`collectCoverageFrom`**: `src/**/*.{js,jsx}` with excludes for `index.js`, `serviceWorker.js`, `setupTests.js`.

**CRA default:**
- **`npm test` as run today** does **not** apply the root `jest.config.js` thresholds; use **`npm test -- --coverage`** for CRA coverage when debugging.

**View coverage (when using CRA):**
```bash
CI=true npm test -- --watchAll=false --coverage
```

## Test Types

**Unit tests:**
- **FMEAHierarchy:** algorithm-focused, no DOM.
- **YouTubeRecordingForm:** component render smoke tests (intended).

**Integration tests:**
- **Not** established as a separate naming or directory convention.

**E2E tests:**
- **Not detected** (no Playwright/Cypress config in repo root).

## Common patterns

**Async testing:**
- Use **`async` / `await`** with **`expect`** when testing async behavior; existing files are mostly synchronous.

**Error testing:**
- Use **`expect(() => fn()).toThrow(...)`** or **`rejects`** for promises when adding failure-path tests (no current examples in the two files).

**Snapshot testing:**
- **Not used** in the sampled tests.

## Current execution status

- **`npm test`** (CI, non-watch) currently **fails** on `src/components/YouTube/YouTubeRecordingForm.test.js` because **`@testing-library/react` is not listed** in `package.json` dependencies — the import cannot be resolved.
- Add **`@testing-library/react`** and **`@testing-library/jest-dom`** (and wire **`jest-dom`** via CRA `src/setupTests.js` or the unused `test/setup.js`) to match the test file’s expectations.

---

*Testing analysis: 2026-04-13*
*Update when test patterns change*
