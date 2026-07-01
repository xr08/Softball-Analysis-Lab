import { ReactNode } from "react";
import { TaggedEvent } from "@/lib/analysis/types";

type PitchLocationSelectorProps = {
  value: TaggedEvent["pitchLocation"];
  onChange: (zoneId: TaggedEvent["pitchLocation"], label: string | null) => void;
  compact?: boolean;
  countControl?: ReactNode;
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

export function PitchLocationSelector({
  value,
  onChange,
  compact = false,
  countControl
}: PitchLocationSelectorProps) {
  const isLeftHanded = false;
  const leftId = isLeftHanded ? "outside" : "inside";
  const rightId = isLeftHanded ? "inside" : "outside";
  const leftLabel = isLeftHanded ? "Outside" : "Inside";
  const rightLabel = isLeftHanded ? "Inside" : "Outside";

  return (
    <section className={`rounded-lg border border-slate-700 bg-slate-950/50 ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between">
        <h2 className={`font-black text-slate-100 ${compact ? "text-base" : "text-lg"}`}>Pitch Location</h2>
        <button
          type="button"
          onClick={() => onChange(null, null)}
          className="rounded px-2 py-1 text-xs font-black uppercase tracking-wide text-slate-500 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Clear
        </button>
      </div>

      {countControl ? <div className="mb-2">{countControl}</div> : null}

      <div className={`mx-auto flex flex-col items-center ${compact ? "max-w-[228px] gap-1" : "max-w-[300px] gap-2"}`}>
        {/* High Zone */}
        <button
          type="button"
          onClick={() => onChange("high", "High")}
          className={`${compact ? "h-6 w-32 text-[10px]" : "h-10 w-32 text-sm"} rounded-t-md border font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            value === "high" ? "border-orange-400 bg-orange-500 text-slate-950" : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
          }`}
        >
          High
        </button>

        <div className={`flex w-full items-stretch justify-center ${compact ? "gap-1" : "gap-2"}`}>
          {/* Left Chase Zone */}
          <button
            type="button"
            onClick={() => onChange(leftId, leftLabel)}
            className={`${compact ? "w-8 text-[10px]" : "w-16 text-sm"} flex rotate-180 items-center justify-center rounded-l-md border font-black transition-colors [writing-mode:vertical-lr] focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              value === leftId ? "border-orange-400 bg-orange-500 text-slate-950" : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
            }`}
          >
            <span className="rotate-180">{leftLabel}</span>
          </button>

          {/* 3x3 Grid */}
          <div className={`grid flex-shrink-0 grid-cols-3 grid-rows-3 gap-1 border-2 border-slate-500 bg-slate-800 p-1 ${compact ? "h-32 w-32" : "h-32 w-32"}`}>
            {ZONES.map((zone) => (
              <button
                key={zone.id}
                type="button"
                onClick={() => onChange(zone.id, zone.label)}
                className={`flex items-center justify-center rounded-sm border font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${compact ? "text-sm" : "text-xs"} ${
                  value === zone.id ? "border-orange-400 bg-orange-500 text-slate-950" : "border-slate-600 bg-slate-950 text-slate-300 hover:border-sky-400 hover:bg-slate-900"
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
            className={`${compact ? "w-8 text-[10px]" : "w-16 text-sm"} flex items-center justify-center rounded-r-md border font-black transition-colors [writing-mode:vertical-rl] focus:outline-none focus:ring-2 focus:ring-orange-400 ${
              value === rightId ? "border-orange-400 bg-orange-500 text-slate-950" : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
            }`}
          >
            {rightLabel}
          </button>
        </div>

        {/* Low Zone */}
        <button
          type="button"
          onClick={() => onChange("low", "Low")}
          className={`${compact ? "h-6 w-32 text-[10px]" : "h-10 w-32 text-sm"} rounded-b-md border font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
            value === "low" ? "border-orange-400 bg-orange-500 text-slate-950" : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
          }`}
        >
          Low
        </button>
      </div>

      <p className="mt-2 text-[11px] leading-tight text-slate-500">
        Inside and outside are shown from the selected batter&apos;s perspective.
      </p>
    </section>
  );
}
