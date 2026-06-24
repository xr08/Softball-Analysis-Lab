# Restart Audit (Updated)

## Current State
The project has a Next.js App Router foundation. It is currently at **Stage 5 (VT-5)**. The goal is to provide a local-first batter and pitcher analysis tool without cloud video upload. 

## What Already Works
- **VT-1 (Durable Manual Batter Tagging Foundation):** Completed. Includes session identity, schema versioning, JSON import, local recovery (localStorage), debounced autosaving, event deletion, and 150+ tests.
- **VT-2 (Structured Batter Context):** Completed. Includes count, pitch location, contact direction, contact quality, and hit results tracking.
- **VT-3 (Review Mode):** Completed. Includes Tagging/Review toggle, Review Filters panel (AND across, OR within), playlist playback, and keyboard navigation.
- **VT-4 (Reports):** Completed. Includes Session Report, Comparison Mode, and data exports.
- **VT-5 (Pitcher Mode):** In progress. Initial schema changes (sessionType) have been laid down.

## Technical Debt Resolved
- **Tag Identity:** Tags now use stable IDs rather than display labels.
- **Testing:** 150 unit tests cover core review and reporting logic.

## Known Technical Debt
- **Linting:** ESLint is not currently configured. Next.js 15.5.19 deprecates `next lint` and attempting to use ESLint 9 flat config manually results in a circular structure bug with the `eslint-config-next` adapter. Lint configuration is deferred to a future maintenance milestone to avoid disproportionate setup scope.

## Privacy Concerns
- Local footage MUST NOT be committed to git.
- Strict `.gitignore` rules for video formats, exported sessions, and temporary files remain enforced.

## Recommended Next Milestone
**VT-5: Pitcher Mode.**
Complete the Pitcher Mode UI toggle and specific tags.

## What Should Not Be Built Yet
- Supabase integration, login, or cloud authentication.
- Google Drive API or direct integration.
- Full video uploads.
- AI analysis, tracking, or automated clip generation.
- Club dashboard, team mode, drawing tools.
