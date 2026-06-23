"use client";

import { MetricRow, NOT_SET_KEY, NOT_SET_LABEL } from "@/lib/analysis/reports";

type ZoneHeatmapProps = {
  /** All 15 location MetricRows (zone_1..9, high, low, inside, outside, not_set) */
  locations: MetricRow[];
  showPercentage?: boolean;
};

const ZONE_IDS = [
  "zone_1", "zone_2", "zone_3",
  "zone_4", "zone_5", "zone_6",
  "zone_7", "zone_8", "zone_9",
] as const;

/**
 * Compact 13-zone heatmap matching VT-2 zone layout.
 *
 * Layout (from batter's perspective, pitcher looking in):
 *   [High]
 *   [1][2][3]
 *   [4][5][6]   inside/outside flanking
 *   [7][8][9]
 *   [Low]
 *
 * Colour intensity reflects count. Text is always readable.
 * No external charting dependency.
 */
export function ZoneHeatmap({ locations, showPercentage = true }: ZoneHeatmapProps) {
  const byId = new Map(locations.map((r) => [r.id, r]));

  const maxCount = Math.max(
    ...locations
      .filter((r) => r.id !== NOT_SET_KEY)
      .map((r) => r.count),
    1 // avoid division by zero
  );

  function cellStyle(count: number): React.CSSProperties {
    const intensity = count / maxCount;
    // Scale from white (0) to emerald-600 (full)
    const alpha = Math.round(intensity * 90);
    return {
      backgroundColor: `rgba(5, 150, 105, ${alpha / 100})`,
    };
  }

  function cellTextClass(count: number): string {
    const intensity = count / maxCount;
    // Use white text only when background is dark enough
    return intensity > 0.6 ? "text-white" : "text-slate-800";
  }

  function ZoneCell({ zoneId }: { zoneId: string }) {
    const row = byId.get(zoneId);
    const count = row?.count ?? 0;
    const pct = row?.percentage;
    const label = row?.label ?? zoneId;
    return (
      <div
        className={`flex flex-col items-center justify-center rounded border border-slate-200 p-1 text-center min-h-[52px] ${cellTextClass(count)}`}
        style={cellStyle(count)}
        aria-label={`${label}: ${count} event${count === 1 ? "" : "s"}`}
        title={`${label}: ${count}${showPercentage && pct !== null && pct !== undefined ? ` (${pct}%)` : ""}`}
      >
        <span className="text-[10px] font-medium leading-none opacity-70">
          {label.replace("Zone ", "")}
        </span>
        <span className="mt-0.5 text-sm font-bold leading-none">{count}</span>
        {showPercentage && pct !== null && pct !== undefined && (
          <span className="mt-0.5 text-[9px] leading-none opacity-80">{pct}%</span>
        )}
      </div>
    );
  }

  function ChaseCell({ zoneId, label }: { zoneId: string; label: string }) {
    const row = byId.get(zoneId);
    const count = row?.count ?? 0;
    const pct = row?.percentage;
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-slate-300 px-2 py-1 text-center text-xs ${cellTextClass(count)}`}
        style={cellStyle(count)}
        aria-label={`${label}: ${count}`}
        title={`${label}: ${count}${showPercentage && pct !== null && pct !== undefined ? ` (${pct}%)` : ""}`}
      >
        <span className="font-semibold">{label}</span>
        <span className="ml-1 font-bold">{count}</span>
        {showPercentage && pct !== null && pct !== undefined && (
          <span className="ml-0.5 opacity-80">({pct}%)</span>
        )}
      </div>
    );
  }

  const notSetRow = byId.get(NOT_SET_KEY);
  const notSetCount = notSetRow?.count ?? 0;

  return (
    <div className="flex flex-col items-center gap-1.5" aria-label="13-zone pitch location heatmap">
      {/* High */}
      <div className="w-full max-w-[200px]">
        <ChaseCell zoneId="high" label="High" />
      </div>

      {/* Main 3×3 grid with inside/outside flanks */}
      <div className="flex items-center gap-1.5">
        <ChaseCell zoneId="inside" label="In" />
        <div className="grid grid-cols-3 gap-1" style={{ width: 180 }}>
          {ZONE_IDS.map((id) => (
            <ZoneCell key={id} zoneId={id} />
          ))}
        </div>
        <ChaseCell zoneId="outside" label="Out" />
      </div>

      {/* Low */}
      <div className="w-full max-w-[200px]">
        <ChaseCell zoneId="low" label="Low" />
      </div>

      {/* Not set indicator */}
      {notSetCount > 0 && (
        <p className="mt-1 text-center text-xs text-slate-500">
          {NOT_SET_LABEL}: <strong>{notSetCount}</strong>
        </p>
      )}

      <div className="mt-2 text-center text-[10px] text-slate-400">
        <p>Inside and outside are shown from the batter's perspective.</p>
        <p>Colour intensity reflects relative event count.</p>
      </div>
    </div>
  );
}
