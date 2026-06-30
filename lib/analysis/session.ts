import { Session, Player, TeamSide, AtBat, TaggedEvent, EventRole, VideoSource } from "./types";

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

export function upsertLocalVideoSource(
  videoSources: VideoSource[],
  sessionId: string,
  fileName: string,
  durationSeconds?: number
): VideoSource[] {
  const existing = videoSources.find((source) => source.sourceType === "local_file" && source.type === "main");
  const cleanDuration = durationSeconds !== undefined && Number.isFinite(durationSeconds) && durationSeconds > 0
    ? durationSeconds
    : undefined;

  if (existing) {
    return videoSources.map((source) =>
      source.id === existing.id
        ? {
            ...source,
            sessionId,
            fileName,
            sourceType: "local_file",
            type: "main",
            durationSeconds: cleanDuration ?? source.durationSeconds
          }
        : source
    );
  }

  return [
    ...videoSources,
    {
      id: crypto.randomUUID(),
      sessionId,
      fileName,
      sourceType: "local_file",
      type: "main",
      durationSeconds: cleanDuration,
      addedAt: new Date().toISOString()
    }
  ];
}

export function updateVideoSourceDuration(
  videoSources: VideoSource[],
  videoSourceId: string | null,
  durationSeconds: number
): VideoSource[] {
  if (!videoSourceId || !Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return videoSources;
  }

  const existing = videoSources.find((source) => source.id === videoSourceId);
  if (!existing || existing.durationSeconds === durationSeconds) {
    return videoSources;
  }

  return videoSources.map((source) =>
    source.id === videoSourceId ? { ...source, durationSeconds } : source
  );
}

export function createAtBat(
  sessionId: string,
  batterId: string | null,
  pitcherId: string,
  batterTeamSide: TeamSide | null,
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
