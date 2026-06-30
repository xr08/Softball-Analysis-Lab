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
  const playerById = new Map(players.map((player) => [player.id, player]));
  const atBatById = new Map(atBats.map((atBat) => [atBat.id, atBat]));

  const headers = [
    "sessionId",
    "sessionName",
    "sessionType",
    "sessionDate",
    "opponent",
    "atBatId",
    "atBatStartTimestampSeconds",
    "atBatEndTimestampSeconds",
    "timestampSeconds",
    "timestampLabel",
    "eventRole",
    "playerId",
    "playerName",
    "relatedPlayerId",
    "relatedPlayerName",
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
    const player = event.playerId ? playerById.get(event.playerId) : undefined;
    const relatedPlayer = event.relatedPlayerId ? playerById.get(event.relatedPlayerId) : undefined;
    const atBat = event.atBatId ? atBatById.get(event.atBatId) : undefined;

    return [
      session.id,
      session.name,
      session.sessionType,
      session.date,
      session.context,
      event.atBatId,
      atBat?.startTimestampSeconds,
      atBat?.endTimestampSeconds,
      event.timestampSeconds.toString(),
      event.timestampLabel,
      event.eventRole,
      event.playerId,
      player?.name,
      event.relatedPlayerId,
      relatedPlayer?.name,
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
