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
    "sessionId",
    "playerName",
    "sessionName",
    "sessionDate",
    "opponent",
    "videoFileName",
    "timestampSeconds",
    "timestampLabel",
    "tagId",
    "tagLabel",
    "category",
    "balls",
    "strikes",
    "pitchResult",
    "pitchLocationZone",
    "pitchLocationLabel",
    "batterHandedness",
    "contactDirection",
    "contactQuality",
    "result",
    "note",
    "source",
    "reviewStatus",
    "createdAt"
  ];

  const rows = events.map((event) => {
    let balls = null;
    let strikes = null;
    if (event.count) {
      const parts = event.count.split("-");
      if (parts.length === 2) {
        balls = parts[0];
        strikes = parts[1];
      }
    }

    return [
      session.sessionId,
      session.playerName,
      session.sessionName,
      session.sessionDate,
      session.opponent,
      session.videoFileName,
      event.timestampSeconds.toString(),
      event.timestampLabel,
      event.tagId,
      event.tagLabel,
      event.category,
      balls,
      strikes,
      event.pitchResult,
      event.pitchLocationZone,
      event.pitchLocationLabel,
      event.batterHandedness,
      event.contactDirection,
      event.contactQuality,
      event.result,
      event.note,
      "manual", // source
      "unreviewed", // review status
      event.createdAt
    ]
      .map(escapeCsvValue)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function toJson(session: SessionMetadata, events: AnalysisEvent[]): string {
  const exportedData: ExportedSession = {
    schemaVersion: "1.1",
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
  if (parsed.reportFormat) {
    throw new Error("This is a Report JSON file, which cannot be imported as a session. Please select a Session JSON file.");
  }
  if (parsed.schemaVersion !== "1.0" && parsed.schemaVersion !== "1.1") {
    throw new Error(`Unsupported schema version: ${parsed.schemaVersion || "none"}`);
  }
  if (!parsed.session || typeof parsed.session !== "object") {
    throw new Error("Missing session metadata");
  }
  if (!Array.isArray(parsed.events)) {
    throw new Error("Missing or invalid events array");
  }

  // Migrate schema 1.0 to 1.1
  const migratedSession = {
    ...parsed.session,
    batterHandedness: parsed.session.batterHandedness ?? null,
  };

  const migratedEvents = parsed.events.map((event: any) => ({
    ...event,
    pitchResult: event.pitchResult ?? null,
    pitchLocationZone: event.pitchLocationZone ?? null,
    pitchLocationLabel: event.pitchLocationLabel ?? null,
    batterHandedness: event.batterHandedness ?? null,
    contactDirection: event.contactDirection ?? null,
    contactQuality: event.contactQuality ?? null,
    result: event.result ?? null,
  }));

  return {
    schemaVersion: "1.1",
    exportedAt: parsed.exportedAt || new Date().toISOString(),
    session: migratedSession,
    events: migratedEvents
  } as ExportedSession;
}


