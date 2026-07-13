import { AtBat, Player, TaggedEvent } from "./types";
import { getPlayerName, UNKNOWN_PLAYER_LABEL } from "./workflow";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AtBatGroup = {
  atBat: AtBat;
  /** 1-based chronological position among all at-bats */
  atBatIndex: number;
  batterName: string;
  pitcherName: string;
  timeRangeLabel: string;
  status: "active" | "ended";
  events: TaggedEvent[];
};

export type GroupedTimeline = {
  atBatGroups: AtBatGroup[];
  ungroupedEvents: TaggedEvent[];
};

// ---------------------------------------------------------------------------
// Time formatting helpers
// ---------------------------------------------------------------------------

/**
 * Formats seconds into a compact MM:SS label for timeline display.
 * Does not include milliseconds — this is a coarse human-readable label
 * for range display, not the precise timestamp label on events.
 */
export function formatCompactTime(totalSeconds: number): string {
  const safeTotal = Math.max(0, totalSeconds);
  let hours = Math.floor(safeTotal / 3600);
  let mins = Math.floor((safeTotal % 3600) / 60);
  let secs = Math.floor(safeTotal % 60);

  if (hours > 0) {
    return `${hours}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

/**
 * Formats a time range for at-bat headers.
 * If endSeconds is undefined, shows an open range with "…".
 */
export function formatTimeRange(startSeconds: number, endSeconds?: number): string {
  const startLabel = formatCompactTime(startSeconds);
  if (endSeconds === undefined) {
    return `${startLabel}–…`;
  }
  return `${startLabel}–${formatCompactTime(endSeconds)}`;
}

// ---------------------------------------------------------------------------
// Grouping
// ---------------------------------------------------------------------------

/**
 * Groups events by their atBatId, producing ordered at-bat groups and
 * a separate ungrouped section. Events that reference an atBatId not found
 * in the atBats array are treated as ungrouped.
 *
 * At-bat groups are sorted by startTimestampSeconds.
 * Events within each group are sorted by timestampSeconds.
 * Ungrouped events are sorted by timestampSeconds.
 */
export function groupEventsByAtBat(
  events: TaggedEvent[],
  atBats: AtBat[],
  players: Player[]
): GroupedTimeline {
  const atBatById = new Map(atBats.map((ab) => [ab.id, ab]));

  // Build event buckets keyed by atBatId
  const eventsByAtBatId = new Map<string, TaggedEvent[]>();
  const ungroupedEvents: TaggedEvent[] = [];

  for (const event of events) {
    if (event.atBatId && atBatById.has(event.atBatId)) {
      const bucket = eventsByAtBatId.get(event.atBatId);
      if (bucket) {
        bucket.push(event);
      } else {
        eventsByAtBatId.set(event.atBatId, [event]);
      }
    } else {
      ungroupedEvents.push(event);
    }
  }

  // Sort at-bats chronologically
  const sortedAtBats = [...atBats].sort(
    (a, b) => a.startTimestampSeconds - b.startTimestampSeconds
  );

  const atBatGroups: AtBatGroup[] = sortedAtBats.map((atBat, index) => {
    const groupEvents = eventsByAtBatId.get(atBat.id) ?? [];
    // Sort events within this group by timestamp
    groupEvents.sort((a, b) => a.timestampSeconds - b.timestampSeconds);

    const status: "active" | "ended" =
      atBat.endTimestampSeconds === undefined ? "active" : "ended";

    return {
      atBat,
      atBatIndex: index + 1,
      batterName: getPlayerName(players, atBat.batterId),
      pitcherName: getPlayerName(players, atBat.pitcherId),
      timeRangeLabel: formatTimeRange(atBat.startTimestampSeconds, atBat.endTimestampSeconds),
      status,
      events: groupEvents,
    };
  });

  // Sort ungrouped events by timestamp
  ungroupedEvents.sort((a, b) => a.timestampSeconds - b.timestampSeconds);

  return { atBatGroups, ungroupedEvents };
}

// ---------------------------------------------------------------------------
// Label formatting
// ---------------------------------------------------------------------------

/**
 * Produces a readable at-bat header label.
 * Example: "AB 3 · Batter Name vs Pitcher Name · 01:24–02:10"
 */
export function formatAtBatHeaderLabel(group: AtBatGroup): string {
  const parts: string[] = [`AB ${group.atBatIndex}`];

  const batterDisplay = group.batterName === UNKNOWN_PLAYER_LABEL ? "Unknown" : group.batterName;
  const pitcherDisplay = group.pitcherName === UNKNOWN_PLAYER_LABEL ? "Unknown" : group.pitcherName;
  parts.push(`${batterDisplay} vs ${pitcherDisplay}`);

  parts.push(group.timeRangeLabel);

  return parts.join(" · ");
}

/**
 * Produces a compact pitch row label for the timeline.
 * Example: "Pitch 2 · 1-1 · Rise · Called Strike · Zone 5"
 *
 * Only includes fields that are present — unknowns are omitted rather than invented.
 */
export function formatPitchRowLabel(event: TaggedEvent, pitchIndex: number): string {
  const parts: string[] = [`Pitch ${pitchIndex}`];

  if (event.pitchCount) {
    parts.push(event.pitchCount);
  }

  if (event.pitchType) {
    parts.push(capitalize(event.pitchType.replace(/_/g, " ")));
  }

  if (event.pitchResult) {
    parts.push(capitalize(event.pitchResult.replace(/_/g, " ")));
  }

  if (event.pitchLocation) {
    parts.push(event.pitchLocation.replace(/_/g, " ").replace(/^zone /i, "Zone "));
  }

  if (event.contactType || event.contactQuality) {
    const contactParts: string[] = [];
    if (event.contactQuality) contactParts.push(capitalize(event.contactQuality));
    if (event.contactType) contactParts.push(capitalize(event.contactType));
    parts.push(contactParts.join(" "));
  }

  if (event.playResult) {
    parts.push(capitalize(event.playResult.replace(/_/g, " ")));
  }

  return parts.join(" · ");
}

/**
 * Produces a label for ungrouped events.
 * Example: "03:42 · swing · Contact: Hard Pull"
 */
export function formatUngroupedLabel(event: TaggedEvent): string {
  const parts: string[] = [formatCompactTime(event.timestampSeconds)];

  if (event.tag) {
    parts.push(event.tag);
  }

  // Add the most useful context fields
  if (event.pitchResult) {
    parts.push(capitalize(event.pitchResult.replace(/_/g, " ")));
  }

  if (event.contactQuality || event.contactType) {
    const contactParts: string[] = [];
    if (event.contactQuality) contactParts.push(capitalize(event.contactQuality));
    if (event.contactType) contactParts.push(capitalize(event.contactType));
    parts.push(`Contact: ${contactParts.join(" ")}`);
  }

  if (event.playResult) {
    parts.push(capitalize(event.playResult.replace(/_/g, " ")));
  }

  return parts.join(" · ");
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
