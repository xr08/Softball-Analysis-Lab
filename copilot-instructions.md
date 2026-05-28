# Copilot Instructions — Softball Analysis Lab

This is a local-first softball video coding tool.

Before suggesting or making changes, follow:

- PROJECT_PLAN.md
- AI_WORKFLOW.md
- NEXT_STEP.md

## Current Product Direction

The first product is not a full club platform.

It is a private local batter analysis tool for pre-recorded softball footage.

The app should allow the user to select a local video, code batter events, review a timestamped timeline, and export CSV/JSON.

## Current Stage

Stage 1 — Local Video Batter Tagging MVP.

## Do Not Add Yet

Do not add Supabase, authentication, Google Drive API, cloud uploads, pitcher mode, team mode, AI swing analysis, automatic clipping, drawing tools, or club dashboards unless NEXT_STEP.md says to.

## Code Style

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- simple readable components

Prefer small files and clear names.

## Expected Structure

Use this structure where practical:

- app/page.tsx
- app/analyse/page.tsx
- components/analysis/VideoPlayer.tsx
- components/analysis/TagPanel.tsx
- components/analysis/Timeline.tsx
- components/analysis/SessionDetails.tsx
- components/analysis/ExportButtons.tsx
- lib/analysis/tags.ts
- lib/analysis/types.ts
- lib/analysis/time.ts
- lib/analysis/export.ts

## User Support Rule

The user is not a professional programmer.

When giving instructions, always explain:

- which app to open
- which file to edit
- which command to run
- how to test
- when to commit in GitHub Desktop