import { TagDefinition } from "./types";

export const STAGE_1_TAGS: TagDefinition[] = [
  { tag: "At-bat start", category: "Plate Appearance" },
  { tag: "Pitch seen", category: "Pitch Tracking" },
  { tag: "Take", category: "Swing Decision" },
  { tag: "Swing", category: "Swing Decision" },
  { tag: "Swing and miss", category: "Swing Decision" },
  { tag: "Foul", category: "Outcome" },
  { tag: "Contact", category: "Contact Type" },
  { tag: "Hard contact", category: "Contact Type" },
  { tag: "Weak contact", category: "Contact Type" },
  { tag: "Line drive", category: "Contact Type" },
  { tag: "Ground ball", category: "Contact Type" },
  { tag: "Fly ball", category: "Contact Type" },
  { tag: "Hit", category: "Outcome" },
  { tag: "Out", category: "Outcome" },
  { tag: "Walk", category: "Outcome" },
  { tag: "Strikeout", category: "Outcome" },
  { tag: "Chased high", category: "Coach Observation" },
  { tag: "Late swing", category: "Coach Observation" },
  { tag: "Good decision", category: "Coach Observation" },
  { tag: "Coach note", category: "Coach Observation" }
];
