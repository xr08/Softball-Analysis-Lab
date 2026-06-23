# Scoresheet Reuse Plan

This document outlines patterns and architectures from the related `Sport-Scoresheet-Analysis` project that we should adapt, reuse, or explicitly avoid in the Video Tag Program.

## A. Patterns to reuse now
- **Staged Project Documentation:** Using `PROJECT_PLAN.md`, `NEXT_STEP.md`, and architectural files to maintain a disciplined, milestone-driven approach.
- **Strict TypeScript Schemas:** Explicitly defining our models (`types.ts`) and relying on strong type checking. We must avoid implicit typing or assumptions in data boundaries.
- **Review Statuses:** The concept that human-approved analysis data is canonical, and anything else (AI or unreviewed tags) is merely evidence.
- **Deterministic Tests:** Preventing regressions in data processing and ensuring unreviewed data cannot mistakenly become canonical data.
- **Private Data Rules:** Strict boundaries around committing sensitive footage and real athlete data.

## B. Patterns to adapt later
- **Supabase Authentication:** Wait until the local app is stable, but use the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` environment variable naming conventions when the time comes.
- **Provider Interfaces:** Abstraction of models/AI vendors (OpenAI, Gemini) into generic providers that only offer "suggestions".
- **Review Queues:** Processing events that require human validation before being committed.
- **Private Storage / Signed URLs:** Eventually hosting videos securely, but not right now.

## C. Patterns not to copy directly
- **Scorecard OCR Models:** No Tesseract or vision dependencies needed here.
- **Canonical Stat Reconciliation:** We are not reconciling full box scores, only coding events.
- **Image-specific Upload Assumptions:** Video files are much larger and require different streaming/handling strategies compared to scorecard images.

## D. Shared future concepts
When building the cloud/database models, ensure compatibility with the Scoresheet project by aligning shared concepts:
- `sport`
- `player_id`
- `team_id`
- `match_id`
- `video_id`
- `analysis_session_id`
- `source_type`
- `source_file`
- `review_status`
- `model_name`
- `confidence`
- `approved_at`
