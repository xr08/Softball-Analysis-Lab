"use client";

import {
  ComparisonReport as ComparisonReportType,
  ComparableMetric,
  ReportWarning,
  diffDirectionLabel,
} from "@/lib/analysis/reports";
import { ReportSection } from "@/components/analysis/ReportSection";

type ComparisonReportProps = {
  comparison: ComparisonReportType;
};

function WarningBanner({ warning }: { warning: ReportWarning }) {
  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      ⚠ {warning.message}
    </div>
  );
}

function ComparisonTableSection({
  title,
  metrics,
  showPct = true,
}: {
  title: string;
  metrics: ComparableMetric[];
  showPct?: boolean;
}) {
  const visible = metrics.filter((m) => m.aValue > 0 || m.bValue > 0);

  if (visible.length === 0) {
    return (
      <ReportSection title={title}>
        <p className="text-xs text-slate-400">No events coded in either session for this section.</p>
      </ReportSection>
    );
  }

  return (
    <ReportSection title={title}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
              <th className="pb-2 pr-3 font-semibold">Metric</th>
              <th className="pb-2 pr-3 text-right font-semibold">Session A</th>
              <th className="pb-2 pr-3 text-right font-semibold">Session B</th>
              <th className="pb-2 text-right font-semibold">Difference</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((m) => {
              const dir = diffDirectionLabel(m.diff);
              // Use real minus sign \u2212 for negative
              const diffDisplay =
                m.diff === 0
                  ? "Unchanged"
                  : m.diff > 0
                  ? `+${m.diff}`
                  : `\u2212${Math.abs(m.diff)}`;
              
              const ppDisplay =
                showPct && m.ppDiff !== null
                  ? ` (${m.ppDiff > 0 ? "+" : m.ppDiff < 0 ? "\u2212" : ""}${Math.abs(m.ppDiff)} pp)`
                  : "";
              
              const dirClass =
                dir === "higher"
                  ? "text-emerald-700"
                  : dir === "lower"
                  ? "text-rose-700"
                  : "text-slate-400";

              return (
                <tr key={m.id}>
                  <td className="py-1.5 pr-3 text-slate-700">{m.label}</td>
                  <td className="py-1.5 pr-3 text-right font-semibold text-slate-900">
                    {m.aValue}
                    {showPct && (
                      <span className="ml-1 font-normal text-slate-400 text-xs">
                        {m.aPct !== null ? `(${m.aPct}%)` : "(\u2014)"}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 pr-3 text-right font-semibold text-slate-900">
                    {m.bValue}
                    {showPct && (
                      <span className="ml-1 font-normal text-slate-400 text-xs">
                        {m.bPct !== null ? `(${m.bPct}%)` : "(\u2014)"}
                      </span>
                    )}
                  </td>
                  <td className={`py-1.5 text-right font-semibold ${dirClass}`}>
                    {diffDisplay}{ppDisplay}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">
        Difference = Session B − Session A. Neutral — does not imply improvement or decline.
      </p>
    </ReportSection>
  );
}

/**
 * Side-by-side session comparison view.
 */
export function ComparisonReport({ comparison }: ComparisonReportProps) {
  const { sessionA, sessionB, warnings, totalEvents } = comparison;

  const aName = sessionA.session.name || "Session A";
  const bName = sessionB.session.name || "Session B";

  return (
    <div className="space-y-4 print-area">
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          {warnings.map((w) => (
            <WarningBanner key={w.code} warning={w} />
          ))}
        </div>
      )}

      {/* Session headers */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-xs font-semibold text-emerald-800">Session A</p>
          <p className="mt-0.5 text-sm font-bold text-emerald-900">{aName}</p>
          <p className="text-xs text-emerald-700">

          </p>
          <p className="mt-1 text-xs text-emerald-700">
            <strong>{sessionA.totalEvents}</strong> event{sessionA.totalEvents === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
          <p className="text-xs font-semibold text-sky-800">Session B</p>
          <p className="mt-0.5 text-sm font-bold text-sky-900">{bName}</p>
          <p className="text-xs text-sky-700">

          </p>
          <p className="mt-1 text-xs text-sky-700">
            <strong>{sessionB.totalEvents}</strong> event{sessionB.totalEvents === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      {/* Total events comparison */}
      <ReportSection title="Total Events">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-emerald-700">{totalEvents.aValue}</div>
            <div className="text-xs text-slate-500">{aName}</div>
          </div>
          <div className="text-slate-300 text-xl">vs</div>
          <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-sky-700">{totalEvents.bValue}</div>
            <div className="text-xs text-slate-500">{bName}</div>
          </div>
          <div className="flex-1 text-center">
            <div
              className={`text-xl font-bold ${
                totalEvents.diff > 0
                  ? "text-emerald-600"
                  : totalEvents.diff < 0
                  ? "text-rose-600"
                  : "text-slate-400"
              }`}
            >
              {totalEvents.diff === 0
                ? "—"
                : totalEvents.diff > 0
                ? `+${totalEvents.diff}`
                : totalEvents.diff}
            </div>
            <div className="text-xs text-slate-500">B − A</div>
          </div>
        </div>
      </ReportSection>

      <ComparisonTableSection title="Pitch Results" metrics={comparison.pitchResults} />
      <ComparisonTableSection title="Pitch Locations" metrics={comparison.locations} />
      <ComparisonTableSection title="Contact Direction" metrics={comparison.contactDirections} />
      <ComparisonTableSection title="Contact Quality" metrics={comparison.contactQuality} />
      <ComparisonTableSection title="At-Bat Results" metrics={comparison.atBatResults} />
    </div>
  );
}
