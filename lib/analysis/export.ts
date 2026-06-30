import { ExportedSession, Session, Player, AtBat, VideoSource, TaggedEvent } from "./types";
import { UNKNOWN_PLAYER_LABEL } from "./workflow";

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
    const playerName = player?.name ?? UNKNOWN_PLAYER_LABEL;
    const relatedPlayerName = event.relatedPlayerId ? relatedPlayer?.name ?? "Unknown player" : "";

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
      playerName,
      event.relatedPlayerId,
      relatedPlayerName,
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

export function getPrimaryVideoFileName(exportedSession: ExportedSession): string | null {
  const firstName = exportedSession.videoSources.find((source) => source.fileName.trim())?.fileName.trim();
  return firstName || null;
}

export function buildImportRestoreMessage(importedFileName: string, exportedSession: ExportedSession): string {
  const originalVideoFileName = getPrimaryVideoFileName(exportedSession);
  if (originalVideoFileName) {
    return `Imported ${importedFileName}. To resume playback, re-select the original local video file: ${originalVideoFileName}.`;
  }

  return `Imported ${importedFileName}. To resume playback, re-select the original local video file used for this session.`;
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
  if (!parsed.session || !Array.isArray(parsed.events)) {
    throw new Error("Invalid session JSON: expected a session and events array.");
  }

  const videoSources = Array.isArray(parsed.videoSources)
    ? parsed.videoSources
        .filter((source: Partial<VideoSource>) => typeof source.fileName === "string")
        .map((source: Partial<VideoSource>, index: number): VideoSource => {
          const durationSeconds =
            typeof source.durationSeconds === "number" &&
            Number.isFinite(source.durationSeconds) &&
            source.durationSeconds > 0
              ? source.durationSeconds
              : undefined;

          return {
            id: typeof source.id === "string" && source.id ? source.id : `imported-video-${index + 1}`,
            sessionId: typeof source.sessionId === "string" && source.sessionId ? source.sessionId : parsed.session.id,
            fileName: source.fileName ?? "",
            sourceType: "local_file",
            type: source.type === "angle2" || source.type === "angle3" ? source.type : "main",
            durationSeconds,
            addedAt: typeof source.addedAt === "string" && source.addedAt ? source.addedAt : parsed.session.createdAt
          };
        })
    : [];

  return {
    schemaVersion: "2.0",
    session: parsed.session,
    players: Array.isArray(parsed.players) ? parsed.players : [],
    videoSources,
    atBats: Array.isArray(parsed.atBats) ? parsed.atBats : [],
    events: parsed.events
  } as ExportedSession;
}
