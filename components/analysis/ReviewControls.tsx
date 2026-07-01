"use client";

import { TaggedEvent } from "@/lib/analysis/types";

type ReviewControlsProps = {
  filteredEvents: TaggedEvent[];
  selectedEventId: string | null;
  hasVideo: boolean;
  preRoll: number;
  postRoll: number;
  isPlayingPlaylist: boolean;
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
  onPrev,
  onNext,
  onPlayClip,
  onPlayPlaylist,
  onStopPlaylist,
  onPreRollChange,
  onPostRollChange
}: ReviewControlsProps) {
  const selectedIndex = selectedEventId
    ? filteredEvents.findIndex((event) => event.id === selectedEventId)
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
        : `${filteredEvents.length} matching event${filteredEvents.length === 1 ? "" : "s"} - select one to begin`;

  return (
    <section className="rounded-lg border border-slate-700 bg-[#101720] p-4">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-400">Playback Review</p>
      <h2 className="mt-1 text-lg font-black text-white">Review Controls</h2>

      <p className="mt-3 text-sm font-semibold text-slate-300" role="status" aria-live="polite">
        {positionLabel}
      </p>

      {hasVideo ? (
        <p className="mt-2 text-xs text-slate-500">
          Keyboard: Left previous, Right next, Space play/pause.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev || !hasVideo || isPlayingPlaylist}
          aria-label="Previous matching event"
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext || !hasVideo || isPlayingPlaylist}
          aria-label="Next matching event"
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-bold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
          Pre-roll seconds
          <input
            id="review-preroll"
            type="number"
            min={0}
            max={10}
            step={0.5}
            value={preRoll}
            onChange={(event) => onPreRollChange(Math.max(0, Math.min(10, Number(event.target.value))))}
            className="w-24 rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 text-sm font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
          Post-roll seconds
          <input
            id="review-postroll"
            type="number"
            min={1}
            max={15}
            step={0.5}
            value={postRoll}
            onChange={(event) => onPostRollChange(Math.max(1, Math.min(15, Number(event.target.value))))}
            className="w-24 rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 text-sm font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!isPlayingPlaylist ? (
          <>
            <button
              type="button"
              onClick={onPlayClip}
              disabled={!hasSelected || !hasVideo}
              aria-label="Play review clip for selected event"
              className="rounded-md bg-orange-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Play Clip
            </button>
            <button
              type="button"
              onClick={onPlayPlaylist}
              disabled={!hasEvents || !hasVideo}
              aria-label="Play all matching events"
              className="rounded-md border border-sky-500/50 bg-sky-500/10 px-4 py-2 text-sm font-black uppercase tracking-wide text-sky-200 hover:bg-sky-500/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Play All Matching
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-300" aria-live="polite">
              {playlistIndex !== null
                ? `Playing ${playlistIndex + 1} of ${filteredEvents.length}`
                : "Starting playback..."}
            </span>
            <button
              type="button"
              onClick={onStopPlaylist}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-black uppercase tracking-wide text-white hover:bg-red-500"
            >
              Stop Review
            </button>
          </div>
        )}
      </div>

      {!hasVideo ? (
        <p className="mt-3 text-xs text-amber-300">
          Connect a video file to enable review playback controls.
        </p>
      ) : null}

      {hasVideo && filteredEvents.length === 0 ? (
        <p className="mt-3 text-sm text-slate-500">No events match the current filters.</p>
      ) : null}
    </section>
  );
}
