import { describe, expect, it } from "vitest";
import {
  groupEventsByAtBat,
  formatAtBatHeaderLabel,
  formatPitchRowLabel,
  formatUngroupedLabel,
  formatCompactTime,
  formatTimeRange,
  AtBatGroup,
} from "../lib/analysis/timeline-grouping";
import { AtBat, Player, TaggedEvent } from "../lib/analysis/types";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

const SESSION_ID = "session-1";

const players: Player[] = [
  { id: "pitcher-1", sessionId: SESSION_ID, name: "Pitcher One", teamSide: "teamB" },
  { id: "batter-1", sessionId: SESSION_ID, name: "Batter One", teamSide: "teamA" },
  { id: "batter-2", sessionId: SESSION_ID, name: "Batter Two", teamSide: "teamA" },
];

function makeAtBat(overrides: Partial<AtBat> = {}): AtBat {
  return {
    id: "atbat-1",
    sessionId: SESSION_ID,
    batterId: "batter-1",
    pitcherId: "pitcher-1",
    batterTeamSide: "teamA",
    pitcherTeamSide: "teamB",
    startTimestampSeconds: 10,
    endTimestampSeconds: undefined,
    ...overrides,
  };
}

function makeEvent(overrides: Partial<TaggedEvent> = {}): TaggedEvent {
  return {
    id: "event-1",
    sessionId: SESSION_ID,
    videoSourceId: null,
    atBatId: "atbat-1",
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
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// formatCompactTime
// ---------------------------------------------------------------------------

describe("formatCompactTime", () => {
  it("formats zero seconds", () => {
    expect(formatCompactTime(0)).toBe("00:00");
  });

  it("formats sub-minute", () => {
    expect(formatCompactTime(42)).toBe("00:42");
  });

  it("formats minutes and seconds", () => {
    expect(formatCompactTime(84)).toBe("01:24");
  });

  it("formats with hours when >= 3600", () => {
    expect(formatCompactTime(3661)).toBe("1:01:01");
  });

  it("handles fractional seconds by flooring", () => {
    expect(formatCompactTime(84.9)).toBe("01:24");
  });

  it("handles negative by clamping to zero", () => {
    expect(formatCompactTime(-5)).toBe("00:00");
  });
});

// ---------------------------------------------------------------------------
// formatTimeRange
// ---------------------------------------------------------------------------

describe("formatTimeRange", () => {
  it("formats a closed range", () => {
    expect(formatTimeRange(84, 130)).toBe("01:24–02:10");
  });

  it("formats an open range with …", () => {
    expect(formatTimeRange(84)).toBe("01:24–…");
  });

  it("formats an open range when endSeconds is explicitly undefined", () => {
    expect(formatTimeRange(10, undefined)).toBe("00:10–…");
  });
});

// ---------------------------------------------------------------------------
// groupEventsByAtBat
// ---------------------------------------------------------------------------

describe("groupEventsByAtBat", () => {
  it("groups events with atBatId under matching at-bat", () => {
    const atBat = makeAtBat({ id: "ab-1", endTimestampSeconds: 25 });
    const event = makeEvent({ id: "e-1", atBatId: "ab-1", timestampSeconds: 15 });

    const result = groupEventsByAtBat([event], [atBat], players);

    expect(result.atBatGroups).toHaveLength(1);
    expect(result.atBatGroups[0].events).toHaveLength(1);
    expect(result.atBatGroups[0].events[0].id).toBe("e-1");
    expect(result.ungroupedEvents).toHaveLength(0);
  });

  it("puts events without atBatId in ungrouped", () => {
    const event = makeEvent({ id: "e-1", atBatId: null, timestampSeconds: 5 });

    const result = groupEventsByAtBat([event], [], players);

    expect(result.atBatGroups).toHaveLength(0);
    expect(result.ungroupedEvents).toHaveLength(1);
    expect(result.ungroupedEvents[0].id).toBe("e-1");
  });

  it("puts events referencing unknown atBatId in ungrouped", () => {
    const event = makeEvent({ id: "e-1", atBatId: "nonexistent-ab", timestampSeconds: 5 });

    const result = groupEventsByAtBat([event], [], players);

    expect(result.ungroupedEvents).toHaveLength(1);
    expect(result.ungroupedEvents[0].id).toBe("e-1");
  });

  it("sorts at-bat groups by startTimestampSeconds", () => {
    const ab1 = makeAtBat({ id: "ab-1", startTimestampSeconds: 30 });
    const ab2 = makeAtBat({ id: "ab-2", startTimestampSeconds: 10 });

    const result = groupEventsByAtBat([], [ab1, ab2], players);

    expect(result.atBatGroups[0].atBat.id).toBe("ab-2");
    expect(result.atBatGroups[1].atBat.id).toBe("ab-1");
    expect(result.atBatGroups[0].atBatIndex).toBe(1);
    expect(result.atBatGroups[1].atBatIndex).toBe(2);
  });

  it("sorts events within a group by timestampSeconds", () => {
    const atBat = makeAtBat({ id: "ab-1" });
    const e1 = makeEvent({ id: "e-1", atBatId: "ab-1", timestampSeconds: 20 });
    const e2 = makeEvent({ id: "e-2", atBatId: "ab-1", timestampSeconds: 15 });
    const e3 = makeEvent({ id: "e-3", atBatId: "ab-1", timestampSeconds: 18 });

    const result = groupEventsByAtBat([e1, e2, e3], [atBat], players);

    expect(result.atBatGroups[0].events.map((e) => e.id)).toEqual(["e-2", "e-3", "e-1"]);
  });

  it("sorts ungrouped events by timestampSeconds", () => {
    const e1 = makeEvent({ id: "e-1", atBatId: null, timestampSeconds: 20 });
    const e2 = makeEvent({ id: "e-2", atBatId: null, timestampSeconds: 5 });

    const result = groupEventsByAtBat([e1, e2], [], players);

    expect(result.ungroupedEvents.map((e) => e.id)).toEqual(["e-2", "e-1"]);
  });

  it("sets status to 'active' when atBat has no endTimestampSeconds", () => {
    const atBat = makeAtBat({ id: "ab-1", endTimestampSeconds: undefined });

    const result = groupEventsByAtBat([], [atBat], players);

    expect(result.atBatGroups[0].status).toBe("active");
  });

  it("sets status to 'ended' when atBat has endTimestampSeconds", () => {
    const atBat = makeAtBat({ id: "ab-1", endTimestampSeconds: 25 });

    const result = groupEventsByAtBat([], [atBat], players);

    expect(result.atBatGroups[0].status).toBe("ended");
  });

  it("handles empty events array", () => {
    const result = groupEventsByAtBat([], [], players);

    expect(result.atBatGroups).toHaveLength(0);
    expect(result.ungroupedEvents).toHaveLength(0);
  });

  it("handles multiple at-bats with distributed events", () => {
    const ab1 = makeAtBat({ id: "ab-1", startTimestampSeconds: 10, endTimestampSeconds: 30 });
    const ab2 = makeAtBat({ id: "ab-2", startTimestampSeconds: 35 });

    const e1 = makeEvent({ id: "e-1", atBatId: "ab-1", timestampSeconds: 15 });
    const e2 = makeEvent({ id: "e-2", atBatId: "ab-2", timestampSeconds: 40 });
    const e3 = makeEvent({ id: "e-3", atBatId: null, timestampSeconds: 3 });

    const result = groupEventsByAtBat([e1, e2, e3], [ab1, ab2], players);

    expect(result.atBatGroups).toHaveLength(2);
    expect(result.atBatGroups[0].events).toHaveLength(1);
    expect(result.atBatGroups[1].events).toHaveLength(1);
    expect(result.ungroupedEvents).toHaveLength(1);
  });

  it("resolves batter and pitcher names from players", () => {
    const atBat = makeAtBat({ id: "ab-1", batterId: "batter-1", pitcherId: "pitcher-1" });

    const result = groupEventsByAtBat([], [atBat], players);

    expect(result.atBatGroups[0].batterName).toBe("Batter One");
    expect(result.atBatGroups[0].pitcherName).toBe("Pitcher One");
  });

  it("uses Unknown Player for missing batter", () => {
    const atBat = makeAtBat({ id: "ab-1", batterId: null });

    const result = groupEventsByAtBat([], [atBat], players);

    expect(result.atBatGroups[0].batterName).toBe("Unknown Player");
  });

  it("old sessions with no atBatId on events render all as ungrouped", () => {
    const e1 = makeEvent({ id: "e-1", atBatId: null, timestampSeconds: 5 });
    const e2 = makeEvent({ id: "e-2", atBatId: null, timestampSeconds: 10 });

    const result = groupEventsByAtBat([e1, e2], [], players);

    expect(result.atBatGroups).toHaveLength(0);
    expect(result.ungroupedEvents).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// formatAtBatHeaderLabel
// ---------------------------------------------------------------------------

describe("formatAtBatHeaderLabel", () => {
  function makeGroup(overrides: Partial<AtBatGroup> = {}): AtBatGroup {
    return {
      atBat: makeAtBat({ id: "ab-1", startTimestampSeconds: 84, endTimestampSeconds: 130 }),
      atBatIndex: 3,
      batterName: "Batter One",
      pitcherName: "Pitcher One",
      timeRangeLabel: "01:24–02:10",
      status: "ended",
      events: [],
      ...overrides,
    };
  }

  it("produces the expected label format", () => {
    const label = formatAtBatHeaderLabel(makeGroup());

    expect(label).toBe("AB 3 · Batter One vs Pitcher One · 01:24–02:10");
  });

  it("handles unknown batter name", () => {
    const label = formatAtBatHeaderLabel(makeGroup({ batterName: "Unknown Player" }));

    expect(label).toBe("AB 3 · Unknown vs Pitcher One · 01:24–02:10");
  });

  it("handles unknown pitcher name", () => {
    const label = formatAtBatHeaderLabel(makeGroup({ pitcherName: "Unknown Player" }));

    expect(label).toBe("AB 3 · Batter One vs Unknown · 01:24–02:10");
  });

  it("shows open range for active at-bat", () => {
    const label = formatAtBatHeaderLabel(makeGroup({ timeRangeLabel: "01:24–…" }));

    expect(label).toBe("AB 3 · Batter One vs Pitcher One · 01:24–…");
  });
});

// ---------------------------------------------------------------------------
// formatPitchRowLabel
// ---------------------------------------------------------------------------

describe("formatPitchRowLabel", () => {
  it("includes all available fields", () => {
    const event = makeEvent({
      pitchCount: "1-1",
      pitchType: "rise",
      pitchResult: "called_strike",
      pitchLocation: "zone_5",
    });

    const label = formatPitchRowLabel(event, 2);

    expect(label).toBe("Pitch 2 · 1-1 · Rise · Called strike · Zone 5");
  });

  it("omits unknown fields rather than inventing", () => {
    const event = makeEvent({
      pitchCount: null,
      pitchType: null,
      pitchResult: null,
      pitchLocation: null,
    });

    const label = formatPitchRowLabel(event, 1);

    expect(label).toBe("Pitch 1");
  });

  it("includes contact info when present", () => {
    const event = makeEvent({
      pitchResult: "ball_in_play",
      contactQuality: "hard",
      contactType: "pull",
      playResult: "single",
    });

    const label = formatPitchRowLabel(event, 3);

    expect(label).toContain("Hard Pull");
    expect(label).toContain("Single");
  });

  it("includes pitch count when available", () => {
    const event = makeEvent({ pitchCount: "3-2" });

    const label = formatPitchRowLabel(event, 1);

    expect(label).toContain("3-2");
  });
});

// ---------------------------------------------------------------------------
// formatUngroupedLabel
// ---------------------------------------------------------------------------

describe("formatUngroupedLabel", () => {
  it("shows timestamp and tag", () => {
    const event = makeEvent({ timestampSeconds: 222, tag: "note" });

    const label = formatUngroupedLabel(event);

    expect(label).toContain("03:42");
    expect(label).toContain("note");
  });

  it("includes contact info when present", () => {
    const event = makeEvent({
      timestampSeconds: 100,
      tag: "swing",
      contactQuality: "hard",
      contactType: "pull",
    });

    const label = formatUngroupedLabel(event);

    expect(label).toContain("Contact: Hard Pull");
  });

  it("includes pitch result when present", () => {
    const event = makeEvent({
      timestampSeconds: 50,
      tag: "pitch",
      pitchResult: "called_strike",
    });

    const label = formatUngroupedLabel(event);

    expect(label).toContain("Called strike");
  });

  it("handles event with minimal data", () => {
    const event = makeEvent({
      timestampSeconds: 0,
      tag: "misc",
      pitchResult: null,
      contactType: null,
      contactQuality: null,
      playResult: null,
    });

    const label = formatUngroupedLabel(event);

    expect(label).toBe("00:00 · misc");
  });
});
