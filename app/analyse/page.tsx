"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ContactContextSelector } from "@/components/analysis/ContactContextSelector";
import { CountSelector } from "@/components/analysis/CountSelector";
import { ExportButtons } from "@/components/analysis/ExportButtons";
import { PitchLocationSelector } from "@/components/analysis/PitchLocationSelector";
import { PitchResultSelector } from "@/components/analysis/PitchResultSelector";
import { SessionDetails } from "@/components/analysis/SessionDetails";
import { TagPanel } from "@/components/analysis/TagPanel";
import { Timeline } from "@/components/analysis/Timeline";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { toCsv, toJson, parseImportedSession } from "@/lib/analysis/export";
import { formatTimestampLabel } from "@/lib/analysis/time";
import { compareVideoFileNames } from "@/lib/analysis/video";
import { AnalysisEvent, ExportedSession, SessionMetadata, TagDefinition } from "@/lib/analysis/types";

const RECOVERY_KEY = "softball-analysis-lab:recovery:v1";

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
  // Delayed cleanup avoids browsers dropping the download before it starts.
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

type SaveToProjectResult = {
  success: boolean;
  savedFile: string;
  savedFolder: string;
  savedPath: string;
};

export default function AnalysePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [session, setSession] = useState<SessionMetadata>({
    sessionId: crypto.randomUUID(),
    sessionName: "",
    playerName: "",
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

  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");
  const [videoMessage, setVideoMessage] = useState("");
  
  const [isDirty, setIsDirty] = useState(false);
  const [hasRecoveryData, setHasRecoveryData] = useState(false);
  const [recoverySnapshot, setRecoverySnapshot] = useState<any>(null);

  // Check for recovery on mount
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

  // Debounced Autosave
  useEffect(() => {
    if (!isDirty || hasRecoveryData) return;
    const timer = setTimeout(() => {
      const recoveryData = { session, events };
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(recoveryData));
    }, 750);
    return () => clearTimeout(timer);
  }, [session, events, isDirty, hasRecoveryData]);

  // Before unload warning
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

  const sortedEvents = useMemo(
    () =>
      [...events].sort(
        (firstEvent, secondEvent) =>
          firstEvent.timestampSeconds - secondEvent.timestampSeconds
      ),
    [events]
  );

  const sessionLabel = session.sessionName.trim() || "session";
  const csvFileName = `${sessionLabel}-events.csv`;
  const jsonFileName = `${sessionLabel}-events.json`;
  const csvContent = useMemo(() => `\uFEFF${toCsv(session, sortedEvents)}`, [session, sortedEvents]);
  const jsonContent = useMemo(() => toJson(session, sortedEvents), [session, sortedEvents]);

  function updateSession(updates: Partial<SessionMetadata>) {
    setSession((prev) => ({ ...prev, ...updates, updatedAt: new Date().toISOString() }));
    setIsDirty(true);
  }

  function handleSelectFile(file: File | null): void {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }
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
    if (!videoRef.current) {
      return;
    }

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
      createdAt: new Date().toISOString()
    };

    setEvents((previous) => [...previous, newEvent]);
    setIsDirty(true);
  }

  function handleSeek(timestampSeconds: number): void {
    if (!videoRef.current) {
      return;
    }
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

  async function handleExportCsv(): Promise<void> {
    await saveFile(
      csvContent,
      csvFileName,
      "text/csv;charset=utf-8;",
      ".csv"
    );
    setExportMessage(`CSV export triggered: ${csvFileName}`);
  }

  async function handleExportJson(): Promise<void> {
    await saveFile(
      jsonContent,
      jsonFileName,
      "application/json;charset=utf-8;",
      ".json"
    );
    setExportMessage(`JSON export triggered: ${jsonFileName}`);
    setIsDirty(false); // JSON is a durable backup, mark session as clean
  }

  async function handleCopyCsv(): Promise<void> {
    const copied = await copyToClipboard(csvContent);
    if (copied) {
      setExportMessage("CSV copied to clipboard.");
      return;
    }
    setExportMessage("Could not copy CSV automatically. Use manual fallback text area.");
  }

  async function handleCopyJson(): Promise<void> {
    const copied = await copyToClipboard(jsonContent);
    if (copied) {
      setExportMessage("JSON copied to clipboard.");
      return;
    }
    setExportMessage("Could not copy JSON automatically. Use manual fallback text area.");
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
    textArea.style.position = "fixed";
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.opacity = "0";
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
    if (!openedWindow) {
      window.location.href = url;
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
  }

  function handleOpenCsv(): void {
    openContent(csvContent, "text/csv;charset=utf-8;");
    setExportMessage("Opened CSV view.");
  }

  function handleOpenJson(): void {
    openContent(jsonContent, "application/json;charset=utf-8;");
    setExportMessage("Opened JSON view.");
  }

  function handleRestoreRecovery() {
    if (recoverySnapshot) {
      setSession(recoverySnapshot.session);
      setEvents(recoverySnapshot.events);
      setIsDirty(true);
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
        setExportMessage(`Imported ${file.name}. Select the original video file (${parsed.session.videoFileName || 'unknown'}) to resume playback.`);
      } catch (err: any) {
        setExportMessage(`Import failed: ${err.message}`);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

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

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Batter Video Analysis
        </h1>
        <div>
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

      <SessionDetails
        playerName={session.playerName}
        sessionName={session.sessionName}
        sessionDate={session.sessionDate}
        opponent={session.opponent}
        batterHandedness={session.batterHandedness}
        onPlayerNameChange={(v) => updateSession({ playerName: v })}
        onSessionNameChange={(v) => updateSession({ sessionName: v })}
        onSessionDateChange={(v) => updateSession({ sessionDate: v })}
        onOpponentChange={(v) => updateSession({ opponent: v })}
        onBatterHandednessChange={(v) => updateSession({ batterHandedness: v })}
      />
      
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
      </div>

      <VideoPlayer
        videoRef={videoRef}
        videoUrl={videoUrl}
        selectedFileName={videoUrl ? (session.videoFileName || "") : null}
        expectedVideoFileName={session.videoFileName}
        videoMessage={videoMessage}
        onSelectFile={handleSelectFile}
      />

      <TagPanel onTagClick={handleTagClick} disabled={!videoUrl} />

      <Timeline events={sortedEvents} onSeek={handleSeek} onUpdateEvent={handleUpdateEvent} onDeleteEvent={handleDeleteEvent} />

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
    </main>
  );
}
