"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ExportButtons } from "@/components/analysis/ExportButtons";
import { PitchWindow } from "@/components/analysis/PitchWindow";
import { ReviewControls } from "@/components/analysis/ReviewControls";
import { ReviewFilters } from "@/components/analysis/ReviewFilters";
import { ReviewSummary } from "@/components/analysis/ReviewSummary";
import { ReportsPanel } from "@/components/analysis/ReportsPanel";
import { SessionDetails } from "@/components/analysis/SessionDetails";
import { TagPanel } from "@/components/analysis/TagPanel";
import { Timeline } from "@/components/analysis/Timeline";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { toCsv, toJson, parseImportedSession, buildImportRestoreMessage } from "@/lib/analysis/export";
import { WorkflowTagDefinition } from "@/lib/analysis/tags";
import { formatTimestampLabel } from "@/lib/analysis/time";
import { compareVideoFileNames } from "@/lib/analysis/video";
import {
  buildNextAtBatState,
  buildNextPitchSelection,
  getPlayerName,
  teamSideLabel,
  UNKNOWN_BATTER_LABEL,
  resolveTagAssignment
} from "@/lib/analysis/workflow";
import {
  ReviewFilters as ReviewFiltersType,
  emptyFilters,
  filterAndSortEvents,
  getNextEvent,
  getPrevEvent,
  resolveSelectedAfterFilterChange,
  clampPreRoll,
  clampPostRoll,
  getReviewSummary,
  hasActiveFilters
} from "@/lib/analysis/review";
import { TaggedEvent, ExportedSession, Session, Player, AtBat, TeamSide, VideoSource } from "@/lib/analysis/types";
import {
  createDefaultSession,
  createTaggedEvent,
  createPlayer,
  createAtBat,
  upsertLocalVideoSource,
  updateVideoSourceDuration
} from "@/lib/analysis/session";
import { createEmptyPitchWindowState } from "@/lib/analysis/pitch-window";
import { PlayersList } from "@/components/analysis/PlayersList";
import { AtBatControls } from "@/components/analysis/AtBatControls";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RECOVERY_KEY = "softball-analysis-lab:recovery:v1";
const DEFAULT_PRE_ROLL = 2;
const DEFAULT_POST_ROLL = 3;

type AppMode = "tagging" | "review" | "reports";

// ---------------------------------------------------------------------------
// File utilities
// ---------------------------------------------------------------------------

function downloadFile(content: string, fileName: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

async function saveFile(
  content: string,
  fileName: string,
  type: string,
  extension: ".csv" | ".json"
): Promise<void> {
  const windowWithPicker = window as Window & {
    showSaveFilePicker?: (options: {
      suggestedName: string;
      types: Array<{
        description: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<{
      createWritable: () => Promise<{
        write: (data: string) => Promise<void>;
        close: () => Promise<void>;
      }>;
    }>;
  };

  if (windowWithPicker.showSaveFilePicker) {
    try {
      const fileHandle = await windowWithPicker.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: extension === ".csv" ? "CSV file" : "JSON file",
            accept: { [type]: [extension] }
          }
        ]
      });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    } catch (error) {
      const maybeError = error as { name?: string };
      if (maybeError.name === "AbortError") {
        return;
      }
    }
  }

  downloadFile(content, fileName, type);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AnalysePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---------------------------------------------------------------------------
  // Session state
  // ---------------------------------------------------------------------------

  const [session, setSession] = useState<Session>(createDefaultSession());

  const [events, setEvents] = useState<TaggedEvent[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [atBats, setAtBats] = useState<AtBat[]>([]);
  const [videoSources, setVideoSources] = useState<VideoSource[]>([]);
  const [currentPitcherId, setCurrentPitcherId] = useState<string | null>(null);
  const [currentBatterId, setCurrentBatterId] = useState<string | null>(null);
  const [selectedFielderId, setSelectedFielderId] = useState<string | null>(null);
  const [activeAtBatId, setActiveAtBatId] = useState<string | null>(null);
  const [countBalls, setCountBalls] = useState<number | null>(null);
  const [countStrikes, setCountStrikes] = useState<number | null>(null);

  const [currentPitchResult, setCurrentPitchResult] = useState<TaggedEvent["pitchResult"]>(null);
  const [currentPitchLocation, setCurrentPitchLocation] = useState<TaggedEvent["pitchLocation"]>(null);
  const [currentPitchLocationLabel, setCurrentPitchLocationLabel] = useState<string | null>(null);
  const [currentContactType, setCurrentContactType] = useState<TaggedEvent["contactType"]>(null);
  const [currentContactQuality, setCurrentContactQuality] = useState<TaggedEvent["contactQuality"]>(null);
  const [currentPlayResult, setCurrentPlayResult] = useState<TaggedEvent["playResult"]>(null);
  
  const [currentPitchType, setCurrentPitchType] = useState<TaggedEvent["pitchType"]>(null);
  
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [importRestoreMessage, setImportRestoreMessage] = useState("");
  const [videoMessage, setVideoMessage] = useState("");
  const [tagMessage, setTagMessage] = useState("");

  const [isDirty, setIsDirty] = useState(false);
  const [hasRecoveryData, setHasRecoveryData] = useState(false);
  const [recoverySnapshot, setRecoverySnapshot] = useState<any>(null);

  // ---------------------------------------------------------------------------
  // Review mode state
  // ---------------------------------------------------------------------------

  const [mode, setMode] = useState<AppMode>("tagging");
  const [reviewFilters, setReviewFilters] = useState<ReviewFiltersType>(emptyFilters());
  const [selectedReviewEventId, setSelectedReviewEventId] = useState<string | null>(null);
  const [preRoll, setPreRoll] = useState(DEFAULT_PRE_ROLL);
  const [postRoll, setPostRoll] = useState(DEFAULT_POST_ROLL);

  // Comparison session (in-memory only — not persisted, not written to recovery)
  const [comparisonSession, setComparisonSession] = useState<ExportedSession | null>(null);

  // Playlist playback state
  const [isPlayingPlaylist, setIsPlayingPlaylist] = useState(false);
  const [playlistIndex, setPlaylistIndex] = useState<number | null>(null);

  /**
   * Active clip controller — stored in a ref so cleanup is always current.
   *
   * Design (per spec corrections):
   * - We use the video element's `timeupdate` event as the source of truth for
   *   clip boundaries. A fallback timer handles cases where timeupdate fires
   *   infrequently (e.g., buffering).
   * - Only one controller can be active at any time. Starting a new clip or
   *   playlist always cancels the previous one first.
   */
  const clipControllerRef = useRef<{
    cleanup: () => void;
  } | null>(null);

  // ---------------------------------------------------------------------------
  // Derived data
  // ---------------------------------------------------------------------------

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (a, b) => a.timestampSeconds - b.timestampSeconds
      ),
    [events]
  );

  const filteredReviewEvents = useMemo(
    () => filterAndSortEvents(sortedEvents, reviewFilters),
    [sortedEvents, reviewFilters]
  );

  const reviewSummary = useMemo(
    () => getReviewSummary(filteredReviewEvents),
    [filteredReviewEvents]
  );

  const sessionLabel = session.name.trim() || "session";
  const csvFileName = `${sessionLabel}-events.csv`;
  const jsonFileName = `${sessionLabel}-events.json`;
  const csvContent = useMemo(() => `\uFEFF${toCsv(session, players, atBats, sortedEvents)}`, [session, players, atBats, sortedEvents]);
  const jsonContent = useMemo(() => toJson(session, players, videoSources, atBats, sortedEvents), [session, players, videoSources, atBats, sortedEvents]);
  const currentVideoSource = useMemo(
    () => videoSources.find((source) => source.sourceType === "local_file" && source.type === "main") ?? null,
    [videoSources]
  );
  const activeAtBat = useMemo(
    () => atBats.find((atBat) => atBat.id === activeAtBatId) ?? null,
    [atBats, activeAtBatId]
  );
  const currentAtBatEventCount = useMemo(
    () => events.filter((event) => event.atBatId === activeAtBatId).length,
    [events, activeAtBatId]
  );

  // ---------------------------------------------------------------------------
  // Recovery
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const rawData = localStorage.getItem(RECOVERY_KEY);
    if (rawData) {
      try {
        const parsed = JSON.parse(rawData);
        if (parsed.session && parsed.events) {
          setRecoverySnapshot(parsed);
          setHasRecoveryData(true);
        }
      } catch (e) {
        console.error("Failed to parse recovery data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!isDirty || hasRecoveryData) return;
    const timer = setTimeout(() => {
      const recoveryData = {
        session,
        events,
        players,
        videoSources,
        atBats,
        currentPitcherId,
        currentBatterId,
        activeAtBatId
      };
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));
    }, 750);
    return () => clearTimeout(timer);
  }, [session, events, players, videoSources, atBats, currentPitcherId, currentBatterId, activeAtBatId, isDirty, hasRecoveryData]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!videoUrl || !video || !currentVideoSource) return;
    const videoSourceId = currentVideoSource.id;

    function syncDuration() {
      if (Number.isFinite(video!.duration) && video!.duration > 0) {
        setVideoSources((previous) => {
          const next = updateVideoSourceDuration(previous, videoSourceId, video!.duration);
          if (next !== previous) {
            setIsDirty(true);
          }
          return next;
        });
      }
    }

    if (Number.isFinite(video.duration) && video.duration > 0) {
      syncDuration();
      return;
    }

    video.addEventListener("loadedmetadata", syncDuration);
    return () => video.removeEventListener("loadedmetadata", syncDuration);
  }, [videoUrl, currentVideoSource]);

  // ---------------------------------------------------------------------------
  // Clip playback controller (timeupdate-based)
  // ---------------------------------------------------------------------------

  /** Cancel any active clip/playlist listener and timer. */
  const cancelClipController = useCallback(() => {
    if (clipControllerRef.current) {
      clipControllerRef.current.cleanup();
      clipControllerRef.current = null;
    }
  }, []);

  /**
   * Plays a single review clip for the given event.
   *
   * Boundary enforcement strategy:
   * 1. Seeks to clamped pre-roll start.
   * 2. Begins playback.
   * 3. Attaches a `timeupdate` listener that pauses when currentTime >= clipEnd.
   * 4. A fallback timer (slightly beyond clipEnd) pauses if timeupdate is delayed.
   *
   * Returns a Promise that resolves when the clip is finished (stopped or ended).
   */
  const playClipForEvent = useCallback(
    (event: TaggedEvent): Promise<void> => {
      return new Promise((resolve) => {
        const video = videoRef.current;
        if (!video) {
          resolve();
          return;
        }

        cancelClipController();

        const duration = isFinite(video.duration) && video.duration > 0 ? video.duration : Infinity;
        const clipStart = clampPreRoll(event.timestampSeconds, preRoll);
        const clipEnd = clampPostRoll(event.timestampSeconds, postRoll, duration);

        let finished = false;

        function finish() {
          if (finished) return;
          finished = true;
          video!.pause();
          video!.removeEventListener("timeupdate", onTimeUpdate);
          clearTimeout(fallbackTimer);
          clipControllerRef.current = null;
          resolve();
        }

        function onTimeUpdate() {
          if (video!.currentTime >= clipEnd) {
            finish();
          }
        }

        // Fallback timer — fires slightly after the clip should have ended.
        // This handles cases where timeupdate fires infrequently during buffering.
        const fallbackMs = Math.max(0, (clipEnd - clipStart) * 1000) + 500;
        const fallbackTimer = window.setTimeout(() => {
          // Only fire if we're still near the end (timeupdate might have handled it)
          if (!finished) finish();
        }, fallbackMs);

        clipControllerRef.current = {
          cleanup: () => {
            finished = true;
            video!.removeEventListener("timeupdate", onTimeUpdate);
            clearTimeout(fallbackTimer);
          }
        };

        video.currentTime = clipStart;
        video.addEventListener("timeupdate", onTimeUpdate);
        video.play().catch(() => {
          // User gesture or autoplay policy may prevent play — resolve gracefully
          finish();
        });
      });
    },
    [preRoll, postRoll, cancelClipController]
  );

  // ---------------------------------------------------------------------------
  // Review playback — single clip
  // ---------------------------------------------------------------------------

  function handlePlayClip(): void {
    const event = filteredReviewEvents.find((e) => e.id === selectedReviewEventId);
    if (!event) return;
    void playClipForEvent(event);
  }

  // ---------------------------------------------------------------------------
  // Review playback — playlist state machine
  // ---------------------------------------------------------------------------

  /**
   * Runs through all filtered events in order.
   *
   * Design:
   * - Uses an async loop with await so each clip completes before advancing.
   * - A shared `cancelled` ref allows any external stop to short-circuit the loop.
   */
  async function runPlaylist(
    events: TaggedEvent[],
    cancelledRef: { current: boolean }
  ): Promise<void> {
    for (let i = 0; i < events.length; i++) {
      if (cancelledRef.current) break;
      setPlaylistIndex(i);
      setSelectedReviewEventId(events[i].id);
      await playClipForEvent(events[i]);
      if (cancelledRef.current) break;
    }
    if (!cancelledRef.current) {
      // Finished all events naturally
      setIsPlayingPlaylist(false);
      setPlaylistIndex(null);
    }
  }

  const playlistCancelRef = useRef<{ current: boolean }>({ current: false });

  function handlePlayPlaylist(): void {
    if (filteredReviewEvents.length === 0 || !videoRef.current) return;
    stopPlaylist();

    const cancelledRef = { current: false };
    playlistCancelRef.current = cancelledRef;
    setIsPlayingPlaylist(true);
    setPlaylistIndex(null);
    void runPlaylist(filteredReviewEvents, cancelledRef);
  }

  function stopPlaylist(): void {
    playlistCancelRef.current.current = true;
    cancelClipController();
    videoRef.current?.pause();
    setIsPlayingPlaylist(false);
    setPlaylistIndex(null);
  }

  // Stop playlist when filters change, mode changes, or video is replaced
  useEffect(() => {
    if (isPlayingPlaylist) {
      stopPlaylist();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewFilters, mode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelClipController();
      playlistCancelRef.current.current = true;
    };
  }, [cancelClipController]);

  // ---------------------------------------------------------------------------
  // Review filter change — resolve selected event
  // ---------------------------------------------------------------------------

  function handleFilterChange(updated: ReviewFiltersType): void {
    stopPlaylist();
    const newFiltered = filterAndSortEvents(sortedEvents, updated);
    const newSelectedId = resolveSelectedAfterFilterChange(newFiltered, selectedReviewEventId);
    setReviewFilters(updated);
    setSelectedReviewEventId(newSelectedId);
  }

  // When events change (edit/delete), re-resolve selected in case it was removed
  useEffect(() => {
    if (mode === "review") {
      const newSelectedId = resolveSelectedAfterFilterChange(filteredReviewEvents, selectedReviewEventId);
      if (newSelectedId !== selectedReviewEventId) {
        setSelectedReviewEventId(newSelectedId);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events, reviewFilters]);

  // ---------------------------------------------------------------------------
  // Mode toggle
  // ---------------------------------------------------------------------------

  function switchMode(newMode: AppMode): void {
    if (newMode === mode) return;
    // Always stop playlist when switching modes
    stopPlaylist();
    if (newMode === "review") {
      // Clear stale selection on entering review
      const newSelectedId = resolveSelectedAfterFilterChange(filteredReviewEvents, null);
      setSelectedReviewEventId(newSelectedId);
    }
    setMode(newMode);
  }

  // ---------------------------------------------------------------------------
  // Keyboard shortcuts (review mode only, not in form elements)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (mode !== "review") return;

    function isFormElement(target: EventTarget | null): boolean {
      if (!target || !(target instanceof Element)) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "select" ||
        tag === "textarea" ||
        (target as HTMLElement).isContentEditable
      );
    }

    function handleKeyDown(e: KeyboardEvent): void {
      // Ignore if modifier keys are pressed
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      // Ignore if focus is in a form element
      if (isFormElement(document.activeElement)) return;
      // Ignore if no video connected
      if (!videoRef.current) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const prev = getPrevEvent(filteredReviewEvents, selectedReviewEventId);
        if (prev) handleSelectReviewEvent(prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = getNextEvent(filteredReviewEvents, selectedReviewEventId);
        if (next) handleSelectReviewEvent(next);
      } else if (e.key === " ") {
        e.preventDefault();
        const video = videoRef.current;
        if (video.paused) {
          void video.play();
        } else {
          video.pause();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, filteredReviewEvents, selectedReviewEventId]);

  // ---------------------------------------------------------------------------
  // Review navigation
  // ---------------------------------------------------------------------------

  function handleSelectReviewEvent(event: TaggedEvent): void {
    setSelectedReviewEventId(event.id);
    if (videoRef.current) {
      videoRef.current.currentTime = event.timestampSeconds;
    }
  }

  function handleReviewPrev(): void {
    const prev = getPrevEvent(filteredReviewEvents, selectedReviewEventId);
    if (prev) handleSelectReviewEvent(prev);
  }

  function handleReviewNext(): void {
    const next = getNextEvent(filteredReviewEvents, selectedReviewEventId);
    if (next) handleSelectReviewEvent(next);
  }

  // ---------------------------------------------------------------------------
  // Session helpers
  // ---------------------------------------------------------------------------

  function updateSession(updates: Partial<Session>) {
    setSession((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setIsDirty(true);
  }

  function resetPitchContext() {
    const emptyState = createEmptyPitchWindowState();
    setCountBalls(emptyState.countBalls);
    setCountStrikes(emptyState.countStrikes);
    setCurrentPitchResult(emptyState.pitchResult);
    setCurrentPitchLocation(emptyState.pitchLocation);
    setCurrentPitchLocationLabel(null);
    setCurrentContactType(emptyState.contactType);
    setCurrentContactQuality(emptyState.contactQuality);
    setCurrentPlayResult(emptyState.playResult);
    setCurrentPitchType(emptyState.pitchType);
  }

  function handleAddPlayer(name: string, teamSide: TeamSide) {
    const player = createPlayer(session.id, name, teamSide);
    setPlayers((prev) => [...prev, player]);
    setIsDirty(true);
  }

  function handleRemovePlayer(playerId: string) {
    const inUse = events.some((e) => e.playerId === playerId || e.relatedPlayerId === playerId) ||
                  atBats.some((ab) => ab.pitcherId === playerId || ab.batterId === playerId) ||
                  currentPitcherId === playerId ||
                  currentBatterId === playerId ||
                  selectedFielderId === playerId;
    if (inUse) {
      alert("Cannot remove player because they are currently associated with an at-bat or tagged event.");
      return;
    }
    setPlayers((prev) => prev.filter((p) => p.id !== playerId));
    setIsDirty(true);
  }

  function syncEmptyActiveAtBat(updates: Partial<AtBat>) {
    if (!activeAtBatId || currentAtBatEventCount > 0) return;
    setAtBats((prev) =>
      prev.map((atBat) =>
        atBat.id === activeAtBatId ? { ...atBat, ...updates } : atBat
      )
    );
  }

  function handlePitcherChange(playerId: string | null) {
    const pitcher = playerId ? players.find((player) => player.id === playerId) : null;
    setCurrentPitcherId(playerId);
    if (playerId && pitcher) {
      syncEmptyActiveAtBat({
        pitcherId: playerId,
        pitcherTeamSide: pitcher.teamSide
      });
    }
    setIsDirty(true);
  }

  function handleBatterChange(playerId: string | null) {
    const batter = playerId ? players.find((player) => player.id === playerId) : null;
    setCurrentBatterId(playerId);
    syncEmptyActiveAtBat({
      batterId: playerId,
      batterTeamSide: batter?.teamSide ?? null
    });
    setIsDirty(true);
  }

  function handleStartAtBat() {
    if (!currentPitcherId) return;
    const pitcher = players.find((p) => p.id === currentPitcherId);
    const batter = currentBatterId ? players.find((p) => p.id === currentBatterId) : null;
    if (!pitcher) return;

    const timestampSeconds = videoRef.current ? videoRef.current.currentTime : 0;
    const newAtBat = createAtBat(
      session.id,
      currentBatterId,
      currentPitcherId,
      batter?.teamSide ?? null,
      pitcher.teamSide,
      timestampSeconds
    );
    setAtBats((prev) => [...prev, newAtBat]);
    setActiveAtBatId(newAtBat.id);
    setIsDirty(true);
  }

  function handleEndAtBat() {
    if (!activeAtBatId) return;
    const timestampSeconds = videoRef.current ? videoRef.current.currentTime : 0;
    setAtBats((prev) =>
      prev.map((ab) => {
        if (ab.id === activeAtBatId) {
          return { ...ab, endTimestampSeconds: timestampSeconds };
        }
        return ab;
      })
    );
    setActiveAtBatId(null);
    resetPitchContext();
    setSelectedFielderId(null);
    setIsDirty(true);
  }

  function handleNextPitch() {
    const nextPitchSelection = buildNextPitchSelection({
      currentPitcherId,
      currentBatterId,
      activeAtBatId
    });
    setCurrentPitcherId(nextPitchSelection.currentPitcherId);
    setCurrentBatterId(nextPitchSelection.currentBatterId);
    setActiveAtBatId(nextPitchSelection.activeAtBatId);
    setSelectedFielderId(nextPitchSelection.selectedFielderId);
    resetPitchContext();
    setTagMessage("Ready for the next pitch. Pitcher, batter, and at-bat context stayed in place.");
  }

  function handleNextAtBat() {
    if (!currentPitcherId) return;

    const timestampSeconds = videoRef.current ? videoRef.current.currentTime : 0;
    const nextState = buildNextAtBatState({
      sessionId: session.id,
      players,
      atBats,
      currentPitcherId,
      currentBatterId,
      activeAtBatId,
      timestampSeconds,
      newAtBatId: crypto.randomUUID()
    });

    setAtBats(nextState.atBats);
    setCurrentPitcherId(nextState.currentPitcherId);
    setCurrentBatterId(nextState.currentBatterId);
    setActiveAtBatId(nextState.activeAtBatId);
    setSelectedFielderId(null);
    resetPitchContext();
    setIsDirty(true);
    setTagMessage("Advanced to the next at-bat. Current pitcher was kept.");
  }

  function handleSelectFile(file: File | null): void {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    // Stop any active playback when video changes
    stopPlaylist();

    if (!file) {
      setVideoUrl(null);
      return;
    }
    setVideoUrl(URL.createObjectURL(file));
    setImportRestoreMessage("");
    setVideoSources((previous) => upsertLocalVideoSource(previous, session.id, file.name));
    setIsDirty(true);

    const expected = "";
    if (expected) {
      const result = compareVideoFileNames(expected, file.name);
      setVideoMessage(result.message);
    } else {
      setVideoMessage("");
    }

    
  }

  function handleTagClick(tag: WorkflowTagDefinition): void {
    if (!videoRef.current) return;

    const timestampSeconds = videoRef.current.currentTime;
    const countLabel = countBalls !== null && countStrikes !== null ? `${countBalls}-${countStrikes}` : null;
    const assignment = resolveTagAssignment({
      role: tag.role,
      players,
      currentPitcherId,
      currentBatterId,
      selectedFielderId,
      activeAtBatId
    });

    if (!assignment.ok) {
      setTagMessage(assignment.reason);
      return;
    }

    const newEvent: TaggedEvent = createTaggedEvent({
      sessionId: session.id,
      videoSourceId: currentVideoSource?.id ?? null,
      atBatId: assignment.atBatId,
      eventRole: assignment.eventRole,
      playerId: assignment.playerId,
      relatedPlayerId: assignment.relatedPlayerId,
      teamSide: assignment.teamSide,
      timestampSeconds,
      timestampLabel: formatTimestampLabel(timestampSeconds),
      tag: tag.id,
      category: tag.category,
      note: "",
      pitchCount: countLabel,
      pitchResult: currentPitchResult,
      pitchLocation: currentPitchLocation,
      pitchType: currentPitchType,
      contactType: currentContactType,
      contactQuality: currentContactQuality,
      playResult: currentPlayResult
    });

    setEvents((previous) => [...previous, newEvent]);
    setIsDirty(true);
    setTagMessage(`${tag.label} tagged for ${tag.role}.`);
  }

  function handleSeek(timestampSeconds: number): void {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timestampSeconds;
    videoRef.current.focus();
  }

  function handleUpdateEvent(updatedEvent: TaggedEvent): void {
    setEvents((previous) =>
      previous.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    setIsDirty(true);
  }

  function handleDeleteEvent(id: string): void {
    setEvents((previous) => previous.filter((event) => event.id !== id));
    setIsDirty(true);
  }

  // ---------------------------------------------------------------------------
  // Export handlers
  // ---------------------------------------------------------------------------

  async function handleExportCsv(): Promise<void> {
    await saveFile(csvContent, csvFileName, "text/csv;charset=utf-8;", ".csv");
    setExportMessage(`CSV export triggered: ${csvFileName}`);
  }

  async function handleExportJson(): Promise<void> {
    await saveFile(jsonContent, jsonFileName, "application/json;charset=utf-8;", ".json");
    setExportMessage(`JSON export triggered: ${jsonFileName}`);
    setIsDirty(false);
  }

  async function handleCopyCsv(): Promise<void> {
    const copied = await copyToClipboard(csvContent);
    setExportMessage(copied ? "CSV copied to clipboard." : "Could not copy CSV automatically. Use manual fallback text area.");
  }

  async function handleCopyJson(): Promise<void> {
    const copied = await copyToClipboard(jsonContent);
    setExportMessage(copied ? "JSON copied to clipboard." : "Could not copy JSON automatically. Use manual fallback text area.");
  }

  async function copyToClipboard(value: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(value);
      return true;
    } catch {
      return copyToClipboardFallback(value);
    }
  }

  function copyToClipboardFallback(value: string): boolean {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "true");
    textArea.style.cssText = "position:fixed;top:0;left:0;opacity:0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, textArea.value.length);
    const copied = document.execCommand("copy");
    document.body.removeChild(textArea);
    return copied;
  }

  function openContent(content: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const openedWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (!openedWindow) window.location.href = url;
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  function handleOpenCsv(): void { openContent(csvContent, "text/csv;charset=utf-8;"); setExportMessage("Opened CSV view."); }
  function handleOpenJson(): void { openContent(jsonContent, "application/json;charset=utf-8;"); setExportMessage("Opened JSON view."); }

  // ---------------------------------------------------------------------------
  // Recovery / import
  // ---------------------------------------------------------------------------

  function handleRestoreRecovery() {
    if (recoverySnapshot) {
      setSession(recoverySnapshot.session);
      setEvents(recoverySnapshot.events);
      setPlayers(recoverySnapshot.players || []);
      setVideoSources(recoverySnapshot.videoSources || []);
      setAtBats(recoverySnapshot.atBats || []);
      setCurrentPitcherId(recoverySnapshot.currentPitcherId || null);
      setCurrentBatterId(recoverySnapshot.currentBatterId || null);
      setSelectedFielderId(null);
      setActiveAtBatId(recoverySnapshot.activeAtBatId || null);
      setIsDirty(true);
      setSelectedReviewEventId(null);
      setReviewFilters(emptyFilters());
      // Clear stale comparison session when active session changes
      setComparisonSession(null);
      setExportMessage("Session restored. Select the original video file to resume playback and timestamp review.");
    }
    setHasRecoveryData(false);
    setRecoverySnapshot(null);
  }

  function handleDiscardRecovery() {
    localStorage.removeItem(RECOVERY_KEY);
    setHasRecoveryData(false);
    setRecoverySnapshot(null);
  }

  function handleImportJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportedSession(text);
        setSession(parsed.session);
        setEvents(parsed.events);
        setPlayers(parsed.players || []);
        setVideoSources(parsed.videoSources || []);
        setAtBats(parsed.atBats || []);
        setCurrentPitcherId(null);
        setCurrentBatterId(null);
        setSelectedFielderId(null);
        setActiveAtBatId(null);
        if (videoUrl) {
          URL.revokeObjectURL(videoUrl);
        }
        setVideoUrl(null);
        setVideoMessage("");
        setIsDirty(false);
        setSelectedReviewEventId(null);
        setReviewFilters(emptyFilters());
        // Clear stale comparison session when active session is replaced
        setComparisonSession(null);
        stopPlaylist();
        setImportRestoreMessage(buildImportRestoreMessage(file.name, parsed));
        setExportMessage("");
      } catch (err: any) {
        setImportRestoreMessage("");
        setExportMessage(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ---------------------------------------------------------------------------
  // Recovery screen
  // ---------------------------------------------------------------------------

  if (hasRecoveryData) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-amber-900">
          <h2 className="mb-2 text-xl font-bold">Unfinished Session Found</h2>
          <p className="mb-4">
            {recoverySnapshot?.session?.context || "Unknown Player"} — {recoverySnapshot?.session?.name || "Unnamed Session"}
            <br />
            Last saved: {new Date(recoverySnapshot?.session?.updatedAt || Date.now()).toLocaleString()}
          </p>
          <div className="flex gap-4">
            <button
              onClick={handleRestoreRecovery}
              className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
            >
              Restore session
            </button>
            <button
              onClick={handleDiscardRecovery}
              className="rounded-md border border-amber-300 bg-white px-4 py-2 font-semibold text-amber-900 hover:bg-amber-100"
            >
              Discard recovery
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // Main render
  // ---------------------------------------------------------------------------

  const showReview = mode === "review";
  const showReports = mode === "reports";
  const teamAPlayers = players.filter((player) => player.teamSide === "teamA");
  const teamBPlayers = players.filter((player) => player.teamSide === "teamB");
  const currentPitcherName = getPlayerName(players, currentPitcherId);
  const currentBatterName = currentBatterId ? getPlayerName(players, currentBatterId) : UNKNOWN_BATTER_LABEL;
  const fielderName = selectedFielderId ? getPlayerName(players, selectedFielderId) : "No fielder";
  const activeAtBatStatus = activeAtBat
    ? `${currentAtBatEventCount} event${currentAtBatEventCount === 1 ? "" : "s"} tagged`
    : "No active at-bat";

  return (
    <main className="min-h-screen bg-[#06080c] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-3 py-4 sm:px-4 lg:px-6">
        <header className="rounded-lg border border-slate-700 bg-[#101720] shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 border-b border-slate-700 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-400">CoachBoss Workspace</p>
              <h1 className="mt-1 text-2xl font-black tracking-wide text-white">Video Analysis Command</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-md border border-slate-600 bg-[#0a0f16] p-1" role="tablist" aria-label="Application mode">
                <button
                  id="tab-tagging"
                  role="tab"
                  aria-selected={mode === "tagging"}
                  onClick={() => switchMode("tagging")}
                  className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    mode === "tagging" ? "bg-orange-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Tagging
                </button>
                <button
                  id="tab-review"
                  role="tab"
                  aria-selected={showReview}
                  onClick={() => switchMode("review")}
                  className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    showReview ? "bg-orange-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Review
                  {hasActiveFilters(reviewFilters) ? (
                    <span className="ml-1.5 rounded-full bg-sky-300 px-1.5 py-0.5 text-[10px] text-slate-950">
                      Filtered
                    </span>
                  ) : null}
                </button>
                <button
                  id="tab-reports"
                  role="tab"
                  aria-selected={showReports}
                  onClick={() => switchMode("reports")}
                  className={`rounded px-3 py-1.5 text-xs font-black uppercase tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                    showReports ? "bg-orange-500 text-slate-950" : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  Reports
                </button>
              </div>

              <input
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleImportJson}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-100 shadow-sm transition-colors hover:border-sky-400 hover:text-sky-200 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Import JSON
              </button>
            </div>
          </div>

          <div className="grid gap-px bg-slate-700 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-[#0d131b] px-4 py-3">
              <span className="block font-black uppercase tracking-[0.18em] text-slate-500">Session</span>
              <span className="mt-1 block truncate font-bold text-slate-100">{session.name.trim() || "Untitled session"}</span>
            </div>
            <div className="bg-[#0d131b] px-4 py-3">
              <span className="block font-black uppercase tracking-[0.18em] text-slate-500">Context</span>
              <span className="mt-1 block truncate font-bold text-slate-100">{session.context.trim() || "No game context"}</span>
            </div>
            <div className="bg-[#0d131b] px-4 py-3">
              <span className="block font-black uppercase tracking-[0.18em] text-slate-500">Teams</span>
              <span className="mt-1 block font-bold text-sky-200">Team A {teamAPlayers.length} / Team B {teamBPlayers.length}</span>
            </div>
            <div className="bg-[#0d131b] px-4 py-3">
              <span className="block font-black uppercase tracking-[0.18em] text-slate-500">At-Bat</span>
              <span className="mt-1 block truncate font-bold text-orange-300">{activeAtBatStatus}</span>
            </div>
          </div>
        </header>

        {!showReports ? (
          <section className="grid gap-3 lg:grid-cols-4">
            <details className="group rounded-lg border border-slate-700 bg-[#101720]">
              <summary className="cursor-pointer list-none px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-200 outline-none transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
                Session Details
              </summary>
              <div className="p-4">
                <SessionDetails session={session} onUpdateSession={updateSession} />
              </div>
            </details>
            <details className="group rounded-lg border border-slate-700 bg-[#101720]">
              <summary className="cursor-pointer list-none px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-200 outline-none transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
                Teams / Players
              </summary>
              <div className="p-4">
                <PlayersList
                  players={players}
                  onAddPlayer={handleAddPlayer}
                  onRemovePlayer={handleRemovePlayer}
                />
              </div>
            </details>
            <details className="group rounded-lg border border-slate-700 bg-[#101720] lg:col-span-2">
              <summary className="cursor-pointer list-none px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-200 outline-none transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
                Settings / Export
              </summary>
              <div className="p-4">
                <ExportButtons
                  onExportCsv={() => void handleExportCsv()}
                  onExportJson={() => void handleExportJson()}
                  onOpenCsv={handleOpenCsv}
                  onOpenJson={handleOpenJson}
                  onCopyCsv={() => void handleCopyCsv()}
                  onCopyJson={() => void handleCopyJson()}
                  csvContent={csvContent}
                  jsonContent={jsonContent}
                  exportMessage={exportMessage}
                  hasEvents={sortedEvents.length > 0}
                />
              </div>
            </details>
          </section>
        ) : null}

        <section className={showReports ? "hidden" : "grid gap-4 xl:grid-cols-[minmax(0,1fr)_390px]"}>
          <div className="flex min-w-0 flex-col gap-4">
            {importRestoreMessage ? (
              <div className="rounded-lg border border-amber-400/40 bg-amber-950/40 p-4 text-sm text-amber-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <p className="font-medium">{importRestoreMessage}</p>
                  <button
                    type="button"
                    onClick={() => setImportRestoreMessage("")}
                    className="self-start rounded-md border border-amber-300/60 bg-amber-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100 hover:bg-amber-400/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ) : null}
            <VideoPlayer
              videoRef={videoRef}
              videoUrl={videoUrl}
              selectedFileName={currentVideoSource?.fileName ?? null}
              videoMessage={videoMessage}
              onSelectFile={handleSelectFile}
            />

            {mode === "tagging" ? (
              <PitchWindow
                balls={countBalls}
                strikes={countStrikes}
                pitchResult={currentPitchResult}
                pitchLocation={currentPitchLocation}
                pitchType={currentPitchType}
                contactType={currentContactType}
                contactQuality={currentContactQuality}
                playResult={currentPlayResult}
                onBallsChange={setCountBalls}
                onStrikesChange={setCountStrikes}
                onPitchResultChange={setCurrentPitchResult}
                onPitchLocationChange={(zoneId, label) => {
                  setCurrentPitchLocation(zoneId);
                  setCurrentPitchLocationLabel(label);
                }}
                onPitchTypeChange={setCurrentPitchType}
                onContactTypeChange={setCurrentContactType}
                onContactQualityChange={setCurrentContactQuality}
                onPlayResultChange={setCurrentPlayResult}
              />
            ) : null}

            {mode === "tagging" ? (
              <details className="group rounded-lg border border-slate-700 bg-[#101720]">
                <summary className="cursor-pointer list-none px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-200 outline-none transition-colors hover:bg-slate-800 focus:ring-2 focus:ring-orange-400 group-open:border-b group-open:border-slate-700">
                  Secondary Tag Events
                </summary>
                <div className="p-4">
                  <TagPanel onTagClick={handleTagClick} disabled={!videoUrl} message={tagMessage} />
                </div>
              </details>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-col gap-4">
            {mode === "tagging" ? (
              <AtBatControls
                session={session}
                players={players}
                activeAtBat={activeAtBat}
                currentAtBatEventCount={currentAtBatEventCount}
                currentPitcherId={currentPitcherId}
                currentBatterId={currentBatterId}
                selectedFielderId={selectedFielderId}
                onPitcherChange={handlePitcherChange}
                onBatterChange={handleBatterChange}
                onFielderChange={setSelectedFielderId}
                onClearFielder={() => setSelectedFielderId(null)}
                onStartAtBat={handleStartAtBat}
                hasActiveAtBat={!!activeAtBatId}
                onEndAtBat={handleEndAtBat}
                onNextPitch={handleNextPitch}
                onNextAtBat={handleNextAtBat}
              />
            ) : null}

            <div className="rounded-lg border border-slate-700 bg-[#101720] p-4">
              <h2 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Live Context</h2>
              <div className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Pitcher</span>
                  <span className="truncate font-bold text-slate-100">{currentPitcherName}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Batter</span>
                  <span className="truncate font-bold text-slate-100">{currentBatterName}</span>
                </div>
                <div className="flex justify-between gap-3 border-b border-slate-800 pb-2">
                  <span className="text-slate-500">Fielder</span>
                  <span className="truncate font-bold text-slate-100">{fielderName}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-slate-500">Pitcher Team</span>
                  <span className="font-bold text-sky-200">{teamSideLabel(activeAtBat?.pitcherTeamSide ?? null)}</span>
                </div>
              </div>
            </div>

            <Timeline
              events={showReview ? filteredReviewEvents : sortedEvents}
              players={players}
              atBats={atBats}
              onSeek={handleSeek}
              onUpdateEvent={handleUpdateEvent}
              onDeleteEvent={handleDeleteEvent}
              selectedReviewEventId={showReview ? selectedReviewEventId : null}
              totalCount={sortedEvents.length}
              filteredCount={showReview ? filteredReviewEvents.length : undefined}
            />
          </aside>
        </section>

        {showReview ? (
          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <ReviewFilters filters={reviewFilters} onChange={handleFilterChange} />
            <ReviewControls
              filteredEvents={filteredReviewEvents}
              selectedEventId={selectedReviewEventId}
              hasVideo={!!videoUrl}
              preRoll={preRoll}
              postRoll={postRoll}
              isPlayingPlaylist={isPlayingPlaylist}
              playlistIndex={playlistIndex}
              onSelectEvent={handleSelectReviewEvent}
              onPrev={handleReviewPrev}
              onNext={handleReviewNext}
              onPlayClip={handlePlayClip}
              onPlayPlaylist={handlePlayPlaylist}
              onStopPlaylist={stopPlaylist}
              onPreRollChange={setPreRoll}
              onPostRollChange={setPostRoll}
            />
            <ReviewSummary
              summary={reviewSummary}
              totalSessionEvents={sortedEvents.length}
            />
          </section>
        ) : null}

        {showReports ? (
          <ReportsPanel
            session={session}
            allEvents={sortedEvents}
            filteredEvents={filteredReviewEvents}
            reviewFilters={reviewFilters}
            comparisonSession={comparisonSession}
            onLoadComparisonSession={setComparisonSession}
            onClearComparisonSession={() => setComparisonSession(null)}
          />
        ) : null}
      </div>
    </main>
  );
}