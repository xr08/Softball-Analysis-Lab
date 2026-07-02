"use client";

import { ReactNode } from "react";

type ReportSectionProps = {
  title: string;
  description?: string;
  children: ReactNode;
  /** Extra classes for the outer wrapper */
  className?: string;
};

/**
 * Reusable report section block.
 * Used within SessionReport and ComparisonReport panels.
 */
export function ReportSection({ title, description, children, className = "" }: ReportSectionProps) {
  return (
    <section className={`rounded-lg border border-slate-700 bg-[#101720] p-5 ${className}`}>
      <h3 className="mb-1 text-base font-black text-slate-100">{title}</h3>
      {description && (
        <p className="mb-3 text-xs text-slate-500">{description}</p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** A horizontal percentage bar row for a single metric. */
export function MetricBar({
  label,
  count,
  percentage,
  denominator,
  barColor = "bg-emerald-500",
}: {
  label: string;
  count: number;
  percentage: number | null;
  denominator: number;
  barColor?: string;
}) {
  return (
    <li className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className="font-semibold text-slate-100">
          {count}
          {percentage !== null && (
            <span className="ml-1 font-normal text-slate-500">({percentage}%)</span>
          )}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${Math.max(percentage ?? 0, 0)}%` }}
          aria-hidden="true"
        />
      </div>
    </li>
  );
}

/** A list of MetricBar rows. */
export function MetricBarList({
  metrics,
  barColor,
  hideZero = false,
}: {
  metrics: Array<{ id: string; label: string; count: number; percentage: number | null; denominator: number }>;
  barColor?: string;
  hideZero?: boolean;
}) {
  const rows = hideZero ? metrics.filter((m) => m.count > 0) : metrics;
  if (rows.length === 0) {
    return <p className="text-xs text-slate-400">No data.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {rows.map((m) => (
        <MetricBar
          key={m.id}
          label={m.label}
          count={m.count}
          percentage={m.percentage}
          denominator={m.denominator}
          barColor={barColor}
        />
      ))}
    </ul>
  );
}
