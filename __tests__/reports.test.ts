import { describe, it, expect } from "vitest";
import {
  buildSessionReport,
  summarisePitchResults,
  summariseLocations,
  summariseContactDirections,
  summariseContactQuality,
  summariseAtBatResults,
  summariseCounts,
  summariseSwingDecision,
  summariseTagCategories,
  summariseCodingCompleteness,
  compareReports,
  buildComparisonWarnings,
  toReportCsv,
  toComparisonCsv,
  toReportJson,
  toComparisonReportJson,
  safePercent,
  diffDirectionLabel,
  NOT_SET_KEY,
} from "../lib/analysis/reports";
import { parseImportedSession } from "../lib/analysis/export";
import { AnalysisEvent, SessionMetadata } from "../lib/analysis/types";

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeSession(overrides: Partial<SessionMetadata> = {}): SessionMetadata {
  return {
    sessionId: "test-session-a",
    sessionName: "Test Session A",
    playerName: "Player A",
    sessionDate: "2026-06-01",
    opponent: "Team B",
    videoFileName: "sample.mp4",
    batterHandedness: "right",
    createdAt: "2026-06-01T10:00:00.000Z",
    updatedAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

function makeEvent(overrides: Partial<AnalysisEvent> = {}): AnalysisEvent {
  return {
    id: "e1",
    timestampSeconds: 10,
    timestampLabel: "00:10.000",
    tagId: "swing",
    tagLabel: "Swing",
    category: "Swing Decision",
    note: "",
    count: null,
    pitchResult: null,
    pitchLocationZone: null,
    pitchLocationLabel: null,
    batterHandedness: null,
    contactDirection: null,
    contactQuality: null,
    result: null,
    createdAt: "2026-06-01T10:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// safePercent
// ---------------------------------------------------------------------------

describe("safePercent", () => {
  it("returns null when denominator is 0", () => {
    expect(safePercent(5, 0)).toBeNull();
  });

  it("calculates percentage correctly", () => {
    expect(safePercent(1, 4)).toBe(25);
  });

  it("rounds to one decimal", () => {
    expect(safePercent(1, 3)).toBe(33.3);
  });

  it("returns 100 for full match", () => {
    expect(safePercent(7, 7)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// diffDirectionLabel
// ---------------------------------------------------------------------------

describe("diffDirectionLabel", () => {
  it("returns higher for positive diff", () => {
    expect(diffDirectionLabel(5)).toBe("higher");
  });

  it("returns lower for negative diff", () => {
    expect(diffDirectionLabel(-3)).toBe("lower");
  });

  it("returns unchanged for zero", () => {
    expect(diffDirectionLabel(0)).toBe("unchanged");
  });
});

// ---------------------------------------------------------------------------
// Empty session report
// ---------------------------------------------------------------------------

describe("buildSessionReport — empty session", () => {
  const session = makeSession();
  const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");

  it("has correct format identifier", () => {
    expect(report.reportFormat).toBe("softball-analysis-report");
  });

  it("has correct version", () => {
    expect(report.reportVersion).toBe("1.0");
  });

  it("has zero total events", () => {
    expect(report.totalEvents).toBe(0);
  });

  it("is not filtered by default", () => {
    expect(report.filters.filtersApplied).toBe(false);
  });

  it("has zero event overview counts", () => {
    expect(report.eventOverview.total).toBe(0);
    expect(report.eventOverview.tagCategories.length).toBeGreaterThan(0);
    expect(report.eventOverview.tagCategories[0].count).toBe(0);
  });

  it("pitch results all have count 0", () => {
    for (const row of report.pitchResults) {
      expect(row.count).toBe(0);
      expect(row.percentage).toBeNull();
    }
  });

  it("coding completeness all coded=0", () => {
    for (const row of report.codingCompleteness) {
      expect(row.coded).toBe(0);
      expect(row.total).toBe(0);
      expect(row.codedPct).toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// One-event session
// ---------------------------------------------------------------------------

describe("buildSessionReport — one event", () => {
  const session = makeSession();
  const events = [
    makeEvent({
      tagId: "swing",
      tagLabel: "Swing",
      category: "Swing Decision",
      pitchResult: "swinging_strike",
      pitchLocationZone: "zone_5",
      contactDirection: "pull",
      contactQuality: "hard",
      result: "strikeout",
      count: "1-2",
    }),
  ];
  const report = buildSessionReport(session, events, "2026-06-01T10:00:00.000Z");

  it("has total 1", () => {
    expect(report.totalEvents).toBe(1);
  });

  it("correctly counts swinging_strike", () => {
    const row = report.pitchResults.find((r) => r.id === "swinging_strike")!;
    expect(row.count).toBe(1);
    expect(row.percentage).toBe(100);
    expect(row.denominator).toBe(1);
  });

  it("correctly counts zone_5", () => {
    const row = report.locations.find((r) => r.id === "zone_5")!;
    expect(row.count).toBe(1);
    expect(row.percentage).toBe(100);
  });

  it("correctly counts contact direction pull", () => {
    const row = report.contactDirections.find((r) => r.id === "pull")!;
    expect(row.count).toBe(1);
  });

  it("correctly counts hard contact quality", () => {
    const row = report.contactQuality.find((r) => r.id === "hard")!;
    expect(row.count).toBe(1);
  });

  it("correctly counts strikeout result", () => {
    const row = report.atBatResults.find((r) => r.id === "strikeout")!;
    expect(row.count).toBe(1);
  });

  it("correctly counts two-strike situation", () => {
    expect(report.countSituations.twoStrike).toBe(1);
  });

  it("swing decision shows 1 swing", () => {
    expect(report.swingDecision.swingEvents).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Count aggregation
// ---------------------------------------------------------------------------

describe("summariseCounts", () => {
  it("counts two-strike events", () => {
    const events = [
      makeEvent({ count: "0-2" }),
      makeEvent({ count: "1-2" }),
      makeEvent({ count: "3-2" }),
      makeEvent({ count: "2-0" }),
    ];
    const result = summariseCounts(events);
    expect(result.twoStrike).toBe(3);
  });

  it("counts three-ball events", () => {
    const events = [
      makeEvent({ count: "3-0" }),
      makeEvent({ count: "3-1" }),
      makeEvent({ count: "3-2" }),
    ];
    const result = summariseCounts(events);
    expect(result.threeBall).toBe(3);
  });

  it("counts full count exactly", () => {
    const events = [
      makeEvent({ count: "3-2" }),
      makeEvent({ count: "3-1" }),
    ];
    const result = summariseCounts(events);
    expect(result.fullCount).toBe(1);
  });

  it("counts not-set events", () => {
    const events = [
      makeEvent({ count: null }),
      makeEvent({ count: null }),
      makeEvent({ count: "1-1" }),
    ];
    const result = summariseCounts(events);
    expect(result.notSet).toBe(2);
  });

  it("returns most common counts sorted descending", () => {
    const events = [
      makeEvent({ count: "1-2" }),
      makeEvent({ count: "1-2" }),
      makeEvent({ count: "0-0" }),
    ];
    const result = summariseCounts(events);
    expect(result.mostCommon[0].count).toBe("1-2");
    expect(result.mostCommon[0].events).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Pitch result grouping — stable ordering
// ---------------------------------------------------------------------------

describe("summarisePitchResults — stable ordering", () => {
  it("returns all 7 rows in expected order", () => {
    const events: AnalysisEvent[] = [];
    const rows = summarisePitchResults(events);
    const ids = rows.map((r) => r.id);
    expect(ids).toEqual([
      "called_strike",
      "swinging_strike",
      "foul",
      "ball",
      "ball_in_play",
      "hit_by_pitch",
      NOT_SET_KEY,
    ]);
  });
});

// ---------------------------------------------------------------------------
// Location grouping — stable ordering
// ---------------------------------------------------------------------------

describe("summariseLocations — stable ordering", () => {
  it("returns 15 rows with correct order", () => {
    const rows = summariseLocations([]);
    const ids = rows.map((r) => r.id);
    expect(ids[0]).toBe("zone_1");
    expect(ids[8]).toBe("zone_9");
    expect(ids[9]).toBe("high");
    expect(ids[10]).toBe("low");
    expect(ids[11]).toBe("inside");
    expect(ids[12]).toBe("outside");
    expect(ids[13]).toBe(NOT_SET_KEY);
  });
});

// ---------------------------------------------------------------------------
// Contact direction grouping
// ---------------------------------------------------------------------------

describe("summariseContactDirections", () => {
  it("groups pull, middle, opposite and not_set", () => {
    const events = [
      makeEvent({ contactDirection: "pull" }),
      makeEvent({ contactDirection: "pull" }),
      makeEvent({ contactDirection: "middle" }),
      makeEvent({ contactDirection: null }),
    ];
    const rows = summariseContactDirections(events);
    expect(rows.find((r) => r.id === "pull")!.count).toBe(2);
    expect(rows.find((r) => r.id === "middle")!.count).toBe(1);
    expect(rows.find((r) => r.id === NOT_SET_KEY)!.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Contact quality grouping
// ---------------------------------------------------------------------------

describe("summariseContactQuality", () => {
  it("groups hard, medium, weak, not_set", () => {
    const events = [
      makeEvent({ contactQuality: "hard" }),
      makeEvent({ contactQuality: "medium" }),
      makeEvent({ contactQuality: null }),
    ];
    const rows = summariseContactQuality(events);
    expect(rows.find((r) => r.id === "hard")!.count).toBe(1);
    expect(rows.find((r) => r.id === "medium")!.count).toBe(1);
    expect(rows.find((r) => r.id === NOT_SET_KEY)!.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// At-bat result grouping
// ---------------------------------------------------------------------------

describe("summariseAtBatResults", () => {
  it("groups single, walk, strikeout correctly", () => {
    const events = [
      makeEvent({ result: "single" }),
      makeEvent({ result: "single" }),
      makeEvent({ result: "walk" }),
      makeEvent({ result: null }),
    ];
    const rows = summariseAtBatResults(events);
    expect(rows.find((r) => r.id === "single")!.count).toBe(2);
    expect(rows.find((r) => r.id === "walk")!.count).toBe(1);
    expect(rows.find((r) => r.id === NOT_SET_KEY)!.count).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Tag category grouping
// ---------------------------------------------------------------------------

describe("summariseTagCategories", () => {
  it("groups by all 6 categories", () => {
    const events = [
      makeEvent({ category: "Swing Decision" }),
      makeEvent({ category: "Swing Decision" }),
      makeEvent({ category: "Coach Observation" }),
      makeEvent({ category: "Contact Type" }),
    ];
    const rows = summariseTagCategories(events);
    expect(rows.find((r) => r.id === "Swing Decision")!.count).toBe(2);
    expect(rows.find((r) => r.id === "Coach Observation")!.count).toBe(1);
    expect(rows.find((r) => r.id === "Outcome")!.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Coding completeness
// ---------------------------------------------------------------------------

describe("summariseCodingCompleteness", () => {
  it("correctly identifies coded vs uncoded", () => {
    const events = [
      makeEvent({ pitchResult: "ball", pitchLocationZone: "zone_1", contactQuality: null }),
      makeEvent({ pitchResult: null, pitchLocationZone: null, contactQuality: "hard" }),
    ];
    const rows = summariseCodingCompleteness(events);
    const prRow = rows.find((r) => r.fieldId === "pitchResult")!;
    expect(prRow.coded).toBe(1);
    expect(prRow.uncoded).toBe(1);
    expect(prRow.codedPct).toBe(50);

    const cqRow = rows.find((r) => r.fieldId === "contactQuality")!;
    expect(cqRow.coded).toBe(1);
    expect(cqRow.uncoded).toBe(1);
  });

  it("returns 100% when all coded", () => {
    const events = [makeEvent({ pitchResult: "ball" })];
    const rows = summariseCodingCompleteness(events);
    const prRow = rows.find((r) => r.fieldId === "pitchResult")!;
    expect(prRow.codedPct).toBe(100);
  });

  it("returns 0% when all uncoded", () => {
    const events = [makeEvent({ pitchResult: null })];
    const rows = summariseCodingCompleteness(events);
    const prRow = rows.find((r) => r.fieldId === "pitchResult")!;
    expect(prRow.codedPct).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Swing/decision summary
// ---------------------------------------------------------------------------

describe("summariseSwingDecision", () => {
  it("counts swing events from tagId", () => {
    const events = [
      makeEvent({ tagId: "swing", pitchResult: null }),
      makeEvent({ tagId: "swing_and_miss", pitchResult: null }),
      makeEvent({ tagId: "take", pitchResult: null }),
    ];
    const result = summariseSwingDecision(events);
    expect(result.swingEvents).toBe(1);
    expect(result.swingAndMissEvents).toBe(1);
    expect(result.takeEvents).toBe(1);
  });

  it("calculates swing-and-miss pct correctly (1 swing, 1 miss -> 50%)", () => {
    const events = [
      makeEvent({ tagId: "swing" }),
      makeEvent({ tagId: "swing_and_miss" }),
    ];
    const result = summariseSwingDecision(events);
    // swingAndMissEvents = 1, swingEvents = 1, total = 2 -> 50%
    expect(result.swingAndMissPctOfSwings).toBe(50);
  });

  it("calculates swing-and-miss pct correctly (0 swing, 2 miss -> 100%)", () => {
    const events = [
      makeEvent({ tagId: "swing_and_miss" }),
      makeEvent({ tagId: "swing_and_miss" }),
    ];
    const result = summariseSwingDecision(events);
    // swingAndMissEvents = 2, swingEvents = 0, total = 2 -> 100%
    expect(result.swingAndMissPctOfSwings).toBe(100);
  });

  it("returns null pct when no swing or swing-and-miss events", () => {
    const events = [
      makeEvent({ tagId: "take" }),
      makeEvent({ tagId: "foul" }),
    ];
    const result = summariseSwingDecision(events);
    expect(result.swingAndMissPctOfSwings).toBeNull();
  });

  it("counts balls in play from pitchResult field", () => {
    const events = [
      makeEvent({ pitchResult: "ball_in_play" }),
      makeEvent({ pitchResult: "ball_in_play" }),
      makeEvent({ pitchResult: "ball" }),
    ];
    const result = summariseSwingDecision(events);
    expect(result.ballsInPlay).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Filtered report
// ---------------------------------------------------------------------------

describe("buildSessionReport — filtered input", () => {
  it("sets filters applied and counts when provided", () => {
    const session = makeSession();
    const events = [makeEvent({ pitchResult: "ball" })];
    const report = buildSessionReport(session, events, "2026-06-01T10:00:00.000Z", true, 10);
    expect(report.filters.filtersApplied).toBe(true);
    expect(report.filters.totalEvents).toBe(10);
    expect(report.filters.filteredCount).toBe(1);
    expect(report.totalEvents).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Comparison — positive, negative, unchanged differences
// ---------------------------------------------------------------------------

describe("compareReports", () => {
  const session = makeSession();
  const sessionB = makeSession({ sessionId: "test-session-b", sessionName: "Test Session B" });

  it("positive diff when B has more events", () => {
    const reportA = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const eventsB = [makeEvent({ pitchResult: "ball" })];
    const reportB = buildSessionReport(sessionB, eventsB, "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    expect(comp.totalEvents.diff).toBe(1);
    expect(diffDirectionLabel(comp.totalEvents.diff)).toBe("higher");
  });

  it("negative diff when A has more events", () => {
    const eventsA = [makeEvent({ pitchResult: "ball" }), makeEvent({ pitchResult: "foul" })];
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [], "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    expect(comp.totalEvents.diff).toBe(-2);
    expect(diffDirectionLabel(comp.totalEvents.diff)).toBe("lower");
  });

  it("unchanged when both have same count", () => {
    const eventsA = [makeEvent()];
    const eventsB = [makeEvent({ id: "e2" })];
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, eventsB, "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    expect(comp.totalEvents.diff).toBe(0);
    expect(diffDirectionLabel(comp.totalEvents.diff)).toBe("unchanged");
  });

  it("calculates percentage-point difference for pitch results", () => {
    // A: 2 balls in play, 2 total → 100%
    // B: 1 ball in play, 2 total → 50%
    const eventsA = [
      makeEvent({ pitchResult: "ball_in_play" }),
      makeEvent({ pitchResult: "ball_in_play" }),
    ];
    const eventsB = [
      makeEvent({ pitchResult: "ball_in_play" }),
      makeEvent({ pitchResult: "ball" }),
    ];
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, eventsB, "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    const bipMetric = comp.pitchResults.find((m) => m.id === "ball_in_play")!;
    expect(bipMetric.aValue).toBe(2);
    expect(bipMetric.bValue).toBe(1);
    expect(bipMetric.diff).toBe(-1);
    // A=100%, B=50%, ppDiff = -50
    expect(bipMetric.ppDiff).toBe(-50);
  });

  it("handles null ppDiff when denominator is 0", () => {
    const reportA = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [], "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    const anyMetric = comp.pitchResults[0];
    expect(anyMetric.ppDiff).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sample-size warnings
// ---------------------------------------------------------------------------

describe("buildComparisonWarnings", () => {
  const session = makeSession();
  const sessionB = makeSession({ sessionId: "b", sessionName: "B" });

  it("warns when session A is empty", () => {
    const reportA = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [makeEvent()], "2026-06-01T11:00:00.000Z");
    const warnings = buildComparisonWarnings(reportA, reportB);
    expect(warnings.some((w) => w.code === "zero_events")).toBe(true);
  });

  it("warns when session B is empty", () => {
    const reportA = buildSessionReport(session, [makeEvent()], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [], "2026-06-01T11:00:00.000Z");
    const warnings = buildComparisonWarnings(reportA, reportB);
    expect(warnings.some((w) => w.code === "zero_events")).toBe(true);
  });

  it("warns when ratio >= 2", () => {
    const eventsA = Array(1).fill(null).map(() => makeEvent());
    const eventsB = Array(12).fill(null).map(() => makeEvent());
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, eventsB, "2026-06-01T11:00:00.000Z");
    const warnings = buildComparisonWarnings(reportA, reportB);
    expect(warnings.some((w) => w.code === "unequal_sample_size")).toBe(true);
  });

  it("warns when same session ID loaded twice", () => {
    const eventsA = Array(10).fill(null).map(() => makeEvent());
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    // Same sessionId
    const reportB = buildSessionReport(session, eventsA, "2026-06-01T11:00:00.000Z");
    const warnings = buildComparisonWarnings(reportA, reportB);
    expect(warnings.some((w) => w.code === "same_session_id")).toBe(true);
  });

  it("no unequal warning when ratio < 2", () => {
    const eventsA = Array(10).fill(null).map(() => makeEvent());
    const eventsB = Array(15).fill(null).map(() => makeEvent());
    const reportA = buildSessionReport(session, eventsA, "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, eventsB, "2026-06-01T11:00:00.000Z");
    const warnings = buildComparisonWarnings(reportA, reportB);
    expect(warnings.some((w) => w.code === "unequal_sample_size")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Schema 1.0 migration for comparison session
// ---------------------------------------------------------------------------

describe("schema 1.0 migration compatibility", () => {
  it("migrates schema 1.0 session for comparison without error", () => {
    const schema10Json = JSON.stringify({
      schemaVersion: "1.0",
      exportedAt: "2026-01-01T00:00:00.000Z",
      session: {
        sessionId: "old-session",
        sessionName: "Old Session",
        playerName: "Player B",
        sessionDate: "2026-01-01",
        opponent: "Team A",
        videoFileName: "old-video.mp4",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      events: [
        {
          id: "ev1",
          timestampSeconds: 5,
          timestampLabel: "00:05.000",
          tagId: "swing",
          tagLabel: "Swing",
          category: "Swing Decision",
          note: "",
          count: "0-1",
          createdAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });

    const parsed = parseImportedSession(schema10Json);
    // All VT-2 fields should be null after migration
    expect(parsed.events[0].pitchResult).toBeNull();
    expect(parsed.events[0].pitchLocationZone).toBeNull();
    expect(parsed.events[0].batterHandedness).toBeNull();
    expect(parsed.session.batterHandedness).toBeNull();

    // Should be able to build a report without error
    const report = buildSessionReport(
      parsed.session,
      parsed.events,
      "2026-06-01T10:00:00.000Z"
    );
    expect(report.totalEvents).toBe(1);
    expect(report.codingCompleteness.find((r) => r.fieldId === "pitchResult")!.coded).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Schema 1.1 load
// ---------------------------------------------------------------------------

describe("schema 1.1 load", () => {
  it("loads a schema 1.1 session correctly", () => {
    const schema11Json = JSON.stringify({
      schemaVersion: "1.1",
      exportedAt: "2026-06-01T10:00:00.000Z",
      session: makeSession(),
      events: [
        makeEvent({ pitchResult: "ball", pitchLocationZone: "zone_3" }),
      ],
    });

    const parsed = parseImportedSession(schema11Json);
    expect(parsed.schemaVersion).toBe("1.1");
    expect(parsed.events[0].pitchResult).toBe("ball");
    expect(parsed.events[0].pitchLocationZone).toBe("zone_3");
  });
});

// ---------------------------------------------------------------------------
// Malformed comparison session rejection
// ---------------------------------------------------------------------------

describe("malformed session rejection", () => {
  it("rejects empty string", () => {
    expect(() => parseImportedSession("")).toThrow();
  });

  it("rejects unknown schema version", () => {
    expect(() =>
      parseImportedSession(JSON.stringify({ schemaVersion: "9.9" }))
    ).toThrow("Unsupported schema version");
  });

  it("rejects missing events array", () => {
    expect(() =>
      parseImportedSession(
        JSON.stringify({ schemaVersion: "1.1", session: makeSession() })
      )
    ).toThrow("Missing or invalid events array");
  });

  it("rejects missing session", () => {
    expect(() =>
      parseImportedSession(JSON.stringify({ schemaVersion: "1.1", events: [] }))
    ).toThrow("Missing session metadata");
  });
});

// ---------------------------------------------------------------------------
// Report CSV escaping
// ---------------------------------------------------------------------------

describe("toReportCsv", () => {
  it("produces CSV with correct column headers", () => {
    const session = makeSession();
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const csv = toReportCsv(report);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toContain("section");
    expect(firstLine).toContain("metricId");
    expect(firstLine).toContain("metricLabel");
    expect(firstLine).toContain("count");
    expect(firstLine).toContain("percentage");
    expect(firstLine).toContain("denominator");
    expect(firstLine).toContain("sessionId");
    expect(firstLine).toContain("sessionName");
  });

  it("escapes double quotes in session names", () => {
    const session = makeSession({ sessionName: 'Session "A" Test' });
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const csv = toReportCsv(report);
    expect(csv).toContain('""A""');
  });

  it("includes pitchResults section rows", () => {
    const session = makeSession();
    const events = [makeEvent({ pitchResult: "ball" })];
    const report = buildSessionReport(session, events, "2026-06-01T10:00:00.000Z");
    const csv = toReportCsv(report);
    expect(csv).toContain("pitchResults");
  });
});

// ---------------------------------------------------------------------------
// Comparison CSV
// ---------------------------------------------------------------------------

describe("toComparisonCsv", () => {
  it("has correct comparison CSV headers", () => {
    const session = makeSession();
    const sessionB = makeSession({ sessionId: "b", sessionName: "B" });
    const reportA = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [], "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    const csv = toComparisonCsv(comp);
    const firstLine = csv.split("\n")[0];
    expect(firstLine).toContain("sessionAValue");
    expect(firstLine).toContain("sessionBValue");
    expect(firstLine).toContain("diff");
    expect(firstLine).toContain("ppDiff");
  });
});

// ---------------------------------------------------------------------------
// Report JSON shape and format identifier
// ---------------------------------------------------------------------------

describe("toReportJson", () => {
  it("has reportFormat and reportVersion fields", () => {
    const session = makeSession();
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const json = JSON.parse(toReportJson(report));
    expect(json.reportFormat).toBe("softball-analysis-report");
    expect(json.reportVersion).toBe("1.0");
  });

  it("is not importable as a session", () => {
    const session = makeSession();
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const json = toReportJson(report);
    // parseImportedSession should throw because no schemaVersion
    expect(() => parseImportedSession(json)).toThrow();
  });

  it("does not include videoFileName in report JSON (privacy)", () => {
    const session = makeSession({ videoFileName: "/Users/private/videos/secret.mp4" });
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const json = toReportJson(report);
    expect(json).not.toContain("secret.mp4");
  });

  it("includes generatedAt, totalEvents, and session metadata", () => {
    const session = makeSession();
    const report = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const json = JSON.parse(toReportJson(report));
    expect(json.generatedAt).toBe("2026-06-01T10:00:00.000Z");
    expect(json.totalEvents).toBe(0);
    expect(json.session.sessionId).toBe("test-session-a");
  });
});

// ---------------------------------------------------------------------------
// Canonical session data unchanged
// ---------------------------------------------------------------------------

describe("canonical session data unchanged", () => {
  it("building a report does not mutate the original events array", () => {
    const session = makeSession();
    const events = [
      makeEvent({ pitchResult: "ball" }),
      makeEvent({ id: "e2", pitchResult: "foul" }),
    ];
    const originalLength = events.length;
    const originalFirst = { ...events[0] };
    buildSessionReport(session, events, "2026-06-01T10:00:00.000Z");
    expect(events.length).toBe(originalLength);
    expect(events[0]).toEqual(originalFirst);
  });

  it("comparing reports does not mutate session metadata", () => {
    const session = makeSession();
    const sessionB = makeSession({ sessionId: "b" });
    const reportA = buildSessionReport(session, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [], "2026-06-01T11:00:00.000Z");
    compareReports(reportA, reportB);
    expect(session.sessionId).toBe("test-session-a");
    expect(sessionB.sessionId).toBe("b");
  });
});

// ---------------------------------------------------------------------------
// Report JSON shape (Comparison)
// ---------------------------------------------------------------------------

describe("toComparisonReportJson", () => {
  it("exports full comparison report including both sessions and differences", () => {
    const sessionA = makeSession({ sessionId: "a", videoFileName: "a.mp4" });
    const sessionB = makeSession({ sessionId: "b", videoFileName: "b.mp4" });
    const reportA = buildSessionReport(sessionA, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [makeEvent()], "2026-06-01T11:00:00.000Z");
    const comp = compareReports(reportA, reportB);
    
    const jsonStr = toComparisonReportJson(comp);
    const json = JSON.parse(jsonStr);

    expect(json.reportFormat).toBe("comparison-report");
    expect(json.reportType).toBe("session-comparison");
    expect(json.sessionA.session.sessionId).toBe("a");
    expect(json.sessionB.session.sessionId).toBe("b");
    expect(json.sessionA.session.videoFileName).toBeUndefined();
    expect(json.sessionB.session.videoFileName).toBeUndefined();
    expect(json.warnings).toBeDefined();
    expect(json.pitchResults).toBeDefined();
    expect(json.totalEvents.diff).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Zero-event Session A handling in Comparison
// ---------------------------------------------------------------------------

describe("compareReports — zero-event handling", () => {
  it("produces valid comparison model when Session A has zero events", () => {
    const sessionA = makeSession({ sessionId: "a" });
    const sessionB = makeSession({ sessionId: "b" });
    
    // Session A is empty, Session B has 1 event
    const reportA = buildSessionReport(sessionA, [], "2026-06-01T10:00:00.000Z");
    const reportB = buildSessionReport(sessionB, [makeEvent()], "2026-06-01T11:00:00.000Z");
    
    const comp = compareReports(reportA, reportB);
    
    expect(comp.totalEvents.aValue).toBe(0);
    expect(comp.totalEvents.bValue).toBe(1);
    expect(comp.totalEvents.diff).toBe(1);
    
    // Warning about zero events should be present
    expect(comp.warnings.some(w => w.code === "zero_events")).toBe(true);
  });
});
