import { TaggedEvent } from "@/lib/analysis/types";

type PitchLocationSelectorProps = {
  value: TaggedEvent["pitchLocation"];
  onChange: (zoneId: TaggedEvent["pitchLocation"], label: string | null) => void;
  compact?: boolean;
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

export function PitchLocationSelector({ value, onChange, compact = false }: PitchLocationSelectorProps) {
  const isLeftHanded = false;
  const leftId = isLeftHanded ? "outside" : "inside";
  const rightId = isLeftHanded ? "inside" : "outside";
  const leftLabel = isLeftHanded ? "Outside" : "Inside";
  const rightLabel = isLeftHanded ? "Inside" : "Outside";

  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>Pitch Location</h2>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="text-xs text-slate-500 hover:text-slate-900"
        >
          Clear
        </button>
      </div>

      <p className={`text-xs text-slate-500 ${compact ? "mb-2" : "mb-4"}`}>
        Inside and outside are shown from the selected batter's perspective.
      </p>

      <div className={`mx-auto flex flex-col items-center ${compact ? "max-w-[236px] gap-1.5" : "max-w-[300px] gap-2"}`}>
        {/* High Zone */}
        <button
          type="button"
          onClick={() => onChange("high", "High")}
          className={`${compact ? "h-8 w-24 text-xs" : "h-10 w-32 text-sm"} rounded-t-xl border border-slate-300 font-medium transition-colors ${
            value === "high" ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          High
        </button>

        <div className={`flex w-full items-stretch justify-center ${compact ? "gap-1.5" : "gap-2"}`}>
          {/* Left Chase Zone */}
          <button
            type="button"
            onClick={() => onChange(leftId, leftLabel)}
            className={`${compact ? "w-12 text-xs" : "w-16 text-sm"} rounded-l-xl border border-slate-300 font-medium transition-colors [writing-mode:vertical-lr] rotate-180 flex items-center justify-center ${
              value === leftId ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
            }`}
          >
            <span className="rotate-180">{leftLabel}</span>
          </button>

          {/* 3x3 Grid */}
          <div className={`grid grid-cols-3 grid-rows-3 gap-1 bg-slate-300 border-2 border-slate-800 p-1 flex-shrink-0 ${compact ? "h-24 w-24" : "h-32 w-32"}`}>
            {ZONES.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => onChange(zone.id, zone.label)}
                className={`flex items-center justify-center border font-medium transition-colors ${compact ? "text-[11px]" : "text-xs"} ${
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
            className={`${compact ? "w-12 text-xs" : "w-16 text-sm"} rounded-r-xl border border-slate-300 font-medium transition-colors [writing-mode:vertical-rl] flex items-center justify-center ${
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
          className={`${compact ? "h-8 w-24 text-xs" : "h-10 w-32 text-sm"} rounded-b-xl border border-slate-300 font-medium transition-colors ${
            value === "low" ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
          }`}
        >
          Low
        </button>
      </div>
    </section>
  );
}
