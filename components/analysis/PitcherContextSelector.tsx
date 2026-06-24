import { AnalysisEvent } from "@/lib/analysis/types";

type PitcherContextSelectorProps = {
  velocity: AnalysisEvent["velocity"];
  armSlot: AnalysisEvent["armSlot"];
  onVelocityChange: (val: AnalysisEvent["velocity"]) => void;
  onArmSlotChange: (val: AnalysisEvent["armSlot"]) => void;
};

export function PitcherContextSelector({
  velocity,
  armSlot,
  onVelocityChange,
  onArmSlotChange,
}: PitcherContextSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pitcher Context</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Velocity (mph)
          <input
            type="number"
            value={velocity !== null ? velocity : ""}
            onChange={(e) => {
              const val = e.target.value;
              onVelocityChange(val === "" ? null : Number(val));
            }}
            placeholder="e.g. 64"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
            min="0"
            max="120"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Arm Slot
          <select
            value={armSlot || ""}
            onChange={(e) => {
              const val = e.target.value;
              onArmSlotChange(val === "" ? null : (val as AnalysisEvent["armSlot"]));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown / Clear</option>
            <option value="overhand">Overhand</option>
            <option value="three_quarter">3/4 Slot</option>
            <option value="sidearm">Sidearm</option>
            <option value="submarine">Submarine</option>
          </select>
        </label>
      </div>
    </section>
  );
}
