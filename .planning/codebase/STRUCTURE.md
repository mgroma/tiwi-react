# Codebase Structure

**Analysis Date:** 2026-04-13

## Directory Layout

```
tiwi-react/
├── public/                 # Static assets, HTML shell, manifest
├── src/                    # Application source (CRA entry: index.js)
│   ├── assets/             # Global CSS, JSS, images, vendor snippets
│   ├── components/         # Reusable and feature UI (by folder)
│   ├── context/            # React context providers
│   ├── layouts/            # Admin / RTL shell layouts
│   ├── service/            # API client (fetch, SSE)
│   ├── types/              # Shared types (sparse .ts / .js)
│   ├── variables/          # Chart and general constants
│   ├── views/              # Page-level views (dashboard, login, etc.)
│   ├── config.js           # Okta OIDC and sample API URLs
│   ├── index.js            # App bootstrap, providers, top routes
│   ├── routes.js           # Route table for admin sidebar
│   └── react-app-env.d.ts  # TypeScript ambient defs for CRA
├── test/                   # Jest tests and setup
├── openspec/               # Specs and change proposals (non-runtime)
├── config-overrides.js     # react-app-rewired / env injection
├── package.json            # Scripts and dependencies
└── README.md               # Project documentation
```

## Directory Purposes

**`public/`:**
- Purpose: Static files served as-is; HTML entry for the SPA.
- Contains: `index.html`, icons, `manifest.json`, topic-specific static folders (e.g. `public/fmea/`).
- Key files: `public/index.html`
- Subdirectories: Feature or asset groupings as needed.

**`src/`:**
- Purpose: All React application code and bundled assets.
- Contains: `.js`, `.jsx`, `.ts`, `.tsx` sources; global styles.
- Key files: `src/index.js`, `src/routes.js`, `src/config.js`
- Subdirectories: See below.

**`src/assets/`:**
- Purpose: Global styling and images for the Material Dashboard theme.
- Contains: `css/`, `jss/material-dashboard-react/**` (component, layout, view styles), `img/`, `github/`.
- Key files: `src/assets/css/material-dashboard-react.css`, `src/assets/jss/material-dashboard-react.js`
- Subdirectories: `jss/material-dashboard-react/components/`, `layouts/`, `views/`

**`src/components/`:**
- Purpose: UI building blocks and feature modules grouped by domain.
- Contains: PascalCase component files; nested feature folders (`Teleman/`, `Jobs/`, `Recordings/`, `Web/`, `Player/`, `Navbars/`, `Sidebar/`, etc.).
- Key files: Examples include `src/components/Sidebar/Sidebar.js`, `src/components/Navbars/Navbar.js`, `src/components/Teleman/useEPGData.tsx`
- Subdirectories: One folder per concern (e.g. `src/components/Jobs/d3graph/`)

**`src/context/`:**
- Purpose: App-wide React Context providers and hooks.
- Contains: `JobsProvider.js`, `RecordingSearchContext.js`
- Key files: `src/context/JobsProvider.js`, `src/context/RecordingSearchContext.js`

**`src/layouts/`:**
- Purpose: Full-page shells that host `routes.js` and chrome.
- Contains: `Admin.js`, `RTL.js`
- Key files: `src/layouts/Admin.js`

**`src/service/`:**
- Purpose: HTTP and SSE integration with the backend API.
- Contains: `api.js`
- Key files: `src/service/api.js`

**`src/types/`:**
- Purpose: Shared type or constant modules (limited use).
- Contains: e.g. `SLO.ts`, `SLO.js`
- Key files: `src/types/SLO.ts`

**`src/variables/`:**
- Purpose: Data/config for charts and general UI constants.
- Contains: `charts.js`, `general.js`
- Key files: `src/variables/charts.js`

**`src/views/`:**
- Purpose: Top-level pages (especially legacy dashboard template views) and login.
- Contains: `Dashboard/`, `Login/`, `Icons/`, `Notifications/`, `UserProfile/`, etc.
- Key files: `src/views/Login/Login.js`, `src/views/Dashboard/Dashboard.js`

**`test/`:**
- Purpose: Jest tests outside `src/` (project choice).
- Contains: `setup.js`, mirror paths under `test/components/`
- Key files: `test/setup.js`, `test/components/Jobs/FMEAHierarchy.test.js`

**`openspec/`:**
- Purpose: Specifications and change records; not imported by the React app.
- Contains: `specs/`, `changes/` with nested markdown or spec files.
- Key files: Under `openspec/specs/` and `openspec/changes/`

## Key File Locations

**Entry Points:**
- `public/index.html`: HTML shell and meta tags for the SPA.
- `src/index.js`: React root, router, Okta, React Query, context providers, redirects.

**Configuration:**
- `package.json`: npm scripts (`react-app-rewired` start/build/test), dependency versions.
- `config-overrides.js`: Required env vars for client build; optional `testenv` loading; Webpack `DefinePlugin`.
- `jest.config.js`: Jest configuration for tests.
- `src/config.js`: Okta OIDC client configuration (reads `process.env.*` injected at build time).

**Core Logic:**
- `src/routes.js`: Declares all `/admin`-prefixed routes and their components.
- `src/service/api.js`: Backend API functions and SSE client.
- `src/context/JobsProvider.js`: Jobs/schedules state and mutations calling `api`.

**Testing:**
- `test/setup.js`: Jest environment setup.
- `test/components/**/*.test.js`: Example co-located-by-mirror-path tests.
- `src/components/YouTube/YouTubeRecordingForm.test.js`: In-source test example.

**Documentation:**
- `README.md`: Human-readable project instructions (including env expectations).

## Naming Conventions

**Files:**
- PascalCase for React components: `RecordingList.js`, `JobsPage.js`, `FMEAHierarchy.jsx`, `JobStatus.tsx`.
- camelCase for hooks and utilities: `useEPGData.tsx`, `useTitleHeader.tsx`, `dtutils.js`, `PlayerUtils.js`.
- lowercase for config/entry/route modules: `config.js`, `index.js`, `routes.js`.
- `*.test.js` for Jest tests.

**Directories:**
- PascalCase folder names under `src/components/` matching feature or widget groups (`Teleman`, `Recordings`, `WeebAccountStatus`).
- lowercase for structural dirs: `context/`, `layouts/`, `service/`, `views/`, `variables/`, `types/`.

**Special Patterns:**
- Creative Tim / Material Dashboard legacy: many imports include explicit `.js` suffix (e.g. `components/Navbars/Navbar.js`).
- Mixed extensions: `.js`, `.jsx`, `.ts`, `.tsx` coexist; TypeScript usage is partial.

## Where to Add New Code

**New admin page (sidebar + route):**
- Add a `dashboardRoutes` entry in `src/routes.js` (`path`, `name`, `icon`, `component`, `layout: "/admin"`, `unsecure` as required).
- Implement the screen in `src/views/{PageName}/` for template-style pages or `src/components/{Feature}/{Page}.js` for domain-heavy screens (match existing neighbors like `WebPage.js`, `JobsPage.js`).
- Register icons from `@material-ui/icons` or string icon keys as existing routes do.

**New API operation:**
- Add a function in `src/service/api.js` using `_baseFetch` or `_baseFetchThirdParty`; export on the default object.
- Call from components with `authState` from `useOktaAuth()` where Bearer auth is required.

**New global state:**
- Prefer colocating with React Query in a hook under the relevant feature (see `src/components/Teleman/useEPGData.tsx`) if data is server-backed.
- Use `src/context/` for cross-cutting client state that mirrors existing `JobsProvider` or `RecordingSearchContext` patterns.

**New styles (Material-UI v4 JSS):**
- Add or extend objects under `src/assets/jss/material-dashboard-react/` and import via `makeStyles` in the component or layout.

**New tests:**
- Add `*.test.js` next to the component under `src/` or under `test/` mirroring the component path (see `test/components/Jobs/FMEAHierarchy.test.js`).

**Utilities:**
- Shared string/UI helpers: `src/components/Utils/` (e.g. `StringCompare.js`, `ReadableBytes.js`).

## Special Directories

**`build/`:**
- Purpose: Production build output from `npm run build`.
- Source: Generated by Create React App / Webpack.
- Committed: Typically no (verify `.gitignore`); treat as ephemeral.

**`node_modules/`:**
- Purpose: Installed dependencies.
- Committed: No.

**`.planning/`:**
- Purpose: Planning and codebase intelligence artifacts for GSD-style workflows.
- Committed: Per team policy; contains `codebase/` analysis docs.

**`testenv` (file at repo root, if present):**
- Purpose: Local env overrides read by `config-overrides.js` via `dotenv.parse`.
- Committed: Do not commit secrets; existence only is noted here.

---

*Structure analysis: 2026-04-13*
*Update when directory structure changes*
