import { AtBat, Player, Session } from "@/lib/analysis/types";
import {
  getPlayerName,
  teamSideLabel,
  UNKNOWN_BATTER_LABEL,
  UNKNOWN_FIELDER_ID,
  UNKNOWN_FIELDER_LABEL,
  canClearPitcherSelection,
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
  const allowEmptyPitcherOption = canClearPitcherSelection(activeAtBat?.id ?? null);
  const fielderLabel = selectedFielderId
    ? getPlayerName(players, selectedFielderId)
    : "No fielder selected";

  return (
    <section className="rounded-lg border border-slate-700 bg-[#101720] p-4 shadow-xl shadow-black/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">Current At-Bat</p>
          <h2 className="mt-1 text-lg font-black text-white">{activeStatus}</h2>
          <p className="mt-1 text-xs text-slate-500">{session.name.trim() || "Untitled session"}</p>
        </div>
        {hasActiveAtBat ? (
          <button
            onClick={onEndAtBat}
            className="rounded-md border border-amber-400/40 bg-amber-500/10 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-amber-200 transition-colors hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            End
          </button>
        ) : (
          <button
            onClick={onStartAtBat}
            disabled={!currentPitcherId}
            className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-2 text-sm">
        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
          <span className="block text-[11px] font-black uppercase tracking-wide text-slate-500">Pitcher</span>
          <span className="mt-1 block truncate font-bold text-slate-100">{getPlayerName(players, currentPitcherId)}</span>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
          <span className="block text-[11px] font-black uppercase tracking-wide text-slate-500">Batter</span>
          <span className="mt-1 block truncate font-bold text-slate-100">
            {currentBatterId ? getPlayerName(players, currentBatterId) : UNKNOWN_BATTER_LABEL}
          </span>
        </div>
        <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
          <span className="block text-[11px] font-black uppercase tracking-wide text-slate-500">Fielder Target</span>
          <span className="mt-1 block truncate font-bold text-slate-100">{fielderLabel}</span>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={onNextPitch}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-950 shadow-sm transition-colors hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Next Pitch
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onNextAtBat}
            disabled={!currentPitcherId}
            className="rounded-md border border-sky-500/50 bg-sky-500/10 px-3 py-2 text-xs font-black uppercase tracking-wide text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next At-Bat
          </button>
          <button
            type="button"
            onClick={onClearFielder}
            disabled={!selectedFielderId}
            className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear Fielder
          </button>
        </div>
      </div>

      <details className="group mt-4 rounded-md border border-slate-700 bg-slate-950/40">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300 outline-none hover:bg-slate-900 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
          Edit / Change Participants
        </summary>
        <div className="grid gap-3 p-3">
          <div className="grid gap-2 rounded-md border border-slate-700 bg-slate-950/50 p-3 text-xs text-slate-300">
            <div>
              <span className="block font-black uppercase tracking-wide text-slate-500">Teams</span>
              Team A: {teamAPlayers.length} / Team B: {teamBPlayers.length}
            </div>
            <div>
              <span className="block font-black uppercase tracking-wide text-slate-500">Status</span>
              {activeStatus}
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Pitcher
            <select
              value={currentPitcherId || ""}
              onChange={(e) => onPitcherChange(e.target.value || null)}
              disabled={selectorsLocked}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 disabled:bg-slate-900 disabled:text-slate-500"
            >
              {allowEmptyPitcherOption ? <option value="">Select Pitcher...</option> : null}
              {pitchers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.teamSide === "teamA" ? "A" : p.teamSide === "teamB" ? "B" : "N"})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Batter
            <select
              value={currentBatterId || ""}
              onChange={(e) => onBatterChange(e.target.value || null)}
              disabled={selectorsLocked}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 disabled:bg-slate-900 disabled:text-slate-500"
            >
              <option value="">{UNKNOWN_BATTER_LABEL}</option>
              {batters.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.teamSide === "teamA" ? "A" : p.teamSide === "teamB" ? "B" : "N"})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Fielder Target
            <select
              value={selectedFielderId || ""}
              onChange={(e) => onFielderChange(e.target.value || null)}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
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

          <p className="text-xs text-slate-500">
            Next Pitch clears count, pitch result, location, contact, and pitch type only. It keeps the session,
            teams, current pitcher, current batter, and active at-bat.
          </p>
          {selectorsLocked ? (
            <p className="text-xs text-amber-300">
              Pitcher and batter are locked because this at-bat already has tagged events. End it or use Next At-Bat to correct course.
            </p>
          ) : null}
        </div>
      </details>
    </section>
  );
}
