import { Session, Player, TeamSide, AtBat, TaggedEvent, EventRole } from "./types";

export function createDefaultSession(): Session {
  return {
    id: crypto.randomUUID(),
    name: "",
    date: new Date().toISOString().split("T")[0],
    context: "",
    sessionType: "game",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function createPlayer(sessionId: string, name: string, teamSide: TeamSide): Player {
  return {
    id: crypto.randomUUID(),
    sessionId,
    name,
    teamSide
  };
}

export function createAtBat(
  sessionId: string,
  batterId: string,
  pitcherId: string,
  batterTeamSide: TeamSide,
  pitcherTeamSide: TeamSide,
  startTimestampSeconds: number
): AtBat {
  return {
    id: crypto.randomUUID(),
    sessionId,
    batterId,
    pitcherId,
    batterTeamSide,
    pitcherTeamSide,
    startTimestampSeconds,
    endTimestampSeconds: undefined
  };
}

export function createTaggedEvent(
  params: Omit<TaggedEvent, "id" | "createdAt">
): TaggedEvent {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...params,
    reviewStatus: params.reviewStatus || "none",
    source: params.source || "manual",
  };
}
