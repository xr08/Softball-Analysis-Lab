import { useMemo } from "react";
import { AtBat, Player, TaggedEvent } from "@/lib/analysis/types";
import { groupEventsByAtBat, formatPitchRowLabel, formatUngroupedLabel } from "@/lib/analysis/timeline-grouping";
import { TimelineAtBatHeader } from "./TimelineAtBatHeader";
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

  const grouped = useMemo(
    () => groupEventsByAtBat(events, atBats, players),
    [events, atBats, players]
  );

  const showFilterBadge =
    filteredCount !== undefined &&
    totalCount !== undefined &&
    filteredCount !== totalCount;

  const hasContent = grouped.atBatGroups.some((g) => g.events.length > 0) || grouped.ungroupedEvents.length > 0;

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

      {!hasContent ? (
        <p className="rounded-md border border-dashed border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-500">
          {filteredCount === 0
            ? "No events match the current filters."
            : "No events yet. Work the video, use the Pitch Window, then add observations when needed."}
        </p>
      ) : (
        <div className="space-y-4">
          {/* At-bat groups */}
          {grouped.atBatGroups.map((group) => {
            // Skip at-bat groups that have no events in filtered mode
            if (group.events.length === 0 && filteredCount !== undefined && filteredCount !== totalCount) {
              return null;
            }

            return (
              <div key={group.atBat.id} className="rounded-md border border-slate-700/60 bg-slate-950/30">
                <TimelineAtBatHeader group={group} onSeek={onSeek} />

                {group.events.length > 0 ? (
                  <ul className="space-y-2 px-3 pb-3 pt-2">
                    {group.events.map((event, eventIdx) => (
                      <TimelineEventItem
                        key={event.id}
                        event={event}
                        player={event.playerId ? playerById.get(event.playerId) : undefined}
                        relatedPlayer={event.relatedPlayerId ? playerById.get(event.relatedPlayerId) : undefined}
                        atBat={event.atBatId ? atBatById.get(event.atBatId) : undefined}
                        pitchLabel={formatPitchRowLabel(event, eventIdx + 1)}
                        onSeek={onSeek}
                        onUpdateEvent={onUpdateEvent}
                        onDeleteEvent={onDeleteEvent}
                        isSelected={event.id === selectedReviewEventId}
                      />
                    ))}
                  </ul>
                ) : (
                  <p className="px-3 pb-2 pt-1 text-xs text-slate-600">No pitches tagged in this at-bat yet.</p>
                )}
              </div>
            );
          })}

          {/* Ungrouped events */}
          {grouped.ungroupedEvents.length > 0 && (
            <div className="rounded-md border border-slate-700/60 bg-slate-950/30">
              <div className="border-b border-slate-700/40 px-3 py-2">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-400/80">
                  Ungrouped Events
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {grouped.ungroupedEvents.length} event{grouped.ungroupedEvents.length === 1 ? "" : "s"} not linked to an at-bat
                </p>
              </div>
              <ul className="space-y-2 px-3 pb-3 pt-2">
                {grouped.ungroupedEvents.map((event) => (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    player={event.playerId ? playerById.get(event.playerId) : undefined}
                    relatedPlayer={event.relatedPlayerId ? playerById.get(event.relatedPlayerId) : undefined}
                    atBat={event.atBatId ? atBatById.get(event.atBatId) : undefined}
                    pitchLabel={formatUngroupedLabel(event)}
                    onSeek={onSeek}
                    onUpdateEvent={onUpdateEvent}
                    onDeleteEvent={onDeleteEvent}
                    isSelected={event.id === selectedReviewEventId}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
