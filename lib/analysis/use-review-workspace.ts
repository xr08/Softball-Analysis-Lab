"use client";

import { RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  clampPostRoll,
  clampPreRoll,
  emptyFilters,
  filterAndSortEvents,
  getNextEvent,
  getPrevEvent,
  getReviewSummary,
  hasActiveFilters,
  resolveSelectedAfterFilterChange,
  ReviewFilters
} from "./review";
import { TaggedEvent } from "./types";

const DEFAULT_PRE_ROLL = 2;
const DEFAULT_POST_ROLL = 3;

export type AppMode = "tagging" | "review" | "reports";

type UseReviewWorkspaceOptions = {
  sortedEvents: TaggedEvent[];
  videoRef: RefObject<HTMLVideoElement | null>;
};

function isFormElement(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  const tag = target.tagName.toLowerCase();
  return tag === "input" || tag === "select" || tag === "textarea" || (target as HTMLElement).isContentEditable;
}

export function useReviewWorkspace({ sortedEvents, videoRef }: UseReviewWorkspaceOptions) {
  const [mode, setMode] = useState<AppMode>("tagging");
  const [reviewFilters, setReviewFilters] = useState<ReviewFilters>(emptyFilters);
  const [selectedReviewEventId, setSelectedReviewEventId] = useState<string | null>(null);
  const [preRoll, setPreRoll] = useState(DEFAULT_PRE_ROLL);
  const [postRoll, setPostRoll] = useState(DEFAULT_POST_ROLL);
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState<number | null>(null);

  const clipControllerRef = useRef<{ cleanup: () => void } | null>(null);
  const playlistCancelRef = useRef<{ current: boolean }>({ current: false });

  const filteredReviewEvents = useMemo(
    () => filterAndSortEvents(sortedEvents, reviewFilters),
    [sortedEvents, reviewFilters]
  );

  const reviewSummary = useMemo(
    () => getReviewSummary(filteredReviewEvents),
    [filteredReviewEvents]
  );

  const cancelClipController = useCallback(() => {
    clipControllerRef.current?.cleanup();
    clipControllerRef.current = null;
  }, []);

  const playClipForEvent = useCallback(
    (event: TaggedEvent): Promise<void> =>
      new Promise((resolve) => {
        const video = videoRef.current;
        if (!video) {
          resolve();
          return;
        }

        cancelClipController();
        const duration = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : Infinity;
        const clipStart = clampPreRoll(event.timestampSeconds, preRoll);
        const clipEnd = clampPostRoll(event.timestampSeconds, postRoll, duration);
        let finished = false;

        function finish() {
          if (finished) return;
          finished = true;
          video?.pause();
          video?.removeEventListener("timeupdate", onTimeUpdate);
          window.clearTimeout(fallbackTimer);
          clipControllerRef.current = null;
          resolve();
        }

        function onTimeUpdate() {
          if (video && video.currentTime >= clipEnd) finish();
        }

        const fallbackMs = Math.max(0, (clipEnd - clipStart) * 1000) + 500;
        const fallbackTimer = window.setTimeout(finish, fallbackMs);

        clipControllerRef.current = {
          cleanup: () => {
            finished = true;
            video.removeEventListener("timeupdate", onTimeUpdate);
            window.clearTimeout(fallbackTimer);
          }
        };

        video.currentTime = clipStart;
        video.addEventListener("timeupdate", onTimeUpdate);
        video.play().catch(finish);
      }),
    [cancelClipController, postRoll, preRoll, videoRef]
  );

  const stopPlaylist = useCallback(() => {
    playlistCancelRef.current.current = true;
    cancelClipController();
    videoRef.current?.pause();
    setIsPlayingPlaylist(false);
    setPlaylistIndex(null);
  }, [cancelClipController, videoRef]);

  const handleSelectReviewEvent = useCallback(
    (event: TaggedEvent) => {
      setSelectedReviewEventId(event.id);
      if (videoRef.current) videoRef.current.currentTime = event.timestampSeconds;
    },
    [videoRef]
  );

  const handlePlayClip = useCallback(() => {
    const event = filteredReviewEvents.find((candidate) => candidate.id === selectedReviewEventId);
    if (event) void playClipForEvent(event);
  }, [filteredReviewEvents, playClipForEvent, selectedReviewEventId]);

  const handlePlayPlaylist = useCallback(() => {
    if (filteredReviewEvents.length === 0 || !videoRef.current) return;
    stopPlaylist();
    const cancelledRef = { current: false };
    playlistCancelRef.current = cancelledRef;
    setIsPlayingPlaylist(true);
    setPlaylistIndex(null);

    void (async () => {
      for (let index = 0; index < filteredReviewEvents.length; index += 1) {
        if (cancelledRef.current) break;
        setPlaylistIndex(index);
        setSelectedReviewEventId(filteredReviewEvents[index].id);
        await playClipForEvent(filteredReviewEvents[index]);
      }
      if (!cancelledRef.current) {
        setIsPlayingPlaylist(false);
        setPlaylistIndex(null);
      }
    })();
  }, [filteredReviewEvents, playClipForEvent, stopPlaylist, videoRef]);

  const handleFilterChange = useCallback(
    (updated: ReviewFilters) => {
      stopPlaylist();
      const nextEvents = filterAndSortEvents(sortedEvents, updated);
      setReviewFilters(updated);
      setSelectedReviewEventId((current) => resolveSelectedAfterFilterChange(nextEvents, current));
    },
    [sortedEvents, stopPlaylist]
  );

  const switchMode = useCallback(
    (nextMode: AppMode) => {
      stopPlaylist();
      if (nextMode === "review") {
        setSelectedReviewEventId(resolveSelectedAfterFilterChange(filteredReviewEvents, null));
      }
      setMode(nextMode);
    },
    [filteredReviewEvents, stopPlaylist]
  );

  const resetReviewState = useCallback(() => {
    stopPlaylist();
    setSelectedReviewEventId(null);
    setReviewFilters(emptyFilters());
  }, [stopPlaylist]);

  const handleReviewPrev = useCallback(() => {
    const previous = getPrevEvent(filteredReviewEvents, selectedReviewEventId);
    if (previous) handleSelectReviewEvent(previous);
  }, [filteredReviewEvents, handleSelectReviewEvent, selectedReviewEventId]);

  const handleReviewNext = useCallback(() => {
    const next = getNextEvent(filteredReviewEvents, selectedReviewEventId);
    if (next) handleSelectReviewEvent(next);
  }, [filteredReviewEvents, handleSelectReviewEvent, selectedReviewEventId]);

  useEffect(() => {
    setSelectedReviewEventId((current) =>
      mode === "review" ? resolveSelectedAfterFilterChange(filteredReviewEvents, current) : current
    );
  }, [filteredReviewEvents, mode]);

  useEffect(() => {
    if (mode !== "review") return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.ctrlKey || event.altKey || event.metaKey || isFormElement(document.activeElement) || !videoRef.current) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handleReviewPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleReviewNext();
      } else if (event.key === " ") {
        event.preventDefault();
        if (videoRef.current.paused) void videoRef.current.play();
        else videoRef.current.pause();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleReviewNext, handleReviewPrev, mode, videoRef]);

  useEffect(() => () => {
    cancelClipController();
    playlistCancelRef.current.current = true;
  }, [cancelClipController]);

  return {
    mode,
    reviewFilters,
    filteredReviewEvents,
    reviewSummary,
    selectedReviewEventId,
    preRoll,
    postRoll,
    isPlayingPlaylist,
    playlistIndex,
    hasActiveReviewFilters: hasActiveFilters(reviewFilters),
    setPreRoll,
    setPostRoll,
    switchMode,
    stopPlaylist,
    resetReviewState,
    handleFilterChange,
    handleSelectReviewEvent,
    handleReviewPrev,
    handleReviewNext,
    handlePlayClip,
    handlePlayPlaylist
  };
}
