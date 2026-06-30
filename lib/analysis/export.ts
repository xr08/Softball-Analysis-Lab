import { ExportedSession, Session, Player, AtBat, VideoSource, TaggedEvent } from "./types";

function escapeCsvValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const escaped = String(value).replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}

export function toCsv(
  session: Session,
  players: Player[],
  atBats: AtBat[],
  events: TaggedEvent[]
): string {
  const headers = [
    "sessionId",
    "sessionName",
    "sessionDate",
    "opponent",
    "timestampSeconds",
    "timestampLabel",
    "eventRole",
    "playerId",
    "relatedPlayerId",
    "teamSide",
    "tag",
    "category",
    "pitchCount",
    "pitchResult",
    "pitchLocation",
    "pitchType",
    "contactType",
    "contactQuality",
    "playResult",
    "note",
    "source",
    "reviewStatus",
    "createdAt"
  ];

  const rows = events.map((event) => {
    return [
      session.id,
      session.name,
      session.date,
      session.context,
      event.timestampSeconds.toString(),
      event.timestampLabel,
      event.eventRole,
      event.playerId,
      event.relatedPlayerId,
      event.teamSide,
      event.tag,
      event.category,
      event.pitchCount,
      event.pitchResult,
      event.pitchLocation,
      event.pitchType,
      event.contactType,
      event.contactQuality,
      event.playResult,
      event.note,
      event.source,
      event.reviewStatus,
      event.createdAt
    ]
      .map(escapeCsvValue)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function toJson(
  session: Session,
  players: Player[],
  videoSources: VideoSource[],
  atBats: AtBat[],
  events: TaggedEvent[]
): string {
  const exportedData: ExportedSession = {
    schemaVersion: "2.0",
    session,
    players,
    videoSources,
    atBats,
    events
  };
  return JSON.stringify(exportedData, null, 2);
}

export function parseImportedSession(text: string): ExportedSession {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid session format");
  }
  if (parsed.reportFormat) {
    throw new Error("This is a Report JSON file, which cannot be imported as a session. Please select a Session JSON file.");
  }
  if (parsed.schemaVersion !== "2.0") {
    throw new Error(`Unsupported legacy schema version: ${parsed.schemaVersion || "none"}. This app requires schema version 2.0.`);
  }

  return parsed as ExportedSession;
}
