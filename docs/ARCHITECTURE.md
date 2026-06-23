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
