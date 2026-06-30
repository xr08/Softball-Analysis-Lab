"use client";

import { ExportedSession } from "@/lib/analysis/types";
import { parseImportedSession } from "@/lib/analysis/export";
import { useRef, useState } from "react";

type ComparisonSessionLoaderProps = {
  activeSessionId: string;
  activeSessionName: string;
  comparisonSession: ExportedSession | null;
  onLoad: (session: ExportedSession) => void;
  onClear: () => void;
};

/**
 * File input for loading Session B for comparison.
 *
 * - Validates using existing parseImportedSession for current session JSON.
 * - Does NOT load the video, replace the active session, or add to recovery.
 * - Warns if the same session ID is loaded on both sides.
 */
export function ComparisonSessionLoader({
  activeSessionId,
  activeSessionName,
  comparisonSession,
  onLoad,
  onClear,
}: ComparisonSessionLoaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseImportedSession(text);
        onLoad(parsed);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(`Could not load comparison session: ${message}`);
      }
    };
    reader.readAsText(file);

    // Reset file input so the same file can be re-loaded if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleClear() {
    setError(null);
    onClear();
  }

  const isSameSession = comparisonSession?.session.id === activeSessionId;

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-900">Session B — Comparison</h3>

      {/* Active session label */}
      <p className="mb-3 text-xs text-slate-500">
        Session A: <span className="font-medium text-slate-700">{activeSessionName || "Unnamed Session"}</span>
      </p>

      {comparisonSession ? (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
            <div>
              <p className="text-xs font-semibold text-emerald-800">
                {comparisonSession.session.name || "Unnamed Session"}
              </p>
              <p className="text-[11px] text-emerald-700">

                {comparisonSession.session.date || "No date"} ·{" "}
                {comparisonSession.events.length} event
                {comparisonSession.events.length === 1 ? "" : "s"}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="shrink-0 rounded px-2 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100"
              aria-label="Clear comparison session"
            >
              Clear
            </button>
          </div>

          {isSameSession && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ⚠ Session A and Session B have the same session ID. You may have loaded the same
              session twice.
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-slate-500 underline hover:text-slate-700"
          >
            Load a different session
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Load comparison session
          </button>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Accepts a saved session JSON file (schema 2.0). The video is not loaded.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {error}
        </p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Load comparison session JSON file"
      />
    </div>
  );
}
