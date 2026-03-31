# Tasks: display-weeb-status

Implementation checklist. Complete in order; check off as done.

## Backend (node-tiwi)

- [x] Add dependencies: HTTP client (e.g. `axios` or `node-fetch`) and HTML parser (`cheerio`) if not already in node-tiwi.
- [x] Create `GET /api/weebAccountStatus` (or equivalent) that fetches https://weeb.tv/account (with optional cookies/headers from env or config).
- [x] Implement HTML parsing: extract the four fields (Free Account, Premium days left, Multi session, Local Service) using cheerio; centralize selectors and document expected page structure.
- [x] Add PL→EN translation map (e.g. "Tak"→"Yes", "Nie"→"No") and apply to values and labels; return JSON `{ freeAccount, premiumDaysLeft, multiSession, localService }` on success.
- [x] On fetch or parse failure, return appropriate error (4xx/5xx or 200 with `{ error }` / `{ unavailable: true }`).

## Frontend (tiwi-react)

- [x] Add API helper `getWeebAccountStatus(authState)` (e.g. in `src/service/api.js`) that calls the new backend endpoint.
- [x] Create `WeebAccountStatus` component: fetch on mount, show loading state (spinner or "Loading…") while fetching.
- [x] In `WeebAccountStatus`, render the four fields (Free Account, Premium days left, Multi session, Local Service) in a compact block when data is available; show "—" for null/not applicable (e.g. premium days).
- [x] In `WeebAccountStatus`, on error or unavailable response, show fallback (e.g. "Weeb status: Unavailable" or "—") and optional retry/refresh control.
- [x] Add optional manual refresh (e.g. refresh icon) that re-fetches and shows loading/error as above.
- [x] Integrate `WeebAccountStatus` in the navbar top-right: render it inside `AdminNavbarLinks.js` (or as sibling in the Navbar Toolbar) so it appears on all admin pages.

## Verification

- [x] Confirm loading state shows before any status fields; confirm error fallback when backend fails or returns error.
- [x] Confirm all four fields display with English labels and translated values; premium days shows number or "—" when not applicable.
