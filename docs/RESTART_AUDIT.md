# Restart Audit

Updated: 16 July 2026

## Current State

Softball Analysis Lab is a local-first Next.js App Router application at VT-5 close-out. The core session-based coaching workflow works without a database or cloud video upload.

## Implemented

* Game, Player, and Training session modes
* multiple players with Team A / Team B assignments
* one actively connected local MP4, with video-source metadata in the session schema
* pitcher, batter, fielder, and review tag palettes
* structured pitch, count, location, contact, and outcome coding
* at-bat creation, closure, participant links, and grouped timeline display
* local recovery, versioned JSON import/export, CSV export, and event editing/deletion
* Review Mode filters, navigation, clips, and playlist playback
* session reports, comparisons, heatmaps, completeness warnings, and report exports
* 233 passing unit tests as of this audit

## VT-5 Gaps

* The UI replaces the active main video rather than retaining and switching among multiple local videos.
* Events do not yet carry a complete source-video playback workflow.
* `EventRole` reserves `team`, but team tags cannot yet be created and assigned to Team A or Team B through the manual tagging UI.
* `runner` is a reserved schema role, not an implemented workflow.

See `NEXT_STEP.md` for the acceptance criteria.

## Repository Health

* `npm test`: passing, 233 tests
* `npm run typecheck`: passing
* `npm run build`: passing
* ESLint and formatting checks are not configured
* the analysis-page controller remains large and should continue to be split into focused hooks/components

## Privacy Rules

* Local footage must never be committed to Git.
* Exported player/session data and real names must remain private unless sharing is explicitly approved.
* Video paths must not be persisted; reconnect local files by safe metadata such as filename.

## Next Milestone Boundary

Finish multi-video source playback and team-role tagging before beginning the Player Library or any cloud platform work. Supabase, authentication, Google Drive integration, AI tagging, computer vision, overlays, and club dashboards remain deferred.
