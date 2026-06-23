"use client";

import { ReviewSummary as ReviewSummaryData } from "@/lib/analysis/review";

const PITCH_RESULT_LABELS: Record<string, string> = {
  called_strike: "Called Strike",
  swinging_strike: "Swinging Strike",
  foul: "Foul",
  ball: "Ball",
  ball_in_play: "Ball in Play",
  hit_by_pitch: "Hit by Pitch",
  "Not set": "Not set"
};

const CONTACT_QUALITY_LABELS: Record<string, string> = {
  hard: "Hard",
  medium: "Medium",
  weak: "Weak",
  "Not set": "Not set"
};

const RESULT_LABELS: Record<string, string> = {
  single: "Single",
  double: "Double",
  triple: "Triple",
  home_run: "Home Run",
  walk: "Walk",
  strikeout: "Strikeout",
  field_out: "Field Out",
  fielders_choice: "Fielder's Choice",
  reached_on_error: "Reached on Error",
  sacrifice: "Sacrifice",
  hit_by_pitch: "HBP",
  "Not set": "Not set"
};

type ReviewSummaryProps = {
  summary: ReviewSummaryData;
  totalSessionEvents: number;
};

function BreakdownRow({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <li className="flex items-center gap-2">
      <div className="flex-1">
        <div className="mb-0.5 flex justify-between text-xs">
          <span className="text-slate-700">{label}</span>
          <span className="font-semibold text-slate-900">{count} ({pct}%)</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </li>
  );
}

function BreakdownSection({ title, data, labelMap, total }: {
  title: string;
  data: Record<string, number>;
  labelMap: Record<string, string>;
  total: number;
}) {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  if (entries.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <ul className="space-y-2">
        {entries.map(([key, count]) => (
          <BreakdownRow
            key={key}
            label={labelMap[key] ?? key}
            count={count}
            total={total}
          />
        ))}
      </ul>
    </div>
  );
}

export function ReviewSummary({ summary, totalSessionEvents }: ReviewSummaryProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Review Summary</h2>

      <p className="mb-4 text-sm text-slate-700">
        <span className="font-bold text-emerald-700">{summary.totalCount}</span> matching event
        {summary.totalCount === 1 ? "" : "s"}{" "}
        from <span className="font-semibold">{totalSessionEvents}</span> total
      </p>

      {summary.totalCount === 0 ? (
        <p className="text-sm text-slate-500">No events match the current filters.</p>
      ) : (
        <div className="space-y-4">
          <BreakdownSection
            title="Pitch Results"
            data={summary.pitchResults}
            labelMap={PITCH_RESULT_LABELS}
            total={summary.totalCount}
          />
          <BreakdownSection
            title="Contact Quality"
            data={summary.contactQualities}
            labelMap={CONTACT_QUALITY_LABELS}
            total={summary.totalCount}
          />
          <BreakdownSection
            title="At-Bat Results"
            data={summary.results}
            labelMap={RESULT_LABELS}
            total={summary.totalCount}
          />
        </div>
      )}
    </section>
  );
}
