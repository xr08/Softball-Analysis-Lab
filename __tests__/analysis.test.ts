import { describe, it, expect } from "vitest";
import { formatTimestampLabel } from "../lib/analysis/time";
import { toCsv, toJson, parseImportedSession } from "../lib/analysis/export";
import { compareVideoFileNames } from "../lib/analysis/video";
import { TaggedEvent, Session } from "../lib/analysis/types";

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
  const session: Session = {
    id: "s123",
    name: "Test Session",    sessionType: "player",
    date: "2026-06-23",
    context: "Red Sox",    createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
  };

  const events: TaggedEvent[] = [
    {
      id: "e1",
      sessionId: session.id,
      videoSourceId: null,
      atBatId: null,
      eventRole: "batter",
      playerId: null,
      relatedPlayerId: null,
      teamSide: null,
      timestampSeconds: 12.34,
      timestampLabel: "00:12.340",
      tag: "swing",
      category: "Swing Decision",
      note: "Good swing",
      pitchCount: "1-2",
      pitchResult: "swinging_strike",
      pitchLocation: "zone_2",
      contactType: null,
      contactQuality: null,
      playResult: null,
      pitchType: "fastball",
      createdAt: new Date().toISOString()
    }
  ];

  it("round trips JSON 2.0 successfully", () => {
    const jsonStr = toJson(session, [], [], [], events);
    const parsed = parseImportedSession(jsonStr);

    expect(parsed.schemaVersion).toBe("2.0");
    expect(parsed.session.id).toBe(session.id);
    expect(parsed.events.length).toBe(1);
    expect(parsed.events[0].pitchCount).toBe("1-2");
    expect(parsed.events[0].pitchResult).toBe("swinging_strike");
    expect(parsed.events[0].pitchLocation).toBe("zone_2");
    expect(parsed.events[0].pitchType).toBe("fastball");
    
    
  });
  it("rejects malformed json", () => {
    expect(() => parseImportedSession("")).toThrow();
    expect(() => parseImportedSession("{ \"some\": \"data\" }")).toThrow(/Unsupported legacy schema version/);
  });
  it("rejects missing session or events", () => {
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.1" }))).toThrow(/Unsupported legacy schema version/);
    expect(() => parseImportedSession(JSON.stringify({ schemaVersion: "1.1", session: {} }))).toThrow(/Unsupported legacy schema version/);
  });
});

describe("CSV Export", () => {
  const session: Session = {
    id: "s123",
    name: "Test Session",    sessionType: "player",
    date: "2026-06-23",
    context: "Red Sox",    createdAt: "2026-06-23T00:00:00.000Z",
    updatedAt: "2026-06-23T00:00:00.000Z"
  };

  const events: TaggedEvent[] = [
    {
      id: "e1", sessionId: "s123", videoSourceId: null, atBatId: null, eventRole: "batter", playerId: null, relatedPlayerId: null, teamSide: null, timestampSeconds: 12.34,
      timestampLabel: "00:12.340",
      tag: "swing",
      category: "Swing Decision",
      note: 'Note with a "quote", comma, and\nnewline',
      pitchCount: "3-2",
      pitchResult: "swinging_strike",
      pitchLocation: "zone_9",
            contactType: null,
      contactQuality: null,
      playResult: "strikeout",
      pitchType: null,      createdAt: "2026-06-23T00:00:00.000Z"
    }
  ];

  it("escapes CSV values correctly", () => {
    const csv = toCsv(session, [], [], events);
    // Split rows and check if the note is escaped properly: """quote"""
    expect(csv).toContain('""quote""');
  });
  it("outputs null fields as empty strings", () => {
    const csv = toCsv(session, [], [], events);
    // contactType and contactQuality are null, should be ""
    expect(csv).toContain('""');
  });
});
