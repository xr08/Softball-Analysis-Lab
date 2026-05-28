# Softball Analysis Lab — Project Plan

## Project Purpose

Softball Analysis Lab is a local-first video coding and analysis tool for individual softball player development.

The first real use case is high-level batter analysis for a national-level Australian player and coach using pre-recorded video.

The app should allow the user to:

1. Select a local video file.
2. Enter a player name and session name.
3. Code batter events using tag buttons.
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
* player name
* session name
* count
* pitch location
* contact quality
* result
* note

## Current Stage

Current stage: **Stage 2 — Structured Batter Context**

The project must stay local-first.

The video should stay on the user's local hard drive and should be selected through a browser file input.

## Stage 1 Scope

Stage 1 must include:

* local video file selection
* browser video playback
* player name field
* session name field
* batter tag buttons
* timestamp capture when a tag is clicked
* timeline list of tagged events
* click timeline event to seek video
* editable notes
* CSV export
* JSON export

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

Do not add these until Stage 1 is complete and tested:

* Supabase
* login/authentication
* Google Drive API integration
* cloud video upload
* automatic video clipping
* AI swing analysis
* drawing tools/telestration
* pitcher mode
* team mode
* club dashboard
* mobile app install/PWA
* public sharing
* payment/subscription features

## Stage 1 Success Criteria

Stage 1 is only complete when:

* a local MP4 can be selected and played
* player name and session name can be entered
* tag buttons save accurate video timestamps
* timeline events appear in time order
* clicking a timeline event jumps back to that moment in the video
* notes can be added or edited
* CSV export works
* JSON export works
* exported CSV opens cleanly in Excel or Google Sheets

## Future Stages

### Stage 2 — Structured Batter Context

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

### Stage 3 — Review Mode

Add:

* filter by tag
* filter by count
* filter by result
* previous tagged event
* next tagged event
* simple review playlist behaviour

### Stage 4 — Reports

Add:

* session summary
* player trend summary
* coach note summary
* exportable report content

### Stage 5 — Pitcher Mode

Only after batter mode is useful.

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
