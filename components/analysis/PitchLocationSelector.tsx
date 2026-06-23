import { AnalysisEvent } from "@/lib/analysis/types";

type PitchLocationSelectorProps = {
  value: AnalysisEvent["pitchLocationZone"];
  batterHandedness: AnalysisEvent["batterHandedness"];
  onChange: (zoneId: AnalysisEvent["pitchLocationZone"], label: string | null) => void;
};

const ZONES = [
  { id: "zone_1", label: "Zone 1" },
  { id: "zone_2", label: "Zone 2" },
  { id: "zone_3", label: "Zone 3" },
  { id: "zone_4", label: "Zone 4" },
  { id: "zone_5", label: "Zone 5" },
  { id: "zone_6", label: "Zone 6" },
  { id: "zone_7", label: "Zone 7" },
  { id: "zone_8", label: "Zone 8" },
  { id: "zone_9", label: "Zone 9" },
] as const;

export function PitchLocationSelector({ value, batterHandedness, onChange }: PitchLocationSelectorProps) {
  const isLeftHanded = batterHandedness === "left";
  const leftId = isLeftHanded ? "outside" : "inside";
  const rightId = isLeftHanded ? "inside" : "outside";
  const leftLabel = isLeftHanded ? "Outside" : "Inside";
  const rightLabel = isLeftHanded ? "Inside" : "Outside";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Pitch Location</h2>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Clear
        </button>
      </div>

      <p className="mb-4 text-xs text-slate-500">
        Inside and outside are shown from the selected batter's perspective.
      </p>

      <div className="mx-auto flex max-w-[300px] flex-col items-center gap-2">
        {/* High Zone */}
        <button
          type="button"
          onClick={() => onChange("high", "High")}
          className={`h-10 w-32 rounded-t-xl border border-slate-300 text-sm font-medium transition-colors ${
            value === "high" ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          High
        </button>

        <div className="flex w-full items-stretch justify-center gap-2">
          {/* Left Chase Zone */}
          <button
            type="button"
            onClick={() => onChange(leftId, leftLabel)}
            className={`w-16 rounded-l-xl border border-slate-300 text-sm font-medium transition-colors [writing-mode:vertical-lr] rotate-180 flex items-center justify-center ${
              value === leftId ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="rotate-180">{leftLabel}</span>
          </button>

          {/* 3x3 Grid */}
          <div className="grid grid-cols-3 grid-rows-3 gap-1 bg-slate-300 border-2 border-slate-800 p-1 w-32 h-32 flex-shrink-0">
            {ZONES.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => onChange(zone.id, zone.label)}
                className={`flex items-center justify-center border text-xs font-medium transition-colors ${
                  value === zone.id ? "bg-emerald-500 text-white border-emerald-600" : "bg-white text-slate-600 hover:bg-slate-100"
                }`}
              >
                {zone.id.replace("zone_", "")}
              </button>
            ))}
          </div>

          {/* Right Chase Zone */}
          <button
            type="button"
            onClick={() => onChange(rightId, rightLabel)}
            className={`w-16 rounded-r-xl border border-slate-300 text-sm font-medium transition-colors [writing-mode:vertical-rl] flex items-center justify-center ${
              value === rightId ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            {rightLabel}
          </button>
        </div>

        {/* Low Zone */}
        <button
          type="button"
          onClick={() => onChange("low", "Low")}
          className={`h-10 w-32 rounded-b-xl border border-slate-300 text-sm font-medium transition-colors ${
            value === "low" ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          Low
        </button>
      </div>
    </section>
  );
}
