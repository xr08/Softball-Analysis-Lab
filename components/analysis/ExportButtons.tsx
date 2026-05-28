type ExportButtonsProps = {
  onExportCsv: () => void;
  onExportJson: () => void;
  onCopyCsv: () => void;
  onCopyJson: () => void;
  csvUrl: string | null;
  jsonUrl: string | null;
  csvFileName: string;
  jsonFileName: string;
  csvContent: string;
  jsonContent: string;
  exportMessage: string;
  disabled?: boolean;
};

export function ExportButtons({
  onExportCsv,
  onExportJson,
  onCopyCsv,
  onCopyJson,
  csvUrl,
  jsonUrl,
  csvFileName,
  jsonFileName,
  csvContent,
  jsonContent,
  exportMessage,
  disabled = false
}: ExportButtonsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Export</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onExportCsv}
          disabled={disabled}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export CSV
        </button>
        <button
          type="button"
          onClick={onExportJson}
          disabled={disabled}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={onCopyCsv}
          disabled={disabled}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Copy CSV
        </button>
        <button
          type="button"
          onClick={onCopyJson}
          disabled={disabled}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Copy JSON
        </button>
      </div>
      {disabled ? (
        <p className="mt-3 text-sm text-slate-600">Add at least one event to export.</p>
      ) : null}
      {!disabled ? (
        <div className="mt-3 space-y-1 text-sm">
          <p className="text-slate-700">Fallback links (if download button is blocked):</p>
          <a
            href={csvUrl ?? "#"}
            download={csvFileName}
            target="_blank"
            rel="noopener noreferrer"
            className="mr-4 text-emerald-700 underline"
          >
            Open CSV
          </a>
          <span className="mr-4 text-slate-400">|</span>
          <a
            href={jsonUrl ?? "#"}
            download={jsonFileName}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 underline"
          >
            Open JSON
          </a>
        </div>
      ) : null}
      {!disabled ? (
        <div className="mt-4 grid gap-3">
          <label className="text-sm font-medium text-slate-800">
            CSV manual fallback (select text and copy)
            <textarea
              readOnly
              value={csvContent}
              className="mt-1 h-24 w-full rounded-md border border-slate-300 bg-slate-50 p-2 font-mono text-xs text-slate-900"
            />
          </label>
          <label className="text-sm font-medium text-slate-800">
            JSON manual fallback (select text and copy)
            <textarea
              readOnly
              value={jsonContent}
              className="mt-1 h-24 w-full rounded-md border border-slate-300 bg-slate-50 p-2 font-mono text-xs text-slate-900"
            />
          </label>
        </div>
      ) : null}
      {exportMessage ? <p className="mt-3 text-sm text-slate-700">{exportMessage}</p> : null}
    </section>
  );
}
