# Softball Analysis Lab

Softball Analysis Lab is a local-first video coding and analysis tool for individual softball player development.

The first use case is high-level batter analysis using pre-recorded video. The app will allow a coach or analyst to select a local video file, code key batter events, review timestamped moments, and export the coded data for coaching review.

## Current Project Stage

**Stage 1 — Local Video Batter Tagging MVP**

The first version is intentionally simple.

It should allow the user to:

* select a local MP4 video file
* enter a player name
* enter a session name
* play the video in the browser
* click batter tag buttons while watching
* save timestamped events
* view a timeline of coded moments
* click a timeline event to jump back to that video moment
* add or edit notes
* export the session as CSV
* export the session as JSON

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

Do not add these features in Stage 1:

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

## Project Files to Read First

Before making changes, read these files:

* `PROJECT_PLAN.md`
* `AI_WORKFLOW.md`
* `NEXT_STEP.md`
* `.github/copilot-instructions.md`

These files explain the project direction, current task, AI workflow rules, and what is out of scope.

## Recommended Repo Structure

```txt
softball-analysis-lab/
  app/
    page.tsx
    analyse/
      page.tsx

  components/
    analysis/
      VideoPlayer.tsx
      TagPanel.tsx
      Timeline.tsx
      SessionDetails.tsx
      ExportButtons.tsx

  lib/
    analysis/
      tags.ts
      types.ts
      export.ts
      time.ts

  data/
    sample-session.json

  PROJECT_PLAN.md
  AI_WORKFLOW.md
  NEXT_STEP.md
  README.md
```

## Stage 1 Initial Batter Tags

The first version should include these batter tags:

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

But the first goal is simple:

**Code one batter’s pre-recorded footage and produce one useful CSV export for a coach.**
