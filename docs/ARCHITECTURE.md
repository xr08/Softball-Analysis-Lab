# Architecture Decisions

We are following a staged architectural progression.

## Stage 1 — Local manual analysis (Current)
- Video remains on local disk, selected via browser file input.
- No video is uploaded or committed to Git.
- Manual timestamp tagging with structured batter observations.
- Local crash recovery via `localStorage`.
- Durable session storage via CSV and versioned JSON exports.
- No required database. No AI calls.

## Stage 2 — Reliable session persistence (Future consideration)
- Although `localStorage` is used in Stage 1 for basic recovery, we may evaluate IndexedDB if we later need to store many saved sessions, thumbnails, or complex searchable local records in-browser.

## Stage 3 — Private cloud metadata
- Prepare for Supabase authentication.
- Sync player records, analysis sessions, tag events, and coach reports to the cloud.
- Keys must use modern conventions: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`.

## Stage 4 — Google Drive video references
- Keep Google Drive optional.
- Store a reference (`drive_file_id`, `drive_web_url`, `video_filename`) alongside the session instead of uploading/copying the large video file itself.
- Local playback acts as the fallback.

## Stage 5 — AI-assisted analysis
- Use a provider-neutral interface (OpenAI, Gemini).
- Machine-generated data acts as "evidence" only and requires human approval before becoming canonical analysis data.
- The first AI feature should be report generation from approved structured tags, not raw video analysis.

## Stage 6 — Computer vision
- Heavy computer vision tasks (pitch-speed estimation, repeated swing alignment, tracking) must be handled by a separate worker/research area outside the main Next.js UI.

## VT-3 Review State Architecture

Review state (filters, selected event, playlist index, playback status, pre/post-roll) is **ephemeral UI state** only.

- It is NOT written to `localStorage` under the session recovery key.
- It is NOT included in the JSON export (`ExportedSession` schema stays at version 1.1).
- It is NOT considered part of the canonical event/session data.
- If stored at all in the future, it must be under a separate, clearly-named preference key (not the session key).

### Playback boundary enforcement

VT-3 clip playback uses the video element's `timeupdate` event as the primary boundary signal, not a timer. A fallback `setTimeout` fires only if `timeupdate` is delayed (e.g., during buffering). Only one clip controller can be active at a time.

### Playlist state machine

VT-3 playlist mode is implemented as a sequential `async` loop (not a timer chain). Each clip must reach its endpoint before the next begins. The playlist is cancelled (and listeners cleaned up) on: filter change, mode change, video replacement, manual stop, session import/restore, or component unmount.

## VT-4 Reports Architecture

VT-4 introduces Session Reports and Comparisons with a strict functional separation between data processing and UI rendering.

### Pure Reporting Logic

All calculations for reports (e.g., `buildSessionReport`, `summarisePitchResults`, `buildComparisonWarnings`) are implemented as pure functions in `lib/analysis/reports.ts`. These functions:
- Never mutate the input `events` array or `session` metadata.
- Require explicit denominators for all percentage calculations, returning `null` when the denominator is zero (to prevent misleading `0%` metrics).
- Do not make HTTP calls or depend on external APIs/DOM.

### In-Memory Comparison State

Comparison logic ("Session B") is treated as an ephemeral overlay within `AnalysePage` React state.
- It is cleared explicitly when a new main session is imported, restored, or manually closed.
- It inherits filters from Review Mode automatically, ensuring equivalent subsets are compared.
- Comparison metrics are not saved back into the original `ExportedSession`. Only the final generated report can be exported as a distinct `Report JSON`.
