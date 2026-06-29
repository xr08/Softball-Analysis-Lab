# Next Step

## Current Stage

Session-based multi-player manual tagging foundation.

VT-4 (Reports and Comparison) is complete.

## Build This Next

Update the core architecture to support a session-based workflow instead of the old one-video/one-player model.

### Required outputs

* **Session Modes** — Support Game, Player, and Training modes.
* **Team Tracking** — Support Team A / Team B (not Home / Away) in Game mode.
* **Multiple Videos & Players** — Allow a session to contain multiple players and one or more videos.
* **Role-Based Tagging** — Tags must be linked to the correct role: pitcher, batter, fielder, team, or review.
* **At-Bat Grouping** — At-bats must become important objects linking batter, pitcher, teams, and timestamps.
* **Manual-First MVP** — Ensure manual tagging remains the primary workflow. AI, automatic detection, cloud storage, and overlays remain future work.

### Expected pages and components

* Update session and event schema to support multiple videos, multiple players, roles, and at-bats.
* Update UI forms to support Game, Player, and Training mode creation.
* Update tagging interface to link tags to specific roles and at-bats.

### Notes

* This is still local-first. No database, no Supabase, no cloud storage, no AI tagging.
* Data schema must be backward compatible with existing single-player/single-video exports.
* All new pure functions must be unit-tested.

## Do Not Build Now

Do not add:

* Supabase
* login
* Google Drive API
* cloud upload / storage
* Google Drive integration
* AI, automatic detection, or computer vision tracking
* overlays and drawing tools
* full historical reports
* club dashboard

## Deferred Maintenance Tasks

* **ESLint Configuration** — Adding `eslint` and `eslint-config-next` has been deferred because Next.js 15.5.19 deprecates `next lint` and transitioning to ESLint 9+ flat config natively creates a known circular dependency bug with the current `eslint-config-next` adapter. This is scheduled for the next major milestone after VT-5.

## Testing Checklist

This milestone is complete only when:

* Sessions can be created as Game, Player, or Training modes.
* A session can contain multiple players and multiple videos.
* Tags are properly linked to roles (pitcher, batter, fielder, team, review) and grouped by at-bats.
* The workflow remains manual-first and local-first.
* `npm run typecheck` passes
* `npm run test` passes
* `npm run build` passes

## After This Is Complete

Commit in GitHub Desktop with this message:

`feat: add session-based multi-player manual tagging foundation`

Then update this file to the next task.
