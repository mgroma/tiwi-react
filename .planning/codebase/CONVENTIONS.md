# Coding Conventions

**Analysis Date:** 2026-04-13

## Naming Patterns

**Files:**
- React views and many components use **PascalCase** with `.js` (e.g. `src/views/Dashboard/Dashboard.js`, `src/components/Navbars/Navbar.js`).
- Some newer or feature UI uses **PascalCase** with `.jsx` (e.g. `src/components/Jobs/FMEASearch.jsx`).
- Shared styles and JSS live under `src/assets/jss/` with **camelCase** or descriptive names (e.g. `snackbarContentStyle.js`).
- Co-located tests next to source: `*.test.js` (e.g. `src/components/YouTube/YouTubeRecordingForm.test.js`).
- Separate test tree: `test/components/Jobs/FMEAHierarchy.test.js` (see `TESTING.md` for discoverability).

**Functions:**
- Use **camelCase** for functions and hooks (e.g. `fetchSchedules`, `setLoading`, `connectToJobUpdates` in `src/context/JobsProvider.js`).
- Event handlers and actions are typically **camelCase** verbs (e.g. `testVideoAccess`, `scheduleRecording` in `src/components/YouTube/YouTubeRecordingForm.js`).
- Internal helpers may use a **leading underscore** for module-private helpers (e.g. `_baseFetch`, `_baseFetchThirdParty` in `src/service/api.js`).

**Variables:**
- Use **camelCase** for locals and React state (`authState`, `eventSource`, `loadingStates`).
- No consistent `UPPER_SNAKE_CASE` for module-level constants; SSE delay uses `RECONNECT_DELAY` in `src/service/api.js`.

**Components and exports:**
- **Default export** for many page and form components (e.g. `export default function YouTubeRecordingForm` in `src/components/YouTube/YouTubeRecordingForm.js`).
- **Named export** used where multiple symbols leave one file (e.g. `export { EPGPrograms }` / `import { EPGPrograms }` in `src/routes.js` and `src/components/Teleman/EPGPrograms`).
- **PropTypes** remain common on legacy-style components (e.g. `src/components/Snackbar/SnackbarContent.js`, `src/views/Notifications/Notifications.js`).

**Types:**
- `tsconfig.json` sets `baseUrl` to `src` and allows JS; **strict TypeScript is off** (`strict: false`, `noImplicitAny: false`). Prefer matching any new TS to project settings if TS files are added.

## Code Style

**Formatting:**
- **No committed `.prettierrc` or `.eslintrc` file** at repo root; formatting follows editor defaults and historical edits.
- `package.json` includes **Prettier 2.x** and `eslint-config-prettier` / `eslint-plugin-prettier` as devDependencies — align new edits with surrounding files (quote style and spacing vary).

**Linting:**
- **ESLint** extends **`react-app`** via `package.json` → `eslintConfig` (Create React App baseline).
- `config-overrides.js` uses `/* eslint-disable import/no-extraneous-dependencies */` for build tooling.
- **No `lint` npm script** in `package.json`; run ESLint via the IDE or `npx eslint` if configured locally.

## Import Organization

**Order (typical in this codebase):**
1. **React** and React ecosystem (`react`, `react-dom`, `react-router-dom`, `@okta/okta-react`, `react-query`).
2. **Third-party** UI and libs (`@material-ui/core`, `@mui/material`, `moment`, `classnames`, `prop-types`).
3. **Absolute imports from `src`** using `baseUrl` (`components/...`, `layouts/...`, `assets/...`, `views/...`) — see `tsconfig.json` `baseUrl: "src"`.
4. **Relative imports** for siblings and local modules (`./Login`, `../Card/Card`, `../service/api`).

**Path aliases:**
- **`@/`** is declared in `jest.config.js` as `<rootDir>/src/$1` for tests **if** that Jest config is used; production bundling resolves via `baseUrl: "src"` (not the `@/` prefix in app code today — app code favors bare `components/...` paths).

**Grouping:**
- Blank lines between import groups are **inconsistent**; new code should separate React, third-party, and internal groups with one blank line for readability.

## Error Handling

**Patterns:**
- **HTTP layer:** `src/service/api.js` uses `_baseFetch` / `_baseFetchThirdParty`; failed responses use **`throw Error(\`...\`)`** (not `new Error` consistently).
- **Async UI and context:** **`try` / `catch` / `finally`** with **`console.error`** and often **rethrow** (`throw error`) after logging — see `src/context/JobsProvider.js` (`fetchSchedules`, `removeJob`, `recordWebChannel`).
- **Nested try/catch** for non-fatal follow-up work (e.g. refetch after remove in `JobsProvider` — logs refetch failure without always failing the whole operation).
- **SSE message parsing** in `src/service/api.js`: parse errors are logged, not rethrown, so the connection can continue.

**When adding code:**
- Prefer **`new Error(message)`** or **`Error` with `{ cause }`** for new throws unless matching adjacent `api.js` style.
- For user-visible failures, set component **state** or **message** objects (e.g. `message` state in `src/components/YouTube/YouTubeRecordingForm.js`) rather than only logging.

## Logging

**Framework:**
- **`console.log`**, **`console.error`**, and **`console.warn`** are used directly (no shared logger wrapper in app code sampled).

**Patterns:**
- **Debug and lifecycle** logging in `src/service/api.js` (SSE connect/disconnect/reconnect).
- **Operational** logging in `src/context/JobsProvider.js` for job removal and refetch steps.
- Some **commented-out** `console.log` (e.g. `src/components/Teleman/ThreadPool.js`).

**When adding code:**
- Match existing **`[context]`**-style messages where used; avoid noisy logs in hot render paths.

## Comments

**When to comment:**
- **License / template banners** at top of many Creative Tim–derived files (e.g. `src/index.js`, `src/routes.js`).
- **Inline comments** explain behavior or domain (e.g. link graph scenarios in `test/components/Jobs/FMEAHierarchy.test.js`, optimistic update notes in `JobsProvider`).
- **Section comments** in `src/routes.js` for icon groups and route groupings.

**JSDoc/TSDoc:**
- **Sparse**; param blocks appear for some APIs (e.g. `editParams` shape in `src/service/api.js`). Not required for every function unless you are exposing a shared public API.

**TODO comments:**
- **No `TODO` / `FIXME` hits** in `src` at time of analysis; use a ticket reference if adding them.

## Function Design

**Size:**
- Large components and views exist (dashboard, forms). **Prefer extracting** hooks or helpers when touching them, without mandatory line limits.

**Parameters:**
- **Objects and destructuring** for React props; service functions take **`authState`** first, then path-specific args in `src/service/api.js`.

**Return values:**
- React components **return JSX**; async API helpers **return parsed JSON** or throw; context methods **return data** or **boolean** where applicable (`removeJob` returns `true` on success path).

## Module Design

**Exports:**
- **Default export** for primary UI in many files under `src/components/` and `src/views/`.
- **Named exports** for context providers and utilities (`export function JobsProvider` in `src/context/JobsProvider.js`).
- **`src/service/api.js`** aggregates functions and uses a **default export** object at the bottom of the module.

**Barrel files:**
- **`src/index.js`** is the app bootstrap, not a general re-export barrel.
- Import **concrete paths** (e.g. `components/Card/Card.js`) rather than relying on `index.js` barrels unless a directory already exposes one.

---

*Convention analysis: 2026-04-13*
*Update when patterns change*
