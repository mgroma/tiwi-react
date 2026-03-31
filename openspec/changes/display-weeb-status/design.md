# Design: display-weeb-status

## Overview

Show Weeb.tv account status in the top-right of the app (navbar). Data is obtained by scraping https://weeb.tv/account on the backend, then returned as JSON to the frontend with Polish→English translation applied.

## Architecture

### Data flow

1. **Backend (node-tiwi)**  
   New endpoint (e.g. `GET /api/weebAccountStatus`) that:
   - Fetches https://weeb.tv/account (with any required cookies/headers if the app uses a shared or configured Weeb session).
   - Parses the HTML (e.g. with `cheerio`) to extract the four fields: Free Account, Premium days left, Multi session, Local Service.
   - Applies a fixed PL→EN map for known values (e.g. "Tak" → "Yes", "Nie" → "No") and for field labels if needed.
   - Returns a JSON object, e.g.  
     `{ freeAccount, premiumDaysLeft, multiSession, localService }`  
     plus optional `error` or `unavailable` if the request or parse fails.

2. **Frontend (tiwi-react)**  
   - New API helper (e.g. `getWeebAccountStatus(authState)`) calling the new backend route.
   - New presentational component (e.g. `WeebAccountStatus`) that:
     - Calls the API on mount (and optionally on a refresh action).
     - Renders loading state while fetching.
     - Renders the four fields in a compact block (e.g. small list or badges) in the top-right.
     - On error or unavailable data, shows a clear fallback (e.g. "Weeb status: Unavailable" or "—") per spec.

3. **Placement**  
   Render the Weeb status in the **navbar (top-right)** so it is visible on all admin pages. Concretely:
   - Use the existing **Navbar** in `layouts/Admin.js`, which already includes **AdminNavbarLinks** on the right.
   - Add the Weeb status **inside** `AdminNavbarLinks.js` (or as a sibling before it in the Toolbar) so it appears in the top-right area next to Search/other links. Prefer a single, small block (e.g. compact list or icon + dropdown) to avoid crowding the header.

### Scraping and translation

- **HTML parsing**  
  Use a small, targeted parser (e.g. `cheerio` in node-tiwi) to find the account section and extract text for each of the four fields. Selectors should be based on the current structure of weeb.tv/account and documented or made easy to adjust if the page layout changes.

- **Translation**  
  - Implement a simple map for known Polish values → English (e.g. "Tak" → "Yes", "Nie" → "No").
  - Map any Polish field labels to the English labels required by the spec (Free Account, Premium days left, Multi session, Local Service).
  - If a value is not in the map, display it as-is to avoid hiding information; consider adding it to the map in a follow-up.

### Authentication / cookies (Weeb.tv)

- If weeb.tv/account requires a logged-in session, the backend request must send the same cookies or session the browser would use. Options:
  - **Option A:** Backend uses a configured cookie or token (e.g. env var) that represents a single “service” Weeb account, and the UI shows that account’s status.
  - **Option B:** The frontend passes a user-specific token/cookie to the backend, and the backend forwards it when fetching weeb.tv/account (user sees their own status). This requires a way to obtain that token (e.g. login flow or manual paste).
- If the page is public or the product decision is to start without auth, the first version can fetch without cookies and handle “login required” as an error/unavailable and show the fallback state.

## Component and API shape

- **Backend response (success)**  
  `{ freeAccount: "Yes"|"No", premiumDaysLeft: number | null, multiSession: "Yes"|"No", localService: "Yes"|"No" }`  
  Use `null` or a sentinel for “not applicable” (e.g. premium days when not premium).

- **Backend response (error)**  
  HTTP 4xx/5xx or 200 with body like `{ error: string }` or `{ unavailable: true }`. Frontend treats both as “unavailable” and shows the spec fallback.

- **Frontend component**  
  `WeebAccountStatus`: no props required beyond what’s needed for API auth. Fetches on mount; optional “Refresh” control. Renders loading spinner or “Loading…” then either the four fields or “Unavailable” / “—”.

## Error and loading behavior

- **Loading:** Show a single loading state (spinner or “Loading…”) for the whole block; do not show partial or empty fields.
- **Failure:** Show one clear fallback (e.g. “Weeb status: Unavailable” or “—”) and optionally a retry action.
- **Refresh:** Optional manual refresh (e.g. small refresh icon) to re-fetch; same loading/error behavior.

## Dependencies

- **node-tiwi:** Add HTTP client to fetch weeb.tv/account (e.g. `axios` or `node-fetch`) and HTML parser (e.g. `cheerio`) if not already present.
- **tiwi-react:** No new libs required if using existing `fetch`/API pattern; reuse existing auth (e.g. Okta) for calling the backend API only (backend may still need its own strategy for weeb.tv session as above).

## Risks and mitigations

- **Weeb.tv page change:** Selectors may break. Mitigation: centralize selectors and keep parsing logic in one place; document the expected page structure; consider a simple health check or log when parsing returns empty/unexpected data.
- **Rate limiting / blocking:** Avoid aggressive polling; fetch on load and on explicit refresh only.
- **Auth:** If Weeb requires login, document how cookies/tokens are provided and how they are passed to the backend so future changes are straightforward.
