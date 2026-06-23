# Restart Audit

## Current State
The project has a Next.js App Router foundation. It is currently at the beginning of its life cycle and is capable of local manual video tagging with CSV/JSON export. The goal is to provide a local-first batter analysis tool without cloud video upload. 

## What Already Works
- The application can be built and run using Next.js.
- Local MP4 video can be selected and played via a file input.
- Users can input a player name and session name.
- Tag buttons correctly capture timestamps.
- A timeline displays the coded events in order.
- Clicking an event in the timeline seeks the video back to that timestamp.
- Note fields on events are editable.
- Both CSV and JSON can be generated and exported locally.
- Basic API route for saving to the local project folder (`/exports`).

## Missing Pieces (To be built in Milestone VT-1)
- **Session Identity:** No stable session ID, creation date, opponent details, or schema versioning.
- **Event Deletion & Correction:** Events cannot currently be deleted from the timeline.
- **JSON Import:** No functionality to load a previously exported session.
- **Local Recovery:** No `localStorage` autosave/recovery mechanism to prevent data loss on page refresh.
- **Dirty State:** No warnings when closing the browser with unsaved work.
- **Robust Field Types:** Missing nullable fields (count, pitchLocation, contactDirection, contactQuality, result) required for proper schema stability.
- **Testing:** Zero test coverage (no Unit tests or end-to-end testing).

## Technical Debt
- **Tag Identity:** Tags currently rely on display labels which is brittle. We need stable IDs for tags.
- **Conflicting Milestones:** The previous `NEXT_STEP.md` directed work towards 13-zone location selectors before establishing safe, durable session management (VT-1). We are rectifying this by prioritizing VT-1 and deferring the zone selectors to VT-2.

## Privacy Concerns
- Local footage MUST NOT be committed to git.
- We must enforce strict `.gitignore` rules for video formats, exported sessions, and temporary files to prevent accidental leakage of real athlete names/data.

## Recommended Next Milestone
**VT-1: Durable Manual Batter Tagging Foundation.**
Includes session identity, schema versioning, JSON import, local recovery (localStorage), debounced autosaving, event deletion, and tests.

## What Should Not Be Built Yet
- Supabase integration, login, or cloud authentication.
- Google Drive API or direct integration.
- Full video uploads.
- AI analysis, tracking, or automated clip generation.
- Pitcher mode, club dashboard, team mode, drawing tools.
