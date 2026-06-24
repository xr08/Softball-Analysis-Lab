export type TagCategory =
  | "Plate Appearance"
  | "Pitch Tracking"
  | "Swing Decision"
  | "Contact Type"
  | "Outcome"
  | "Coach Observation";

export type TagDefinition = {
  id: string;
  label: string;
  category: TagCategory;
};

export type AnalysisEvent = {
  id: string;
  timestampSeconds: number;
  timestampLabel: string;
  tagId: string;
  tagLabel: string;
  category: TagCategory;
  note: string;

  // Explicitly nullable structured context
  count: string | null;
  pitchResult: "called_strike" | "swinging_strike" | "foul" | "ball" | "ball_in_play" | "hit_by_pitch" | null;
  pitchLocationZone: "zone_1" | "zone_2" | "zone_3" | "zone_4" | "zone_5" | "zone_6" | "zone_7" | "zone_8" | "zone_9" | "high" | "low" | "inside" | "outside" | null;
  pitchLocationLabel: string | null;
  batterHandedness: "right" | "left" | null;
  contactDirection: "pull" | "middle" | "opposite" | null;
  contactQuality: "hard" | "medium" | "weak" | null;
  result: "single" | "double" | "triple" | "home_run" | "walk" | "strikeout" | "field_out" | "fielders_choice" | "reached_on_error" | "sacrifice" | "hit_by_pitch" | null;

  // Pitcher context
  pitchType: "rise" | "drop" | "changeup" | "curve" | "screw" | "fastball" | "other" | null;
  velocity: number | null;
  armSlot: "overhand" | "three_quarter" | "sidearm" | "submarine" | null;

  createdAt: string;
};

export type SessionMetadata = {
  sessionId: string;
  sessionName: string;
  playerName: string;
  sessionType: "batter" | "pitcher";
  sessionDate: string;
  opponent: string;
  videoFileName: string | null;
  batterHandedness: "right" | "left" | null;
  createdAt: string;
  updatedAt: string;
};

export type ExportedSession = {
  schemaVersion: "1.0" | "1.1" | "1.2";
  exportedAt: string;
  session: SessionMetadata;
  events: AnalysisEvent[];
};

