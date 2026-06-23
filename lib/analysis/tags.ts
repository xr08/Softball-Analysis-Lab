import { TagDefinition } from "./types";

export const STAGE_1_TAGS: TagDefinition[] = [
  { id: "at_bat_start", label: "At-bat start", category: "Plate Appearance" },
  { id: "pitch_seen", label: "Pitch seen", category: "Pitch Tracking" },
  { id: "take", label: "Take", category: "Swing Decision" },
  { id: "swing", label: "Swing", category: "Swing Decision" },
  { id: "swing_and_miss", label: "Swing and miss", category: "Swing Decision" },
  { id: "foul", label: "Foul", category: "Outcome" },
  { id: "contact", label: "Contact", category: "Contact Type" },
  { id: "hard_contact", label: "Hard contact", category: "Contact Type" },
  { id: "weak_contact", label: "Weak contact", category: "Contact Type" },
  { id: "line_drive", label: "Line drive", category: "Contact Type" },
  { id: "ground_ball", label: "Ground ball", category: "Contact Type" },
  { id: "fly_ball", label: "Fly ball", category: "Contact Type" },
  { id: "hit", label: "Hit", category: "Outcome" },
  { id: "out", label: "Out", category: "Outcome" },
  { id: "walk", label: "Walk", category: "Outcome" },
  { id: "strikeout", label: "Strikeout", category: "Outcome" },
  { id: "chased_high", label: "Chased high", category: "Coach Observation" },
  { id: "late_swing", label: "Late swing", category: "Coach Observation" },
  { id: "good_decision", label: "Good decision", category: "Coach Observation" },
  { id: "coach_note", label: "Coach note", category: "Coach Observation" }
];

