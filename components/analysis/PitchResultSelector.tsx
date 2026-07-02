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
    <section className={`rounded-lg border border-slate-700 bg-slate-950/50 ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className={`font-black text-slate-100 ${compact ? "text-base" : "text-lg"}`}>Pitch Result</h2>
          {!compact ? (
            <p className="text-xs text-slate-500">Fast result buttons feed the same stored pitch result value used in tags and exports.</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded-md border border-slate-600 bg-slate-900 px-2.5 py-1 text-xs font-black uppercase tracking-wide text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Clear
        </button>
      </div>

      <div className={compact ? "grid grid-cols-3 gap-1" : "flex flex-wrap gap-1.5"}>
        {PITCH_RESULT_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option.value)}
              className={`min-h-8 rounded-md border px-1.5 py-1 text-[10px] font-black leading-tight transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                selected
                  ? "border-orange-400 bg-orange-500 text-slate-950"
                  : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {compact ? null : (
        <p className="mt-2 text-sm text-slate-400">Selected result: {getPitchResultLabel(value)}</p>
      )}
      {hasCustomValue ? (
        <p className="mt-1 text-xs text-amber-300">
          This session contains a non-standard pitch result value: {getPitchResultLabel(value)}.
        </p>
      ) : null}
    </section>
  );
}
