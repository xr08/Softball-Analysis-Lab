import { Player } from "@/lib/analysis/types";

type AtBatControlsProps = {
  players: Player[];
  currentPitcherId: string | null;
  currentBatterId: string | null;
  onPitcherChange: (id: string | null) => void;
  onBatterChange: (id: string | null) => void;
  onStartAtBat: () => void;
  hasActiveAtBat: boolean;
  onEndAtBat: () => void;
};

export function AtBatControls({
  players,
  currentPitcherId,
  currentBatterId,
  onPitcherChange,
  onBatterChange,
  onStartAtBat,
  hasActiveAtBat,
  onEndAtBat
}: AtBatControlsProps) {
  const pitchers = players;
  const batters = players;

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
              disabled={!currentPitcherId || !currentBatterId}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
            >
              Start At-Bat
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Pitcher
          <select
            value={currentPitcherId || ""}
            onChange={(e) => onPitcherChange(e.target.value || null)}
            disabled={hasActiveAtBat}
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
            disabled={hasActiveAtBat}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500"
          >
            <option value="">Select Batter...</option>
            {batters.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.teamSide === "teamA" ? "A" : p.teamSide === "teamB" ? "B" : "N"})
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
