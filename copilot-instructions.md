# Codex Project Instructions - Video Tag and Analysis

You are the implementation agent for the Video Tag and Analysis Program.

## Product direction
Build a dependable session-based, multi-player, manual-first manual tagging and coaching-review MVP.

Prioritise:
- Import or reference one or more local videos per session (Google Drive is future work).
- Create sessions (Game / Player / Training modes), athletes, clips, and tags.
- For Game mode, use Team A / Team B (not Home / Away).
- Manually tag events linked to roles (batter, pitcher, fielder, team, review) and track at-bats.
- Jump to tagged moments.
- Add coaching notes and classifications.
- Filter, review, compare, and export useful tagged clips.
- Preserve original video and avoid unnecessary duplication.

Do not make these MVP prerequisites:
- Automatic player detection
- Automatic swing or pitch recognition
- Pose or biomechanical analysis
- Ball tracking
- Automatic release-point or swing alignment
- Paid computer-vision APIs
- Cloud-scale transcoding

Advanced analysis may be explored later without destabilising the manual workflow.

Important future capability:
- Pitchers: align repeated pitches by release point and overlay body/ball movement.
- Batters: align repeated swings by stance, load, or pitch arrival and compare load, stride, contact, and follow-through.

Preserve timestamps, anchors, clips, athlete identity, camera metadata, and annotations needed for this later feature.

## Product rules
- Manual-first, automation-ready.
- Never present an automated guess as a verified event.
- Keep suggestions editable, attributable, and reviewable.
- Never modify original footage.
- Store source metadata, references, clips, thumbnails, notes, and derived artifacts separately.
- Use stable IDs and an explicit canonical timestamp unit.
- Avoid unnecessary re-encoding, upload, duplication, and paid services.
- Treat athlete footage and coaching notes as private.

## How to work
Use enough context to complete the requested workflow, but do not scan unrelated folders.

At task start:
1. Read project status, architecture notes, and current milestone.
2. Inspect named files and the immediate video/data flow.
3. Search related models, player components, persistence, routes, tests, and conventions.
4. Expand only where the change crosses boundaries.
5. Identify whether the task is MVP work or an advanced-analysis experiment.

Modes:

### Playback or tagging bug
- Reproduce or trace the interaction.
- Inspect player state, timestamps, handlers, persistence, and reload behaviour.
- Make the smallest coherent fix.
- Add a focused regression test.
- Verify the real interaction.

### Bounded MVP feature
- Follow model -> storage -> service/API -> UI -> tests, as applicable.
- Implement the complete user workflow.
- Consider repeated tagging, keyboard use, and realistic video length.
- Do not add unrequested automation.

### Data-model change
Check impact on:
- video source identity
- athlete and session identity
- timestamps/timebase
- tag definitions
- clip ranges
- notes
- comparison anchors
- derived artifacts
- import/export compatibility

Use migrations or compatibility handling when existing data may be affected.

### Advanced-analysis experiment
- Keep it isolated from the stable MVP.
- Use reproducible inputs and outputs.
- Record library/model versions and parameters.
- Measure accuracy and failure modes.
- Prefer local and open-source tools.
- Do not merge into the core path until useful and reliable.

## Technical guardrails
- Use one documented timestamp unit.
- Avoid floating-point drift where frame accuracy matters.
- Account for variable frame rate where exact frame mapping is needed.
- Do not assume common codec, frame rate, resolution, orientation, duration, or camera angle.
- Validate clip ranges strictly.
- Do not load full large videos into memory.
- Cache thumbnails, metadata, proxies, and derived artifacts.
- Keep local and Drive-backed sources abstracted.
- Support missing or moved media with a recoverable relink flow.
- Never expose local paths, secrets, signed URLs, or footage publicly by default.

A tag/event should support:
- video and session
- linked role (pitcher, batter, fielder, team, or review)
- at-bat context (linking batter, pitcher, teams, and timestamps)
- tag type
- timestamp or range
- optional frame reference
- optional sequence grouping
- notes
- author/source
- confidence or review state for future automation
- optional alignment anchor

## UI expectations
Make it easy to:
1. Open a video/session.
2. Confirm athlete and role.
3. Play, pause, seek, frame-step, and adjust speed.
4. Add a point tag or time range.
5. Add notes without losing position.
6. Review tags on a list or timeline.
7. Filter and jump to tags.
8. Edit or delete tags.
9. Compare selected clips where implemented.
10. Preserve work automatically or show save state clearly.

## Verification
Before completion:
- Run focused tests and the broader affected suite.
- Run typecheck, lint, and build checks used by the repo.
- Verify playback/tagging in a real browser where tooling permits.
- Check timestamp persistence after reload.
- Check edit/delete behaviour.
- Check invalid ranges and missing-video handling when affected.
- Test realistic footage where performance matters.
- Review the final diff for scope creep.

Do not claim video behaviour works only because unit tests pass when interactive verification is possible.

## Completion report
Report:
- Scope
- Findings
- Implemented changes
- Verification
- Intentionally deferred advanced work

A task is done only when the coaching workflow works, original footage is preserved, timestamps persist correctly, errors are recoverable, relevant tests pass, and the change remains compatible with future repeated swing/pitch comparison.

Default priority:
1. Useful coaching workflow
2. Video and timestamp correctness
3. Source preservation and privacy
4. Maintainable future comparison foundations
5. Realistic performance
6. Low or zero operating cost
7. Efficient context use
