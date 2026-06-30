import { TaggedEvent } from "@/lib/analysis/types";

type PitchResultSelectorProps = {
  value: TaggedEvent["pitchResult"];
  onChange: (value: TaggedEvent["pitchResult"]) => void;
};

export function PitchResultSelector({ value, onChange }: PitchResultSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Pitch Result</h2>
      <label className="flex flex-col gap-1 text-sm text-slate-700">
        Result
        <select
          value={value || ""}
          onChange={(event) => {
            const val = event.target.value;
            onChange(val === "" ? null : (val as TaggedEvent["pitchResult"]));
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
        >
          <option value="">Unknown / Clear</option>
          <option value="called_strike">Called Strike</option>
          <option value="swinging_strike">Swinging Strike</option>
          <option value="foul">Foul</option>
          <option value="ball">Ball</option>
          <option value="ball_in_play">Ball In Play</option>
          <option value="hit_by_pitch">Hit by Pitch</option>
        </select>
      </label>
    </section>
  );
}
