"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CountSelector } from "@/components/analysis/CountSelector";
import { ExportButtons } from "@/components/analysis/ExportButtons";
import { SessionDetails } from "@/components/analysis/SessionDetails";
import { TagPanel } from "@/components/analysis/TagPanel";
import { Timeline } from "@/components/analysis/Timeline";
import { VideoPlayer } from "@/components/analysis/VideoPlayer";
import { toCsv, toJson } from "@/lib/analysis/export";
import { formatTimestampLabel } from "@/lib/analysis/time";
import { AnalysisEvent, TagDefinition } from "@/lib/analysis/types";

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
  const [playerName, setPlayerName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [countBalls, setCountBalls] = useState(0);
  const [countStrikes, setCountStrikes] = useState(0);
  const [videoFileName, setVideoFileName] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [events, setEvents] = useState<AnalysisEvent[]>([]);
  const [csvUrl, setCsvUrl] = useState<string | null>(null);
  const [jsonUrl, setJsonUrl] = useState<string | null>(null);
  const [exportMessage, setExportMessage] = useState("");

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
  const sessionLabel = sessionName.trim() || "session";
  const csvFileName = `${sessionLabel}-events.csv`;
  const jsonFileName = `${sessionLabel}-events.json`;
  const csvContent = useMemo(() => `\uFEFF${toCsv(sortedEvents)}`, [sortedEvents]);
  const jsonContent = useMemo(() => toJson(sortedEvents), [sortedEvents]);

  useEffect(() => {
    if (sortedEvents.length === 0) {
      setCsvUrl(null);
      setJsonUrl(null);
      return;
    }

    const nextCsvUrl = URL.createObjectURL(
      new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    );
    const nextJsonUrl = URL.createObjectURL(
      new Blob([jsonContent], { type: "application/json;charset=utf-8;" })
    );
    setCsvUrl(nextCsvUrl);
    setJsonUrl(nextJsonUrl);

    return () => {
      URL.revokeObjectURL(nextCsvUrl);
      URL.revokeObjectURL(nextJsonUrl);
    };
  }, [csvContent, jsonContent, sortedEvents.length]);

  function handleSelectFile(file: File | null): void {
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    if (!file) {
      setVideoUrl(null);
      setVideoFileName("");
      return;
    }

    setVideoFileName(file.name);
    setVideoUrl(URL.createObjectURL(file));
  }

  function handleTagClick(tag: TagDefinition): void {
    if (!videoRef.current) {
      return;
    }

    const timestampSeconds = videoRef.current.currentTime;
    const countLabel = `${countBalls}-${countStrikes}`;
    const newEvent: AnalysisEvent = {
      id: crypto.randomUUID(),
      timestampSeconds,
      timestampLabel: formatTimestampLabel(timestampSeconds),
      playerName: playerName.trim(),
      sessionName: sessionName.trim(),
      countBalls,
      countStrikes,
      countLabel,
      tag: tag.tag,
      category: tag.category,
      note: "",
      createdAt: new Date().toISOString()
    };

    setEvents((previous) => [...previous, newEvent]);
  }

  function handleSeek(timestampSeconds: number): void {
    if (!videoRef.current) {
      return;
    }
    videoRef.current.currentTime = timestampSeconds;
    videoRef.current.focus();
  }

  function handleNoteChange(id: string, note: string): void {
    setEvents((previous) =>
      previous.map((event) => (event.id === id ? { ...event, note } : event))
    );
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
  }

  async function handleCopyCsv(): Promise<void> {
    try {
      await navigator.clipboard.writeText(csvContent);
      setExportMessage("CSV copied to clipboard.");
    } catch {
      setExportMessage("Could not copy CSV. Use Open CSV link as fallback.");
    }
  }

  async function handleCopyJson(): Promise<void> {
    try {
      await navigator.clipboard.writeText(jsonContent);
      setExportMessage("JSON copied to clipboard.");
    } catch {
      setExportMessage("Could not copy JSON. Use Open JSON link as fallback.");
    }
  }

  async function saveToProject(
    format: "csv" | "json",
    fileName: string,
    content: string
  ): Promise<void> {
    try {
      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format, fileName, content })
      });

      if (!response.ok) {
        setExportMessage(`Could not save ${format.toUpperCase()} to project folder.`);
        return;
      }

      const result = (await response.json()) as SaveToProjectResult;
      setExportMessage(
        `${format.toUpperCase()} saved to ${result.savedFolder}\\${result.savedFile}`
      );
    } catch {
      setExportMessage(`Could not save ${format.toUpperCase()} to project folder.`);
    }
  }

  async function handleSaveCsvToProject(): Promise<void> {
    await saveToProject("csv", csvFileName, csvContent);
  }

  async function handleSaveJsonToProject(): Promise<void> {
    await saveToProject("json", jsonFileName, jsonContent);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 px-4 py-6 md:px-6">
      <h1 className="text-2xl font-bold text-slate-900">
        Stage 2: Structured Batter Context
      </h1>

      <SessionDetails
        playerName={playerName}
        sessionName={sessionName}
        onPlayerNameChange={setPlayerName}
        onSessionNameChange={setSessionName}
      />
      <CountSelector
        balls={countBalls}
        strikes={countStrikes}
        onBallsChange={setCountBalls}
        onStrikesChange={setCountStrikes}
      />

      <VideoPlayer
        videoRef={videoRef}
        videoUrl={videoUrl}
        selectedFileName={videoFileName}
        onSelectFile={handleSelectFile}
      />

      <TagPanel onTagClick={handleTagClick} disabled={!videoUrl} />

      <Timeline events={sortedEvents} onSeek={handleSeek} onNoteChange={handleNoteChange} />

      <ExportButtons
        onExportCsv={() => void handleExportCsv()}
        onExportJson={() => void handleExportJson()}
        onSaveCsvToProject={() => void handleSaveCsvToProject()}
        onSaveJsonToProject={() => void handleSaveJsonToProject()}
        onCopyCsv={() => void handleCopyCsv()}
        onCopyJson={() => void handleCopyJson()}
        csvUrl={csvUrl}
        jsonUrl={jsonUrl}
        csvFileName={csvFileName}
        jsonFileName={jsonFileName}
        csvContent={csvContent}
        jsonContent={jsonContent}
        exportMessage={exportMessage}
        disabled={sortedEvents.length === 0}
      />
    </main>
  );
}
