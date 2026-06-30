import { describe, expect, it } from "vitest";
import {
  buildNextAtBatState,
  buildNextPitchSelection,
  getNextBatterId,
  getTimelineEventDisplayData,
  resolveTagAssignment
} from "../lib/analysis/workflow";
import { toCsv, toJson, parseImportedSession } from "../lib/analysis/export";
import { AtBat, Player, Session, TaggedEvent } from "../lib/analysis/types";

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

  it("fielder tags require a selected fielder", () => {
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
      reason: "Select a fielder before adding fielder tags."
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

  it("CSV export includes timeline sorting display data and at-bat context", () => {
    const csv = toCsv(session, players, [activeAtBat], [
      makeEvent({ id: "event-1", timestampSeconds: 20, playerId: "batter-1" })
    ]);

    expect(csv.split("\n")[0]).toContain("atBatId");
    expect(csv).toContain("Batter One");
    expect(csv).toContain("Pitcher One");
    expect(csv).toContain("atbat-1");
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
});
