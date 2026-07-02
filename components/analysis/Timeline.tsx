import { AtBat, Player, TaggedEvent } from "@/lib/analysis/types";
import { TimelineEventItem } from "./TimelineEventItem";

type TimelineProps = {
  events: TaggedEvent[];
  players: Player[];
  atBats: AtBat[];
  onSeek: (timestampSeconds: number) => void;
  onUpdateEvent: (updatedEvent: TaggedEvent) => void;
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
  players,
  atBats,
  onSeek,
  onUpdateEvent,
  onDeleteEvent,
  selectedReviewEventId = null,
  totalCount,
  filteredCount
}: TimelineProps) {
  const playerById = new Map(players.map((player) => [player.id, player]));
  const atBatById = new Map(atBats.map((atBat) => [atBat.id, atBat]));
  const showFilterBadge =
    filteredCount !== undefined &&
    totalCount !== undefined &&
    filteredCount !== totalCount;

  return (
    <section className="rounded-lg border border-slate-700 bg-[#101720] p-4 shadow-xl shadow-black/20">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Review Queue</p>
          <h2 className="mt-1 text-lg font-black text-white">Timeline</h2>
        </div>
        {showFilterBadge && (
          <span className="text-sm text-slate-400">
            <span className="font-black text-sky-200">{filteredCount}</span> matching from{" "}
            <span className="font-black text-slate-100">{totalCount}</span> total
          </span>
        )}
        {!showFilterBadge && totalCount !== undefined && (
          <span className="text-sm text-slate-500">{totalCount} event{totalCount === 1 ? "" : "s"}</span>
        )}
      </div>

      {events.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-500">
          {filteredCount === 0
            ? "No events match the current filters."
            : "No events yet. Work the video, use the Pitch Window, then add observations when needed."}
        </p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <TimelineEventItem
              key={event.id}
              event={event}
              player={event.playerId ? playerById.get(event.playerId) : undefined}
              relatedPlayer={event.relatedPlayerId ? playerById.get(event.relatedPlayerId) : undefined}
              atBat={event.atBatId ? atBatById.get(event.atBatId) : undefined}
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

