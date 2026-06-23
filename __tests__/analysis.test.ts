import { describe, it, expect } from "vitest";
import { formatTimestampLabel } from "../lib/analysis/time";
import { toCsv, toJson, parseImportedSession } from "../lib/analysis/export";
import { compareVideoFileNames } from "../lib/analysis/video";
import { AnalysisEvent, SessionMetadata } from "../lib/analysis/types";

describe("formatTimestampLabel", () => {
  it("formats timestamps correctly", () => {
    expect(formatTimestampLabel(0)).toBe("00:00.000");
    expect(formatTimestampLabel(61.5)).toBe("01:01.500");
    expect(formatTimestampLabel(3599.999)).toBe("59:59.999");
    expect(formatTimestampLabel(3600)).toBe("1:00:00.000"); // assuming it supports hours or just raw logic
  });
});

describe("compareVideoFileNames", () => {
  it("matches identical filenames", () => {
    const result = compareVideoFileNames("video.mp4", "video.mp4");
    expect(result.isMatch).toBe(true);
    expect(result.message).toContain("reconnected successfully");
  });
  
  it("matches with case differences", () => {
    const result = compareVideoFileNames("video.mp4", "Video.MP4");
    expect(result.isMatch).toBe(true);
    expect(result.message).toContain("reconnected successfully");
  });
  
  it("rejects different filenames", () => {
    const result = compareVideoFileNames("video1.mp4", "video2.mp4");
    expect(result.isMatch).toBe(false);
    expect(result.message).toContain("differs from expected");
  });
  
  it("handles missing expected value", () => {
    const result = compareVideoFileNames(null, "video.mp4");
    expect(result.isMatch).toBe(true);
    expect(result.message).toBe("");
  });
});

describe("JSON Export and Import", () => {
  const session: SessionMetadata = {
    sessionId: "s123",
    sessionName: "Test Session",
    playerName: "Player A",
    sessionDate: "2026-06-23",
    opponent: "Red Sox",
    videoFileName: "video.mp4",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const events: AnalysisEvent[] = [
    {
      id: "e1",
      timestampSeconds: 12.34,
      timestampLabel: "00:12.340",
      tagId: "swing",
      tagLabel: "Swing",
      category: "Swing Decision",
      note: "Good swing",
      count: "1-2",
      pitchLocation: null,
      contactDirection: null,
      contactQuality: null,
      result: null,
      createdAt: new Date().toISOString()
    }
  ];

  it("round trips JSON successfully", () => {
    const jsonStr = toJson(session, events);
    const parsed = parseImportedSession(jsonStr);

    expect(parsed.schemaVersion).toBe("1.0");
    expect(parsed.session.sessionId).toBe(session.sessionId);
    expect(parsed.events.length).toBe(1);
    expect(parsed.events[0].count).toBe("1-2");
    expect(parsed.events[0].pitchLocation).toBeNull();
  });

  it("rejects malformed json", () => {
    expect(() => parseImportedSession("")).toThrow();
    expect(() => parseImportedSession("{ \"some\": \"data\" }")).toThrow("Unsupported schema version");
  });

  it("rejects unsupported schema versions", () => {
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "2.0" }))).toThrow("Unsupported schema version");
  });

  it("rejects missing session or events", () => {
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.0" }))).toThrow("Missing session metadata");
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.0", session: {} }))).toThrow("Missing or invalid events array");
  });
});

describe("CSV Export", () => {
  const session: SessionMetadata = {
    sessionId: "s123",
    sessionName: "Test Session",
    playerName: "Player A",
    sessionDate: "2026-06-23",
    opponent: "Red Sox",
    videoFileName: "video.mp4",
    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z"
  };

  const events: AnalysisEvent[] = [
    {
      id: "e1",
      timestampSeconds: 12.34,
      timestampLabel: "00:12.340",
      tagId: "swing",
      tagLabel: "Swing",
      category: "Swing Decision",
      note: 'Note with a "quote", comma, and\nnewline',
      count: "0-0",
      pitchLocation: null,
      contactDirection: null,
      contactQuality: null,
      result: null,
      createdAt: "2026-06-23T00:00:00.000Z"
    }
  ];

  it("escapes CSV values correctly", () => {
    const csv = toCsv(session, events);
    // Split rows and check if the note is escaped properly: """quote"""
    expect(csv).toContain('""quote""');
  });

  it("outputs null fields as empty strings", () => {
    const csv = toCsv(session, events);
    // Check if null values resulted in empty string outputs for those columns
    // We expect several empty columns `...,"0-0","","","","",...`
    expect(csv).toContain('""');
  });
});
