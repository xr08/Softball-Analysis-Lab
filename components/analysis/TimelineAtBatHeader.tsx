import { AtBatGroup, formatAtBatHeaderLabel } from "@/lib/analysis/timeline-grouping";

type TimelineAtBatHeaderProps = {
  group: AtBatGroup;
  onSeek: (timestampSeconds: number) => void;
};

export function TimelineAtBatHeader({ group, onSeek }: TimelineAtBatHeaderProps) {
  const label = formatAtBatHeaderLabel(group);

  return (
    <button
      type="button"
      onClick={() => onSeek(group.atBat.startTimestampSeconds)}
      className="flex w-full items-center gap-2 rounded-md border-l-4 px-3 py-2 text-left transition-colors hover:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-orange-400"
      style={{
        borderLeftColor: group.status === "active" ? "#22c55e" : "#64748b",
        backgroundColor: group.status === "active" ? "rgba(34, 197, 94, 0.06)" : "rgba(100, 116, 139, 0.06)",
      }}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-black text-slate-100">
          {label}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={group.status} />
          <span className="text-[11px] text-slate-500">
            {group.events.length} pitch{group.events.length === 1 ? "" : "es"}
          </span>
        </div>
      </div>
      <span className="shrink-0 text-xs font-bold text-orange-400/80">
        ▶ {group.timeRangeLabel.split("–")[0]}
      </span>
    </button>
  );
}

function StatusBadge({ status }: { status: "active" | "ended" }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-300">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        Active
      </span>
    );
  }

  return (
    <span className="rounded-full border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-slate-400">
      Ended
    </span>
  );
}
