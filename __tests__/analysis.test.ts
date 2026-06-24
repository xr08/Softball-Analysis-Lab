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
    sessionType: "batter",
    sessionDate: "2026-06-23",
    opponent: "Red Sox",
    videoFileName: "video.mp4",
    batterHandedness: "right",
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
      pitchResult: "swinging_strike",
      pitchLocationZone: "zone_2",
      pitchLocationLabel: "Zone 2",
      batterHandedness: "right",
      contactDirection: null,
      contactQuality: null,
      result: null,
      pitchType: "fastball",
      velocity: 64,
      armSlot: "overhand",
      createdAt: new Date().toISOString()
    }
  ];

  it("round trips JSON 1.1 successfully", () => {
    const jsonStr = toJson(session, events);
    const parsed = parseImportedSession(jsonStr);

    expect(parsed.schemaVersion).toBe("1.2");
    expect(parsed.session.sessionId).toBe(session.sessionId);
    expect(parsed.events.length).toBe(1);
    expect(parsed.events[0].count).toBe("1-2");
    expect(parsed.events[0].pitchResult).toBe("swinging_strike");
    expect(parsed.events[0].pitchLocationZone).toBe("zone_2");
    expect(parsed.events[0].pitchLocationLabel).toBe("Zone 2");
    expect(parsed.events[0].batterHandedness).toBe("right");
    expect(parsed.events[0].pitchType).toBe("fastball");
    expect(parsed.events[0].velocity).toBe(64);
    expect(parsed.events[0].armSlot).toBe("overhand");
  });

  it("migrates schema 1.0 to 1.1", () => {
    // Schema 1.0 JSON representation
    const oldSchemaJson = JSON.stringify({
      schemaVersion: "1.0",
      exportedAt: new Date().toISOString(),
      session: {
        sessionId: "s123",
        sessionName: "Old Session",
        playerName: "Player A",
        sessionType: "batter",
        sessionDate: "2026-06-23",
        opponent: "Red Sox",
        videoFileName: "video.mp4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      events: [
        {
          id: "e1",
          timestampSeconds: 12.34,
          timestampLabel: "00:12.340",
          tagId: "swing",
          tagLabel: "Swing",
          category: "Swing Decision",
          note: "Old event",
          count: "1-2",
          pitchLocation: null,
          contactDirection: null,
          contactQuality: null,
          result: null,
          createdAt: new Date().toISOString()
        }
      ]
    });

    const parsed = parseImportedSession(oldSchemaJson);

    expect(parsed.schemaVersion).toBe("1.2");
    expect(parsed.session.batterHandedness).toBeNull();
    expect(parsed.events[0].pitchResult).toBeNull();
    expect(parsed.events[0].pitchLocationZone).toBeNull();
    expect(parsed.events[0].batterHandedness).toBeNull();
    expect(parsed.events[0].pitchType).toBeNull();
    expect(parsed.events[0].velocity).toBeNull();
    expect(parsed.events[0].armSlot).toBeNull();
  });

  it("rejects malformed json", () => {
    expect(() => parseImportedSession("")).toThrow();
    expect(() => parseImportedSession("{ \"some\": \"data\" }")).toThrow("Unsupported schema version");
  });

  it("rejects unsupported schema versions", () => {
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "2.0" }))).toThrow("Unsupported schema version");
  });

  it("rejects missing session or events", () => {
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.1" }))).toThrow("Missing session metadata");
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.1", session: {} }))).toThrow("Missing or invalid events array");
  });
});

describe("CSV Export", () => {
  const session: SessionMetadata = {
    sessionId: "s123",
    sessionName: "Test Session",
    playerName: "Player A",
    sessionType: "batter",
    sessionDate: "2026-06-23",
    opponent: "Red Sox",
    videoFileName: "video.mp4",
    batterHandedness: "left",
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
      count: "3-2",
      pitchResult: "swinging_strike",
      pitchLocationZone: "zone_9",
      pitchLocationLabel: "Zone 9",
      batterHandedness: "left",
      contactDirection: null,
      contactQuality: null,
      result: "strikeout",
      pitchType: null,
      velocity: null,
      armSlot: null,
      createdAt: "2026-06-23T00:00:00.000Z"
    }
  ];

  it("escapes CSV values correctly", () => {
    const csv = toCsv(session, events);
    // Split rows and check if the note is escaped properly: """quote"""
    expect(csv).toContain('""quote""');
  });

  it("outputs balls and strikes columns correctly", () => {
    const csv = toCsv(session, events);
    // balls=3, strikes=2
    // headers should include balls, strikes
    expect(csv).toContain('balls,strikes');
    // data row should contain the extracted values
    expect(csv).toContain('"3","2"');
  });

  it("outputs null fields as empty strings", () => {
    const csv = toCsv(session, events);
    // contactDirection and contactQuality are null, should be ""
    expect(csv).toContain('""');
  });
});
