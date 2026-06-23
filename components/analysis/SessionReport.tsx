"use client";

import type { SessionReport as SessionReportModel } from "@/lib/analysis/reports";
import { ReportSection, MetricBarList } from "@/components/analysis/ReportSection";
import { ZoneHeatmap } from "@/components/analysis/ZoneHeatmap";

type SessionReportProps = {
  report: SessionReportModel;
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-36 shrink-0 font-medium text-slate-600">{label}</span>
      <span className="text-slate-900">{value || <span className="italic text-slate-400">Not set</span>}</span>
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center">
      <div className="text-2xl font-bold text-emerald-700">{value}</div>
      <div className="mt-0.5 text-xs font-medium text-slate-700">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-slate-400">{sub}</div>}
    </div>
  );
}

/**
 * Full single-session report view.
 * Renders all sections of a SessionReport model.
 */
export function SessionReport({ report }: SessionReportProps) {
  const { session, eventOverview, countSituations, swingDecision, codingCompleteness } = report;

  const generatedTime = (() => {
    try {
      return new Date(report.generatedAt).toLocaleString();
    } catch {
      return report.generatedAt;
    }
  })();

  return (
    <div className="space-y-4 print-area">
      {/* ── Session metadata ────────────────────────────────────────── */}
      <ReportSection title="Session Details">
        <div className="space-y-1.5">
          <InfoRow label="Player" value={session.playerName} />
          <InfoRow label="Session" value={session.sessionName} />
          <InfoRow label="Date" value={session.sessionDate} />
          <InfoRow label="Opponent / Context" value={session.opponent} />
          <InfoRow label="Video file" value={session.videoFileName} />
          <InfoRow
            label="Handedness"
            value={
              session.batterHandedness === "right"
                ? "Right"
                : session.batterHandedness === "left"
                ? "Left"
                : null
            }
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
            Total events: <strong>{report.totalEvents}</strong>
          </span>
          {report.filters.filtersApplied && report.filters.totalEvents !== undefined && (
            <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
              Filtered — showing {report.totalEvents} of {report.filters.totalEvents} events
            </span>
          )}
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            Generated: {generatedTime}
          </span>
        </div>
      </ReportSection>

      {/* ── Event overview ──────────────────────────────────────────── */}
      <ReportSection title="Event Overview">
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          <StatCard label="Total" value={eventOverview.total} />
          {eventOverview.tagCategories.map((c) => (
            <StatCard key={c.id} label={c.label} value={c.count} />
          ))}
        </div>
      </ReportSection>

      {/* ── Pitch results ───────────────────────────────────────────── */}
      <ReportSection
        title="Pitch Results"
        description="Count and percentage of each coded pitch result across all reported events."
      >
        <MetricBarList metrics={report.pitchResults} hideZero={false} />
      </ReportSection>

      {/* ── Pitch location heatmap ──────────────────────────────────── */}
      <ReportSection
        title="Pitch Locations"
        description="13-zone heatmap (zones 1–9 plus high, low, inside, outside). Colour intensity reflects event count."
      >
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-center">
          <ZoneHeatmap locations={report.locations} showPercentage />
          <div className="w-full sm:max-w-[240px]">
            <MetricBarList metrics={report.locations} hideZero barColor="bg-emerald-600" />
          </div>
        </div>
      </ReportSection>

      {/* ── Count situations ────────────────────────────────────────── */}
      <ReportSection
        title="Count Situations"
        description="Based on coded count fields only. Not inferred from pitch sequences."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatCard label="Two-strike events" value={countSituations.twoStrike} />
          <StatCard label="Three-ball events" value={countSituations.threeBall} />
          <StatCard label="Full count (3-2)" value={countSituations.fullCount} />
          <StatCard label="Count not set" value={countSituations.notSet} />
        </div>
        {countSituations.mostCommon.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Most common counts
            </p>
            <ul className="space-y-1.5">
              {countSituations.mostCommon.map(({ count, events }) => (
                <li key={count} className="flex items-center justify-between text-sm">
                  <span className="font-mono text-slate-700">{count}</span>
                  <span className="font-semibold text-slate-900">
                    {events} event{events === 1 ? "" : "s"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ReportSection>

      {/* ── Swing and decision ──────────────────────────────────────── */}
      <ReportSection
        title="Swing and Decision Summary"
        description="Counts are based on coded tag IDs from the session. Percentages use the denominator stated."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <StatCard label="Swing events" value={swingDecision.swingEvents} />
          <StatCard label="Swing and miss" value={swingDecision.swingAndMissEvents} />
          <StatCard label="Take events" value={swingDecision.takeEvents} />
          <StatCard label="Foul events" value={swingDecision.foulEvents} />
          <StatCard label="Balls in play" value={swingDecision.ballsInPlay} sub="(pitchResult = ball_in_play)" />
          {swingDecision.swingAndMissPctOfSwings !== null && (
            <StatCard
              label="Miss % of swings"
              value={swingDecision.swingAndMissPctOfSwings}
              sub="%"
            />
          )}
        </div>
        <p className="mt-2 text-[11px] italic text-slate-500">
          {swingDecision.denominatorNote}
        </p>
        {swingDecision.swingEvents === 0 && (
          <p className="mt-1 text-xs text-slate-400">
            No coded swing events — swing-and-miss percentage is not available.
          </p>
        )}
      </ReportSection>

      {/* ── Contact direction ───────────────────────────────────────── */}
      <ReportSection title="Contact Direction">
        <MetricBarList metrics={report.contactDirections} barColor="bg-sky-500" />
      </ReportSection>

      {/* ── Contact quality ─────────────────────────────────────────── */}
      <ReportSection title="Contact Quality">
        <MetricBarList metrics={report.contactQuality} barColor="bg-violet-500" />
      </ReportSection>

      {/* ── At-bat results ──────────────────────────────────────────── */}
      <ReportSection
        title="At-Bat Results"
        description="Descriptive counts only. Official statistics (e.g. batting average) are not calculated."
      >
        <MetricBarList metrics={report.atBatResults} barColor="bg-amber-500" hideZero={false} />
      </ReportSection>

      {/* ── Coding completeness ─────────────────────────────────────── */}
      <ReportSection
        title="Coding Completeness"
        description="How many events have each structured field coded. Null values are counted as 'uncoded'."
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 pr-4 font-semibold">Field</th>
                <th className="pb-2 pr-4 font-semibold text-right">Coded</th>
                <th className="pb-2 pr-4 font-semibold text-right">Uncoded</th>
                <th className="pb-2 font-semibold text-right">Coded %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {codingCompleteness.map((row) => (
                <tr key={row.fieldId} className="py-1">
                  <td className="py-1.5 pr-4 text-slate-700">{row.fieldLabel}</td>
                  <td className="py-1.5 pr-4 text-right font-semibold text-emerald-700">
                    {row.coded}
                  </td>
                  <td className="py-1.5 pr-4 text-right text-slate-500">{row.uncoded}</td>
                  <td className="py-1.5 text-right">
                    <span
                      className={`font-semibold ${
                        row.codedPct === null
                          ? "text-slate-400"
                          : row.codedPct >= 80
                          ? "text-emerald-700"
                          : row.codedPct >= 50
                          ? "text-amber-700"
                          : "text-rose-700"
                      }`}
                    >
                      {row.codedPct !== null ? `${row.codedPct}%` : "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ReportSection>
    </div>
  );
}
