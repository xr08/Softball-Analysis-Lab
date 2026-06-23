import { AnalysisEvent } from "@/lib/analysis/types";
import { TimelineEventItem } from "./TimelineEventItem";

type TimelineProps = {
  events: AnalysisEvent[];
  onSeek: (timestampSeconds: number) => void;
  onUpdateEvent: (updatedEvent: AnalysisEvent) => void;
  onDeleteEvent: (id: string) => void;
  /** ID of the event currently selected in Review mode, or null */
  selectedReviewEventId?: string | null;
  /** Total number of unfiltered session events */
  totalCount?: number;
  /** Number of events matching current review filters (only shown if different from totalCount) */
  filteredCount?: number;
};

export function Timeline({
  events,
  onSeek,
  onUpdateEvent,
  onDeleteEvent,
  selectedReviewEventId = null,
  totalCount,
  filteredCount
}: TimelineProps) {
  const showFilterBadge =
    filteredCount !== undefined &&
    totalCount !== undefined &&
    filteredCount !== totalCount;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Timeline</h2>
        {showFilterBadge && (
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-emerald-700">{filteredCount}</span> matching from{" "}
            <span className="font-semibold">{totalCount}</span> total
          </span>
        )}
        {!showFilterBadge && totalCount !== undefined && (
          <span className="text-sm text-slate-500">{totalCount} event{totalCount === 1 ? "" : "s"}</span>
        )}
      </div>

      {events.length === 0 ? (
        <p className="text-sm text-slate-600">
          {filteredCount === 0
            ? "No events match the current filters."
            : "No events yet. Play video and click a tag."}
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              onSeek={onSeek}
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
              isSelected={event.id === selectedReviewEventId}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

