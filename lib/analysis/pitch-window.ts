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

export function getPitchResultLabel(value: TaggedEvent["pitchResult"]): string {
  if (!value) return "Unspecified";
  return PITCH_RESULT_OPTIONS.find((option) => option.value === value)?.label ?? value.replaceAll("_", " ");
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
