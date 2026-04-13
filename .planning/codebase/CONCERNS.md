# Codebase Concerns

**Analysis Date:** 2026-04-13

## Tech Debt

**Create React App / Webpack 4 toolchain:**
- Issue: `react-scripts` `3.4.1` with `react-app-rewired`; `npm start` requires `NODE_OPTIONS=--openssl-legacy-provider` (see `package.json`).
- Why: Older webpack/OpenSSL defaults incompatible with current Node LTS without the flag.
- Impact: Fragile local setup, security patches depend on upstream CRA; harder to adopt modern tooling (Vite, Rspack, or CRA 5+).
- Fix approach: Plan migration off CRA 3 (e.g. upgrade to maintained bundler or `react-scripts` 5.x) and remove legacy OpenSSL workaround.

**Dual Material UI stacks:**
- Issue: Both `@material-ui/core` `4.10.0` and `@mui/material` `5.10.7` (plus `@mui/x-data-grid`, `@mui/styles`) are dependencies (`package.json`).
- Why: Incremental migration or template merge without completing removal of v4.
- Impact: Larger bundles, inconsistent theming APIs, duplicate styling mental model for contributors.
- Fix approach: Finish migrating screens to MUI v5 and drop `@material-ui/*` packages.

**Duplicate SLO type definitions:**
- Issue: Parallel definitions in `src/types/SLO.ts` (TypeScript interfaces) and `src/types/SLO.js` (PropTypes). Shapes diverge (e.g. `ComponentPropTypes.id` is required string in `SLO.js` vs optional `number` in `SLO.ts`).
- Why: Mixed JS/TS components with duplicated contracts.
- Impact: Runtime vs compile-time drift; refactors can miss one file.
- Fix approach: Single source of truth (e.g. TS types + `satisfies` or generated PropTypes); remove or narrow `SLO.js` to re-export from TS build.

**Hardcoded Okta resource server URLs:**
- Issue: `src/config.js` sets `resourceServer.messagesUrl` and `resourceServer.infoUrl` to `http://localhost:8000/...` with no `process.env` override.
- Why: Sample Okta SPA configuration left in place.
- Impact: Production builds point at localhost for any code still using these keys; environment-specific behavior is wrong by default.
- Fix approach: Drive URLs from env (same pattern as `CLIENT_ID` / `ISSUER` in `config-overrides.js`) or remove unused `resourceServer` if dead.

**Global ESLint disables:**
- Issue: File-level `/*eslint-disable*/` in multiple views/components (e.g. `src/views/Icons/Icons.js`, `src/views/Notifications/Notifications.js`, `src/components/Sidebar/Sidebar.js`, `src/components/Player/PlayerPage.js`, `src/components/FixedPlugin/FixedPlugin.js`, `src/components/Teleman/TelemanList.js`, `src/components/Footer/Footer.js`).
- Why: Quick suppression of lint noise.
- Impact: Hides regressions and unsafe patterns across large surface area.
- Fix approach: Replace with scoped disables or fix underlying rules file by file.

## Known Bugs

**Invalid error handling on third-party fetch helper:**
- Symptoms: Failed `_baseFetchThirdParty` responses may throw or produce misleading errors instead of a clear message.
- Trigger: Any non-OK response from `fetchTvGuide`, `getWeebAccountStatus`, or similar paths in `src/service/api.js`.
- Workaround: Inspect network tab and server logs manually.
- Root cause: `response.error()` is not a standard `Response` API method; likely intended to be `response.statusText` or status-based messaging (`src/service/api.js`).
- Blocked by: Nothing.

**Test script typo (may break CLI expectations):**
- Symptoms: Passing Jest environment via npm script may not apply the intended flag.
- Trigger: `npm test` uses `--evn=jsdom` in `package.json` (typo for `--env`).
- Workaround: Rely on Jest default `jsdom` where applicable or fix the flag.
- Root cause: Typo in `package.json` `scripts.test`.

## Security Considerations

**Most admin routes bypass `SecureRoute`:**
- Risk: UI under `/admin` is registered with plain `Route` when `unsecure: true` in `src/routes.js`; `src/layouts/Admin.js` only wraps `SecureRoute` when `unsecure` is falsy. Nearly all feature routes set `unsecure: true` (dashboard, recordings, teleman, jobs, EPG, etc.); only routes without `unsecure` (e.g. `/admin/typography`) use `SecureRoute`.
- Current mitigation: Backend must reject unauthenticated API calls; Okta `Security` still wraps the tree in `src/index.js`.
- Recommendations: Set `unsecure: false` (or remove flag) for routes that should require login; enforce auth at API and optionally add route-level guard that redirects to `/login` when `authState` is not authenticated. Treat current behavior as “security relies on API + obscurity,” not on React Router.

**Authentication checks disabled in client data loading:**
- Risk: `authState.isAuthenticated || true` forces the condition to always run authenticated API paths in `src/components/Web/WebPage.js`, `src/components/Web/WebList.js`, and `src/components/Recordings/RecordingList.js`. That sends `Authorization: Bearer ${accessToken}` with a possibly missing token (`src/service/api.js` `_baseFetch`).
- Current mitigation: Server should return 401/403 for invalid tokens.
- Recommendations: Remove `|| true`; gate fetches on `authState?.isAuthenticated` and show login prompt or skeleton otherwise.

**Okta HTTPS check disable via env:**
- Risk: `OKTA_TESTING_DISABLEHTTPSCHECK` flows from `config-overrides.js` / `src/config.js` into `disableHttpsCheck` on the Okta client; if set truthy in production, TLS validation may be weakened.
- Current mitigation: Build fails if required vars unset (`config-overrides.js`); default is false when unset.
- Recommendations: Document that this flag is dev-only; add CI assertion that production builds do not set it.

**Unauthenticated third-party API paths:**
- Risk: `_baseFetchThirdParty` in `src/service/api.js` calls `api/tvguide` and `api/weebAccountStatus` without Bearer tokens. If those endpoints are sensitive, they are exposed to anyone who can reach `API_HOSTNAME`.
- Current mitigation: Depends entirely on network placement and server auth.
- Recommendations: Align with backend: either require auth (e.g. cookie or query token if EventSource-style) or document as intentionally public.

**Server-Sent Events without Authorization header:**
- Risk: `EventSource` in `connectToJobUpdates` (`src/service/api.js`) cannot attach `Authorization: Bearer`; connection is to `${HOSTNAME}/api/epg-events`. If the stream is privileged, it may be misconfigured or rely on cookies only.
- Current mitigation: Backend may use cookies or IP rules.
- Recommendations: Confirm backend auth model for SSE; if JWT-only, use a pattern that supports it (e.g. short-lived query param, separate WebSocket with headers).

**Query string encoding:**
- Risk: `jsonToQueryParams` in `src/service/api.js` uses `encodeURI` per value, which does not encode all characters safe for query components the way `encodeURIComponent` does.
- Current mitigation: Low special-character payloads may work in practice.
- Recommendations: Use `encodeURIComponent` for keys and values (or `URLSearchParams`).

## Performance Bottlenecks

**Large synchronous chart components:**
- Problem: Very large client-only components increase parse and render cost on first navigation to jobs/visualization views.
- Measurement: Not instrumented in-repo; `src/components/Jobs/SunBurstChart.js` (~1272 lines) and `src/components/Jobs/TreeGraph.js` (~620 lines) are primary hotspots by size.
- Cause: Monolithic components with heavy logic and D3/graph libraries (`package.json`: `d3`, `@antv/g6`, `vis-network`, etc.).
- Improvement path: Code-split routes (`React.lazy` / dynamic import), extract pure functions for testing, and defer non-visible graph work.

**react-query defaults and refetch churn:**
- Problem: Global `refetchOnWindowFocus: true` and aggressive retry in `src/index.js` can multiply traffic when many queries mount.
- Measurement: Not instrumented.
- Cause: `QueryClient` default options favor freshness over request volume.
- Improvement path: Tune per-query `staleTime` / `refetchOnWindowFocus` for high-frequency screens (teleman, EPG, schedules).

## Fragile Areas

**Admin routing and auth flags:**
- Why fragile: Behavior depends on `unsecure` per entry in `src/routes.js` plus `src/layouts/Admin.js` branching; easy to add a route and forget auth semantics.
- Common failures: New pages exposed without `SecureRoute`, or duplicate/incorrect `path` / `layout` strings.
- Safe modification: Add routes with explicit `unsecure: false` unless there is a documented reason; add a short comment in `routes.js` explaining the contract.
- Test coverage: No automated route-auth matrix tests found.

**Jobs and schedule orchestration:**
- Why fragile: `src/context/JobsProvider.js` coordinates optimistic updates, refetch, and console-heavy logging; failures depend on API response shapes (`status === 0` conventions).
- Common failures: UI/server desync after partial errors; noisy logs in production.
- Safe modification: Preserve refetch-after-mutation pattern; add integration tests against API contract mocks.
- Test coverage: Limited; see Test Coverage Gaps.

**EPG and Teleman data hooks:**
- Why fragile: Mix of `src/components/Teleman/useEPGData.tsx`, cache helpers (`src/components/Teleman/EPGCacheUtils.js`), and API timing increases race risk during fast navigation.
- Common failures: Stale grid data, duplicate SSE reconnects (`src/service/api.js` reconnect loop).
- Safe modification: Centralize subscription cleanup; avoid duplicate `connectToJobUpdates` callers without shared guard.
- Test coverage: Sparse for Teleman/EPG flows.

## Scaling Limits

**Browser SSE reconnect loop:**
- Current capacity: Reconnect every 1s after errors (`RECONNECT_DELAY` in `src/service/api.js`).
- Limit: Thundering herd if many tabs or if server flaps; sustained errors hammer `API_HOSTNAME`.
- Symptoms at limit: Client CPU/log spam; server connection spikes.
- Scaling path: Exponential backoff with jitter, max cap, and visibility into connection state in UI.

**Single API host assumption:**
- Current capacity: All REST and SSE traffic targets one `HOSTNAME` derived from `process.env.API_HOSTNAME` or default `window.location` + port `:3001` (`src/service/api.js`).
- Limit: No built-in failover or CDN edge for API.
- Symptoms at limit: Full outage when API host is down.
- Scaling path: Reverse proxy, health checks, env-driven API base URL per environment.

## Dependencies at Risk

**`react-scripts` 3.x and ecosystem age:**
- Risk: Unpatched transitive vulnerabilities, incompatibility with newer Node without workarounds, deprecated babel/eslint paths.
- Impact: `npm audit` noise; CI breakage on toolchain upgrades.
- Migration plan: Upgrade or replace bundler (see Tech Debt).

**`react-query` v3:**
- Risk: Superseded by `@tanstack/react-query`; v3 receives limited attention.
- Impact: Future React features and bugfixes skew toward TanStack v4+.
- Migration plan: Follow official migration guide to `@tanstack/react-query`.

**`@okta/okta-react` 5.x / `okta-auth-js` 4.x:**
- Risk: Older major lines; security and OIDC behavior evolve.
- Impact: Possible compliance or CVE pressure.
- Migration plan: Review Okta upgrade guides and test `Security` / `LoginCallback` flows (`src/index.js`, `src/views/Login/Login.js`).

**`react-google-maps` 9.4.5:**
- Risk: Unmaintained relative to current React and Google Maps patterns.
- Impact: Breakage on React or Maps API changes.
- Migration plan: `@react-google-maps/api` or official loader patterns; touch `src/views/Maps/Maps.js` when migrating.

**npm `logger` 0.0.1:**
- Risk: Trivial/minimal package used as `createLogger` import in `src/components/Teleman/TelemanList.js`; not a structured observability stack.
- Impact: No correlation IDs, levels, or remote shipping by default.
- Migration plan: Replace with `debug`, `pino`/`loglevel`, or platform logging — aligned with product needs.

## Missing Critical Features

**Operational visibility:**
- Problem: Heavy `console.log` / `console.error` usage in API and SSE layers (`src/service/api.js`, `src/context/JobsProvider.js`) without centralized error reporting.
- Current workaround: Browser devtools only.
- Blocks: Production incident diagnosis from the client side.
- Implementation complexity: Medium (Sentry or similar + scrubbing of tokens).

## Test Coverage Gaps

**Orphaned or inconsistent Jest configuration:**
- What's not tested: Most of `src/`; only a handful of tests (e.g. `src/components/YouTube/YouTubeRecordingForm.test.js`, `test/components/Jobs/FMEAHierarchy.test.js`).
- Files: Root `jest.config.js` references `<rootDir>/jest.setup.js`, which is not present; `test/setup.js` exists but is not referenced by that config. CRA/`react-app-rewired` may ignore root `jest.config.js` unless explicitly wired — verify before relying on thresholds.
- Risk: `coverageThreshold` (80% global in `jest.config.js`) is likely never enforced in practice; regressions ship unnoticed.
- Priority: High for CI honesty; Medium for product risk until backend tests exist.
- Difficulty to test: Low to fix config; high to backfill meaningful UI tests without component refactors.

**Okta and API integration paths:**
- What's not tested: Login, token refresh, authenticated `fetch`, and SSE behavior.
- Files: `src/index.js`, `src/service/api.js`, `src/layouts/Admin.js`.
- Risk: Auth or API contract changes break production with no automated signal.
- Priority: High.
- Difficulty to test: Requires mock Okta and API or contract tests in a dedicated layer.

**Auth-gated data loading:**
- What's not tested: Correct behavior when `authState.isAuthenticated` is false after removing `|| true` in Web and Recordings flows.
- Files: `src/components/Web/WebPage.js`, `src/components/Web/WebList.js`, `src/components/Recordings/RecordingList.js`.
- Risk: Infinite loading spinners or accidental unauthenticated calls.
- Priority: Medium.
- Difficulty to test: Low with `useOktaAuth` mocks.

---

*Concerns audit: 2026-04-13*
*Update as issues are fixed or new ones discovered*
