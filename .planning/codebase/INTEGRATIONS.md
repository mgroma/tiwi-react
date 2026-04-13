# External Integrations

**Analysis Date:** 2026-04-13

## APIs & External Services

**Authentication / identity (Okta):**
- **Okta** — OIDC for user sign-in; access tokens attached as `Authorization: Bearer` on API calls.
  - Client libraries: `@okta/okta-react`, `@okta/okta-auth-js`, `@okta/okta-signin-widget` (`src/index.js`, `src/views/Login/Login.js`).
  - Configuration: `ISSUER`, `CLIENT_ID` (or `SPA_CLIENT_ID`), `REDIRECT_URI`, `OKTA_TESTING_DISABLEHTTPSCHECK` injected via `config-overrides.js`; OIDC shape in `src/config.js` (PKCE, scopes `openid`, `email`, `profile`, `order.status`).
  - Routes: `/login` (widget), `/callback` (`LoginCallback` in `src/index.js`).
- **Social / enterprise IdPs (via Okta Sign-In Widget)** — Configured as Okta Identity Providers in widget `idps` (Google, Facebook, Apple, Microsoft, LinkedIn, custom entries) in `src/views/Login/Login.js`. Credentials and IdP setup live in the Okta admin console, not in env vars in this repo.

**Backend REST API (first-party):**
- **Tiwi / recorder backend** — Primary integration: JSON over HTTP from the browser.
  - Base URL: `API_HOSTNAME` (build-time required); if unset at runtime, `src/service/api.js` falls back to `window.location.protocol + '//' + window.location.hostname + ':3001'`.
  - Auth: Bearer token from Okta (`src/service/api.js` `_baseFetch`).
  - Representative paths used by `src/service/api.js`: `api/channels`, `api/schedules`, `api/recordings`, `api/schedule/...`, `api/cancel/{jobIndex}`, `api/removeJob/{jobIndex}`, `api/streamInfo/{channelName}`, `api/play/{recordingName}`, `api/remove/{recordingName}`, `api/edit/...`, `api/stream/...`, `api/schedule/epg?jobType=5`, etc.
- **Unauthenticated backend calls** — `_baseFetchThirdParty` in `src/service/api.js` calls the same `HOSTNAME` without `Authorization` for `api/tvguide` and `api/weebAccountStatus`.

**Server-Sent Events:**
- Same backend host — `EventSource` to `${HOSTNAME}/api/epg-events` for job/update streaming (`connectToJobUpdates` in `src/service/api.js`).

**Google Maps JavaScript API:**
- **Google** — Map rendering in demo view `src/views/Maps/Maps.js` via `react-google-maps` with `googleMapURL` including `key=YOUR_KEY_HERE` (placeholder; replace with a real Maps API key for production).

**YouTube (indirect):**
- UI in `src/components/YouTube/YouTubeRecordingForm.js` parses YouTube URLs client-side and calls the **local/backend** HTTP API (some `fetch` URLs are hardcoded to `https://localhost:3001/...`; scheduling uses query params including `jobType=6`). Actual YouTube API or download logic is assumed to live on the backend, not in this frontend repo.

**HLS / media playback:**
- **HLS streams** — `react-hls-player` in `src/components/Player/PlayerPage.js` plays playlist URLs supplied by app state (typically originating from backend `api/stream` / related endpoints). No third-party video SDK beyond the player component.

**Config placeholders (sample / unused in tree):**
- `src/config.js` defines `resourceServer.messagesUrl` and `resourceServer.infoUrl` pointing at `http://localhost:8000/...` — not referenced by `src/service/api.js` in the surveyed paths; treat as sample or legacy unless wired elsewhere.

## Data Storage

**Databases:**
- Not applicable in this repository — no ORM or direct DB client; persistence is via the backend API.

**File Storage:**
- Browser-only; recordings and files are handled server-side (API contract only from this app).

**Caching:**
- In-memory/query cache via **react-query** (`src/index.js`, Teleman hooks); no Redis or external cache service in frontend code.

## Authentication & Identity

**Auth provider:**
- **Okta OIDC** — Described above; tokens obtained through widget + redirect flow; `SecureRoute` in `src/layouts/Admin.js` protects admin layout.

**Session / tokens:**
- Managed by **Okta Auth JS** / **okta-react** (`useOktaAuth` across components such as `src/components/Navbars/AdminNavbarLinks.js` for `signInWithRedirect` / `signOut`).

## Monitoring & Observability

**Error tracking:**
- Not detected — no Sentry or similar imports in surveyed `src/`.

**Analytics:**
- Not detected in application code.

**Logs:**
- `console.log` / `console.error` in places such as `src/service/api.js` (SSE lifecycle) and `src/views/Login/Login.js` (widget errors).

## CI/CD & Deployment

**CI pipeline:**
- Not detected — no `.github/workflows/` (or similar) in the repository.

**Hosting:**
- Not specified — deliverable is a CRA static build (`npm run build`). Environment-specific `API_HOSTNAME` and Okta values must match the deployment URL at build time.

## Environment Configuration

**Required at build time (enforced in `config-overrides.js`):**
- `API_HOSTNAME`, `REDIRECT_URI`, `ISSUER`, `CLIENT_ID`, `OKTA_TESTING_DISABLEHTTPSCHECK`

**Optional:**
- `SPA_CLIENT_ID` — Used if `CLIENT_ID` is unset (`config-overrides.js`).
- Root `testenv` — Optional dotenv-format file read only in `config-overrides.js` (do not commit secrets).
- `REACT_HTTPS_KEY`, `REACT_HTTPS_CERT` — Optional dev-server TLS file paths.

**Secrets location:**
- Okta client credentials and API base URL should be supplied through environment or `testenv` at build time; never commit values. `.env` / `testenv` files are gitignored patterns to verify locally (contents not documented here).

## Webhooks & Callbacks

**Incoming:**
- None in this SPA — no server routes. Okta **redirect** URI `/callback` is a client route, not a webhook endpoint.

**Outgoing:**
- None defined as webhooks — the app calls REST and opens SSE to the backend; any outbound webhooks would be backend-owned.

---

*Integration audit: 2026-04-13*
*Update when adding/removing external services*
