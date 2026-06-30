import { TaggedEvent } from "@/lib/analysis/types";
import { getPitchResultLabel, PITCH_RESULT_OPTIONS } from "@/lib/analysis/pitch-window";

type PitchResultSelectorProps = {
  value: TaggedEvent["pitchResult"];
  onChange: (value: TaggedEvent["pitchResult"]) => void;
  compact?: boolean;
};

export function PitchResultSelector({ value, onChange, compact = false }: PitchResultSelectorProps) {
  const hasCustomValue = Boolean(value) && !PITCH_RESULT_OPTIONS.some((option) => option.value === value);

  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${compact ? "p-3" : "p-4"}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>Pitch Result</h2>
          <p className="text-xs text-slate-500">Fast result buttons feed the same stored pitch result value used in tags and exports.</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Clear
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {PITCH_RESULT_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                selected
                  ? "border-emerald-600 bg-emerald-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <p className={`mt-3 text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
        Selected result: {getPitchResultLabel(value)}
      </p>
      {hasCustomValue ? (
        <p className="mt-1 text-xs text-amber-700">
          This session contains a non-standard pitch result value: {getPitchResultLabel(value)}.
        </p>
      ) : null}
    </section>
  );
}
