/**
 * lib/analysis/review.ts
 *
 * Pure helper functions for VT-3 Review Mode.
 * No React, no DOM, no side effects — fully unit-testable.
 *
 * Preset stable IDs are derived from the actual STAGE_1_TAGS registry
 * and the VT-2 structured values already defined in types.ts.
 */

import { AnalysisEvent } from "./types";

// ---------------------------------------------------------------------------
// Filter state type
// ---------------------------------------------------------------------------

export type ReviewFilters = {
  /** Tag IDs — OR logic within the group */
  tagIds: string[];
  /** Pitch result values — OR logic within the group */
  pitchResults: Array<AnalysisEvent["pitchResult"]>;
  /** Pitch location zone values — OR logic within the group */
  pitchLocationZones: Array<AnalysisEvent["pitchLocationZone"]>;
  /** Contact direction values — OR logic within the group */
  contactDirections: Array<AnalysisEvent["contactDirection"]>;
  /** Contact quality values — OR logic within the group */
  contactQualities: Array<AnalysisEvent["contactQuality"]>;
  /** At-bat result values — OR logic within the group */
  results: Array<AnalysisEvent["result"]>;
  /** Batter handedness values — OR logic within the group (null = unknown) */
  batterHandedness: Array<"right" | "left" | null>;
  /**
   * Count filter — balls component. null = not filtering on balls.
   * Valid live count values: 0–3 (per VT-2 constraint).
   */
  ballsFilter: number | null;
  /**
   * Count filter — strikes component. null = not filtering on strikes.
   * Valid live count values: 0–2 (per VT-2 constraint).
   */
  strikesFilter: number | null;
  /** Case-insensitive text search across tagLabel and note */
  textSearch: string;
};

// ---------------------------------------------------------------------------
// Preset type
// ---------------------------------------------------------------------------

export type ReviewPreset = {
  id: string;
  label: string;
  filters: Partial<ReviewFilters>;
};

// ---------------------------------------------------------------------------
// Preset definitions — stable IDs from STAGE_1_TAGS + VT-2 values
// ---------------------------------------------------------------------------

/**
 * Presets are built from IDs confirmed in the tag registry
 * (lib/analysis/tags.ts) and VT-2 structured value literals (types.ts).
 *
 * Registry IDs referenced:
 *   swing          — "Swing"          (Swing Decision)
 *   swing_and_miss — "Swing and miss" (Swing Decision)
 *   hit            — "Hit"            (Outcome)
 *   out            — "Out"            (Outcome)
 *   strikeout      — "Strikeout"      (Outcome)
 *
 * VT-2 structured values referenced:
 *   pitchResult:   "ball_in_play"
 *   contactQuality: "hard"
 *   result:        "single"|"double"|"triple"|"home_run"
 *   result:        "field_out"|"strikeout"|"fielders_choice"
 */
export const REVIEW_PRESETS: ReviewPreset[] = [
  {
    id: "all_swings",
    label: "All Swings",
    filters: {
      tagIds: ["swing", "swing_and_miss"]
    }
  },
  {
    id: "balls_in_play",
    label: "Balls in Play",
    filters: {
      pitchResults: ["ball_in_play"]
    }
  },
  {
    id: "hard_contact",
    label: "Hard Contact",
    filters: {
      contactQualities: ["hard"]
    }
  },
  {
    id: "two_strike",
    label: "Two-Strike Pitches",
    filters: {
      strikesFilter: 2
    }
  },
  {
    id: "hits",
    label: "Hits",
    filters: {
      results: ["single", "double", "triple", "home_run"]
    }
  },
  {
    id: "outs",
    label: "Outs",
    filters: {
      results: ["field_out", "strikeout", "fielders_choice"]
    }
  }
];

// ---------------------------------------------------------------------------
// Filter factory / utilities
// ---------------------------------------------------------------------------

/** Returns a filter state with no active filters. */
export function emptyFilters(): ReviewFilters {
  return {
    tagIds: [],
    pitchResults: [],
    pitchLocationZones: [],
    contactDirections: [],
    contactQualities: [],
    results: [],
    batterHandedness: [],
    ballsFilter: null,
    strikesFilter: null,
    textSearch: ""
  };
}

/** Returns true if at least one filter is active. */
export function hasActiveFilters(filters: ReviewFilters): boolean {
  return (
    filters.tagIds.length > 0 ||
    filters.pitchResults.length > 0 ||
    filters.pitchLocationZones.length > 0 ||
    filters.contactDirections.length > 0 ||
    filters.contactQualities.length > 0 ||
    filters.results.length > 0 ||
    filters.batterHandedness.length > 0 ||
    filters.ballsFilter !== null ||
    filters.strikesFilter !== null ||
    filters.textSearch.trim() !== ""
  );
}

/** Applies a preset, merging into empty filters. */
export function applyPreset(preset: ReviewPreset): ReviewFilters {
  return { ...emptyFilters(), ...preset.filters };
}

// ---------------------------------------------------------------------------
// Count parsing helpers
// ---------------------------------------------------------------------------

function parseCount(count: string | null): { balls: number; strikes: number } | null {
  if (!count) return null;
  const parts = count.split("-");
  if (parts.length !== 2) return null;
  const balls = parseInt(parts[0], 10);
  const strikes = parseInt(parts[1], 10);
  if (isNaN(balls) || isNaN(strikes)) return null;
  return { balls, strikes };
}

// ---------------------------------------------------------------------------
// Core filter predicate — AND across groups, OR within each group
// ---------------------------------------------------------------------------

/**
 * Returns true if the event matches ALL active filter groups.
 *
 * - Multiple values within one group use OR logic.
 * - Multiple groups use AND logic.
 * - An empty group is ignored (passes all events through).
 * - Null/missing values can be explicitly filtered for by using `null` in a group array.
 */
export function eventMatchesFilters(event: AnalysisEvent, filters: ReviewFilters): boolean {
  // --- Tag IDs (OR) ---
  if (filters.tagIds.length > 0 && !filters.tagIds.includes(event.tagId)) {
    return false;
  }

  // --- Pitch result (OR) ---
  if (filters.pitchResults.length > 0 && !filters.pitchResults.includes(event.pitchResult)) {
    return false;
  }

  // --- Pitch location zone (OR) ---
  if (filters.pitchLocationZones.length > 0 && !filters.pitchLocationZones.includes(event.pitchLocationZone)) {
    return false;
  }

  // --- Contact direction (OR) ---
  if (filters.contactDirections.length > 0 && !filters.contactDirections.includes(event.contactDirection)) {
    return false;
  }

  // --- Contact quality (OR) ---
  if (filters.contactQualities.length > 0 && !filters.contactQualities.includes(event.contactQuality)) {
    return false;
  }

  // --- At-bat result (OR) ---
  if (filters.results.length > 0 && !filters.results.includes(event.result)) {
    return false;
  }

  // --- Batter handedness (OR) ---
  if (filters.batterHandedness.length > 0 && !filters.batterHandedness.includes(event.batterHandedness)) {
    return false;
  }

  // --- Count filter ---
  const parsed = parseCount(event.count);
  if (filters.ballsFilter !== null) {
    if (!parsed || parsed.balls !== filters.ballsFilter) return false;
  }
  if (filters.strikesFilter !== null) {
    if (!parsed || parsed.strikes !== filters.strikesFilter) return false;
  }

  // --- Text search (case-insensitive substring across tagLabel and note) ---
  const search = filters.textSearch.trim().toLowerCase();
  if (search !== "") {
    const haystack = `${event.tagLabel} ${event.note}`.toLowerCase();
    if (!haystack.includes(search)) return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Filter + sort
// ---------------------------------------------------------------------------

/**
 * Filters events by current filters and sorts ascending by timestamp.
 * Tie-break by createdAt (ISO string comparison) then by id for full stability.
 * Never mutates the original array.
 */
export function filterAndSortEvents(events: AnalysisEvent[], filters: ReviewFilters): AnalysisEvent[] {
  return events
    .filter((event) => eventMatchesFilters(event, filters))
    .sort((a, b) => {
      const tsDiff = a.timestampSeconds - b.timestampSeconds;
      if (tsDiff !== 0) return tsDiff;
      const caDiff = a.createdAt.localeCompare(b.createdAt);
      if (caDiff !== 0) return caDiff;
      return a.id.localeCompare(b.id);
    });
}

// ---------------------------------------------------------------------------
// Navigation helpers
// ---------------------------------------------------------------------------

/**
 * Returns the index of `eventId` in `filteredEvents`, or -1 if not found.
 */
export function getFilteredIndex(filteredEvents: AnalysisEvent[], eventId: string | null): number {
  if (!eventId) return -1;
  return filteredEvents.findIndex((e) => e.id === eventId);
}

/**
 * Returns the event after the current one in the filtered list, or null if at the end.
 */
export function getNextEvent(filteredEvents: AnalysisEvent[], currentId: string | null): AnalysisEvent | null {
  const index = getFilteredIndex(filteredEvents, currentId);
  if (index < 0 || index >= filteredEvents.length - 1) return null;
  return filteredEvents[index + 1];
}

/**
 * Returns the event before the current one in the filtered list, or null if at the start.
 */
export function getPrevEvent(filteredEvents: AnalysisEvent[], currentId: string | null): AnalysisEvent | null {
  const index = getFilteredIndex(filteredEvents, currentId);
  if (index <= 0) return null;
  return filteredEvents[index - 1];
}

/**
 * Resolves the new selected event ID after filters change.
 *
 * Rules (per spec):
 * - If current event still matches → keep it.
 * - If current event no longer matches → select first matching event.
 * - If no events match → clear selection (return null).
 */
export function resolveSelectedAfterFilterChange(
  filteredEvents: AnalysisEvent[],
  currentId: string | null
): string | null {
  if (filteredEvents.length === 0) return null;
  if (currentId && filteredEvents.some((e) => e.id === currentId)) return currentId;
  return filteredEvents[0].id;
}

// ---------------------------------------------------------------------------
// Playback boundary helpers
// ---------------------------------------------------------------------------

/**
 * Returns the safe seek start for a clip, clamped to 0.
 */
export function clampPreRoll(timestampSeconds: number, preRollSeconds: number): number {
  return Math.max(0, timestampSeconds - preRollSeconds);
}

/**
 * Returns the safe clip end, clamped to the video duration.
 * `videoDuration` may be Infinity for streams — treat as unclamped if Infinity.
 */
export function clampPostRoll(
  timestampSeconds: number,
  postRollSeconds: number,
  videoDuration: number
): number {
  const raw = timestampSeconds + postRollSeconds;
  if (!isFinite(videoDuration) || videoDuration <= 0) return raw;
  return Math.min(raw, videoDuration);
}

// ---------------------------------------------------------------------------
// Review summary
// ---------------------------------------------------------------------------

export type ReviewSummary = {
  totalCount: number;
  pitchResults: Record<string, number>;
  contactQualities: Record<string, number>;
  pitchLocationZones: Record<string, number>;
  results: Record<string, number>;
};

const NOT_SET = "Not set";

/**
 * Derives a summary breakdown from the currently filtered events.
 * Null/missing values are grouped under "Not set".
 * Never infers missing data.
 */
export function getReviewSummary(filteredEvents: AnalysisEvent[]): ReviewSummary {
  const pitchResults: Record<string, number> = {};
  const contactQualities: Record<string, number> = {};
  const pitchLocationZones: Record<string, number> = {};
  const results: Record<string, number> = {};

  for (const event of filteredEvents) {
    const pr = event.pitchResult ?? NOT_SET;
    pitchResults[pr] = (pitchResults[pr] ?? 0) + 1;

    const cq = event.contactQuality ?? NOT_SET;
    contactQualities[cq] = (contactQualities[cq] ?? 0) + 1;

    const pz = event.pitchLocationZone ?? NOT_SET;
    pitchLocationZones[pz] = (pitchLocationZones[pz] ?? 0) + 1;

    const res = event.result ?? NOT_SET;
    results[res] = (results[res] ?? 0) + 1;
  }

  return {
    totalCount: filteredEvents.length,
    pitchResults,
    contactQualities,
    pitchLocationZones,
    results
  };
}
