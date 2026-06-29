# Softball Analysis Lab — Project Plan

## Project Purpose

Softball Analysis Lab is a local-first, session-based, multi-player, manual-first softball/baseball video tagging system.

The app supports Game, Player, and Training modes. A session may contain multiple players and one or more videos, with tags linked to the correct role (pitcher, batter, fielder, team, review).

The app should allow the user to:

1. Create a session (Game, Player, or Training mode).
2. Set up Team A / Team B (for Game mode) and add one or more local video files.
3. Code events linking tags to roles (pitcher, batter, fielder, team, or review) and track at-bats.
4. Save timestamped events.
5. Review a timeline of tagged moments.
6. Click timeline events to jump back to the video moment.
7. Export the coded session as CSV and JSON.
8. Later generate a useful coaching summary.

## Core Principle

The video file should not be edited or changed during tagging.

The app should save lightweight metadata against the video, such as:

* timestamp
* tag name
* tag category
* role (pitcher/batter/fielder)
* at-bat context
* count
* pitch location
* contact quality
* result
* note

## Current Stage

Current stage: **Session-based multi-player manual tagging foundation**

VT-4 (Reports and Comparison) is now complete.

The project must stay local-first.

The video should stay on the user's local hard drive and should be selected through a browser file input.

## Stage 1 Scope (VT-1)

Stage 1 is complete and includes:

* local video file selection
* browser video playback
* session creation (Game / Player / Training)
* Team A / Team B tracking
* at-bat tracking and tag roles
* timestamp capture when a tag is clicked
* timeline list of tagged events
* click timeline event to seek video
* editable notes
* CSV export
* JSON export
* Local storage recovery for unfinished sessions
* Persistent tag IDs for stability
* Type-safe models with schema validation

## Stage 1 Initial Batter Tags

Use these initial tags:

* At-bat start
* Pitch seen
* Take
* Swing
* Swing and miss
* Foul
* Contact
* Hard contact
* Weak contact
* Line drive
* Ground ball
* Fly ball
* Hit
* Out
* Walk
* Strikeout
* Chased high
* Late swing
* Good decision
* Coach note

## Do Not Build Yet

Do not add these until later stages:

* Supabase
* login/authentication
* Google Drive API integration
* cloud video upload
* automatic video clipping
* AI, automatic detection, or AI tagging
* drawing tools/telestration or overlays
* cloud storage
* full historical reports
* club dashboard
* mobile app install/PWA
* public sharing
* payment/subscription features

## Future Stages

### Stage 2 — Structured Batter Context (Deferred to VT-2/Stage 3)

Add:

* count selector
* pitch location selector
* contact direction selector
* contact quality selector
* result selector
* filters above the timeline

### International/ISC Standards Matrix (Planned Coverage)

The long-term tagging model must support high-performance national team workflows and ISC-aligned coding depth.

#### Pitch Metrics and Trajectory

* Pitch Type: Pure Riseball (backspin), Dot-Spin Riseball (bullet), Turnover Dropball, Peel Dropball, Flip Changeup, Stiff-Wrist Changeup, Chute Changeup, Curveball, Screwball, Fastball
* Pitch Result: Ball, Strike Looking, Strike Swinging, Foul, Ball in Play
* Location Zone: 9-hole strike zone grid plus 4 chase zones (High, Low, Inside, Outside)

#### Batter Context and Spray

* Batter Profile: Batter ID, Handedness (Right, Left, Slapper), Order Position (1-9)
* Hit Trajectory: Grounder, Line Drive, Fly Ball, Pop Up, Flare, Bunt
* Hit Spray Vector: Line 3, Hole 3-4, 4, Hole 4-6, 6, Hole 5-6, 5, Line 5

#### Elite Slap-Hitter Matrix (Women's International Specific)

* Slap Variant: Power Slap, Soft Slap, Chop Slap, Drag Bunt, Fake Slap-to-Swing
* Footwork Style: Linear (forward attack) vs Lateral (deep box drop)
* Legality Flag: Valid Contact vs Foot-Out-of-Box Illegal Contact

#### Advanced Mechanics and Biomechanics

* Pitcher Mechanical Markers: Rubber Initial Stance, Drive Leap Distance (m), K-Posture Frame, Arm Slot Angle, Plant Foot Angle (degrees), Front-Side Resistance Block (Firm/Soft)
* Hitter Mechanical Markers: Temporal Load Frame-Count (Release to Toe-Touch), Hand Launch Separation, Vertical Bat Angle (VBA) at contact, Kinematic Sequence Order

#### Delivery Staging

* Stage 2 focus: count, pitch result, location zones, and initial batter context
* Stage 3-4 focus: spray, trajectory filters, review workflows, report outputs
* Stage 5+ focus: pitcher mode, advanced biomechanics, and expanded scouting detail

### Stage 3 — Review Mode (VT-3) ✅ Complete

Delivered:

* **Tagging/Review mode toggle** on the analysis page
* **Review Filters panel** — filter by tag (all 20 from registry), pitch result, location zone, count, batter handedness, contact direction/quality, at-bat result, text search
* **AND across groups, OR within group** filter logic, tested in 67 pure-function tests
* **Quick presets** — All Swings, Balls in Play, Hard Contact, Two-Strike Pitches, Hits, Outs (all using stable registry IDs and VT-2 values)
* **Previous/Next navigation** with keyboard shortcuts (← →, Space) — review-mode only, suppressed in form elements
* **Clip playback** using `timeupdate` as the boundary source of truth (fallback timer for buffering)
* **Playlist mode** — single state machine advances only after each clip finishes; cancels cleanly on stop, filter change, mode change, video replacement, or unmount
* **Timeline** updated: selected event highlighted, filtered/total count shown
* **ReviewSummary** panel with breakdown bars for pitch results, contact quality, and at-bat results
* **`lib/analysis/review.ts`** — 11 pure helper functions, fully tested
* **`__tests__/review.test.ts`** — 67 tests covering all filter, navigation, boundary, summary, and preset cases
* No schema change (stays at 1.1); no review state written to the exported session or recovery payload

### Stage 4 — Reports (VT-4) ✅ Complete

Delivered:

* **Session Report** — auto-generates comprehensive metrics (event overview, swing decisions, pitch results, zone heatmaps, and coding completeness) for a session.
* **Comparison Mode** — allows loading a secondary "Session B" for side-by-side metric comparison, calculating absolute and percentage-point differences.
* **Pure Reporting Logic** — report calculation is decoupled from React, fully tested with deterministic warnings for low sample sizes or completeness issues.
* **Filter Inheritance** — comparison reports inherit review filters correctly, enabling "apples-to-apples" analysis.
* **Exports** — exports to CSV (which now includes `reportFormat` distinction) and Report JSON (with filters and report generation metadata, excluding video paths for privacy).
* **UI Components** — `SessionReport`, `ComparisonReport`, `ZoneHeatmap` and a master `ReportsPanel` implemented with strict CSS and no external charting libraries.

### Stage 5 — Session-Based Multi-Player Tagging

Currently in progress.

### Stage 6 — Player Library and Database

Only after local exports prove the workflow is useful.

Possible future database:

* players
* videos
* sessions
* tag events
* tag templates
* coach reports

### Stage 7 — Cloud/Club Platform

Only after individual local analysis is proven.

Possible future features:

* Supabase login
* coach accounts
* player library
* team/club dashboard
* Google Drive or cloud video references
* shared reports
* club-wide tagging templates

## Privacy Rule

Do not upload private player footage, real player names, reports, or screenshots to public tools or public repositories unless permission has been given.

The GitHub repository should be private if it contains any real player data, exports, screenshots, reports, or sample footage.
