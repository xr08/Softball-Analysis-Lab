"use client";

import { useMemo, useState } from "react";
import { AnalysisEvent, ExportedSession, SessionMetadata } from "@/lib/analysis/types";
import {
  buildSessionReport,
  compareReports,
  toReportCsv,
  toComparisonCsv,
  toReportJson,
  SessionReport as SessionReportType,
} from "@/lib/analysis/reports";
import { ReviewFilters as ReviewFiltersType, hasActiveFilters, filterAndSortEvents } from "@/lib/analysis/review";
import { SessionReport } from "@/components/analysis/SessionReport";
import { ComparisonReport } from "@/components/analysis/ComparisonReport";
import { ComparisonSessionLoader } from "@/components/analysis/ComparisonSessionLoader";

type ReportScope = "all" | "filtered";

type ReportsPanelProps = {
  session: SessionMetadata;
  allEvents: AnalysisEvent[];
  filteredEvents: AnalysisEvent[];
  reviewFilters: ReviewFiltersType;
  comparisonSession: ExportedSession | null;
  onLoadComparisonSession: (s: ExportedSession) => void;
  onClearComparisonSession: () => void;
};

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

/**
 * ReportsPanel — the top-level Reports mode component.
 *
 * Contains:
 * - Scope toggle (all events / current review filters)
 * - View toggle (single session / comparison)
 * - Export buttons (CSV, JSON)
 * - Print button
 * - SessionReport or ComparisonReport
 * - ComparisonSessionLoader
 */
export function ReportsPanel({
  session,
  allEvents,
  filteredEvents,
  reviewFilters,
  comparisonSession,
  onLoadComparisonSession,
  onClearComparisonSession,
}: ReportsPanelProps) {
  const [scope, setScope] = useState<ReportScope>("all");
  const [view, setView] = useState<"single" | "compare">("single");

  const isFiltering = hasActiveFilters(reviewFilters);

  // Events to use for the report
  const reportEvents = scope === "filtered" ? filteredEvents : allEvents;
  const isFiltered = scope === "filtered";
  const filteredCount = isFiltered ? allEvents.length : null;

  const generatedAt = useMemo(() => new Date().toISOString(), [reportEvents, comparisonSession]);

  const sessionReport: SessionReportType = useMemo(
    () =>
      buildSessionReport(
        session,
        reportEvents,
        generatedAt,
        isFiltered,
        filteredCount ?? undefined
      ),
    [session, reportEvents, generatedAt, isFiltered, filteredCount]
  );

  const comparisonSessionReport = useMemo(() => {
    if (!comparisonSession) return null;
    
    let compEvents = comparisonSession.events;
    if (isFiltered) {
      compEvents = filterAndSortEvents(compEvents, reviewFilters);
    }

    return buildSessionReport(
      comparisonSession.session,
      compEvents,
      generatedAt,
      isFiltered,
      isFiltered ? comparisonSession.events.length : undefined
    );
  }, [comparisonSession, isFiltered, reviewFilters, generatedAt]);

  const comparison = useMemo(() => {
    if (!comparisonSessionReport) return null;
    return compareReports(sessionReport, comparisonSessionReport);
  }, [sessionReport, comparisonSessionReport]);

  const sessionLabel = session.sessionName.trim() || "session";

  function handleExportReportCsv() {
    if (view === "compare" && comparison) {
      downloadFile(
        `\uFEFF${toComparisonCsv(comparison)}`,
        `${sessionLabel}-comparison-report.csv`,
        "text/csv;charset=utf-8;"
      );
    } else {
      downloadFile(
        `\uFEFF${toReportCsv(sessionReport)}`,
        `${sessionLabel}-report.csv`,
        "text/csv;charset=utf-8;"
      );
    }
  }

  function handleExportReportJson() {
    downloadFile(
      toReportJson(sessionReport),
      `${sessionLabel}-report.json`,
      "application/json;charset=utf-8;"
    );
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="space-y-4">
      {/* ── Toolbar ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Scope toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setScope("all")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                scope === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              All events
            </button>
            <button
              onClick={() => setScope("filtered")}
              disabled={!isFiltering}
              title={!isFiltering ? "No active Review filters" : undefined}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                scope === "filtered"
                  ? "bg-white text-slate-900 shadow-sm"
                  : isFiltering
                  ? "text-slate-500 hover:text-slate-700"
                  : "cursor-not-allowed text-slate-300"
              }`}
            >
              Current filters
              {isFiltering && (
                <span className="ml-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">
                  active
                </span>
              )}
            </button>
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              onClick={() => setView("single")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                view === "single"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Single session
            </button>
            <button
              onClick={() => setView("compare")}
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                view === "compare"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Compare sessions
            </button>
          </div>
        </div>

        {/* Export / print buttons — hidden in print */}
        <div className="no-print flex flex-wrap gap-2">
          <button
            onClick={handleExportReportCsv}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Export CSV
          </button>
          <button
            onClick={handleExportReportJson}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Export Report JSON
          </button>
          <button
            onClick={handlePrint}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm"
          >
            Print report
          </button>
        </div>
      </div>

      {/* Filtered scope notice */}
      {scope === "filtered" && isFiltering && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <strong>Filtered report</strong> — applying current Review filters.
          {comparison ? (
            <div className="mt-1">
              Session A: {filteredEvents.length} of {allEvents.length} events match.<br/>
              Session B: {comparisonSessionReport?.totalEvents} of {comparisonSession?.events.length} events match.
            </div>
          ) : (
            <div className="mt-1">
              Showing {filteredEvents.length} of {allEvents.length} events.
            </div>
          )}
        </div>
      )}

      {/* ── Compare view: session loader ─────────────────────────────── */}
      {view === "compare" && (
        <ComparisonSessionLoader
          activeSessionId={session.sessionId}
          activeSessionName={session.sessionName}
          comparisonSession={comparisonSession}
          onLoad={onLoadComparisonSession}
          onClear={onClearComparisonSession}
        />
      )}

      {/* ── Report content ───────────────────────────────────────────── */}
      {allEvents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          No events in this session yet. Add tagged events in Tagging mode to generate a report.
        </div>
      ) : view === "single" ? (
        <SessionReport report={sessionReport} />
      ) : comparison ? (
        <ComparisonReport comparison={comparison} />
      ) : (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          Load a Session B above to see a side-by-side comparison.
        </div>
      )}

      {/* Print styles — injected inline so they apply for all reports */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, header, [role="tablist"] { display: none !important; }
          body { font-size: 11pt; }
          .print-area { break-inside: avoid; }
          section { break-inside: avoid; }
        }
      `}</style>
    </div>
  );
}
