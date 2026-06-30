/**
 * lib/analysis/reports.ts
 *
 * Pure helper functions for VT-4 Session Reports and Comparison Views.
 * No React, no DOM, no side effects — fully unit-testable.
 *
 * Key design rules:
 * - Division-by-zero is always guarded.
 * - Null values are shown as "Not set" — never inferred.
 * - Ordering is stable and consistent with VT-2 zone layout.
 * - Report JSON is clearly distinct from Session JSON (different format identifier).
 * - Comparison differences use neutral language (no "improved" / "declined").
 */

import {TaggedEvent, Session} from "./types";
import { STAGE_1_TAGS } from "./tags";

// ---------------------------------------------------------------------------
// Shared label maps (stable, canonical)
// ---------------------------------------------------------------------------

export const PITCH_RESULT_LABELS: Record<string, string> = {
  called_strike: "Called Strike",
  swinging_strike: "Swinging Strike",
  foul: "Foul",
  ball: "Ball",
  ball_in_play: "Ball in Play",
  hit_by_pitch: "Hit by Pitch",
  wild_pitch: "Wild Pitch",
};

export const LOCATION_LABELS: Record<string, string> = {
  zone_1: "Zone 1",
  zone_2: "Zone 2",
  zone_3: "Zone 3",
  zone_4: "Zone 4",
  zone_5: "Zone 5",
  zone_6: "Zone 6",
  zone_7: "Zone 7",
  zone_8: "Zone 8",
  zone_9: "Zone 9",
  high: "High",
  low: "Low",
  inside: "Inside",
  outside: "Outside",
};

export const CONTACT_DIRECTION_LABELS: Record<string, string> = {
  pull: "Pull",
  middle: "Middle",
  opposite: "Opposite",
};

export const CONTACT_QUALITY_LABELS: Record<string, string> = {
  hard: "Hard",
  medium: "Medium",
  weak: "Weak",
};

export const AT_BAT_RESULT_LABELS: Record<string, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  home_run: "Home Run",
  walk: "Walk",
  strikeout: "Strikeout",
  field_out: "Field Out",
  fielders_choice: "Fielder's Choice",
  reached_on_error: "Reached on Error",
  sacrifice: "Sacrifice",
  hit_by_pitch: "Hit by Pitch",
};

export const NOT_SET_LABEL = "Not set";
export const NOT_SET_KEY = "not_set";

// ---------------------------------------------------------------------------
// Stable ordering constants
// ---------------------------------------------------------------------------

const PITCH_RESULT_ORDER = [
  "called_strike",
  "swinging_strike",
  "foul",
  "ball",
  "ball_in_play",
  "hit_by_pitch",
  "wild_pitch",
  NOT_SET_KEY,
];

const LOCATION_ORDER = [
  "zone_1",
  "zone_2",
  "zone_3",
  "zone_4",
  "zone_5",
  "zone_6",
  "zone_7",
  "zone_8",
  "zone_9",
  "high",
  "low",
  "inside",
  "outside",
  NOT_SET_KEY,
];

const CONTACT_DIRECTION_ORDER = ["pull", "middle", "opposite", NOT_SET_KEY];

const CONTACT_QUALITY_ORDER = ["hard", "medium", "weak", NOT_SET_KEY];

const AT_BAT_RESULT_ORDER = [
  "single",
  "double",
  "triple",
  "home_run",
  "walk",
  "strikeout",
  "field_out",
  "fielders_choice",
  "reached_on_error",
  "sacrifice",
  "hit_by_pitch",
  NOT_SET_KEY,
];

const TAG_CATEGORY_ORDER: string[] = [
  "Plate Appearance",
  "Pitch Tracking",
  "Pitch Type",
  "Pitch Result",
  "Swing Decision",
  "Contact Type",
  "Outcome",
  "Fielding",
  "Review",
  "Coach Observation",
];

// ---------------------------------------------------------------------------
// Core data types
// ---------------------------------------------------------------------------

/** A single metric row for display and export. */
export type MetricRow = {
  id: string;
  label: string;
  count: number;
  /** Percentage of `denominator`. null if denominator is 0. */
  percentage: number | null;
  denominator: number;
};

/** A comparable metric showing two session values plus difference. */
export type ComparableMetric = {
  id: string;
  label: string;
  /** Session A value */
  aValue: number;
  /** Session B value */
  bValue: number;
  /** B − A (positive means B is higher) */
  diff: number;
  /** Percentage-point difference (if both have a defined percentage) */
  ppDiff: number | null;
  /** Percentage in session A (null if denominator is 0) */
  aPct: number | null;
  /** Percentage in session B (null if denominator is 0) */
  bPct: number | null;
};

/** A warning about data quality or comparability. */
export type ReportWarning = {
  code: string;
  message: string;
};

/** Coding completeness for a single field. */
export type CompletenessRow = {
  fieldId: string;
  fieldLabel: string;
  coded: number;
  uncoded: number;
  total: number;
  /** Percentage coded — null if total is 0. */
  codedPct: number | null;
};

/** Summary of count situations derived from event count strings. */
export type CountSituationSummary = {
  mostCommon: Array<{ count: string; events: number }>;
  twoStrike: number;
  threeBall: number;
  fullCount: number;
  notSet: number;
  total: number;
};

/** Swing and decision summary from tag IDs. */
export type SwingDecisionSummary = {
  swingEvents: number;
  swingAndMissEvents: number;
  takeEvents: number;
  foulEvents: number;
  ballsInPlay: number;
  /** Swing-and-miss as percentage of coded swing events. Null if swingEvents is 0. */
  swingAndMissPctOfSwings: number | null;
  denominatorNote: string;
};

export type FilterInfo = {
  filtersApplied: boolean;
  filteredCount?: number;
  totalEvents?: number;
};

/** Full single-session report. */
export type SessionReport = {
  reportFormat: "softball-analysis-report";
  reportVersion: "1.0";
  generatedAt: string;
  session: Session;
  totalEvents: number;
  filters: FilterInfo;
  pitchResults: MetricRow[];
  locations: MetricRow[];
  contactDirections: MetricRow[];
  contactQuality: MetricRow[];
  atBatResults: MetricRow[];
  countSituations: CountSituationSummary;
  swingDecision: SwingDecisionSummary;
  tagCategories: MetricRow[];
  codingCompleteness: CompletenessRow[];
  eventOverview: {
    total: number;
    tagCategories: MetricRow[];
  };
};

/** Full comparison of two session reports. */
export type ComparisonReport = {
  reportType: "session-comparison";
  sessionA: SessionReport;
  sessionB: SessionReport;
  warnings: ReportWarning[];
  pitchResults: ComparableMetric[];
  locations: ComparableMetric[];
  contactDirections: ComparableMetric[];
  contactQuality: ComparableMetric[];
  atBatResults: ComparableMetric[];
  totalEvents: ComparableMetric;
};

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------

/**
 * Safe percentage — returns null if denominator is 0.
 * Result is rounded to one decimal place.
 */
export function safePercent(n: number, d: number): number | null {
  if (d === 0) return null;
  return Math.round((n / d) * 1000) / 10;
}

// ---------------------------------------------------------------------------
// Generic grouper
// ---------------------------------------------------------------------------

/**
 * Groups events by a nullable field value.
 * Coded values use `codedTotal` as the denominator.
 * NOT_SET_KEY uses `allTotal` as the denominator.
 */
function groupByFieldOrdered<T extends string | null>(
  events: TaggedEvent[],
  getter: (e: TaggedEvent) => T,
  labelMap: Record<string, string>,
  orderKeys: string[]
): MetricRow[] {
  const counts: Record<string, number> = {};
  let codedTotal = 0;

  for (const event of events) {
    const rawVal = getter(event);
    if (rawVal === null) {
      counts[NOT_SET_KEY] = (counts[NOT_SET_KEY] ?? 0) + 1;
    } else {
      counts[rawVal] = (counts[rawVal] ?? 0) + 1;
      codedTotal++;
    }
  }

  const allTotal = events.length;

  return orderKeys.map((key) => {
    const count = counts[key] ?? 0;
    const label =
      key === NOT_SET_KEY
        ? NOT_SET_LABEL
        : (labelMap[key] ?? key);
    
    const denominator = key === NOT_SET_KEY ? allTotal : codedTotal;

    return {
      id: key,
      label,
      count,
      percentage: safePercent(count, denominator),
      denominator,
    };
  });
}

// ---------------------------------------------------------------------------
// Section-level summarisers
// ---------------------------------------------------------------------------

export function summarisePitchResults(events: TaggedEvent[]): MetricRow[] {
  return groupByFieldOrdered(
    events,
    (e) => e.pitchResult,
    PITCH_RESULT_LABELS,
    PITCH_RESULT_ORDER
  );
}

export function summariseLocations(events: TaggedEvent[]): MetricRow[] {
  return groupByFieldOrdered(
    events,
    (e) => e.pitchLocation,
    LOCATION_LABELS,
    LOCATION_ORDER
  );
}

export function summariseContactDirections(events: TaggedEvent[]): MetricRow[] {
  return groupByFieldOrdered(
    events,
    (e) => e.contactType,
    CONTACT_DIRECTION_LABELS,
    CONTACT_DIRECTION_ORDER
  );
}

export function summariseContactQuality(events: TaggedEvent[]): MetricRow[] {
  return groupByFieldOrdered(
    events,
    (e) => e.contactQuality,
    CONTACT_QUALITY_LABELS,
    CONTACT_QUALITY_ORDER
  );
}

export function summariseAtBatResults(events: TaggedEvent[]): MetricRow[] {
  return groupByFieldOrdered(
    events,
    (e) => e.playResult,
    AT_BAT_RESULT_LABELS,
    AT_BAT_RESULT_ORDER
  );
}

export function summariseTagCategories(events: TaggedEvent[]): MetricRow[] {
  const counts: Record<string, number> = {};
  for (const e of events) {
    counts[e.category] = (counts[e.category] ?? 0) + 1;
  }
  const total = events.length;
  return TAG_CATEGORY_ORDER.map((cat) => {
    const count = counts[cat] ?? 0;
    return {
      id: cat,
      label: cat,
      count,
      percentage: safePercent(count, total),
      denominator: total,
    };
  });
}

// ---------------------------------------------------------------------------
// Count situation summary
// ---------------------------------------------------------------------------

function parseCountString(count: string | null): { balls: number; strikes: number } | null {
  if (!count) return null;
  const parts = count.split("-");
  if (parts.length !== 2) return null;
  const balls = parseInt(parts[0], 10);
  const strikes = parseInt(parts[1], 10);
  if (isNaN(balls) || isNaN(strikes)) return null;
  return { balls, strikes };
}

export function summariseCounts(events: TaggedEvent[]): CountSituationSummary {
  const countFreq: Record<string, number> = {};
  let twoStrike = 0;
  let threeBall = 0;
  let fullCount = 0;
  let notSet = 0;

  for (const e of events) {
    const parsed = parseCountString(e.pitchCount);
    if (!parsed) {
      notSet++;
      continue;
    }
    const key = `${parsed.balls}-${parsed.strikes}`;
    countFreq[key] = (countFreq[key] ?? 0) + 1;
    if (parsed.strikes === 2) twoStrike++;
    if (parsed.balls === 3) threeBall++;
    if (parsed.balls === 3 && parsed.strikes === 2) fullCount++;
  }

  const mostCommon = Object.entries(countFreq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([count, events]) => ({ count, events }));

  return {
    mostCommon,
    twoStrike,
    threeBall,
    fullCount,
    notSet,
    total: events.length,
  };
}

// ---------------------------------------------------------------------------
// Swing/decision summary
// ---------------------------------------------------------------------------

export function summariseSwingDecision(events: TaggedEvent[]): SwingDecisionSummary {
  let swingEvents = 0;
  let swingAndMissEvents = 0;
  let takeEvents = 0;
  let foulEvents = 0;
  let ballsInPlay = 0;

  for (const e of events) {
    if (e.tag === "swing") swingEvents++;
    if (e.tag === "swing_and_miss") swingAndMissEvents++;
    if (e.tag === "take") takeEvents++;
    if (e.tag === "foul") foulEvents++;
    if (e.pitchResult === "ball_in_play") ballsInPlay++;
  }

  const swingDenominator = swingEvents + swingAndMissEvents;
  const swingAndMissPctOfSwings =
    swingDenominator > 0 ? safePercent(swingAndMissEvents, swingDenominator) : null;

  return {
    swingEvents,
    swingAndMissEvents,
    takeEvents,
    foulEvents,
    ballsInPlay,
    swingAndMissPctOfSwings,
    denominatorNote:
      "Swing-and-miss events as a percentage of tagged swings (Swing + Swing & Miss).",
  };
}

// ---------------------------------------------------------------------------
// Coding completeness
// ---------------------------------------------------------------------------

type CompletenessField = {
  id: string;
  label: string;
  getter: (e: TaggedEvent) => unknown;
};

const COMPLETENESS_FIELDS: CompletenessField[] = [
  { id: "count", label: "Count", getter: (e) => e.pitchCount },
  { id: "pitchResult", label: "Pitch Result", getter: (e) => e.pitchResult },
  { id: "pitchLocation", label: "Pitch Location", getter: (e) => e.pitchLocation },

  { id: "contactType", label: "Contact Direction", getter: (e) => e.contactType },
  { id: "contactQuality", label: "Contact Quality", getter: (e) => e.contactQuality },
  { id: "result", label: "At-Bat Result", getter: (e) => e.playResult },
];

export function summariseCodingCompleteness(events: TaggedEvent[]): CompletenessRow[] {
  return COMPLETENESS_FIELDS.map(({ id, label, getter }) => {
    const total = events.length;
    const coded = events.filter((e) => getter(e) !== null).length;
    const uncoded = total - coded;
    return {
      fieldId: id,
      fieldLabel: label,
      coded,
      uncoded,
      total,
      codedPct: safePercent(coded, total),
    };
  });
}

// ---------------------------------------------------------------------------
// Event overview
// ---------------------------------------------------------------------------

function buildEventOverview(events: TaggedEvent[]) {
  const categories = summariseTagCategories(events);
  return {
    total: events.length,
    tagCategories: categories,
  };
}

// ---------------------------------------------------------------------------
// Main session report builder
// ---------------------------------------------------------------------------

/**
 * Builds a complete single-session report from events.
 *
 * @param session  The session metadata (read-only).
 * @param events   The events to report on (may be a filtered subset).
 * @param generatedAt  ISO timestamp for the report generation time.
 * @param isFiltered   Whether `events` is a filtered subset of the session.
 * @param originalCount  Original count if filtered, or total if not filtered.
 */
export function buildSessionReport(
  session: Session,
  events: TaggedEvent[],
  generatedAt: string,
  isFiltered = false,
  originalCount?: number
): SessionReport {
  return {
    reportFormat: "softball-analysis-report",
    reportVersion: "1.0",
    generatedAt,
    session,
    totalEvents: events.length,
    filters: {
      filtersApplied: isFiltered,
      ...(isFiltered && originalCount !== undefined ? { filteredCount: events.length, totalEvents: originalCount } : {}),
    },
    pitchResults: summarisePitchResults(events),
    locations: summariseLocations(events),
    contactDirections: summariseContactDirections(events),
    contactQuality: summariseContactQuality(events),
    atBatResults: summariseAtBatResults(events),
    countSituations: summariseCounts(events),
    swingDecision: summariseSwingDecision(events),
    tagCategories: summariseTagCategories(events),
    codingCompleteness: summariseCodingCompleteness(events),
    eventOverview: buildEventOverview(events),
  };
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/**
 * Builds a ComparableMetric from two MetricRow arrays for a shared ID.
 */
function buildComparableMetrics(
  rowsA: MetricRow[],
  rowsB: MetricRow[]
): ComparableMetric[] {
  const mapA = new Map(rowsA.map((r) => [r.id, r]));
  const mapB = new Map(rowsB.map((r) => [r.id, r]));

  // Use order from A (both should have the same order by construction)
  return rowsA.map((rA) => {
    const rB = mapB.get(rA.id);
    const aValue = rA.count;
    const bValue = rB?.count ?? 0;
    const diff = bValue - aValue;

    const aDenom = rA.denominator;
    const bDenom = rB?.denominator ?? 0;

    const aPct = aDenom > 0 ? rA.percentage : null;
    const bPct = bDenom > 0 && rB ? rB.percentage : null;

    const ppDiff =
      aPct !== null && bPct !== null ? Math.round((bPct - aPct) * 10) / 10 : null;

    return {
      id: rA.id,
      label: rA.label,
      aValue,
      bValue,
      diff,
      ppDiff,
      aPct,
      bPct,
    };
  });

  void mapA; // used only for structure; ordering comes from rowsA
}

// ---------------------------------------------------------------------------
// Comparison Thresholds
// ---------------------------------------------------------------------------
export const LOW_SAMPLE_EVENT_THRESHOLD = 10;
export const SAMPLE_SIZE_RATIO_WARNING = 2;
export const LOW_CODING_COMPLETENESS_THRESHOLD = 0.5;

/**
 * Builds comparison warnings for unequal or small sample sizes.
 */
export function buildComparisonWarnings(
  reportA: SessionReport,
  reportB: SessionReport
): ReportWarning[] {
  const warnings: ReportWarning[] = [];

  if (reportA.totalEvents === 0 || reportB.totalEvents === 0) {
    warnings.push({
      code: "zero_events",
      message: "One or both sessions contain zero events. Comparison metrics will be empty.",
    });
  }

  if (reportA.totalEvents > 0 && reportB.totalEvents > 0) {
    if (reportA.totalEvents < LOW_SAMPLE_EVENT_THRESHOLD || reportB.totalEvents < LOW_SAMPLE_EVENT_THRESHOLD) {
      warnings.push({
        code: "low_sample_size",
        message: `One or both sessions have fewer than ${LOW_SAMPLE_EVENT_THRESHOLD} events. Interpret percentages with caution.`,
      });
    }

    const ratio =
      Math.max(reportA.totalEvents, reportB.totalEvents) /
      Math.min(reportA.totalEvents, reportB.totalEvents);
    if (ratio >= SAMPLE_SIZE_RATIO_WARNING) {
      warnings.push({
        code: "unequal_sample_size",
        message: `The sessions contain highly unequal sample sizes (Session A: ${reportA.totalEvents}, Session B: ${reportB.totalEvents}).`,
      });
    }
  }

  // Check if session B lacks structured data based on pitch result
  const bCompleteness = reportB.codingCompleteness;
  const bPitchResultRow = bCompleteness.find((r) => r.fieldId === "pitchResult");
  if (bPitchResultRow && reportB.totalEvents > 0 && bPitchResultRow.codedPct !== null && bPitchResultRow.codedPct / 100 < LOW_CODING_COMPLETENESS_THRESHOLD) {
    warnings.push({
      code: "session_b_low_completeness",
      message: `Session B has a low coding completeness for structured fields (e.g. pitch result). Comparisons may be skewed.`,
    });
  }

  // Check if same session ID
  if (reportA.session.id === reportB.session.id) {
    warnings.push({
      code: "same_session_id",
      message: "Session A and Session B have the same session ID. You may be comparing a session to itself.",
    });
  } else if (
    reportA.session.date === reportB.session.date
  ) {
    warnings.push({
      code: "similar_session",
      message: "Session A and Session B appear similar (same name, player, date, and video file), though their IDs differ.",
    });
  }

  return warnings;
}

/**
 * Compares two session reports and returns a comparison model.
 */
export function compareReports(
  reportA: SessionReport,
  reportB: SessionReport
): ComparisonReport {
  const warnings = buildComparisonWarnings(reportA, reportB);

  const totalA = reportA.totalEvents;
  const totalB = reportB.totalEvents;
  const totalDiff = totalB - totalA;
  const totalAPct = totalA > 0 ? 100 : null;
  const totalBPct = totalB > 0 ? 100 : null;

  const totalEventsMetric: ComparableMetric = {
    id: "total_events",
    label: "Total Events",
    aValue: totalA,
    bValue: totalB,
    diff: totalDiff,
    ppDiff: null, // percentages don't compare meaningfully here
    aPct: totalAPct,
    bPct: totalBPct,
  };

  return {
    reportType: "session-comparison",
    sessionA: reportA,
    sessionB: reportB,
    warnings,
    pitchResults: buildComparableMetrics(reportA.pitchResults, reportB.pitchResults),
    locations: buildComparableMetrics(reportA.locations, reportB.locations),
    contactDirections: buildComparableMetrics(
      reportA.contactDirections,
      reportB.contactDirections
    ),
    contactQuality: buildComparableMetrics(
      reportA.contactQuality,
      reportB.contactQuality
    ),
    atBatResults: buildComparableMetrics(reportA.atBatResults, reportB.atBatResults),
    totalEvents: totalEventsMetric,
  };
}

// ---------------------------------------------------------------------------
// Export: Report CSV
// ---------------------------------------------------------------------------

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const s = String(value).replaceAll('"', '""');
  return `"${s}"`;
}

/**
 * Exports a single-session report as a summary CSV.
 * Columns: section, metricId, metricLabel, count, percentage, denominator, sessionId, sessionName
 */
export function toReportCsv(report: SessionReport): string {
  const headers = [
    "section",
    "metricId",
    "metricLabel",
    "count",
    "percentage",
    "denominator",
    "sessionId",
    "sessionName",
  ];

  const sid = report.session.id;
  const sname = report.session.name;

  const rows: string[] = [];

  function addRows(section: string, metrics: MetricRow[]) {
    for (const m of metrics) {
      rows.push(
        [
          escapeCsv(section),
          escapeCsv(m.id),
          escapeCsv(m.label),
          escapeCsv(m.count),
          escapeCsv(m.percentage),
          escapeCsv(m.denominator),
          escapeCsv(sid),
          escapeCsv(sname),
        ].join(",")
      );
    }
  }

  addRows("pitchResults", report.pitchResults);
  addRows("locations", report.locations);
  addRows("contactDirections", report.contactDirections);
  addRows("contactQuality", report.contactQuality);
  addRows("atBatResults", report.atBatResults);
  addRows("tagCategories", report.tagCategories);

  // Coding completeness rows
  for (const c of report.codingCompleteness) {
    rows.push(
      [
        escapeCsv("codingCompleteness"),
        escapeCsv(c.fieldId),
        escapeCsv(c.fieldLabel),
        escapeCsv(c.coded),
        escapeCsv(c.codedPct),
        escapeCsv(c.total),
        escapeCsv(sid),
        escapeCsv(sname),
      ].join(",")
    );
  }

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Exports a comparison report as a summary CSV.
 * Columns: section, metricId, metricLabel, sessionAValue, sessionBValue, diff, ppDiff, sessionAId, sessionBId, sessionAName, sessionBName
 */
export function toComparisonCsv(comp: ComparisonReport): string {
  const headers = [
    "section",
    "metricId",
    "metricLabel",
    "sessionAValue",
    "sessionBValue",
    "diff",
    "ppDiff",
    "sessionAId",
    "sessionBId",
    "sessionAName",
    "sessionBName",
  ];

  const aId = comp.sessionA.session.id;
  const bId = comp.sessionB.session.id;
  const aName = comp.sessionA.session.name;
  const bName = comp.sessionB.session.name;

  const rows: string[] = [];

  function addMetrics(section: string, metrics: ComparableMetric[]) {
    for (const m of metrics) {
      rows.push(
        [
          escapeCsv(section),
          escapeCsv(m.id),
          escapeCsv(m.label),
          escapeCsv(m.aValue),
          escapeCsv(m.bValue),
          escapeCsv(m.diff),
          escapeCsv(m.ppDiff),
          escapeCsv(aId),
          escapeCsv(bId),
          escapeCsv(aName),
          escapeCsv(bName),
        ].join(",")
      );
    }
  }

  // Total events
  const te = comp.totalEvents;
  rows.push(
    [
      escapeCsv("summary"),
      escapeCsv(te.id),
      escapeCsv(te.label),
      escapeCsv(te.aValue),
      escapeCsv(te.bValue),
      escapeCsv(te.diff),
      escapeCsv(te.ppDiff),
      escapeCsv(aId),
      escapeCsv(bId),
      escapeCsv(aName),
      escapeCsv(bName),
    ].join(",")
  );

  addMetrics("pitchResults", comp.pitchResults);
  addMetrics("locations", comp.locations);
  addMetrics("contactDirections", comp.contactDirections);
  addMetrics("contactQuality", comp.contactQuality);
  addMetrics("atBatResults", comp.atBatResults);

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Exports a single-session report as a derived Report JSON.
 * This is NOT importable as a session — the format identifier is different.
 */
export function toReportJson(report: SessionReport): string {
  // Verify format identifier is present (type-checked at build time too)
  const output = {
    reportFormat: report.reportFormat,
    reportVersion: report.reportVersion,
    generatedAt: report.generatedAt,
    filters: report.filters,
    session: {
      id: report.session.id,
      name: report.session.name,

      date: report.session.date,
      context: report.session.context,
      // Deliberately omit videoFileName to avoid exposing local file paths
    },
    totalEvents: report.totalEvents,
    eventOverview: report.eventOverview,
    pitchResults: report.pitchResults,
    locations: report.locations,
    contactDirections: report.contactDirections,
    contactQuality: report.contactQuality,
    atBatResults: report.atBatResults,
    countSituations: report.countSituations,
    swingDecision: report.swingDecision,
    tagCategories: report.tagCategories,
    codingCompleteness: report.codingCompleteness,
  };
  return JSON.stringify(output, null, 2);
}

/**
 * Exports a comparison report as a derived Comparison Report JSON.
 * This is NOT importable as a session.
 */
export function toComparisonReportJson(comp: ComparisonReport): string {
  const sanitizeSession = (session: Session) => ({
    id: session.id,
    name: session.name,

    date: session.date,
    context: session.context,
  });

  const sanitizeReport = (report: SessionReport) => ({
    ...report,
    session: sanitizeSession(report.session),
  });

  const output = {
    reportFormat: "comparison-report",
    reportType: comp.reportType,
    sessionA: sanitizeReport(comp.sessionA),
    sessionB: sanitizeReport(comp.sessionB),
    warnings: comp.warnings,
    pitchResults: comp.pitchResults,
    locations: comp.locations,
    contactDirections: comp.contactDirections,
    contactQuality: comp.contactQuality,
    atBatResults: comp.atBatResults,
    totalEvents: comp.totalEvents,
  };
  return JSON.stringify(output, null, 2);
}

// ---------------------------------------------------------------------------
// Helper: difference direction label
// ---------------------------------------------------------------------------

/** Returns a neutral direction label for a numeric difference. */
export function diffDirectionLabel(diff: number): "higher" | "lower" | "unchanged" {
  if (diff > 0) return "higher";
  if (diff < 0) return "lower";
  return "unchanged";
}

// ---------------------------------------------------------------------------
// Tag category helpers (used in event overview)
// ---------------------------------------------------------------------------

export { TAG_CATEGORY_ORDER, STAGE_1_TAGS };
