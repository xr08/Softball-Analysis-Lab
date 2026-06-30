import { describe, expect, it } from "vitest";
import {
  CONTACT_QUALITY_OPTIONS,
  CONTACT_TYPE_OPTIONS,
  createEmptyPitchWindowState,
  getContactQualityLabel,
  getContactTypeLabel,
  getPitchResultLabel,
  getPlayResultLabel,
  PITCH_RESULT_OPTIONS
} from "../lib/analysis/pitch-window";
import { buildNextPitchSelection } from "../lib/analysis/workflow";
import { parseImportedSession, toJson } from "../lib/analysis/export";
import { WORKFLOW_TAG_GROUPS } from "../lib/analysis/tags";
import { Session, TaggedEvent } from "../lib/analysis/types";

describe("pitch window helpers", () => {
  it("includes HBP and Wild Pitch as fast pitch result options", () => {
    expect(PITCH_RESULT_OPTIONS.map((option) => option.value)).toEqual([
      "ball",
      "called_strike",
      "swinging_strike",
      "foul",
      "ball_in_play",
      "hit_by_pitch",
      "wild_pitch"
    ]);
  });

  it("maps fast result labels to the same stored pitchResult values used by events", () => {
    expect(PITCH_RESULT_OPTIONS).toEqual(
      expect.arrayContaining([
        { value: "ball", label: "Ball" },
        { value: "hit_by_pitch", label: "HBP" },
        { value: "wild_pitch", label: "Wild Pitch" }
      ])
    );
  });

  it("creates an empty pitch window state for Next Pitch resets", () => {
    expect(createEmptyPitchWindowState()).toEqual({
      countBalls: null,
      countStrikes: null,
      pitchResult: null,
      pitchLocation: null,
      pitchType: null,
      contactType: null,
      contactQuality: null,
      playResult: null
    });
  });

  it("keeps pitcher, batter, and at-bat selection when moving to the next pitch", () => {
    const nextPitch = buildNextPitchSelection({
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      activeAtBatId: "atbat-1"
    });

    expect(nextPitch).toEqual({
      currentPitcherId: "pitcher-1",
      currentBatterId: "batter-1",
      activeAtBatId: "atbat-1",
      selectedFielderId: null
    });
  });

  it("formats the new fast result labels clearly for summaries", () => {
    expect(getPitchResultLabel("wild_pitch")).toBe("Wild Pitch");
    expect(getPitchResultLabel("hit_by_pitch")).toBe("HBP");
  });

  it("maps contact direction buttons to the same stored contactType values", () => {
    expect(CONTACT_TYPE_OPTIONS).toEqual([
      { value: "pull", label: "Pull" },
      { value: "middle", label: "Middle" },
      { value: "opposite", label: "Opposite" }
    ]);
    expect(getContactTypeLabel("pull")).toBe("Pull");
  });

  it("maps contact quality buttons to the same stored contactQuality values", () => {
    expect(CONTACT_QUALITY_OPTIONS).toEqual([
      { value: "hard", label: "Hard" },
      { value: "medium", label: "Medium" },
      { value: "weak", label: "Weak" }
    ]);
    expect(getContactQualityLabel("hard")).toBe("Hard");
  });

  it("formats play result buttons with the same stored playResult values", () => {
    expect(getPlayResultLabel("fielders_choice")).toBe("Fielder's Choice");
    expect(getPlayResultLabel("hit_by_pitch")).toBe("Hit by Pitch");
  });

  it("exposes HBP and Wild Pitch as pitcher Pitch Result tags", () => {
    const pitcherTags = WORKFLOW_TAG_GROUPS.find((group) => group.role === "pitcher")?.tags ?? [];

    expect(pitcherTags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "hit_by_pitch",
          label: "Hit by Pitch",
          category: "Pitch Result",
        }),
        expect.objectContaining({
          id: "wild_pitch",
          label: "Wild Pitch",
          category: "Pitch Result",
        }),
      ])
    );
  });
});

describe("pitch result export compatibility", () => {
  const session: Session = {
    id: "session-pitch-window",
    name: "Pitch Window",
    sessionType: "game",
    date: "2026-06-30",
    context: "Phase 1",
    createdAt: "2026-06-30T00:00:00.000Z",
    updatedAt: "2026-06-30T00:00:00.000Z"
  };

  const event: TaggedEvent = {
    id: "event-wild-pitch",
    sessionId: session.id,
    videoSourceId: null,
    atBatId: null,
    eventRole: "pitcher",
    playerId: null,
    relatedPlayerId: null,
    teamSide: null,
    timestampSeconds: 5,
    timestampLabel: "00:05.000",
    tag: "wild_pitch",
    category: "Pitch Result",
    note: "",
    pitchCount: "2-1",
    pitchResult: "wild_pitch",
    pitchLocation: "high",
    pitchType: "changeup",
    contactType: "pull",
    contactQuality: "hard",
    playResult: "field_out",
    source: "manual",
    reviewStatus: "none",
    createdAt: "2026-06-30T00:00:00.000Z"
  };

  it("preserves the selected pitch result through JSON export/import", () => {
    const parsed = parseImportedSession(toJson(session, [], [], [], [event]));

    expect(parsed.events[0].pitchResult).toBe("wild_pitch");
    expect(parsed.events[0].pitchLocation).toBe("high");
    expect(parsed.events[0].contactType).toBe("pull");
    expect(parsed.events[0].contactQuality).toBe("hard");
    expect(parsed.events[0].playResult).toBe("field_out");
  });
});
