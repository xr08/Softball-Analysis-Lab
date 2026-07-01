import { TaggedEvent } from "./types";

export type PitchWindowState = {
  countBalls: number | null;
  countStrikes: number | null;
  pitchResult: TaggedEvent["pitchResult"];
  pitchLocation: TaggedEvent["pitchLocation"];
  pitchType: TaggedEvent["pitchType"];
  contactType: TaggedEvent["contactType"];
  contactQuality: TaggedEvent["contactQuality"];
  playResult: TaggedEvent["playResult"];
};

export const PITCH_RESULT_OPTIONS: Array<{
  value: NonNullable<TaggedEvent["pitchResult"]>;
  label: string;
}> = [
  { value: "ball", label: "Ball" },
  { value: "called_strike", label: "Called Strike" },
  { value: "swinging_strike", label: "Swinging Strike" },
  { value: "foul", label: "Foul" },
  { value: "ball_in_play", label: "In Play" },
  { value: "hit_by_pitch", label: "HBP" },
  { value: "wild_pitch", label: "Wild Pitch" }
];

export type PitchResultOption = {
  value: NonNullable<TaggedEvent["pitchResult"]>;
  label: string;
};

export const CONTACT_TYPE_OPTIONS: Array<{
  value: NonNullable<TaggedEvent["contactType"]>;
  label: string;
}> = [
  { value: "pull", label: "Pull" },
  { value: "middle", label: "Middle" },
  { value: "opposite", label: "Opposite" }
];

export const CONTACT_QUALITY_OPTIONS: Array<{
  value: NonNullable<TaggedEvent["contactQuality"]>;
  label: string;
}> = [
  { value: "hard", label: "Hard" },
  { value: "medium", label: "Medium" },
  { value: "weak", label: "Weak" }
];

export const PLAY_RESULT_OPTIONS: Array<{
  value: NonNullable<TaggedEvent["playResult"]>;
  label: string;
}> = [
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
  { value: "triple", label: "Triple" },
  { value: "home_run", label: "Home Run" },
  { value: "walk", label: "Walk" },
  { value: "strikeout", label: "Strikeout" },
  { value: "field_out", label: "Field Out" },
  { value: "fielders_choice", label: "Fielder's Choice" },
  { value: "reached_on_error", label: "Reached on Error" },
  { value: "sacrifice", label: "Sacrifice" },
  { value: "hit_by_pitch", label: "Hit by Pitch" }
];

export type BatterContextButton =
  | {
      id: string;
      label: string;
      kind: "contactType";
      value: NonNullable<TaggedEvent["contactType"]>;
    }
  | {
      id: string;
      label: string;
      kind: "contactQuality";
      value: NonNullable<TaggedEvent["contactQuality"]>;
    }
  | {
      id: string;
      label: string;
      kind: "playResult";
      value: NonNullable<TaggedEvent["playResult"]>;
    }
  | {
      id: string;
      label: string;
      kind: "placeholder";
    };

export const BATTER_DIRECTION_POWER_BUTTONS: BatterContextButton[] = [
  { id: "direction-pull", label: "Pull", kind: "contactType", value: "pull" },
  { id: "direction-middle", label: "Middle", kind: "contactType", value: "middle" },
  { id: "direction-opposite", label: "Opposite", kind: "contactType", value: "opposite" },
  { id: "power-hard", label: "Hard", kind: "contactQuality", value: "hard" },
  { id: "power-medium", label: "Medium", kind: "contactQuality", value: "medium" },
  { id: "power-weak", label: "Weak", kind: "contactQuality", value: "weak" }
];

export const BATTER_ON_BASE_BUTTONS: BatterContextButton[] = [
  { id: "onbase-single", label: "Single", kind: "playResult", value: "single" },
  { id: "onbase-walk", label: "Walk", kind: "playResult", value: "walk" },
  { id: "onbase-sac-bunt", label: "Sac Bunt", kind: "placeholder" },
  { id: "onbase-double", label: "Double", kind: "playResult", value: "double" },
  { id: "onbase-hbp", label: "HBP", kind: "playResult", value: "hit_by_pitch" },
  { id: "onbase-sac-fly", label: "Sac Fly", kind: "playResult", value: "sacrifice" },
  { id: "onbase-triple", label: "Triple", kind: "playResult", value: "triple" },
  { id: "onbase-fielders-choice", label: "Fielder Ch", kind: "playResult", value: "fielders_choice" },
  { id: "onbase-int-walk", label: "Int Walk", kind: "placeholder" },
  { id: "onbase-home-run", label: "Home Run", kind: "playResult", value: "home_run" },
  { id: "onbase-error", label: "Error", kind: "playResult", value: "reached_on_error" },
  { id: "onbase-drop-third-k", label: "Drop 3rd K", kind: "placeholder" }
];

export const BATTER_OUT_BUTTONS: BatterContextButton[] = [
  { id: "out-k2", label: "K2", kind: "placeholder" },
  { id: "out-caught", label: "Out-Caught", kind: "playResult", value: "field_out" },
  { id: "out-tag-play", label: "Tag Play", kind: "placeholder" },
  { id: "out-kc", label: "KC", kind: "playResult", value: "strikeout" },
  { id: "out-on-throw", label: "Out-on Throw", kind: "placeholder" },
  { id: "out-double-play", label: "Double Play", kind: "placeholder" },
  { id: "out-infield-fly", label: "Infield Fly", kind: "placeholder" },
  { id: "out-leave-early", label: "Leave Early", kind: "placeholder" },
  { id: "out-triple-play", label: "Triple Play", kind: "placeholder" }
];

export function createEmptyPitchWindowState(): PitchWindowState {
  return {
    countBalls: null,
    countStrikes: null,
    pitchResult: null,
    pitchLocation: null,
    pitchType: null,
    contactType: null,
    contactQuality: null,
    playResult: null
  };
}

export function applyPitchResultToCount({
  balls,
  strikes,
  pitchResult,
  hasActiveAtBat
}: {
  balls: number | null;
  strikes: number | null;
  pitchResult: TaggedEvent["pitchResult"];
  hasActiveAtBat: boolean;
}): Pick<PitchWindowState, "countBalls" | "countStrikes"> {
  if (!hasActiveAtBat) {
    return { countBalls: balls, countStrikes: strikes };
  }

  if (pitchResult === "ball") {
    return { countBalls: Math.min((balls ?? 0) + 1, 4), countStrikes: strikes ?? 0 };
  }

  if (pitchResult === "called_strike" || pitchResult === "swinging_strike") {
    return { countBalls: balls ?? 0, countStrikes: Math.min((strikes ?? 0) + 1, 3) };
  }

  if (pitchResult === "foul") {
    const nextStrikes = strikes === null ? 1 : strikes < 2 ? strikes + 1 : strikes;
    return { countBalls: balls ?? 0, countStrikes: nextStrikes };
  }

  return { countBalls: balls, countStrikes: strikes };
}

export function getPitchResultLabel(value: TaggedEvent["pitchResult"]): string {
  if (!value) return "Unspecified";
  return PITCH_RESULT_OPTIONS.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

export function isKnownPitchResult(value: TaggedEvent["pitchResult"]): boolean {
  return Boolean(value) && PITCH_RESULT_OPTIONS.some((option) => option.value === value);
}

export function getPitchResultOptionsForValue(value: TaggedEvent["pitchResult"]): PitchResultOption[] {
  if (!value || isKnownPitchResult(value)) return PITCH_RESULT_OPTIONS;
  return [
    ...PITCH_RESULT_OPTIONS,
    {
      value,
      label: `Unknown / imported: ${value}`
    }
  ];
}

function getOptionLabel<T extends string>(
  value: T | null,
  options: Array<{ value: T; label: string }>,
  fallback: string
): string {
  if (!value) return fallback;
  return options.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
}

export function getContactTypeLabel(value: TaggedEvent["contactType"]): string {
  return getOptionLabel(value, CONTACT_TYPE_OPTIONS, "Unspecified");
}

export function getContactQualityLabel(value: TaggedEvent["contactQuality"]): string {
  return getOptionLabel(value, CONTACT_QUALITY_OPTIONS, "Unspecified");
}

export function getPlayResultLabel(value: TaggedEvent["playResult"]): string {
  return getOptionLabel(value, PLAY_RESULT_OPTIONS, "Unspecified");
}

export function isContactContextPrimary(pitchResult: TaggedEvent["pitchResult"]): boolean {
  return pitchResult === "ball_in_play";
}

export function getPitchWindowGuidance(pitchResult: TaggedEvent["pitchResult"]): string {
  if (!pitchResult) return "Choose the pitch result first, then add count, type, location, and contact details as needed.";
  if (pitchResult === "ball_in_play") return "Contact and at-bat result are most useful for balls in play.";
  if (pitchResult === "foul") return "Contact details are optional for fouls, but available if you want the extra context.";
  if (pitchResult === "hit_by_pitch" || pitchResult === "wild_pitch") {
    return "Contact details are usually optional here. Count, location, and notes can still be recorded.";
  }
  return "Contact details are optional for this pitch result. Tag the event when you have the pitch context you need.";
}
