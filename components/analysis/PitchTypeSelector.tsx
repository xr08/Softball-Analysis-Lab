import { AnalysisEvent } from "@/lib/analysis/types";

type PitchTypeSelectorProps = {
  value: AnalysisEvent["pitchType"];
  onChange: (val: AnalysisEvent["pitchType"]) => void;
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

export function PitchTypeSelector({ value, onChange }: PitchTypeSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pitch Type</h2>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {PITCH_TYPES.map((pt) => (
          <button
            key={pt.id}
            type="button"
            onClick={() => onChange(pt.id as AnalysisEvent["pitchType"])}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
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
