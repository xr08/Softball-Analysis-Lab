# Service and Cost Plan

Do not optimise solely for zero cost, but avoid uncontrollable usage-based billing. Rely on predictable, low-friction alternatives wherever possible.

## Supabase
- **Decision:** Prepare architecture; defer implementation.
- **Reason:** First prove the local workflow. When we adopt Supabase, use it strictly for metadata (users, sessions, tags, reports), not for storing raw multi-gigabyte video files.

## Google Drive
- **Decision:** Use manually for backup/sharing; defer OAuth integration.
- **Reason:** We will eventually store `drive_file_id` references alongside session metadata. Right now, use local disk for video to reduce friction.

## OpenAI API
- **Decision:** Defer runtime use.
- **Reason:** When we introduce AI, we will use it for lightweight text tasks (e.g., converting approved tag data into coaching summaries) to keep costs low. We will not send full private videos automatically.

## Gemini API
- **Decision:** Defer runtime use.
- **Reason:** Can be used later for long-context reviews of structured exports or specific multimodal experiments, keeping the architecture provider-neutral.

## Claude API
- **Decision:** Do not depend on it.
- **Reason:** Optional review tool if needed, but not a runtime dependency.

## Local Computer Vision
- **Decision:** Research later.
- **Reason:** Will be handled in a separate worker repository. Keep heavy dependencies out of the web UI.
