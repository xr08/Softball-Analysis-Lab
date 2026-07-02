type ExportButtonsProps = {
  onExportCsv: () => void;
  onExportJson: () => void;
  onOpenCsv: () => void;
  onOpenJson: () => void;
  onCopyCsv: () => void;
  onCopyJson: () => void;
  csvContent: string;
  jsonContent: string;
  exportMessage: string;
  hasEvents?: boolean;
};

export function ExportButtons({
  onExportCsv,
  onExportJson,
  onOpenCsv,
  onOpenJson,
  onCopyCsv,
  onCopyJson,
  csvContent,
  jsonContent,
  exportMessage,
  hasEvents = false
}: ExportButtonsProps) {
  const disabled = !hasEvents;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-100">Settings / Export</h2>
        <p className="mt-1 text-xs text-slate-500">Session utilities stay local and file-based for this milestone.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={disabled}
          className="rounded-md bg-orange-500 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={onExportJson}
          disabled={disabled}
          className="rounded-md bg-orange-500 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-950 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onCopyCsv}
          disabled={disabled}
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy CSV
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          disabled={disabled}
          className="rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-xs font-black uppercase tracking-wide text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Copy JSON
        </button>
      </div>

      {disabled ? (
        <p className="rounded-md border border-dashed border-slate-700 bg-slate-950/50 p-3 text-sm text-slate-500">
          Add at least one event to export.
        </p>
      ) : null}

      {!disabled ? (
        <div className="space-y-1 text-sm">
          <p className="text-slate-400">Fallback links if download is blocked:</p>
          <button
            type="button"
            onClick={onOpenCsv}
            className="mr-4 font-bold text-sky-300 underline hover:text-sky-200"
          >
            Open CSV
          </button>
          <span className="mr-4 text-slate-600">|</span>
          <button
            type="button"
            onClick={onOpenJson}
            className="font-bold text-sky-300 underline hover:text-sky-200"
          >
            Open JSON
          </button>
        </div>
      ) : null}

      {!disabled ? (
        <div className="grid gap-3">
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            CSV manual fallback
            <textarea
              readOnly
              value={csvContent}
              className="mt-1 h-24 w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs font-normal normal-case tracking-normal text-slate-200 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </label>
          <label className="text-xs font-black uppercase tracking-wide text-slate-400">
            JSON manual fallback
            <textarea
              readOnly
              value={jsonContent}
              className="mt-1 h-24 w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-xs font-normal normal-case tracking-normal text-slate-200 outline-none focus:ring-2 focus:ring-orange-400"
            />
          </label>
        </div>
      ) : null}

      {exportMessage ? <p className="text-sm font-semibold text-sky-200">{exportMessage}</p> : null}
    </section>
  );
}
