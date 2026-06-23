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
  pitchLocation: string | null;
  contactDirection: string | null;
  contactQuality: string | null;
  result: string | null;

  createdAt: string;
};

export type SessionMetadata = {
  sessionId: string;
  sessionName: string;
  playerName: string;
  sessionDate: string;
  opponent: string;
  videoFileName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExportedSession = {
  schemaVersion: "1.0";
  exportedAt: string;
  session: SessionMetadata;
  events: AnalysisEvent[];
};

