"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ContactContextSelector } from "@/components/analysis/ContactContextSelector";
import { CountSelector } from "@/components/analysis/CountSelector";
import { ExportButtons } from "@/components/analysis/ExportButtons";
import { PitchLocationSelector } from "@/components/analysis/PitchLocationSelector";
import { PitchResultSelector } from "@/components/analysis/PitchResultSelector";
import { PitchTypeSelector } from "@/components/analysis/PitchTypeSelector";
import { PitcherContextSelector } from "@/components/analysis/PitcherContextSelector";
import { ReviewControls } from "@/components/analysis/ReviewControls";
import { ReviewFilters } from "@/components/analysis/ReviewFilters";
import { ReviewSummary } from "@/components/analysis/ReviewSummary";
import { ReportsPanel } from "@/components/analysis/ReportsPanel";
import { SessionDetails } from "@/components/analysis/SessionDetails";
import { TagPanel } from "@/components/analysis/TagPanel";
import { Timeline } from "@/components/analysis/Timeline";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { toCsv, toJson, parseImportedSession } from "@/lib/analysis/export";
import { formatTimestampLabel } from "@/lib/analysis/time";
import { compareVideoFileNames } from "@/lib/analysis/video";
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
import { AnalysisEvent, ExportedSession, SessionMetadata, TagDefinition } from "@/lib/analysis/types";

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

  const [session, setSession] = useState<SessionMetadata>({
    sessionId: crypto.randomUUID(),
    sessionName: "",
    playerName: "",
    sessionType: "batter",
    sessionDate: "",
    opponent: "",
    videoFileName: null,
    batterHandedness: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });

  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [countBalls, setCountBalls] = useState<number | null>(null);
  const [countStrikes, setCountStrikes] = useState<number | null>(null);

  const [currentPitchResult, setCurrentPitchResult] = useState<AnalysisEvent["pitchResult"]>(null);
  const [currentPitchLocationZone, setCurrentPitchLocationZone] = useState<AnalysisEvent["pitchLocationZone"]>(null);
  const [currentPitchLocationLabel, setCurrentPitchLocationLabel] = useState<string | null>(null);
  const [currentContactDirection, setCurrentContactDirection] = useState<AnalysisEvent["contactDirection"]>(null);
  const [currentContactQuality, setCurrentContactQuality] = useState<AnalysisEvent["contactQuality"]>(null);
  const [currentResult, setCurrentResult] = useState<AnalysisEvent["result"]>(null);
  
  const [currentPitchType, setCurrentPitchType] = useState<AnalysisEvent["pitchType"]>(null);
  const [currentVelocity, setCurrentVelocity] = useState<AnalysisEvent["velocity"]>(null);
  const [currentArmSlot, setCurrentArmSlot] = useState<AnalysisEvent["armSlot"]>(null);

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [videoMessage, setVideoMessage] = useState("");

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

  const sessionLabel = session.sessionName.trim() || "session";
  const csvFileName = `${sessionLabel}-events.csv`;
  const jsonFileName = `${sessionLabel}-events.json`;
  const csvContent = useMemo(() => `\uFEFF${toCsv(session, sortedEvents)}`, [session, sortedEvents]);
  const jsonContent = useMemo(() => toJson(session, sortedEvents), [session, sortedEvents]);

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
      const recoveryData = { session, events };
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));
    }, 750);
    return () => clearTimeout(timer);
  }, [session, events, isDirty, hasRecoveryData]);

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
    (event: AnalysisEvent): Promise<void> => {
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
    events: AnalysisEvent[],
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

  function handleSelectReviewEvent(event: AnalysisEvent): void {
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

  function updateSession(updates: Partial<SessionMetadata>) {
    setSession((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setIsDirty(true);
  }

  function handleSelectFile(file: File | null): void {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
    // Stop any active playback when video changes
    stopPlaylist();

    if (!file) {
      setVideoUrl(null);
      updateSession({ videoFileName: null });
      return;
    }
    setVideoUrl(URL.createObjectURL(file));

    const expected = session.videoFileName;
    if (expected) {
      const result = compareVideoFileNames(expected, file.name);
      setVideoMessage(result.message);
    } else {
      setVideoMessage("");
    }

    updateSession({ videoFileName: file.name });
  }

  function handleTagClick(tag: TagDefinition): void {
    if (!videoRef.current) return;

    const timestampSeconds = videoRef.current.currentTime;
    const countLabel = countBalls !== null && countStrikes !== null ? `${countBalls}-${countStrikes}` : null;
    const newEvent: AnalysisEvent = {
      id: crypto.randomUUID(),
      timestampSeconds,
      timestampLabel: formatTimestampLabel(timestampSeconds),
      tagId: tag.id,
      tagLabel: tag.label,
      category: tag.category,
      note: "",
      count: countLabel,
      pitchResult: currentPitchResult,
      pitchLocationZone: currentPitchLocationZone,
      pitchLocationLabel: currentPitchLocationLabel,
      batterHandedness: session.batterHandedness,
      contactDirection: currentContactDirection,
      contactQuality: currentContactQuality,
      result: currentResult,
      pitchType: currentPitchType,
      velocity: currentVelocity,
      armSlot: currentArmSlot,
      createdAt: new Date().toISOString()
    };

    setEvents((previous) => [...previous, newEvent]);
    setIsDirty(true);
  }

  function handleSeek(timestampSeconds: number): void {
    if (!videoRef.current) return;
    videoRef.current.currentTime = timestampSeconds;
    videoRef.current.focus();
  }

  function handleUpdateEvent(updatedEvent: AnalysisEvent): void {
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
        setIsDirty(false);
        setSelectedReviewEventId(null);
        setReviewFilters(emptyFilters());
        // Clear stale comparison session when active session is replaced
        setComparisonSession(null);
        stopPlaylist();
        setExportMessage(`Imported ${file.name}. Select the original video file (${parsed.session.videoFileName || "unknown"}) to resume playback.`);
      } catch (err: any) {
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
            {recoverySnapshot?.session?.playerName || "Unknown Player"} — {recoverySnapshot?.session?.sessionName || "Unnamed Session"}
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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Batter Video Analysis</h1>
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode toggle */}
          <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 shadow-sm" role="tablist" aria-label="Application mode">
            <button
              id="tab-tagging"
              role="tab"
              aria-selected={mode === "tagging"}
              onClick={() => switchMode("tagging")}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                mode === "tagging" ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Tagging
            </button>
            <button
              id="tab-review"
              role="tab"
              aria-selected={showReview}
              onClick={() => switchMode("review")}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                showReview ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Review
              {hasActiveFilters(reviewFilters) && (
                <span className="ml-1.5 rounded-full bg-emerald-200 px-1.5 py-0.5 text-xs text-emerald-900">
                  Filtered
                </span>
              )}
            </button>
            <button
              id="tab-reports"
              role="tab"
              aria-selected={showReports}
              onClick={() => switchMode("reports")}
              className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                showReports ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Reports
            </button>
          </div>

          {/* Import */}
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImportJson}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Import JSON Session
          </button>
        </div>
      </div>

      {/* Session Details — always visible */}
      <SessionDetails
        playerName={session.playerName}
        sessionName={session.sessionName}
        sessionDate={session.sessionDate}
        opponent={session.opponent || ""}
        batterHandedness={session.batterHandedness}
        sessionType={session.sessionType || "batter"}
        onPlayerNameChange={(v) => updateSession({ playerName: v })}
        onSessionNameChange={(v) => updateSession({ sessionName: v })}
        onSessionDateChange={(v) => updateSession({ sessionDate: v })}
        onOpponentChange={(v) => updateSession({ opponent: v })}
        onBatterHandednessChange={(v) => updateSession({ batterHandedness: v })}
        onSessionTypeChange={(v) => updateSession({ sessionType: v })}
      />

      {/* ================================================================ */}
      {/* TAGGING MODE                                                     */}
      {/* ================================================================ */}
      {mode === "tagging" && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <CountSelector
              balls={countBalls}
              strikes={countStrikes}
              onBallsChange={setCountBalls}
              onStrikesChange={setCountStrikes}
            />
            <PitchResultSelector
              value={currentPitchResult}
              onChange={setCurrentPitchResult}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PitchLocationSelector
              value={currentPitchLocationZone}
              batterHandedness={session.batterHandedness}
              onChange={(zoneId, label) => {
                setCurrentPitchLocationZone(zoneId);
                setCurrentPitchLocationLabel(label);
              }}
            />
            <ContactContextSelector
              contactDirection={currentContactDirection}
              contactQuality={currentContactQuality}
              result={currentResult}
              onContactDirectionChange={setCurrentContactDirection}
              onContactQualityChange={setCurrentContactQuality}
              onResultChange={setCurrentResult}
            />
            {session.sessionType === "pitcher" && (
              <>
                <PitchTypeSelector
                  value={currentPitchType}
                  onChange={setCurrentPitchType}
                />
                <PitcherContextSelector
                  velocity={currentVelocity}
                  armSlot={currentArmSlot}
                  onVelocityChange={setCurrentVelocity}
                  onArmSlotChange={setCurrentArmSlot}
                />
              </>
            )}
          </div>
        </>
      )}

      {/* Video Player — preserved in DOM to maintain state, hidden in reports */}
      <div className={showReports ? "hidden" : "block"}>
        <VideoPlayer
          videoRef={videoRef}
          videoUrl={videoUrl}
          selectedFileName={videoUrl ? (session.videoFileName || "") : null}
          expectedVideoFileName={session.videoFileName}
          videoMessage={videoMessage}
          onSelectFile={handleSelectFile}
        />
      </div>

      {/* ================================================================ */}
      {/* TAGGING MODE — Tag panel                                         */}
      {/* ================================================================ */}
      {mode === "tagging" && (
        <TagPanel onTagClick={handleTagClick} disabled={!videoUrl} />
      )}

      {/* ================================================================ */}
      {/* REVIEW MODE — Filters + Controls + Summary                       */}
      {/* ================================================================ */}
      {showReview && (
        <>
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
        </>
      )}

      {/* ================================================================ */}
      {/* REPORTS MODE                                                     */}
      {/* ================================================================ */}
      {showReports && (
        <ReportsPanel
          session={session}
          allEvents={sortedEvents}
          filteredEvents={filteredReviewEvents}
          reviewFilters={reviewFilters}
          comparisonSession={comparisonSession}
          onLoadComparisonSession={setComparisonSession}
          onClearComparisonSession={() => setComparisonSession(null)}
        />
      )}

      {/* ================================================================ */}
      {/* TIMELINE — visible in tagging and review modes                   */}
      {/* ================================================================ */}
      {!showReports && (
        <Timeline
          events={showReview ? filteredReviewEvents : sortedEvents}
          onSeek={handleSeek}
          onUpdateEvent={handleUpdateEvent}
          onDeleteEvent={handleDeleteEvent}
          selectedReviewEventId={showReview ? selectedReviewEventId : null}
          totalCount={sortedEvents.length}
          filteredCount={showReview ? filteredReviewEvents.length : undefined}
        />
      )}

      {/* ================================================================ */}
      {/* EXPORT — visible in tagging and review modes                     */}
      {/* ================================================================ */}
      {!showReports && (
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
      )}
    </main>
  );
}
