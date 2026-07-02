import { describe, expect, it } from "vitest";
import {
  applyPitchResultToCount,
  BATTER_ON_BASE_BUTTONS,
  BATTER_OUT_BUTTONS,
  CONTACT_QUALITY_OPTIONS,
  CONTACT_TYPE_OPTIONS,
  createEmptyPitchWindowState,
  getContactQualityLabel,
  getContactTypeLabel,
  getPitchResultLabel,
  getPitchResultOptionsForValue,
  getPlayResultLabel,
  isKnownPitchResult,
  PITCH_RESULT_OPTIONS,
  isCountMarkerFilled
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

  it("determines filled marker state correctly, excluding the zero control", () => {
    expect(isCountMarkerFilled(0, 0)).toBe(false);
    expect(isCountMarkerFilled(0, 1)).toBe(false);
    expect(isCountMarkerFilled(0, 2)).toBe(false);

    expect(isCountMarkerFilled(1, 0)).toBe(false);
    expect(isCountMarkerFilled(2, 0)).toBe(false);
    expect(isCountMarkerFilled(3, 0)).toBe(false);

    expect(isCountMarkerFilled(1, 1)).toBe(true);
    expect(isCountMarkerFilled(2, 1)).toBe(false);

    expect(isCountMarkerFilled(1, 2)).toBe(true);
    expect(isCountMarkerFilled(2, 2)).toBe(true);
    expect(isCountMarkerFilled(3, 2)).toBe(false);
  });

  it("increments balls from an unknown count during an active at-bat", () => {
    expect(
      applyPitchResultToCount({
        balls: null,
        strikes: null,
        pitchResult: "ball",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 1, countStrikes: 0 });
  });

  it("caps balls at three and strikes at two", () => {
    expect(
      applyPitchResultToCount({
        balls: 3,
        strikes: 2,
        pitchResult: "ball",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 3, countStrikes: 2 });

    expect(
      applyPitchResultToCount({
        balls: 2,
        strikes: 2,
        pitchResult: "called_strike",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 2, countStrikes: 2 });
  });

  it("handles foul strike rules without adding a strike at two strikes", () => {
    expect(
      applyPitchResultToCount({
        balls: 1,
        strikes: 1,
        pitchResult: "foul",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 1, countStrikes: 2 });

    expect(
      applyPitchResultToCount({
        balls: 1,
        strikes: 2,
        pitchResult: "foul",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 1, countStrikes: 2 });
  });

  it("does not infer count for terminal or non-count pitch results", () => {
    expect(
      applyPitchResultToCount({
        balls: null,
        strikes: null,
        pitchResult: "ball_in_play",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: null, countStrikes: null });

    expect(
      applyPitchResultToCount({
        balls: 2,
        strikes: 1,
        pitchResult: "hit_by_pitch",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 2, countStrikes: 1 });

    expect(
      applyPitchResultToCount({
        balls: 2,
        strikes: 1,
        pitchResult: "wild_pitch",
        hasActiveAtBat: true
      })
    ).toEqual({ countBalls: 2, countStrikes: 1 });
  });

  it("calculates live count based on initial count rather than stacking duplicate clicks", () => {
    const startCount = { balls: 0, strikes: 0 };
    
    const click1 = applyPitchResultToCount({
      balls: startCount.balls,
      strikes: startCount.strikes,
      pitchResult: "ball",
      hasActiveAtBat: true
    });
    expect(click1).toEqual({ countBalls: 1, countStrikes: 0 });

    const click2 = applyPitchResultToCount({
      balls: startCount.balls,
      strikes: startCount.strikes,
      pitchResult: "ball",
      hasActiveAtBat: true
    });
    expect(click2).toEqual({ countBalls: 1, countStrikes: 0 });
  });

  it("calculates live count correctly when correcting a misclicked pitch result", () => {
    const startCount = { balls: 1, strikes: 1 };
    
    const mistake = applyPitchResultToCount({
      balls: startCount.balls,
      strikes: startCount.strikes,
      pitchResult: "ball",
      hasActiveAtBat: true
    });
    expect(mistake).toEqual({ countBalls: 2, countStrikes: 1 });

    const correction = applyPitchResultToCount({
      balls: startCount.balls,
      strikes: startCount.strikes,
      pitchResult: "called_strike",
      hasActiveAtBat: true
    });
    expect(correction).toEqual({ countBalls: 1, countStrikes: 2 });
  });

  it("leaves count unchanged when no at-bat is active", () => {
    expect(
      applyPitchResultToCount({
        balls: 1,
        strikes: 1,
        pitchResult: "swinging_strike",
        hasActiveAtBat: false
      })
    ).toEqual({ countBalls: 1, countStrikes: 1 });
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

  it("keeps known pitch result edit options unchanged", () => {
    expect(isKnownPitchResult("ball")).toBe(true);
    expect(getPitchResultOptionsForValue("ball")).toBe(PITCH_RESULT_OPTIONS);
  });

  it("adds a visible imported option for unknown pitch result values", () => {
    expect(isKnownPitchResult("legacy_pitch_result")).toBe(false);
    expect(getPitchResultOptionsForValue("legacy_pitch_result")).toContainEqual({
      value: "legacy_pitch_result",
      label: "Unknown / imported: legacy_pitch_result"
    });
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

  it("exposes the requested Batter Box on-base labels with safe placeholders", () => {
    expect(BATTER_ON_BASE_BUTTONS.map((button) => button.label)).toEqual([
      "Single",
      "Walk",
      "Sac Bunt",
      "Double",
      "HBP",
      "Sac Fly",
      "Triple",
      "Fielder Ch",
      "Int Walk",
      "Home Run",
      "Error",
      "Drop 3rd K"
    ]);
    expect(BATTER_ON_BASE_BUTTONS.filter((button) => button.kind === "placeholder").map((button) => button.label)).toEqual([
      "Sac Bunt",
      "Int Walk",
      "Drop 3rd K"
    ]);
  });

  it("exposes the requested Batter Box out labels with safe placeholders", () => {
    expect(BATTER_OUT_BUTTONS.map((button) => button.label)).toEqual([
      "K2",
      "Out-Caught",
      "Tag Play",
      "KC",
      "Out-on Throw",
      "Double Play",
      "Infield Fly",
      "Leave Early",
      "Triple Play"
    ]);
    expect(BATTER_OUT_BUTTONS.filter((button) => button.kind === "placeholder").map((button) => button.label)).toEqual([
      "K2",
      "Tag Play",
      "Out-on Throw",
      "Double Play",
      "Infield Fly",
      "Leave Early",
      "Triple Play"
    ]);
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

  it("preserves unknown imported pitch result strings through JSON export/import", () => {
    const parsed = parseImportedSession(
      toJson(session, [], [], [], [{ ...event, id: "event-legacy", pitchResult: "legacy_pitch_result" }])
    );

    expect(parsed.events[0].pitchResult).toBe("legacy_pitch_result");
  });
});
