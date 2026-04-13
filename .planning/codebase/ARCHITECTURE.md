# Architecture

**Analysis Date:** 2026-04-13

## Pattern Overview

**Overall:** Single-page application (SPA) on Create React App with custom Webpack overrides, built from the Material Dashboard React shell and extended for TV/recording/EPG workflows.

**Key Characteristics:**
- Client-only rendering: no first-party server in this repo; all data comes from a separate HTTP API.
- Route-based UI with a persistent admin chrome (sidebar, navbar, footer).
- Okta OIDC for identity; most in-app routes are wired as unauthenticated `Route` components while Okta `Security` still wraps the tree.
- Hybrid UI stack: legacy `@material-ui/*` v4 alongside MUI v5 packages in the same tree.

## Layers

**Application bootstrap:**
- Purpose: Mount React, wire router history, global providers, and top-level routes.
- Location: `src/index.js`
- Contains: `createRoot`, `Router` (custom `history`), `QueryClientProvider`, `RecordingSearchContextProvider`, Okta `Security`, `JobsProvider`, `Switch` for `/admin`, `/login`, `/callback`.
- Depends on: `history`, `react-router-dom`, `@okta/okta-react`, `@okta/okta-auth-js`, `react-query`, `./config`, `./context/*`, `layouts/Admin.js`, `views/Login/Login.js`.
- Used by: Browser loading `public/index.html` → bundle entry.

**Layout shell:**
- Purpose: Render shared chrome and nested feature routes.
- Location: `src/layouts/Admin.js` (primary); `src/layouts/RTL.js` (RTL variant; filters routes where `layout === "/rtl"`).
- Contains: `Sidebar`, `Navbar`, `Footer`, `PlayerPopup`, `PerfectScrollbar` setup, route `Switch` built from `routes.js`.
- Depends on: `@material-ui/core` `makeStyles`, `@okta/okta-react` `SecureRoute`, `routes.js`, JSS layout styles under `src/assets/jss/material-dashboard-react/layouts/`.
- Used by: Top-level `/admin` route in `src/index.js`.

**Route table:**
- Purpose: Declarative list of paths, layout prefix, sidebar metadata, and page components.
- Location: `src/routes.js`
- Contains: `dashboardRoutes` array (`path`, `name`, `icon`, `component`, `layout`, `unsecure`, optional `skipFromDisplay`).
- Depends on: View and feature components under `src/views/*` and `src/components/*`.
- Used by: `src/layouts/Admin.js` (and `RTL.js` when applicable), `src/components/Sidebar/Sidebar.js`, `src/components/Navbars/Navbar.js`.

**Feature UI (pages and widgets):**
- Purpose: Screens and domain-specific UI (EPG, jobs, recordings, web TV, player, dashboards).
- Location: `src/views/*` (template-style pages), `src/components/*` (feature folders such as `Teleman/`, `Jobs/`, `Recordings/`, `Web/`, `Player/`).
- Contains: Class and function components; some hooks in `.tsx` (e.g. `src/components/Teleman/useEPGData.tsx`).
- Depends on: MUI/Material-UI, charts/graph libs, `service/api`, Okta hooks, React Query, local context.
- Used by: Routes from `routes.js`.

**API client layer:**
- Purpose: HTTP access to the backend; attach Bearer tokens where required; SSE for live updates.
- Location: `src/service/api.js`
- Contains: `_baseFetch` / `_baseFetchThirdParty`, domain functions (`fetchSchedules`, `fetchRecordings`, `recordWebChannel`, …), `connectToJobUpdates` (`EventSource` to `/api/epg-events`).
- Depends on: `process.env.API_HOSTNAME` (injected via `config-overrides.js`), caller-supplied `authState` from Okta.
- Used by: Feature components and `src/context/JobsProvider.js`.

**Cross-cutting configuration:**
- Purpose: Okta OIDC settings and documented resource-server URLs (sample localhost).
- Location: `src/config.js`
- Contains: `oidc` object (`clientId`, `issuer`, `redirectUri`, `scopes`, `pkce`, `disableHttpsCheck`), `resourceServer` URLs.
- Depends on: `process.env` keys wired through `config-overrides.js` (`CLIENT_ID`, `ISSUER`, `REDIRECT_URI`, etc.).
- Used by: `src/index.js`, `src/views/Login/Login.js`.

**Build / environment wiring:**
- Purpose: Inject required env into the client bundle; optional `testenv` file; dev server HTTPS.
- Location: `config-overrides.js`
- Contains: `webpack.DefinePlugin` for `API_HOSTNAME`, `REDIRECT_URI`, `ISSUER`, `CLIENT_ID`, `OKTA_TESTING_DISABLEHTTPSCHECK`; filesystem cache; devServer tweaks.
- Depends on: Node `fs`, `dotenv` parse of `testenv` at repo root.
- Used by: `react-app-rewired` (`package.json` scripts).

## Data Flow

**Authenticated REST call:**

1. User session: Okta `Security` provides auth context to descendants.
2. Component calls `useOktaAuth()` and reads `authState` (e.g. `src/context/JobsProvider.js`, `src/components/Web/WebList.js`).
3. Component or provider invokes a function from `src/service/api.js`, passing `authState`.
4. `api.js` builds URL from `HOSTNAME` (`process.env.API_HOSTNAME` or origin + `:3001`) and calls `fetch` with `Authorization: Bearer ${accessToken}`.
5. JSON response is returned or an `Error` is thrown if `!response.ok`.

**Server state caching (React Query):**

1. `QueryClient` is created in `src/index.js` (stale time, cache time, retries, refetch flags).
2. Hooks such as `src/components/Teleman/useEPGData.tsx` use `useQuery` / `useQueryClient` with query keys like `epgCombinedData`, `epgSchedules`.
3. Query functions call `api` methods or combine cached data; `useOktaAuth` supplies `authState` inside the hook.

**Jobs / schedule context:**

1. `JobsProvider` (`src/context/JobsProvider.js`) wraps the app inside Okta `Security` in `src/index.js`.
2. Provider uses `useOktaAuth` and `api.fetchSchedules`, `api.removeJob`, etc., holding `jobs` and per-operation loading flags in React state.
3. Consumers use `useContext(JobsContext)` (pattern established in that file).

**Recording search / player popover:**

1. `RecordingSearchContextProvider` in `src/index.js` wraps the tree.
2. `src/context/RecordingSearchContext.js` exposes tuple state and `useRecordingSearch` for search string, player URL, and anchor element.

**Login / callback:**

1. `/login` renders `src/views/Login/Login.js`, which mounts `@okta/okta-signin-widget` with values from `src/config.js`.
2. `/callback` uses Okta `LoginCallback` from `src/index.js`.
3. `restoreOriginalUri` in `src/index.js` uses `toRelativeUrl` to normalize post-login navigation.

**Live job / EPG events:**

1. Callers use `api.connectToJobUpdates(onMessage)` from `src/service/api.js`.
2. A browser `EventSource` connects to `${HOSTNAME}/api/epg-events`; messages are JSON-parsed; errors trigger reconnect with delay.

**State Management:**
- Remote data: primarily React Query (`react-query`) plus manual fetches through `src/service/api.js`.
- Shared UI/domain state: React Context (`src/context/JobsProvider.js`, `src/context/RecordingSearchContext.js`).
- Auth state: Okta (`@okta/okta-react` / `okta-auth-js`), not duplicated in Redux or similar.

## Key Abstractions

**Route descriptor:**
- Purpose: Single object describing one sidebar entry and its React component.
- Examples: `dashboardRoutes` in `src/routes.js`.
- Pattern: Array of objects consumed by layout and navigation components; `unsecure: true` selects `Route` vs `SecureRoute` in `src/layouts/Admin.js`.

**API module:**
- Purpose: Central place for backend paths, fetch options, and SSE lifecycle.
- Examples: `src/service/api.js` default export object.
- Pattern: Plain async functions; no class-based client; auth passed explicitly per call.

**Okta integration:**
- Purpose: SPA authentication and token access for API calls.
- Examples: `Security`, `LoginCallback`, `SecureRoute` in `src/index.js` / `src/layouts/Admin.js`; `useOktaAuth` across feature components; `OktaAuth` instance in `src/index.js`.
- Pattern: OIDC with PKCE (`src/config.js`).

**React Query keys:**
- Purpose: Cache and invalidate server-derived data (EPG, channels, schedules).
- Examples: `src/components/Teleman/useEPGData.tsx`, `src/components/Teleman/EPGCacheUtils.js`, `src/components/Teleman/EPG.js`.
- Pattern: String/array keys; `useQueryClient` for invalidation.

**JSS style modules:**
- Purpose: Co-locate Material-UI v4 `makeStyles` style objects with components and layouts.
- Examples: `src/assets/jss/material-dashboard-react.js`, `src/assets/jss/material-dashboard-react/components/*.js`, `src/assets/jss/material-dashboard-react/layouts/adminStyle.js`.

## Entry Points

**Browser bundle:**
- Location: `public/index.html` (root div, CSP meta), compiled entry from `src/index.js`.
- Triggers: User opens the deployed or dev-server URL.
- Responsibilities: Load SPA assets; React mounts into `#root`.

**React root:**
- Location: `src/index.js`
- Triggers: Bundle execution after HTML load.
- Responsibilities: Create router history, Okta auth, providers, render route switch for admin area, login, and OAuth callback.

**Admin layout route:**
- Location: `src/layouts/Admin.js` via `path="/admin"` in `src/index.js`.
- Triggers: Navigation under `/admin/*`.
- Responsibilities: Render shell and match child paths from `src/routes.js`.

## Error Handling

**Strategy:** Fail fast on missing build-time env in `config-overrides.js`; at runtime, API layer throws `Error` on non-OK HTTP; components and providers often `try/catch`, log with `console.error`, and surface behavior through UI state or rethrow.

**Patterns:**
- `src/service/api.js`: `throw Error(\`error executing ${operationName}...\`)` when `!response.ok`.
- `src/context/JobsProvider.js`: try/catch around async operations, optimistic updates with rollback on failure.
- SSE parse errors: `console.error` in `connectToJobUpdates` message handler.

## Cross-Cutting Concerns

**Logging:**
- Approach: `console.log` / `console.error` in `src/service/api.js` (SSE), `src/context/JobsProvider.js`, and various components; no shared logging abstraction detected.

**Validation:**
- Approach: Ad hoc checks in components; query string building via `jsonToQueryParams` in `src/service/api.js` for edit APIs. No shared schema library at the UI boundary.

**Authentication:**
- Approach: Okta OIDC; `Security` wraps the app in `src/index.js`. `src/layouts/Admin.js` uses `SecureRoute` when `unsecure` is falsy on a route; current `src/routes.js` sets `unsecure: true` on most entries, so those paths use plain `Route` without Okta route protection.

**Internationalization / RTL:**
- Approach: `src/layouts/RTL.js` exists for RTL layout; active route set depends on `routes.js` entries using `layout: "/rtl"` (currently all dashboard routes use `/admin`).

---

*Architecture analysis: 2026-04-13*
*Update when major patterns change*
