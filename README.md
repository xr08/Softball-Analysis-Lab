# Softball Analysis Lab

# Softball Analysis Lab

Softball Analysis Lab is a local-first video coding and analysis tool for individual softball player development.

The first use case is high-level batter analysis using pre-recorded video. The app will allow a coach or analyst to select a local video file, code key batter events, review timestamped moments, and export the coded data for coaching review.

## Current Project Stage

**Stage 5 — Pitcher Mode (VT-5)**

The app now allows a coach or analyst to:

* select a local MP4 video file
* enter a player name and session name
* play the video in the browser
* click batter tag buttons while watching to save timestamped events
* view a timeline of coded moments and click to seek
* capture structured context per pitch (count, pitch result, location, handedness, contact direction/quality, at-bat result)
* add or edit notes inline
* export the session as CSV and JSON
* **switch to Review Mode to filter and step through tagged events**
* filter by tag, pitch result, location, count, handedness, contact, result, or text
* navigate previous/next matching events with keyboard shortcuts
* play a pre-roll/post-roll clip for any single event
* run a playlist through all matching events automatically
* **switch to Reports Mode to view comprehensive session metrics**
* view automatic swing decisions, contact rates, zone heatmaps, and coding completeness
* load a secondary "Session B" to compare against the current session
* see absolute and percentage-point differences with deterministic warnings for low sample size

## Why This Project Exists

This project has started because there is a real need to support individual batter analysis for a high-level Australian softball player and coach.

The goal is to build the project in stages:

1. Basic local batter coding tool
2. Structured batter review
3. Exportable reports
4. Pitcher mode
5. Player library
6. Coach dashboard
7. Future club/team platform

The project should not jump ahead to the full club platform until the first local analysis workflow is working properly.

## Important Design Principle

The video file should not be changed or edited.

The app should save lightweight data against the video, such as:

* timestamp
* tag
* category
* player name
* session name
* note
* count
* pitch location
* contact quality
* result

The video remains local. The tagged analysis data can be exported separately.

## What We Are Not Building Yet

Do not add these features in VT-3:

* Supabase
* user login
* Google Drive API integration
* cloud video upload
* AI swing analysis
* automatic video clipping
* drawing tools
* pitcher mode
* team mode
* club dashboard
* public sharing
* payment/subscription features

These may be added later, but only after the local batter tagging MVP works.

## Review Mode

### Entering Review Mode

Click the **Review** tab in the top-right of the analysis page. The **Tagging** tab returns to the normal workflow.

### How Filters Combine

* Multiple groups (e.g. Pitch Result + Contact Quality) use **AND** logic — all conditions must match.
* Multiple values within one group (e.g. Swing + Swing and miss) use **OR** logic — any value matches.
* No filters selected → all events shown.
* "Clear all filters" resets to unfiltered.

### Previous / Next Navigation

Use the ← Previous and Next → buttons, or the keyboard shortcuts:

* **Left Arrow** — previous matching event
* **Right Arrow** — next matching event
* **Space** — play/pause video

Keyboard shortcuts only work in Review mode and are suppressed when focus is inside a form field, select, or text area.

### Pre-roll and Post-roll

Set the **Pre-roll** (0–10 seconds, default 2) and **Post-roll** (1–15 seconds, default 3) values in the Review Controls panel.

* **Play clip** — seeks to `max(0, event_timestamp − pre_roll)` and plays until `min(duration, event_timestamp + post_roll)`. Uses the video's `timeupdate` event as the boundary source of truth.
* The clip stops safely if playback buffers or lags.

### Playlist Playback

**Play all matching events** runs through every filtered event in timestamp order.

* Click **Stop review** to halt at any time.
* The playlist also stops automatically if filters change, mode switches, or the video is replaced.
* No overlapping timers or listeners are created.

### Current Limitations

* Clips are played from the locally connected video file — no clip is exported.
* Filter results depend entirely on manually tagged data.
* Missing structured values (null) are shown as "Not set" in summaries.
* Video must be reconnected after a page refresh or JSON import.

## International/ISC Standards Target

The long-term tagging matrix should support national-team and ISC-level analysis depth.

Planned model coverage includes:

* Pitch metrics and trajectory: pitch type taxonomy, pitch result, 9-zone grid plus 4 chase zones
* Batter context and spray: batter profile, hit trajectory, hit spray vector
* Elite slap-hitter matrix: slap variants, footwork style, legality flag
* Advanced mechanics and biomechanics: pitcher and hitter marker sets for scouting/review

These are being delivered progressively by stage rather than all at once.
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

## Features Added in Stage 4 (Reports)

Stage 4 delivered:
* **Session Report** — auto-generates comprehensive metrics (event overview, swing decisions, pitch results, zone heatmaps, and coding completeness) for a session.
* **Comparison Mode** — allows loading a secondary "Session B" for side-by-side metric comparison, calculating absolute and percentage-point differences.
* **Filter Inheritance** — comparison reports inherit review filters correctly, enabling "apples-to-apples" analysis.
* **Exports** — exports to CSV (which now includes `reportFormat` distinction) and Report JSON (with filters and report generation metadata, excluding video paths for privacy).

## Stage 1 Success Criteria

Stage 1 is complete only when:

* a local MP4 video can be selected
* the video plays in the browser
* player name and session name can be entered
* tag buttons save accurate timestamps
* the timeline displays coded events
* clicking a timeline event jumps the video back to that moment
* notes can be added or edited
* CSV export works
* JSON export works
* the CSV opens cleanly in Excel or Google Sheets

## How to Run the App Locally

Open the project folder in your coding tool, then run:

```bash
npm install
npm run dev
```

Then open:

```txt
http://localhost:3000
```

The analysis page should be:

```txt
http://localhost:3000/analyse
```

## Working Process

Use small steps.

Recommended workflow:

1. Open the repo in GitHub Desktop.
2. Open the same folder in Codex or Antigravity.
3. Ask the AI tool to read `PROJECT_PLAN.md`, `AI_WORKFLOW.md`, and `NEXT_STEP.md`.
4. Make one small change.
5. Test the app locally.
6. Commit the working change in GitHub Desktop.
7. Update `NEXT_STEP.md` when the task is complete.

Example commit messages:

* `Initial project setup`
* `Add local video player`
* `Add batter tag buttons`
* `Add timestamp timeline`
* `Add CSV and JSON export`
* `Add editable event notes`

## Privacy Rule

Do not commit private player footage, real player names, private reports, or sensitive coaching notes to the repository.

Use placeholder names such as:

* Player A
* Test Session
* sample-video.mp4

If real player data, reports, screenshots, or sample footage are ever added, the GitHub repository must remain private.

## AI Instructions

When using Codex, Antigravity, ChatGPT, Gemini, or GitHub Copilot, start with this instruction:

```txt
You are working on the softball-analysis-lab project.

Before making changes, read:
- PROJECT_PLAN.md
- AI_WORKFLOW.md
- NEXT_STEP.md
- .github/copilot-instructions.md

Then confirm:
1. What stage we are in.
2. What the current task is.
3. Which files you will edit.
4. Which features are out of scope.
5. What I should do after the change.

Do not assume I know where to go. Always tell me which app to open, which file to check, what command to run, how to test, and when to commit in GitHub Desktop.
```

## Long-Term Vision

The long-term vision is to grow from a local individual batter analysis tool into a broader coach and club-level video analysis platform.

Possible future features:

* pitcher analysis mode
* player profiles
* saved analysis sessions
* coach reports
* player trend tracking
* shared coach/player review
* team libraries
* club dashboard
* cloud database
* Google Drive or cloud video references
* private sharing
* full club video analysis workflow
* ESLint / static analysis configuration (deferred due to Next.js 15 flat config compat issues)

But the first goal is simple:

**Code one batter’s pre-recorded footage and produce one useful CSV export for a coach.**
