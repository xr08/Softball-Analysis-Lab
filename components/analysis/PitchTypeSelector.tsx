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
    <section className={`rounded-lg border border-slate-700 bg-slate-950/50 ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={`font-black text-slate-100 ${compact ? "text-sm" : "text-lg"}`}>Pitch Type</h2>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="rounded px-2 py-1 text-xs font-black uppercase tracking-wide text-slate-500 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
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
            className={`rounded-full border px-2.5 py-1.5 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              value === pt.id
                ? "border-orange-400 bg-orange-500 text-slate-950"
                : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>
    </section>
  );
}
