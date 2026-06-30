import { describe, expect, it } from "vitest";
import {
  buildNextAtBatState,
  buildNextPitchSelection,
  canClearPitcherSelection,
  canEditAtBatParticipants,
  getNextBatterId,
  getTimelineEventDisplayData,
  UNKNOWN_FIELDER_ID,
  UNKNOWN_PLAYER_LABEL,
  resolveTagAssignment
} from "../lib/analysis/workflow";
import { buildImportRestoreMessage, toCsv, toJson, parseImportedSession } from "../lib/analysis/export";
import { AtBat, Player, Session, TaggedEvent, VideoSource } from "../lib/analysis/types";
import { buildSessionReport, compareReports } from "../lib/analysis/reports";
import { updateVideoSourceDuration, upsertLocalVideoSource } from "../lib/analysis/session";

const session: Session = {
  id: "session-1",
  name: "Workflow Test",
  sessionType: "game",
  date: "2026-06-30",
  context: "Team A vs Team B",
  createdAt: "2026-06-30T00:00:00.000Z",
  updatedAt: "2026-06-30T00:00:00.000Z"
};

const players: Player[] = [
  { id: "pitcher-1", sessionId: session.id, name: "Pitcher One", teamSide: "teamB" },
  { id: "batter-1", sessionId: session.id, name: "Batter One", teamSide: "teamA" },
  { id: "batter-2", sessionId: session.id, name: "Batter Two", teamSide: "teamA" },
  { id: "fielder-1", sessionId: session.id, name: "Fielder One", teamSide: "teamB" }
];

const activeAtBat: AtBat = {
  id: "atbat-1",
  sessionId: session.id,
  batterId: "batter-1",
  pitcherId: "pitcher-1",
  batterTeamSide: "teamA",
  pitcherTeamSide: "teamB",
  startTimestampSeconds: 10,
  endTimestampSeconds: undefined
};

const videoSource: VideoSource = {
  id: "video-1",
  sessionId: session.id,
  fileName: "game-one.mp4",
  sourceType: "local_file",
  type: "main",
  durationSeconds: 123.45,
  addedAt: "2026-06-30T00:00:00.000Z"
};

function makeEvent(overrides: Partial<TaggedEvent> = {}): TaggedEvent {
  return {
    id: "event-1",
    sessionId: session.id,
    videoSourceId: null,
    atBatId: activeAtBat.id,
    timestampSeconds: 12,
    timestampLabel: "00:12.000",
    eventRole: "batter",
    playerId: "batter-1",
    relatedPlayerId: "pitcher-1",
    teamSide: "teamA",
    tag: "swing",
    category: "Swing Decision",
    note: "",
    pitchCount: null,
    pitchResult: null,
    pitchLocation: null,
    pitchType: null,
    contactType: null,
    contactQuality: null,
    playResult: null,
    source: "manual",
    reviewStatus: "none",
    createdAt: "2026-06-30T00:00:00.000Z",
    ...overrides
  };
}

describe("session workflow controls", () => {
  it("Next Pitch preserves pitcher, batter, and active at-bat while clearing fielder target", () => {
    const result = buildNextPitchSelection({
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      activeAtBatId: "atbat-1"
    });

    expect(result.currentPitcherId).toBe("pitcher-1");
    expect(result.currentBatterId).toBe("batter-1");
    expect(result.activeAtBatId).toBe("atbat-1");
    expect(result.selectedFielderId).toBeNull();
  });

  it("Next At-Bat ends the previous at-bat, starts the next one, and keeps the pitcher", () => {
    const result = buildNextAtBatState({
      sessionId: session.id,
      players,
      atBats: [activeAtBat],
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      activeAtBatId: "atbat-1",
      timestampSeconds: 25,
      newAtBatId: "atbat-2"
    });

    expect(result.currentPitcherId).toBe("pitcher-1");
    expect(result.currentBatterId).toBe("batter-2");
    expect(result.activeAtBatId).toBe("atbat-2");
    expect(result.atBats.find((atBat) => atBat.id === "atbat-1")?.endTimestampSeconds).toBe(25);
    expect(result.atBats.find((atBat) => atBat.id === "atbat-2")?.pitcherId).toBe("pitcher-1");
  });

  it("Next At-Bat can keep an unknown batter unresolved", () => {
    const result = buildNextAtBatState({
      sessionId: session.id,
      players,
      atBats: [activeAtBat],
      currentPitcherId: "pitcher-1",
      currentBatterId: null,
      activeAtBatId: "atbat-1",
      timestampSeconds: 31,
      newAtBatId: "atbat-unknown"
    });

    const nextAtBat = result.atBats.find((atBat) => atBat.id === "atbat-unknown");
    expect(result.currentPitcherId).toBe("pitcher-1");
    expect(result.currentBatterId).toBeNull();
    expect(nextAtBat?.batterId).toBeNull();
    expect(nextAtBat?.batterTeamSide).toBeNull();
  });

  it("allows pitcher and batter changes on a newly prepared empty at-bat", () => {
    expect(canEditAtBatParticipants("atbat-2", 0)).toBe(true);
  });

  it("locks pitcher and batter changes once the active at-bat has events", () => {
    expect(canEditAtBatParticipants("atbat-2", 1)).toBe(false);
  });

  it("does not allow clearing the pitcher once an active at-bat exists", () => {
    expect(canClearPitcherSelection("atbat-2")).toBe(false);
    expect(canClearPitcherSelection(null)).toBe(true);
  });

  it("Unknown Batter remains selectable after Next At-Bat", () => {
    const result = buildNextAtBatState({
      sessionId: session.id,
      players,
      atBats: [activeAtBat],
      currentPitcherId: "pitcher-1",
      currentBatterId: null,
      activeAtBatId: "atbat-1",
      timestampSeconds: 44,
      newAtBatId: "atbat-3"
    });

    expect(result.currentBatterId).toBeNull();
    expect(canEditAtBatParticipants(result.activeAtBatId, 0)).toBe(true);
  });

  it("current batter changes only through explicit batter advancement", () => {
    expect(getNextBatterId(players, "batter-1")).toBe("batter-2");
    expect(getNextBatterId(players, "batter-2")).toBe("batter-1");
  });
});

describe("role-based tag assignment", () => {
  it("pitcher tags link to the current pitcher", () => {
    const result = resolveTagAssignment({
      role: "pitcher",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: null,
      activeAtBatId: "atbat-1"
    });

    expect(result).toMatchObject({
      ok: true,
      eventRole: "pitcher",
      playerId: "pitcher-1",
      relatedPlayerId: "batter-1",
      teamSide: "teamB",
      atBatId: "atbat-1"
    });
  });

  it("batter tags link to the current batter", () => {
    const result = resolveTagAssignment({
      role: "batter",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: null,
      activeAtBatId: "atbat-1"
    });

    expect(result).toMatchObject({
      ok: true,
      eventRole: "batter",
      playerId: "batter-1",
      relatedPlayerId: "pitcher-1",
      teamSide: "teamA"
    });
  });

  it("batter tags can stay linked to Unknown Batter without inventing a player", () => {
    const result = resolveTagAssignment({
      role: "batter",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: null,
      selectedFielderId: null,
      activeAtBatId: "atbat-1"
    });

    expect(result).toMatchObject({
      ok: true,
      eventRole: "batter",
      playerId: null,
      relatedPlayerId: "pitcher-1",
      teamSide: null,
      atBatId: "atbat-1"
    });
  });

  it("fielder tags require a selected fielder or explicit Unknown Fielder", () => {
    const result = resolveTagAssignment({
      role: "fielder",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: null,
      activeAtBatId: "atbat-1"
    });

    expect(result).toEqual({
      ok: false,
      reason: "Select a fielder or Unknown Fielder before adding fielder tags."
    });
  });

  it("unknown fielder tags stay unresolved instead of attaching to another player", () => {
    const result = resolveTagAssignment({
      role: "fielder",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: UNKNOWN_FIELDER_ID,
      activeAtBatId: "atbat-1"
    });

    expect(result).toMatchObject({
      ok: true,
      eventRole: "fielder",
      playerId: null,
      relatedPlayerId: "batter-1",
      teamSide: null
    });
  });

  it("fielder tags do not silently attach to the pitcher or batter", () => {
    const result = resolveTagAssignment({
      role: "fielder",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: "fielder-1",
      activeAtBatId: "atbat-1"
    });

    expect(result).toMatchObject({
      ok: true,
      eventRole: "fielder",
      playerId: "fielder-1",
      relatedPlayerId: "batter-1",
      teamSide: "teamB"
    });
  });

  it("review tags preserve role and active at-bat while staying manually sourced", () => {
    const assignment = resolveTagAssignment({
      role: "review",
      players,
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      selectedFielderId: null,
      activeAtBatId: "atbat-1"
    });

    expect(assignment).toMatchObject({
      ok: true,
      eventRole: "review",
      playerId: "batter-1",
      relatedPlayerId: "pitcher-1",
      teamSide: "teamA",
      atBatId: "atbat-1"
    });
  });
});

describe("workflow export preservation", () => {
  it("JSON export preserves players, at-bats, and role-based events", () => {
    const json = toJson(session, players, [], [activeAtBat], [
      makeEvent({ id: "event-1", eventRole: "pitcher", playerId: "pitcher-1", tag: "fastball" })
    ]);
    const parsed = parseImportedSession(json);

    expect(parsed.players).toHaveLength(4);
    expect(parsed.atBats).toHaveLength(1);
    expect(parsed.events[0].eventRole).toBe("pitcher");
    expect(parsed.events[0].playerId).toBe("pitcher-1");
  });

  it("selecting a local video creates videoSources metadata without raw data", () => {
    const sources = upsertLocalVideoSource([], session.id, "game-one.mp4");

    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({
      sessionId: session.id,
      fileName: "game-one.mp4",
      sourceType: "local_file",
      type: "main"
    });
    expect(JSON.stringify(sources[0])).not.toContain("data:video");
  });

  it("updates local video duration after metadata loads", () => {
    const sources = upsertLocalVideoSource([], session.id, "game-one.mp4");
    const updated = updateVideoSourceDuration(sources, sources[0].id, 88.25);

    expect(updated[0].durationSeconds).toBe(88.25);
  });

  it("does not create a new videoSources array when duration metadata is unchanged", () => {
    const sources = [videoSource];
    const unchanged = updateVideoSourceDuration(sources, videoSource.id, videoSource.durationSeconds!);

    expect(unchanged).toBe(sources);
  });

  it("selecting a different local video updates the main local video source", () => {
    const sources = upsertLocalVideoSource([], session.id, "game-one.mp4");
    const updated = upsertLocalVideoSource(sources, session.id, "game-two.mp4");

    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(sources[0].id);
    expect(updated[0].fileName).toBe("game-two.mp4");
  });

  it("JSON import preserves unknown/null player events", () => {
    const json = toJson(session, players, [], [activeAtBat], [
      makeEvent({ id: "unknown-batter", eventRole: "batter", playerId: null, teamSide: null, tag: "take" }),
      makeEvent({ id: "unknown-fielder", eventRole: "fielder", playerId: null, teamSide: null, tag: "error" })
    ]);
    const parsed = parseImportedSession(json);

    expect(parsed.events[0].playerId).toBeNull();
    expect(parsed.events[1].eventRole).toBe("fielder");
    expect(parsed.events[1].playerId).toBeNull();
  });

  it("JSON export includes videoSources fileName and safe local metadata", () => {
    const json = toJson(session, players, [videoSource], [activeAtBat], []);
    const parsed = JSON.parse(json);

    expect(parsed.videoSources).toEqual([
      {
        id: "video-1",
        sessionId: session.id,
        fileName: "game-one.mp4",
        sourceType: "local_file",
        type: "main",
        durationSeconds: 123.45,
        addedAt: "2026-06-30T00:00:00.000Z"
      }
    ]);
    expect(json).not.toContain("data:video");
    expect(json).not.toContain("blob:");
  });

  it("JSON import restores videoSources metadata", () => {
    const parsed = parseImportedSession(toJson(session, players, [videoSource], [activeAtBat], []));

    expect(parsed.videoSources[0]).toMatchObject({
      fileName: "game-one.mp4",
      sourceType: "local_file",
      durationSeconds: 123.45
    });
  });

  it("CSV export includes timeline sorting display data and at-bat context", () => {
    const csv = toCsv(session, players, [activeAtBat], [
      makeEvent({ id: "event-1", timestampSeconds: 20, playerId: "batter-1" })
    ]);

    expect(csv.split("\n")[0]).toContain("atBatId");
    expect(csv).toContain("Batter One");
    expect(csv).toContain("Pitcher One");
    expect(csv).toContain("atbat-1");
  });

  it("CSV export labels unresolved players without creating a player record", () => {
    const csv = toCsv(session, players, [activeAtBat], [
      makeEvent({ id: "unknown-batter", eventRole: "batter", playerId: null, teamSide: null })
    ]);

    expect(csv).toContain('"Unknown Player"');
    expect(csv).toContain('""');
  });

  it("normalizes schema 2.0 comparison sessions with missing optional arrays", () => {
    const parsed = parseImportedSession(JSON.stringify({
      schemaVersion: "2.0",
      session,
      events: [makeEvent({ id: "comparison-event", playerId: null, teamSide: null })]
    }));

    const reportA = buildSessionReport(session, [], "2026-06-30T00:00:00.000Z");
    const reportB = buildSessionReport(parsed.session, parsed.events, "2026-06-30T00:00:00.000Z");
    const comparison = compareReports(reportA, reportB);

    expect(parsed.players).toEqual([]);
    expect(parsed.atBats).toEqual([]);
    expect(comparison.sessionB.totalEvents).toBe(1);
  });

  it("import restore message quotes the original local video filename when known", () => {
    const parsed = parseImportedSession(toJson(session, players, [videoSource], [activeAtBat], []));

    expect(buildImportRestoreMessage("session-events.json", parsed)).toBe(
      "Imported session-events.json. To resume playback, re-select the original local video file: game-one.mp4."
    );
  });

  it("import restore message avoids confusing unknown text when no video filename exists", () => {
    const parsed = parseImportedSession(toJson(session, players, [], [activeAtBat], []));

    expect(buildImportRestoreMessage("session-events.json", parsed)).toBe(
      "Imported session-events.json. To resume playback, re-select the original local video file used for this session."
    );
  });
});

describe("timeline workflow display data", () => {
  it("keeps role, player, team, and at-bat status clear for timeline rows", () => {
    const display = getTimelineEventDisplayData(
      makeEvent({ eventRole: "fielder", playerId: "fielder-1", relatedPlayerId: "batter-1", teamSide: "teamB" }),
      players,
      [activeAtBat]
    );

    expect(display).toEqual({
      role: "fielder",
      playerName: "Fielder One",
      relatedPlayerName: "Batter One",
      teamLabel: "Team B",
      atBatLabel: "atbat-1",
      atBatStatus: "active"
    });
  });

  it("labels unknown player events clearly", () => {
    const display = getTimelineEventDisplayData(
      makeEvent({ eventRole: "fielder", playerId: null, relatedPlayerId: null, teamSide: null }),
      players,
      [activeAtBat]
    );

    expect(display.playerName).toBe("Unknown Player");
    expect(display.relatedPlayerName).toBe("None");
    expect(display.teamLabel).toBe("No team");
  });

  it("uses the shared unknown player label when a player id cannot be resolved", () => {
    const display = getTimelineEventDisplayData(
      makeEvent({ eventRole: "fielder", playerId: "missing-player", relatedPlayerId: "missing-related" }),
      players,
      [activeAtBat]
    );

    expect(display.playerName).toBe(UNKNOWN_PLAYER_LABEL);
    expect(display.relatedPlayerName).toBe(UNKNOWN_PLAYER_LABEL);
  });

  it("uses the shared unknown player label for unresolved related players in CSV export", () => {
    const csv = toCsv(session, players, [activeAtBat], [
      makeEvent({ id: "event-missing-related", relatedPlayerId: "missing-related" })
    ]);

    expect(csv).toContain(`"${UNKNOWN_PLAYER_LABEL}"`);
  });
});
