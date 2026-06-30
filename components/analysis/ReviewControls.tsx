"use client";

import { TaggedEvent } from "@/lib/analysis/types";

type ReviewControlsProps = {
  /** All events that match the current filters */
  filteredEvents: TaggedEvent[];
  /** Currently selected review event ID, or null */
  selectedEventId: string | null;
  /** Whether a video is connected */
  hasVideo: boolean;
  /** Pre-roll in seconds (0–10) */
  preRoll: number;
  /** Post-roll in seconds (1–15) */
  postRoll: number;
  /** Whether the playlist is currently running */
  isPlayingPlaylist: boolean;
  /** 0-based index of the event currently being played in the playlist */
  playlistIndex: number | null;
  onSelectEvent: (event: TaggedEvent) => void;
  onPrev: () => void;
  onNext: () => void;
  onPlayClip: () => void;
  onPlayPlaylist: () => void;
  onStopPlaylist: () => void;
  onPreRollChange: (value: number) => void;
  onPostRollChange: (value: number) => void;
};

export function ReviewControls({
  filteredEvents,
  selectedEventId,
  hasVideo,
  preRoll,
  postRoll,
  isPlayingPlaylist,
  playlistIndex,
  onSelectEvent,
  onPrev,
  onNext,
  onPlayClip,
  onPlayPlaylist,
  onStopPlaylist,
  onPreRollChange,
  onPostRollChange
}: ReviewControlsProps) {
  const selectedIndex = selectedEventId
    ? filteredEvents.findIndex((e) => e.id === selectedEventId)
    : -1;

  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex >= 0 && selectedIndex < filteredEvents.length - 1;
  const hasSelected = selectedIndex >= 0;
  const hasEvents = filteredEvents.length > 0;

  const positionLabel =
    hasSelected
      ? `${selectedIndex + 1} of ${filteredEvents.length} matching event${filteredEvents.length === 1 ? "" : "s"}`
      : filteredEvents.length === 0
      ? "No matching events"
      : `${filteredEvents.length} matching event${filteredEvents.length === 1 ? "" : "s"} — select one to begin`;

  return (
    <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Review Controls</h2>

      {/* Position indicator */}
      <p className="mb-3 text-sm font-medium text-slate-700" role="status" aria-live="polite">
        {positionLabel}
      </p>

      {/* Keyboard shortcut hint */}
      {hasVideo && (
        <p className="mb-3 text-xs text-slate-500">
          Keyboard shortcuts (Review mode only): <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-xs">←</kbd> Previous &nbsp;
          <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-xs">→</kbd> Next &nbsp;
          <kbd className="rounded border border-slate-300 bg-white px-1 py-0.5 text-xs">Space</kbd> Play/Pause
        </p>
      )}

      {/* Navigation buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev || !hasVideo || isPlayingPlaylist}
          aria-label="Previous matching event"
          className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || !hasVideo || isPlayingPlaylist}
          aria-label="Next matching event"
          className="flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {/* Pre/Post-roll settings */}
      <div className="mb-4 flex flex-wrap gap-4">
        <label className="flex flex-col gap-0.5 text-xs text-slate-700">
          Pre-roll (seconds, 0–10)
          <input
            id="review-preroll"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={preRoll}
            onChange={(e) => onPreRollChange(Math.max(0, Math.min(10, Number(e.target.value))))}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-slate-700">
          Post-roll (seconds, 1–15)
          <input
            id="review-postroll"
            type="number"
            min={1}
            max={15}
            step={0.5}
            value={postRoll}
            onChange={(e) => onPostRollChange(Math.max(1, Math.min(15, Number(e.target.value))))}
            className="w-20 rounded border border-slate-300 px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </label>
      </div>

      {/* Playback buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {!isPlayingPlaylist ? (
          <>
            <button
              type="button"
              onClick={onPlayClip}
              disabled={!hasSelected || !hasVideo}
              aria-label="Play review clip for selected event"
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ▶ Play clip
            </button>
            <button
              type="button"
              onClick={onPlayPlaylist}
              disabled={!hasEvents || !hasVideo}
              aria-label="Play all matching events"
              className="rounded-md border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ▶▶ Play all matching
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-700" aria-live="polite">
              {playlistIndex !== null
                ? `Playing ${playlistIndex + 1} of ${filteredEvents.length}`
                : "Starting playback…"}
            </span>
            <button
              type="button"
              onClick={onStopPlaylist}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              ■ Stop review
            </button>
          </div>
        )}
      </div>

      {/* No video warning */}
      {!hasVideo && (
        <p className="mt-3 text-xs text-amber-700">
          Connect a video file to enable review playback controls.
        </p>
      )}

      {/* Empty state */}
      {hasVideo && filteredEvents.length === 0 && (
        <p className="mt-3 text-sm text-slate-500">No events match the current filters.</p>
      )}
    </section>
  );
}
