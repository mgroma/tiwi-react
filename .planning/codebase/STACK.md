# Technology Stack

**Analysis Date:** 2026-04-13

## Languages

**Primary:**
- JavaScript (ES modules + JSX) — Most of `src/` (`.js`, `.jsx`); dashboards, layouts, and API client.

**Secondary:**
- TypeScript — Incremental adoption in `src/**/*.ts`, `src/**/*.tsx` (e.g. `src/components/Teleman/useEPGData.tsx`, `src/components/Teleman/JobStatus.tsx`); `tsconfig.json` targets ES5 with `strict: false`.

## Runtime

**Environment:**
- **Browser** — SPA; no Node server in this repo. Data access is via `fetch` and `EventSource` to a separate backend (see `src/service/api.js`).
- **Node.js** — Required for install, Webpack dev server, and builds. `npm start` sets `NODE_OPTIONS=--openssl-legacy-provider` (OpenSSL 3 compatibility with Webpack 4 / `react-scripts` 3.x toolchain).

**Package Manager:**
- npm (lockfile: `package-lock.json` present).
- No `engines` field in `package.json`; no `.nvmrc` in repo.

## Frameworks

**Core:**
- **React** `^18.2.0` — UI (`react-dom`); entry in `src/index.js` uses `createRoot`.
- **react-router-dom** `5.2.0` — Routing with `history` `4.10.1` (`createBrowserHistory` in `src/index.js`).
- **Create React App** via **react-scripts** `3.4.1` — Base toolchain; customized with **react-app-rewired** `^2.1.6` and `config-overrides.js`.
- **Material Dashboard React** (Creative Tim) — Layout/CSS in `src/assets/` and `src/layouts/`.
- **@material-ui/core** `4.10.0` / **@mui/material** `5.10.7` — Dual stack: many views use MUI v4; newer MUI v5 and **@mui/x-data-grid** also present.
- **@emotion/react** / **@emotion/styled** — Used by MUI styling path.
- **@okta/okta-react** `5.1.1`, **@okta/okta-auth-js** `^4.8.0`, **@okta/okta-signin-widget** `5.5.2` — Auth wrapper and sign-in UI (`src/index.js`, `src/views/Login/Login.js`).

**Data / state (client):**
- **react-query** `^3.39.2` — Server-state caching; `QueryClientProvider` in `src/index.js`; hooks in `src/components/Teleman/useEPGData.tsx` and related Teleman components.
- **React Context** — `src/context/JobsProvider.js`, `src/context/RecordingSearchContext.js`.

**Visualization / media:**
- **d3** `^7.8.2`, **@antv/g6** `^4.8.23`, **vis-network** / **vis-data**, **react-d3-graph**, **react-d3-tree**, **dagre** / **graphlib** — Graphs and job visualizations under `src/components/Jobs/`.
- **chartist** / **react-chartist** — Charts (`src/variables/charts.js` and dashboard views).
- **react-hls-player** — HLS playback (`src/components/Player/PlayerPage.js`).
- **react-google-maps** — Maps sample view (`src/views/Maps/Maps.js`).
- **moment** — Date handling (e.g. YouTube scheduling form).

**Testing:**
- **Jest** (via CRA / `react-app-rewired test`) — `package.json` script `test`; `jest.config.js` at repo root defines `jsdom`, coverage thresholds, and `moduleNameMapper` (note: config references `jest.setup.js`, which is not present in the repo tree).
- **@testing-library** — Used in tests such as `src/components/YouTube/YouTubeRecordingForm.test.js`.

**Build / dev:**
- **Webpack** (embedded in `react-scripts` 3.x) — Customized through `config-overrides.js` (`webpack.DefinePlugin` for injected env, filesystem cache, devtool).
- **dotenv** — Loaded in `config-overrides.js` from optional root file `testenv` (parsed with `dotenv.parse`); dependency comes from the CRA toolchain (`package-lock.json` includes `dotenv`).
- **TypeScript** `^5.8.3` — Typecheck/transpile for TS/TSX alongside Babel (CRA).
- **Prettier** `2.0.5` + **eslint-config-prettier** / **eslint-plugin-prettier** — Dev formatting/lint integration.
- **gulp** `4.0.2` + **gulp-append-prepend** — Listed in `devDependencies`; no `gulpfile` in repo (usage not evident from project files).

## Key Dependencies

**Critical:**
- **@okta/okta-react** / **@okta/okta-auth-js** / **@okta/okta-signin-widget** — OIDC login, `SecureRoute`, and API `Bearer` tokens (`src/service/api.js`).
- **react-router-dom** + **history** — App navigation and Okta callback route `/callback` (`src/index.js`).
- **react-query** — EPG and schedule data fetching with cache invalidation in Teleman features.
- **@material-ui/core** / **@mui/material** — Primary UI components across views and components.

**Infrastructure (client-side integration):**
- **Native `fetch`** — All REST calls in `src/service/api.js` and some components (e.g. `src/components/YouTube/YouTubeRecordingForm.js`).
- **EventSource** — SSE to `${HOSTNAME}/api/epg-events` in `src/service/api.js`.

## Configuration

**Environment:**
- Build-time injection via `config-overrides.js`: required variables `API_HOSTNAME`, `REDIRECT_URI`, `ISSUER`, `CLIENT_ID`, `OKTA_TESTING_DISABLEHTTPSCHECK` (throws if missing; see `README.md` reference in error). `CLIENT_ID` falls back to `SPA_CLIENT_ID`.
- Optional root file `testenv` — If present, variables are merged into `process.env` before the Webpack build (`config-overrides.js`). Do not commit secrets; treat like `.env`.
- Optional dev HTTPS: `REACT_HTTPS_KEY`, `REACT_HTTPS_CERT` — Read as file paths for dev server TLS (`config-overrides.js`).
- Application Okta OIDC settings: `src/config.js` (scopes include `order.status`).

**Build:**
- `config-overrides.js` — CRA overrides, env whitelist, optional `testenv` and HTTPS.
- `tsconfig.json` — TypeScript for `src/` with `baseUrl: "src"`.
- `package.json` — `eslintConfig.extends: "react-app"`; browserslist for production/development.
- `public/index.html` — CSP meta `upgrade-insecure-requests`; PWA manifest link.

## Platform Requirements

**Development:**
- OS: any platform supported by Node + npm.
- Backend expected on host/port implied by `API_HOSTNAME` or default `window.location.hostname:3001` (`src/service/api.js`).
- Local HTTPS may be required for Okta flows; `OKTA_TESTING_DISABLEHTTPSCHECK` is wired in `src/config.js` / `config-overrides.js`.

**Production:**
- Static assets from `npm run build` output (`build/`, standard CRA). Host on any static file host or behind a reverse proxy; runtime config is baked at build time via injected `process.env` keys above (not `REACT_APP_*` pattern).

---

*Stack analysis: 2026-04-13*
*Update after major dependency changes*
