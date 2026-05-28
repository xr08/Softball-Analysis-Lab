import { AnalysisEvent } from "./types";

function escapeCsvValue(value: string): string {
  const escaped = value.replaceAll("\"", "\"\"");
  return `"${escaped}"`;
}

export function toCsv(events: AnalysisEvent[]): string {
  const headers = [
    "id",
    "timestampSeconds",
    "timestampLabel",
    "playerName",
    "sessionName",
    "countBalls",
    "countStrikes",
    "countLabel",
    "tag",
    "category",
    "note",
    "createdAt"
  ];

  const rows = events.map((event) =>
    [
      event.id,
      event.timestampSeconds.toString(),
      event.timestampLabel,
      event.playerName,
      event.sessionName,
      event.countBalls.toString(),
      event.countStrikes.toString(),
      event.countLabel,
      event.tag,
      event.category,
      event.note,
      event.createdAt
    ]
      .map(escapeCsvValue)
      .join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

export function toJson(events: AnalysisEvent[]): string {
  return JSON.stringify(events, null, 2);
}
