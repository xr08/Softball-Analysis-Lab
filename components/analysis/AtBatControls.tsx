import { AtBat, Player, Session } from "@/lib/analysis/types";
import {
  getPlayerName,
  teamSideLabel,
  UNKNOWN_BATTER_LABEL,
  UNKNOWN_FIELDER_ID,
  UNKNOWN_FIELDER_LABEL,
  canEditAtBatParticipants
} from "@/lib/analysis/workflow";

type AtBatControlsProps = {
  session: Session;
  players: Player[];
  activeAtBat: AtBat | null;
  currentAtBatEventCount: number;
  currentPitcherId: string | null;
  currentBatterId: string | null;
  selectedFielderId: string | null;
  onPitcherChange: (id: string | null) => void;
  onBatterChange: (id: string | null) => void;
  onFielderChange: (id: string | null) => void;
  onClearFielder: () => void;
  onStartAtBat: () => void;
  hasActiveAtBat: boolean;
  onEndAtBat: () => void;
  onNextPitch: () => void;
  onNextAtBat: () => void;
};

export function AtBatControls({
  session,
  players,
  activeAtBat,
  currentAtBatEventCount,
  currentPitcherId,
  currentBatterId,
  selectedFielderId,
  onPitcherChange,
  onBatterChange,
  onFielderChange,
  onClearFielder,
  onStartAtBat,
  hasActiveAtBat,
  onEndAtBat,
  onNextPitch,
  onNextAtBat
}: AtBatControlsProps) {
  const pitchers = players;
  const batters = players;
  const teamAPlayers = players.filter((player) => player.teamSide === "teamA");
  const teamBPlayers = players.filter((player) => player.teamSide === "teamB");
  const activeStatus = activeAtBat
    ? `Active at-bat (${currentAtBatEventCount} event${currentAtBatEventCount === 1 ? "" : "s"})`
    : "No active at-bat";
  const selectorsLocked = !canEditAtBatParticipants(activeAtBat?.id ?? null, currentAtBatEventCount);
  const fielderLabel = selectedFielderId
    ? getPlayerName(players, selectedFielderId)
    : "No fielder selected";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Current At-Bat</h2>
        <div className="flex gap-2">
          {hasActiveAtBat ? (
            <button
              onClick={onEndAtBat}
              className="rounded-md bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800 transition-colors hover:bg-amber-200"
            >
              End At-Bat
            </button>
          ) : (
            <button
              onClick={onStartAtBat}
              disabled={!currentPitcherId}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Start At-Bat
            </button>
          )}
        </div>
      </div>

      <div className="mb-4 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Session</span>
          {session.name.trim() || "Untitled session"} ({session.sessionType})
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Teams</span>
          Team A: {teamAPlayers.length} | Team B: {teamBPlayers.length}
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
          {activeStatus}
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Pitcher</span>
          {getPlayerName(players, currentPitcherId)}
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Batter</span>
          {currentBatterId ? getPlayerName(players, currentBatterId) : UNKNOWN_BATTER_LABEL}
        </div>
        <div>
          <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Fielder Target</span>
          {fielderLabel}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Pitcher
          <select
            value={currentPitcherId || ""}
            onChange={(e) => onPitcherChange(e.target.value || null)}
            disabled={selectorsLocked}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">Select Pitcher...</option>
            {pitchers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamSide === "teamA" ? "A" : p.teamSide === "teamB" ? "B" : "N"})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Batter
          <select
            value={currentBatterId || ""}
            onChange={(e) => onBatterChange(e.target.value || null)}
            disabled={selectorsLocked}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">{UNKNOWN_BATTER_LABEL}</option>
            {batters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamSide === "teamA" ? "A" : p.teamSide === "teamB" ? "B" : "N"})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Fielder Target
          <select
            value={selectedFielderId || ""}
            onChange={(e) => onFielderChange(e.target.value || null)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Select fielder...</option>
            <option value={UNKNOWN_FIELDER_ID}>{UNKNOWN_FIELDER_LABEL}</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name} ({teamSideLabel(player.teamSide)})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onNextPitch}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          Next Pitch: reset pitch fields
        </button>
        <button
          type="button"
          onClick={onNextAtBat}
          disabled={!currentPitcherId}
          className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
        >
          Next At-Bat
        </button>
        <button
          type="button"
          onClick={onClearFielder}
          disabled={!selectedFielderId}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          Clear Fielder
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Next Pitch clears count, pitch result, location, contact, and pitch type only. It keeps the session, teams, current pitcher, current batter, and active at-bat.
      </p>
      {selectorsLocked ? (
        <p className="mt-1 text-xs text-amber-700">
          Pitcher and batter are locked for this at-bat because events have already been tagged. End it or use Next At-Bat to make a correction.
        </p>
      ) : null}
    </section>
  );
}
