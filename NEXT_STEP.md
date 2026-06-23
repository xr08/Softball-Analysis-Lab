# Next Step

## Current Stage

Stage 3 — Structured Batter Context

## Deferred Task: VT-2 — Structured Batter Context

The original Stage 2 task was deferred so we could establish the durable tagging foundation first in VT-1. We are now ready to tackle VT-2.

Add pitch result selector and 13-zone location selector (9-zone strike grid + 4 chase zones), and include both in saved events, timeline, CSV, and JSON.

## Build This Next

Extend `/analyse` with:

* pitch result selector (Ball, Strike Looking, Strike Swinging, Foul, Ball in Play)
* location selector (9-zone grid + High/Low/Inside/Outside chase zones)
* event save updates to include pitch result and location
* timeline display updates for pitch result and location
* CSV export updates for pitch result and location columns
* JSON export updates for pitch result and location fields

## Do Not Build Now

Do not add:

* Supabase
* login
* Google Drive API
* cloud upload
* AI analysis
* pitcher mode
* club dashboard
* team mode
* drawing tools
* automatic highlight clips

## Testing Checklist

The next task is complete only when:

* I can run the app locally
* I can open `/analyse`
* I can choose pitch result before tagging
* I can choose location zone before tagging
* tagged events save pitch result and location correctly
* timeline entries show pitch result and location
* CSV includes pitch result and location columns
* JSON includes pitch result and location fields
* export files still work in this in-app browser workflow

## After This Is Complete

Commit in GitHub Desktop with this message:

`Add Stage 3 pitch result and location context`

Then update this file to the next task.
