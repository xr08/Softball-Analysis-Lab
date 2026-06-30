import { TaggedEvent } from "@/lib/analysis/types";

type PitchTypeSelectorProps = {
  value: TaggedEvent["pitchType"];
  onChange: (val: TaggedEvent["pitchType"]) => void;
  compact?: boolean;
};

const PITCH_TYPES = [
  { id: "fastball", label: "Fastball" },
  { id: "changeup", label: "Changeup" },
  { id: "rise", label: "Rise" },
  { id: "drop", label: "Drop" },
  { id: "curve", label: "Curve" },
  { id: "screw", label: "Screw" },
  { id: "other", label: "Other" },
] as const;

export function PitchTypeSelector({ value, onChange, compact = false }: PitchTypeSelectorProps) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={`font-semibold text-slate-900 ${compact ? "text-sm" : "text-lg"}`}>Pitch Type</h2>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {PITCH_TYPES.map((pt) => (
          <button
            key={pt.id}
            type="button"
            onClick={() => onChange(pt.id as TaggedEvent["pitchType"])}
            className={`rounded-full border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
              value === pt.id
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>
    </section>
  );
}
