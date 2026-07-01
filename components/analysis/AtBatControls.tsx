import { AtBat, Player } from "@/lib/analysis/types";
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
    ? `Active (${currentAtBatEventCount} event${currentAtBatEventCount === 1 ? "" : "s"})`
    : "No active at-bat";
  const selectorsLocked = !canEditAtBatParticipants(activeAtBat?.id ?? null, currentAtBatEventCount);
  const allowEmptyPitcherOption = canClearPitcherSelection(activeAtBat?.id ?? null);
  const batterLabel = currentBatterId ? getPlayerName(players, currentBatterId) : UNKNOWN_BATTER_LABEL;
  const fielderLabel = selectedFielderId ? getPlayerName(players, selectedFielderId) : "No fielder";

  return (
    <section className="rounded-lg border border-slate-700 bg-[#101720] shadow-xl shadow-black/20">
      <div className="flex flex-col gap-2 p-2.5">
        <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-400">Current At-Bat</p>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="text-sm font-black text-white">{activeStatus}</h2>
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
              <span className="min-w-0 truncate">
                <span className="font-black uppercase tracking-wide text-slate-500">Batter:</span> {batterLabel}
              </span>
              <span className="min-w-0 truncate">
                <span className="font-black uppercase tracking-wide text-slate-500">Pitcher:</span> {getPlayerName(players, currentPitcherId)}
              </span>
              <span className="min-w-0 truncate">
                <span className="font-black uppercase tracking-wide text-slate-500">Fielder:</span> {fielderLabel}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {hasActiveAtBat ? (
              <button
                type="button"
                onClick={onNextPitch}
                className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Next Pitch
              </button>
            ) : (
              <button
                type="button"
                onClick={onStartAtBat}
                disabled={!currentPitcherId}
                className="rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Start At-Bat
              </button>
            )}
            <button
              type="button"
              onClick={onNextAtBat}
              disabled={!currentPitcherId}
              className="rounded-md border border-sky-500/50 bg-sky-500/10 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next At-Bat
            </button>
            {selectedFielderId ? (
              <button
                type="button"
                onClick={onClearFielder}
                className="rounded-md border border-slate-600 bg-slate-900 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-slate-200 hover:bg-slate-800"
              >
                Clear Fielder
              </button>
            ) : null}
            {hasActiveAtBat ? (
              <button
                type="button"
                onClick={onEndAtBat}
                className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2.5 py-1.5 text-xs font-black uppercase tracking-wide text-amber-200 transition-colors hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                End
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <details className="group border-t border-slate-700">
        <summary className="cursor-pointer list-none px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-300 outline-none hover:bg-slate-900 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
          Edit / Change Participants
        </summary>
        <div className="grid gap-3 p-3 lg:grid-cols-3">
          <div className="grid gap-2 rounded-md border border-slate-700 bg-slate-950/50 p-3 text-xs text-slate-300 lg:col-span-3">
            <div>
              <span className="block font-black uppercase tracking-wide text-slate-500">Teams</span>
              Team A: {teamAPlayers.length} / Team B: {teamBPlayers.length}
            </div>
            <div>
              <span className="block font-black uppercase tracking-wide text-slate-500">Reset Rule</span>
              Next Pitch clears only pitch-scoped fields and keeps pitcher, batter, and active at-bat.
            </div>
          </div>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Pitcher
            <select
              value={currentPitcherId || ""}
              onChange={(event) => onPitcherChange(event.target.value || null)}
              disabled={selectorsLocked}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 disabled:bg-slate-900 disabled:text-slate-500"
            >
              {allowEmptyPitcherOption ? <option value="">Select Pitcher...</option> : null}
              {pitchers.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.teamSide === "teamA" ? "A" : player.teamSide === "teamB" ? "B" : "N"})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Batter
            <select
              value={currentBatterId || ""}
              onChange={(event) => onBatterChange(event.target.value || null)}
              disabled={selectorsLocked}
              className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 disabled:bg-slate-900 disabled:text-slate-500"
            >
              <option value="">{UNKNOWN_BATTER_LABEL}</option>
              {batters.map((player) => (
                <option key={player.id} value={player.id}>
                  {player.name} ({player.teamSide === "teamA" ? "A" : player.teamSide === "teamB" ? "B" : "N"})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Fielder Target
            <select
              value={selectedFielderId || ""}
              onChange={(event) => onFielderChange(event.target.value || null)}
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

          {selectorsLocked ? (
            <p className="text-xs text-amber-300 lg:col-span-3">
              Pitcher and batter are locked because this at-bat already has tagged events. End it or use Next At-Bat to correct course.
            </p>
          ) : null}
        </div>
      </details>
    </section>
  );
}
