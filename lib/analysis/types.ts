export type TagCategory =
  | "Plate Appearance"
  | "Pitch Tracking"
  | "Swing Decision"
  | "Contact Type"
  | "Outcome"
  | "Coach Observation";

export type TagDefinition = {
  tag: string;
  category: TagCategory;
};

export type AnalysisEvent = {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  playerName: string;
  sessionName: string;
  countBalls: number;
  countStrikes: number;
  countLabel: string;
  tag: string;
  category: TagCategory;
  note: string;
  createdAt: string;
};
