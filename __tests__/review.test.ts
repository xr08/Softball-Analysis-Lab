import { describe, it, expect } from "vitest";
import {
  ReviewFilters,
  emptyFilters,
  hasActiveFilters,
  applyPreset,
  eventMatchesFilters,
  filterAndSortEvents,
  getFilteredIndex,
  getNextEvent,
  getPrevEvent,
  resolveSelectedAfterFilterChange,
  clampPreRoll,
  clampPostRoll,
  getReviewSummary,
  REVIEW_PRESETS
} from "../lib/analysis/review";
import { TaggedEvent } from "../lib/analysis/types";

// ---------------------------------------------------------------------------
// Shared test fixtures
// ---------------------------------------------------------------------------

function makeEvent(overrides: Partial<TaggedEvent>): TaggedEvent {
  return {
    id: "e1",
    sessionId: "session-1",
    videoSourceId: null,
    atBatId: null,
    eventRole: "batter",
    playerId: null,
    relatedPlayerId: null,
    teamSide: null,
    timestampSeconds: 10,
    timestampLabel: "00:10.000",
    tag: "swing",
        category: "Swing Decision",
    note: "",
    pitchCount: null,
    pitchResult: null,
    pitchLocation: null,
        contactType: null,
    contactQuality: null,
    playResult: null,
    pitchType: null,
            createdAt: "2026-06-01T10:00:00.000Z",
    ...overrides
  };
}

const eventA = makeEvent({ id: "a", timestampSeconds: 5, tag: "swing", pitchResult: "ball_in_play", contactQuality: "hard", playResult: "single", pitchCount: "3-2", note: "great contact", createdAt: "2026-06-23T00:00:01.000Z" });
const eventB = makeEvent({ id: "b", timestampSeconds: 12, tag: "take", pitchResult: "called_strike", contactQuality: null, playResult: null, pitchCount: "0-1", note: "", createdAt: "2026-06-23T00:00:02.000Z" });
const eventC = makeEvent({ id: "c", timestampSeconds: 20, tag: "swing_and_miss", pitchResult: "swinging_strike", contactQuality: null, playResult: "strikeout", pitchCount: "2-2", pitchLocation: "zone_5", note: "chased", createdAt: "2026-06-23T00:00:03.000Z" });
const eventD = makeEvent({ id: "d", timestampSeconds: 30, tag: "hit", pitchResult: "ball_in_play", contactQuality: "hard", playResult: "home_run", pitchCount: "1-0", note: "", createdAt: "2026-06-23T00:00:04.000Z" });
const eventE = makeEvent({ id: "e", timestampSeconds: 40, tag: "out", pitchResult: "ball_in_play", contactQuality: "weak", playResult: "field_out", pitchCount: null, note: "", createdAt: "2026-06-23T00:00:05.000Z" });

const ALL_EVENTS = [eventA, eventB, eventC, eventD, eventE];

// ---------------------------------------------------------------------------
// emptyFilters / hasActiveFilters
// ---------------------------------------------------------------------------

describe("emptyFilters", () => {
  it("returns filter state with no active filters", () => {
    const f = emptyFilters();
    expect(hasActiveFilters(f)).toBe(false);
  });
});

describe("hasActiveFilters", () => {
  it("returns false for empty filters", () => {
    expect(hasActiveFilters(emptyFilters())).toBe(false);
  });

  it("returns true when tagIds is set", () => {
    expect(hasActiveFilters({ ...emptyFilters(), tagIds: ["swing"] })).toBe(true);
  });

  it("returns true when textSearch is set", () => {
    expect(hasActiveFilters({ ...emptyFilters(), textSearch: "great" })).toBe(true);
  });

  it("returns true when ballsFilter is set", () => {
    expect(hasActiveFilters({ ...emptyFilters(), ballsFilter: 2 })).toBe(true);
  });

  it("returns true when strikesFilter is set", () => {
    expect(hasActiveFilters({ ...emptyFilters(), strikesFilter: 0 })).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// eventMatchesFilters — individual filter groups
// ---------------------------------------------------------------------------

describe("eventMatchesFilters", () => {
  it("no filters — passes all events", () => {
    const f = emptyFilters();
    expect(ALL_EVENTS.every((e) => eventMatchesFilters(e, f))).toBe(true);
  });

  it("tag filter — single value match", () => {
    const f: ReviewFilters = { ...emptyFilters(), tagIds: ["swing"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(false);
  });

  it("tag filter — multiple values (OR logic within group)", () => {
    const f: ReviewFilters = { ...emptyFilters(), tagIds: ["swing", "take"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(true);
    expect(eventMatchesFilters(eventC, f)).toBe(false);
  });

  it("pitch result filter", () => {
    const f: ReviewFilters = { ...emptyFilters(), pitchResults: ["ball_in_play"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(false);
  });

  it("pitch result filter — multiple values (OR)", () => {
    const f: ReviewFilters = { ...emptyFilters(), pitchResults: ["ball_in_play", "called_strike"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(true);
    expect(eventMatchesFilters(eventC, f)).toBe(false);
  });

  it("pitch location zone filter", () => {
    const f: ReviewFilters = { ...emptyFilters(), pitchLocationZones: ["zone_5"] };
    expect(eventMatchesFilters(eventC, f)).toBe(true);
    expect(eventMatchesFilters(eventA, f)).toBe(false);
  });

  it("location filter — null (not set)", () => {
    const f: ReviewFilters = { ...emptyFilters(), pitchLocationZones: [null] };
    expect(eventMatchesFilters(eventA, f)).toBe(true); // null location
    expect(eventMatchesFilters(eventC, f)).toBe(false); // zone_5
  });

  it("contact direction filter", () => {
    const f: ReviewFilters = { ...emptyFilters(), contactDirections: ["pull"] };
    expect(eventMatchesFilters(makeEvent({ id: "x", contactType: "pull" }), f)).toBe(true);
    expect(eventMatchesFilters(eventA, f)).toBe(false);
  });

  it("contact quality filter", () => {
    const f: ReviewFilters = { ...emptyFilters(), contactQualities: ["hard"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventE, f)).toBe(false);
  });

  it("at-bat result filter", () => {
    const f: ReviewFilters = { ...emptyFilters(), results: ["single"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventD, f)).toBe(false);
  });

  it("at-bat result filter — multiple values (OR)", () => {
    const f: ReviewFilters = { ...emptyFilters(), results: ["single", "home_run"] };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventD, f)).toBe(true);
    expect(eventMatchesFilters(eventC, f)).toBe(false);
  });

  

  

  it("count filter — balls only", () => {
    const f: ReviewFilters = { ...emptyFilters(), ballsFilter: 3 };
    expect(eventMatchesFilters(eventA, f)).toBe(true); // count "3-2"
    expect(eventMatchesFilters(eventB, f)).toBe(false); // count "0-1"
  });

  it("count filter — strikes only", () => {
    const f: ReviewFilters = { ...emptyFilters(), strikesFilter: 2 };
    expect(eventMatchesFilters(eventA, f)).toBe(true); // "3-2"
    expect(eventMatchesFilters(eventC, f)).toBe(true); // "2-2"
    expect(eventMatchesFilters(eventB, f)).toBe(false); // "0-1"
  });

  it("count filter — exact count (both balls and strikes)", () => {
    const f: ReviewFilters = { ...emptyFilters(), ballsFilter: 2, strikesFilter: 2 };
    expect(eventMatchesFilters(eventC, f)).toBe(true); // "2-2"
    expect(eventMatchesFilters(eventA, f)).toBe(false); // "3-2"
  });

  it("count filter — event with null count does not match", () => {
    const f: ReviewFilters = { ...emptyFilters(), ballsFilter: 1 };
    expect(eventMatchesFilters(eventE, f)).toBe(false); // null count
  });

  it("text search — matches tagLabel", () => {
    const f: ReviewFilters = { ...emptyFilters(), textSearch: "swing" };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(false);
  });

  it("text search — matches note (case insensitive)", () => {
    const f: ReviewFilters = { ...emptyFilters(), textSearch: "GREAT" };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventB, f)).toBe(false);
  });

  it("text search — partial match", () => {
    const f: ReviewFilters = { ...emptyFilters(), textSearch: "chas" };
    expect(eventMatchesFilters(eventC, f)).toBe(true);
  });

  it("AND logic across filter groups", () => {
    const f: ReviewFilters = {
      ...emptyFilters(),
      pitchResults: ["ball_in_play"],
      contactQualities: ["hard"]
    };
    // eventA: ball_in_play + hard — matches both
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    // eventD: ball_in_play + hard — matches both
    expect(eventMatchesFilters(eventD, f)).toBe(true);
    // eventE: ball_in_play + weak — fails contactQuality
    expect(eventMatchesFilters(eventE, f)).toBe(false);
    // eventB: called_strike + null — fails pitchResult
    expect(eventMatchesFilters(eventB, f)).toBe(false);
  });

  it("AND across three groups", () => {
    const f: ReviewFilters = {
      ...emptyFilters(),
      pitchResults: ["ball_in_play"],
      contactQualities: ["hard"],
      results: ["single"]
    };
    expect(eventMatchesFilters(eventA, f)).toBe(true);
    expect(eventMatchesFilters(eventD, f)).toBe(false); // home_run not single
  });
});

// ---------------------------------------------------------------------------
// filterAndSortEvents
// ---------------------------------------------------------------------------

describe("filterAndSortEvents", () => {
  it("no filters returns all events sorted by timestamp", () => {
    const result = filterAndSortEvents(ALL_EVENTS, emptyFilters());
    expect(result.length).toBe(5);
    expect(result[0].id).toBe("a"); // ts=5
    expect(result[1].id).toBe("b"); // ts=12
    expect(result[4].id).toBe("e"); // ts=40
  });

  it("returns zero results correctly without crashing", () => {
    const f: ReviewFilters = { ...emptyFilters(), tagIds: ["nonexistent_tag"] };
    const result = filterAndSortEvents(ALL_EVENTS, f);
    expect(result).toHaveLength(0);
  });

  it("stable ordering by timestamp — tie-break by createdAt", () => {
    const t1 = makeEvent({ id: "x1", timestampSeconds: 15, createdAt: "2026-06-23T00:01:00.000Z" });
    const t2 = makeEvent({ id: "x2", timestampSeconds: 15, createdAt: "2026-06-23T00:00:30.000Z" });
    const result = filterAndSortEvents([t1, t2], emptyFilters());
    expect(result[0].id).toBe("x2"); // earlier createdAt
    expect(result[1].id).toBe("x1");
  });

  it("stable ordering — tie-break by id when timestamps and createdAt are equal", () => {
    const t1 = makeEvent({ id: "z2", timestampSeconds: 15, createdAt: "2026-06-23T00:00:00.000Z" });
    const t2 = makeEvent({ id: "z1", timestampSeconds: 15, createdAt: "2026-06-23T00:00:00.000Z" });
    const result = filterAndSortEvents([t1, t2], emptyFilters());
    expect(result[0].id).toBe("z1");
    expect(result[1].id).toBe("z2");
  });

  it("does not mutate the original array", () => {
    const copy = [...ALL_EVENTS];
    filterAndSortEvents(ALL_EVENTS, emptyFilters());
    expect(ALL_EVENTS).toEqual(copy);
  });
});

// ---------------------------------------------------------------------------
// getFilteredIndex / getNextEvent / getPrevEvent
// ---------------------------------------------------------------------------

describe("navigation helpers", () => {
  const filtered = filterAndSortEvents(ALL_EVENTS, emptyFilters());
  // Sorted: a, b, c, d, e

  it("getFilteredIndex returns correct index", () => {
    expect(getFilteredIndex(filtered, "a")).toBe(0);
    expect(getFilteredIndex(filtered, "e")).toBe(4);
  });

  it("getFilteredIndex returns -1 for unknown id", () => {
    expect(getFilteredIndex(filtered, "zzz")).toBe(-1);
  });

  it("getFilteredIndex returns -1 for null id", () => {
    expect(getFilteredIndex(filtered, null)).toBe(-1);
  });

  it("getNextEvent returns next event", () => {
    expect(getNextEvent(filtered, "a")?.id).toBe("b");
    expect(getNextEvent(filtered, "d")?.id).toBe("e");
  });

  it("getNextEvent returns null at last event", () => {
    expect(getNextEvent(filtered, "e")).toBeNull();
  });

  it("getNextEvent returns null for unknown id", () => {
    expect(getNextEvent(filtered, "zzz")).toBeNull();
  });

  it("getNextEvent returns null for null id", () => {
    expect(getNextEvent(filtered, null)).toBeNull();
  });

  it("getPrevEvent returns prev event", () => {
    expect(getPrevEvent(filtered, "b")?.id).toBe("a");
    expect(getPrevEvent(filtered, "e")?.id).toBe("d");
  });

  it("getPrevEvent returns null at first event", () => {
    expect(getPrevEvent(filtered, "a")).toBeNull();
  });

  it("getPrevEvent returns null for unknown id", () => {
    expect(getPrevEvent(filtered, "zzz")).toBeNull();
  });

  it("getPrevEvent returns null for null id", () => {
    expect(getPrevEvent(filtered, null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveSelectedAfterFilterChange
// ---------------------------------------------------------------------------

describe("resolveSelectedAfterFilterChange", () => {
  const filtered = [eventA, eventC, eventD]; // subset

  it("keeps current event when it still matches", () => {
    expect(resolveSelectedAfterFilterChange(filtered, "a")).toBe("a");
    expect(resolveSelectedAfterFilterChange(filtered, "c")).toBe("c");
  });

  it("selects first event when current no longer matches", () => {
    // eventB is not in filtered
    expect(resolveSelectedAfterFilterChange(filtered, "b")).toBe("a");
  });

  it("selects first event when current is null", () => {
    expect(resolveSelectedAfterFilterChange(filtered, null)).toBe("a");
  });

  it("returns null when no events remain", () => {
    expect(resolveSelectedAfterFilterChange([], "a")).toBeNull();
    expect(resolveSelectedAfterFilterChange([], null)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Playback boundary helpers
// ---------------------------------------------------------------------------

describe("clampPreRoll", () => {
  it("returns timestamp minus preRoll", () => {
    expect(clampPreRoll(10, 2)).toBe(8);
  });

  it("clamps to 0 when preRoll exceeds timestamp", () => {
    expect(clampPreRoll(1, 5)).toBe(0);
  });

  it("returns 0 when timestamp is 0", () => {
    expect(clampPreRoll(0, 3)).toBe(0);
  });

  it("returns exact timestamp when preRoll is 0", () => {
    expect(clampPreRoll(10, 0)).toBe(10);
  });
});

describe("clampPostRoll", () => {
  it("returns timestamp plus postRoll", () => {
    expect(clampPostRoll(10, 3, 60)).toBe(13);
  });

  it("clamps to video duration", () => {
    expect(clampPostRoll(58, 5, 60)).toBe(60);
  });

  it("handles Infinity duration (no clamp)", () => {
    expect(clampPostRoll(10, 5, Infinity)).toBe(15);
  });

  it("handles duration of 0 (returns raw)", () => {
    expect(clampPostRoll(10, 5, 0)).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// getReviewSummary
// ---------------------------------------------------------------------------

describe("getReviewSummary", () => {
  it("returns zero counts for empty array", () => {
    const s = getReviewSummary([]);
    expect(s.totalCount).toBe(0);
    expect(Object.keys(s.pitchResults)).toHaveLength(0);
  });

  it("counts pitch results correctly", () => {
    const s = getReviewSummary([eventA, eventD, eventE]);
    // All three have ball_in_play
    expect(s.pitchResults["ball_in_play"]).toBe(3);
  });

  it("groups null values under Not set", () => {
    const s = getReviewSummary([eventA, eventB]);
    // eventB has null contactQuality
    expect(s.contactQualities["Not set"]).toBe(1);
    expect(s.contactQualities["hard"]).toBe(1);
  });

  it("counts at-bat results correctly", () => {
    const s = getReviewSummary([eventA, eventD]);
    expect(s.results["single"]).toBe(1);
    expect(s.results["home_run"]).toBe(1);
  });

  it("total count equals number of filtered events", () => {
    const s = getReviewSummary(ALL_EVENTS);
    expect(s.totalCount).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

describe("REVIEW_PRESETS", () => {
  it("all swings preset filters swing and swing_and_miss", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "all_swings")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    // eventA=swing, eventC=swing_and_miss match
    expect(result.some((e) => e.id === "a")).toBe(true);
    expect(result.some((e) => e.id === "c")).toBe(true);
    // eventB=take does not match
    expect(result.some((e) => e.id === "b")).toBe(false);
  });

  it("balls in play preset filters by pitchResult=ball_in_play", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "balls_in_play")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    expect(result.every((e) => e.pitchResult === "ball_in_play")).toBe(true);
  });

  it("hard contact preset filters by contactQuality=hard", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "hard_contact")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    expect(result.every((e) => e.contactQuality === "hard")).toBe(true);
  });

  it("two-strike preset filters strikesFilter=2", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "two_strike")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    // eventA (3-2) and eventC (2-2) have strikes=2
    expect(result.some((e) => e.id === "a")).toBe(true);
    expect(result.some((e) => e.id === "c")).toBe(true);
    expect(result.some((e) => e.id === "b")).toBe(false); // 0-1
  });

  it("hits preset filters single/double/triple/home_run results", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "hits")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    expect(result.some((e) => e.id === "a")).toBe(true); // single
    expect(result.some((e) => e.id === "d")).toBe(true); // home_run
    expect(result.some((e) => e.id === "c")).toBe(false); // strikeout
  });

  it("outs preset filters field_out/strikeout/fielders_choice results", () => {
    const preset = REVIEW_PRESETS.find((p) => p.id === "outs")!;
    const f = applyPreset(preset);
    const result = filterAndSortEvents(ALL_EVENTS, f);
    expect(result.some((e) => e.id === "c")).toBe(true); // strikeout
    expect(result.some((e) => e.id === "e")).toBe(true); // field_out
    expect(result.some((e) => e.id === "a")).toBe(false); // single
  });
});
