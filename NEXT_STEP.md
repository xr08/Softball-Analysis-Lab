# Next Step

## Current Stage

Stage 4 — Session Reports and Comparison Views (VT-4)

VT-3 (Review Mode and Filtered Playback) is complete.

## Build This Next — VT-4

Add a session report view that summarises a completed tagged session and can be exported or printed.

### Required outputs

* **Session summary** — player, date, opponent, total events, event count by category
* **Pitch result summary** — counts and percentages for each pitch result
* **Count distribution** — how often events were tagged in each count
* **Contact quality summary** — hard/medium/weak breakdown
* **At-bat result summary** — outcome distribution
* **Coach note export** — all tagged notes in one readable list
* **Exportable HTML or printable page** — coach can print the summary

### Expected pages and components

* New page: `/analyse/report` — session report view
* `components/analysis/ReportSection.tsx` — reusable report block
* `lib/analysis/report.ts` — pure helper functions for generating summary data from events

### Notes

* This is still local-first. No database, no Supabase, no AI.
* Report data must be derived only from the exported JSON session or the current in-memory session.
* The report page should be reachable from the analyse page with a "Generate Report" button.
* All report functions must be unit-tested.

## Do Not Build Now

Do not add:

* Supabase
* login
* Google Drive API
* cloud upload
* AI analysis
* pitcher mode
* club dashboard
* team mode
* drawing tools
* automatic highlight clips
* multi-session comparison (later stage)

## Testing Checklist

VT-4 is complete only when:

* Session report page is accessible from `/analyse`
* All summary sections render correctly
* Report data is derived from actual event data (no hard-coded values)
* Exportable/printable version works
* `npm run typecheck` passes
* `npm run test` passes
* `npm run build` passes

## After This Is Complete

Commit in GitHub Desktop with this message:

`feat: add VT-4 session report and summary view`

Then update this file to the next task.
