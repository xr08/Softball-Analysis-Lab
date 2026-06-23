import { AnalysisEvent, ExportedSession, SessionMetadata } from "./types";

function escapeCsvValue(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '""';
  }
  const escaped = String(value).replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}

export function toCsv(session: SessionMetadata, events: AnalysisEvent[]): string {
  const headers = [
    "eventId",
    "timestampSeconds",
    "timestampLabel",
    "tagId",
    "tagLabel",
    "category",
    "note",
    "count",
    "pitchLocation",
    "contactDirection",
    "contactQuality",
    "result",
    "createdAt",
    "sessionId",
    "sessionName",
    "sessionDate",
    "playerName",
    "opponent",
    "videoFileName"
  ];

  const rows = events.map((event) =>
    [
      event.id,
      event.timestampSeconds.toString(),
      event.timestampLabel,
      event.tagId,
      event.tagLabel,
      event.category,
      event.note,
      event.count,
      event.pitchLocation,
      event.contactDirection,
      event.contactQuality,
      event.result,
      event.createdAt,
      session.sessionId,
      session.sessionName,
      session.sessionDate,
      session.playerName,
      session.opponent,
      session.videoFileName
    ]
      .map(escapeCsvValue)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function toJson(session: SessionMetadata, events: AnalysisEvent[]): string {
  const exportedData: ExportedSession = {
    schemaVersion: "1.0",
    exportedAt: new Date().toISOString(),
    session,
    events
  };
  return JSON.stringify(exportedData, null, 2);
}

export function parseImportedSession(text: string): ExportedSession {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid session format");
  }
  if (parsed.schemaVersion !== "1.0") {
    throw new Error(`Unsupported schema version: ${parsed.schemaVersion || "none"}`);
  }
  if (!parsed.session || typeof parsed.session !== "object") {
    throw new Error("Missing session metadata");
  }
  if (!Array.isArray(parsed.events)) {
    throw new Error("Missing or invalid events array");
  }
  return parsed as ExportedSession;
}


