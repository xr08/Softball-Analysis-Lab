export type TeamSide = "teamA" | "teamB" | "neutral";
export type EventRole = "pitcher" | "batter" | "fielder" | "runner" | "team" | "review";
export type EventSource = "manual" | "ai" | "imported";
export type ReviewStatus = "none" | "flagged" | "reviewed" | "resolved";

export interface Player {
  id: string;
  sessionId: string;
  name: string;
  teamSide: TeamSide;
  jerseyNumber?: string;
  handedness?: {
    batting?: "left" | "right" | "switch";
    throwing?: "left" | "right";
  };
}

export interface AtBat {
  id: string;
  sessionId: string;
  batterId: string | null;
  pitcherId: string;
  batterTeamSide: TeamSide | null;
  pitcherTeamSide: TeamSide;
  startTimestampSeconds: number;
  endTimestampSeconds?: number;
}

export interface VideoSource {
  id: string;
  sessionId: string;
  fileName: string;
  filePath?: string; // local only
  sourceType: "local_file";
  type: "main" | "angle2" | "angle3";
  durationSeconds?: number;
  addedAt: string;
}

export interface Session {
  id: string;
  name: string;
  date: string;
  context: string;
  sessionType: "game" | "player" | "training";
  createdAt: string;
  updatedAt: string;
}

export interface TaggedEvent {
  id: string;
  sessionId: string;
  videoSourceId: string | null;
  atBatId: string | null;
  
  timestampSeconds: number;
  timestampLabel?: string;
  
  eventRole: EventRole;
  playerId: string | null;
  relatedPlayerId: string | null;
  teamSide: TeamSide | null;
  
  tag: string;
  category: string;
  note?: string;
  
  pitchCount: string | null;
  pitchResult: string | null;
  pitchLocation: string | null;
  pitchType: string | null;
  contactType: string | null;
  contactQuality: string | null;
  playResult: string | null;
  
  source?: EventSource;
  reviewStatus?: ReviewStatus;
  
  createdAt: string;
}

export interface ExportedSession {
  schemaVersion: "2.0";
  session: Session;
  players: Player[];
  videoSources: VideoSource[];
  atBats: AtBat[];
  events: TaggedEvent[];
}

export interface TagDefinition {
  id: string;
  category: string;
  label: string;
  color: string;
  shortcut?: string;
  description?: string;
}
