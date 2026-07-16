# Next Step

## Current Stage

VT-5 close-out: complete the multi-video and team-role workflows.

The session-based foundation is working: Game, Player, and Training modes; multiple players; Team A / Team B assignments; pitcher, batter, fielder, and review tags; pitch coding; at-bats; grouped timeline; review; reports; recovery; and exports.

## Build Next

### 1. Multi-video session workflow

The schema can retain video-source metadata, but the UI currently connects and plays one `main` MP4 at a time.

Required behavior:

* add and retain more than one local video source in a session
* select the active source without replacing other sources
* link every new event to the active video source
* reconnect imported video sources by filename without storing local paths
* define deterministic ordering for events across video sources
* make review playback select the correct source before seeking
* preserve compatibility with existing single-video exports

Do not create a combined virtual timeline until source-specific event playback is reliable.

### 2. Team-role tagging

`EventRole` includes `team`, but the manual workflow currently supports pitcher, batter, fielder, and review roles only.

Required behavior:

* add intentional team tag definitions rather than reusing player tags
* select Team A or Team B when applying a team tag
* store the selected team without inventing a player ID
* show the team clearly in timeline and review displays
* include team attribution in CSV/JSON export and import
* cover assignment, validation, rendering data, and backward compatibility with pure-function tests

Runner-role tagging remains out of scope unless it is separately designed.

## Completion Checklist

VT-5 is complete when:

* sessions can retain and reconnect multiple local video files
* events play against their correct source video
* team tags can be assigned to Team A or Team B and survive export/import
* existing single-video exports remain compatible
* the workflow remains manual-first and local-first
* `npm run typecheck` passes
* `npm run test` passes
* `npm run build` passes
* the app receives a manual browser smoke test

## Deferred

Do not add Supabase, login, cloud storage, Google Drive integration, AI tagging, computer vision, overlays, historical club dashboards, or public sharing during this milestone.

After VT-5, schedule lint/format tooling and further decomposition of the analysis-page controller before starting the Player Library milestone.
