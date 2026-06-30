import { AtBat, EventRole, Player, TaggedEvent, TeamSide } from "./types";

export type WorkflowTagRole = Extract<EventRole, "pitcher" | "batter" | "fielder" | "review">;

export type TagAssignmentInput = {
  role: WorkflowTagRole;
  players: Player[];
  currentPitcherId: string | null;
  currentBatterId: string | null;
  selectedFielderId: string | null;
  activeAtBatId: string | null;
};

export type TagAssignmentResult =
  | {
      ok: true;
      eventRole: WorkflowTagRole;
      playerId: string | null;
      relatedPlayerId: string | null;
      teamSide: TeamSide | null;
      atBatId: string | null;
    }
  | {
      ok: false;
      reason: string;
    };

export type NextPitchSelection = {
  currentPitcherId: string | null;
  currentBatterId: string | null;
  activeAtBatId: string | null;
  selectedFielderId: null;
};

export type NextAtBatInput = {
  sessionId: string;
  players: Player[];
  atBats: AtBat[];
  currentPitcherId: string | null;
  currentBatterId: string | null;
  activeAtBatId: string | null;
  timestampSeconds: number;
  newAtBatId: string;
};

export type NextAtBatResult = {
  atBats: AtBat[];
  currentPitcherId: string | null;
  currentBatterId: string | null;
  activeAtBatId: string | null;
};

export type TimelineEventDisplayData = {
  role: EventRole;
  playerName: string;
  relatedPlayerName: string;
  teamLabel: string;
  atBatLabel: string;
  atBatStatus: "active" | "ended" | "none";
};

export function teamSideLabel(teamSide: TeamSide | null | undefined): string {
  if (teamSide === "teamA") return "Team A";
  if (teamSide === "teamB") return "Team B";
  if (teamSide === "neutral") return "Neutral";
  return "No team";
}

export function getPlayerName(players: Player[], playerId: string | null | undefined): string {
  if (!playerId) return "Unassigned";
  return players.find((player) => player.id === playerId)?.name ?? "Unknown player";
}

export function getPlayerTeamSide(players: Player[], playerId: string | null): TeamSide | null {
  if (!playerId) return null;
  return players.find((player) => player.id === playerId)?.teamSide ?? null;
}

export function getTimelineEventDisplayData(
  event: TaggedEvent,
  players: Player[],
  atBats: AtBat[]
): TimelineEventDisplayData {
  const atBat = event.atBatId ? atBats.find((candidate) => candidate.id === event.atBatId) : undefined;
  const atBatStatus = atBat
    ? atBat.endTimestampSeconds === undefined
      ? "active"
      : "ended"
    : "none";

  return {
    role: event.eventRole,
    playerName: getPlayerName(players, event.playerId),
    relatedPlayerName: event.relatedPlayerId ? getPlayerName(players, event.relatedPlayerId) : "None",
    teamLabel: teamSideLabel(event.teamSide),
    atBatLabel: event.atBatId ? event.atBatId.slice(0, 8) : "None",
    atBatStatus
  };
}

export function getNextBatterId(players: Player[], currentBatterId: string | null): string | null {
  const currentBatter = players.find((player) => player.id === currentBatterId);
  if (!currentBatter) return null;

  const battingOrder = players.filter((player) => player.teamSide === currentBatter.teamSide);
  if (battingOrder.length === 0) return currentBatterId;

  const currentIndex = battingOrder.findIndex((player) => player.id === currentBatterId);
  if (currentIndex < 0) return currentBatterId;

  return battingOrder[(currentIndex + 1) % battingOrder.length].id;
}

export function buildNextPitchSelection(input: {
  currentPitcherId: string | null;
  currentBatterId: string | null;
  activeAtBatId: string | null;
}): NextPitchSelection {
  return {
    currentPitcherId: input.currentPitcherId,
    currentBatterId: input.currentBatterId,
    activeAtBatId: input.activeAtBatId,
    selectedFielderId: null
  };
}

export function closeAtBat(
  atBats: AtBat[],
  activeAtBatId: string | null,
  timestampSeconds: number
): AtBat[] {
  if (!activeAtBatId) return atBats;

  return atBats.map((atBat) =>
    atBat.id === activeAtBatId
      ? { ...atBat, endTimestampSeconds: timestampSeconds }
      : atBat
  );
}

export function buildNextAtBatState(input: NextAtBatInput): NextAtBatResult {
  const closedAtBats = closeAtBat(input.atBats, input.activeAtBatId, input.timestampSeconds);
  const nextBatterId = getNextBatterId(input.players, input.currentBatterId);

  const pitcher = input.players.find((player) => player.id === input.currentPitcherId);
  const batter = input.players.find((player) => player.id === nextBatterId);

  if (!pitcher || !batter) {
    return {
      atBats: closedAtBats,
      currentPitcherId: input.currentPitcherId,
      currentBatterId: nextBatterId ?? input.currentBatterId,
      activeAtBatId: null
    };
  }

  const nextAtBat: AtBat = {
    id: input.newAtBatId,
    sessionId: input.sessionId,
    batterId: batter.id,
    pitcherId: pitcher.id,
    batterTeamSide: batter.teamSide,
    pitcherTeamSide: pitcher.teamSide,
    startTimestampSeconds: input.timestampSeconds,
    endTimestampSeconds: undefined
  };

  return {
    atBats: [...closedAtBats, nextAtBat],
    currentPitcherId: pitcher.id,
    currentBatterId: batter.id,
    activeAtBatId: nextAtBat.id
  };
}

export function resolveTagAssignment(input: TagAssignmentInput): TagAssignmentResult {
  const pitcher = input.players.find((player) => player.id === input.currentPitcherId);
  const batter = input.players.find((player) => player.id === input.currentBatterId);
  const fielder = input.players.find((player) => player.id === input.selectedFielderId);

  if (input.role === "pitcher") {
    if (!pitcher) return { ok: false, reason: "Select the current pitcher before adding pitcher tags." };
    return {
      ok: true,
      eventRole: "pitcher",
      playerId: pitcher.id,
      relatedPlayerId: batter?.id ?? null,
      teamSide: pitcher.teamSide,
      atBatId: input.activeAtBatId
    };
  }

  if (input.role === "batter") {
    if (!batter) return { ok: false, reason: "Select the current batter before adding batter tags." };
    return {
      ok: true,
      eventRole: "batter",
      playerId: batter.id,
      relatedPlayerId: pitcher?.id ?? null,
      teamSide: batter.teamSide,
      atBatId: input.activeAtBatId
    };
  }

  if (input.role === "fielder") {
    if (!fielder) return { ok: false, reason: "Select a fielder before adding fielder tags." };
    return {
      ok: true,
      eventRole: "fielder",
      playerId: fielder.id,
      relatedPlayerId: batter?.id ?? pitcher?.id ?? null,
      teamSide: fielder.teamSide,
      atBatId: input.activeAtBatId
    };
  }

  return {
    ok: true,
    eventRole: "review",
    playerId: batter?.id ?? null,
    relatedPlayerId: pitcher?.id ?? null,
    teamSide: batter?.teamSide ?? null,
    atBatId: input.activeAtBatId
  };
}
