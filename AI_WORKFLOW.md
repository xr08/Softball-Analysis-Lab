# AI Workflow Instructions

## Purpose

These instructions are for Codex, Antigravity, GitHub Copilot, ChatGPT, Gemini, NotebookLM, and any other AI tool used on this project.

The user is not a professional software developer. Always give clear beginner-friendly instructions.

## Before Doing Any Work

Before making changes, read:

* PROJECT_PLAN.md
* NEXT_STEP.md
* AI_WORKFLOW.md
* .github/copilot-instructions.md

Then confirm:

1. What stage the project is currently in.
2. What task you are about to perform.
3. Which files you will create or edit.
4. Which files you will not touch.
5. What the user should do after the changes.

## Communication Rules

Always explain:

* which app/tool the user should open
* which file or folder the user should go to
* what command to run, if any
* where the change is happening
* how to test the change
* when to commit in GitHub Desktop

Do not assume the user knows where to go.

Use instructions like:

* "Open GitHub Desktop"
* "Open the softball-analysis-lab repo"
* "Open the file components/analysis/Timeline.tsx"
* "Run npm run dev in the terminal"
* "Open http://localhost:3000/analyse"
* "Commit this change in GitHub Desktop with the message: Add timeline seeking"

## Development Rules

Keep changes small.

Do not build ahead of the current stage.

Do not add Supabase, authentication, Google Drive API, cloud storage, AI, automatic detection, overlays, full historical reports, or club dashboard unless PROJECT_PLAN.md and NEXT_STEP.md say that stage has started.

Prefer simple readable code over clever code.

Use TypeScript.

Use clear component names.

Keep the app session-based, manual-first, and video local-first.

## GitHub Desktop Rule

After each working milestone, tell the user to commit.

Use clear commit messages, such as:

* Initial project setup
* Add local video player
* Add batter tag buttons
* Add timestamp timeline
* Add CSV and JSON export
* Add editable event notes

## Testing Rule

Every change should include a manual test checklist.

Example:

1. Run npm run dev.
2. Open http://localhost:3000/analyse.
3. Select a short MP4 video.
4. Click three tag buttons.
5. Confirm the timeline shows three events.
6. Click an event and confirm the video jumps to that timestamp.
7. Export CSV and open it in Excel or Google Sheets.

## Privacy Rule

Do not include real player footage, private player names, private coach notes, or real exports in the GitHub repository.

Use placeholders such as:

* Player A
* Test Session
* sample-video.mp4
