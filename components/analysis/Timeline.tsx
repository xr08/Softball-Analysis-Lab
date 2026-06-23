import { AnalysisEvent } from "@/lib/analysis/types";
import { TimelineEventItem } from "./TimelineEventItem";

type TimelineProps = {
  events: AnalysisEvent[];
  onSeek: (timestampSeconds: number) => void;
  onUpdateEvent: (updatedEvent: AnalysisEvent) => void;
  onDeleteEvent: (id: string) => void;
};

export function Timeline({ events, onSeek, onUpdateEvent, onDeleteEvent }: TimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Timeline</h2>

      {events.length === 0 ? (
        <p className="text-sm text-slate-600">No events yet. Play video and click a tag.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              onSeek={onSeek}
              onUpdateEvent={onUpdateEvent}
              onDeleteEvent={onDeleteEvent}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
