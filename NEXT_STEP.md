# Next Step

## Current Stage

Stage 5 — Pitcher Mode (VT-5)

VT-4 (Reports and Comparison) is complete.

## Build This Next — VT-5

Add a dedicated Pitcher Mode to allow coding and analyzing a pitcher's performance, complementing the existing batter analysis tools.

### Required outputs

* **Pitcher Mode Toggle** — allow switching between Batter Mode and Pitcher Mode on the analysis page.
* **Pitcher-Specific Tags** — update the tagging interface to support pitcher-specific events and taxonomy.
* **Pitcher Context Elements** — track metrics like arm slot, release point, velocity (if available manually), and pitch type (rise, drop, changeup, etc.).
* **Pitcher Review & Filtering** — extend the Review mode to filter by pitcher-specific metrics.
* **Pitcher Reports** — generate summary reports tailored to pitcher performance (e.g., strike percentage by pitch type, location heatmaps from pitcher's perspective).

### Expected pages and components

* Update `app/analyse/page.tsx` — add Pitcher Mode state and UI toggles.
* Update `lib/analysis/types.ts` — add pitcher-specific fields to `AnalysisEvent`.
* Update `components/analysis/ReportsPanel.tsx` — support pitcher report views.
* Update `components/analysis/ZoneHeatmap.tsx` — support pitcher perspective (if needed).

### Notes

* This is still local-first. No database, no Supabase, no AI.
* Pitcher data must be backward compatible or clearly separated from batter session schema (consider a `sessionType` field in session metadata).
* All new pure functions must be unit-tested.

## Do Not Build Now

Do not add:

* Supabase
* login
* Google Drive API
* cloud upload
* AI analysis
* club dashboard
* team mode
* drawing tools
* automatic video clipping
* computer vision tracking

## Testing Checklist

VT-5 is complete only when:

* Pitcher mode can be selected during session setup or dynamically.
* Pitcher-specific tags and context can be logged.
* Review mode successfully filters pitcher events.
* Pitcher reports render correctly.
* `npm run typecheck` passes
* `npm run test` passes
* `npm run build` passes

## After This Is Complete

Commit in GitHub Desktop with this message:

`feat: add VT-5 pitcher mode`

Then update this file to the next task.
