import { AnalysisEvent } from "@/lib/analysis/types";

type TimelineProps = {
  events: AnalysisEvent[];
  onSeek: (timestampSeconds: number) => void;
  onNoteChange: (id: string, note: string) => void;
};

export function Timeline({ events, onSeek, onNoteChange }: TimelineProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Timeline</h2>

      {events.length === 0 ? (
        <p className="text-sm text-slate-600">No events yet. Play video and click a tag.</p>
      ) : (
        <ul className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSeek(event.timestampSeconds)}
                  className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {event.timestampLabel}
                </button>
                <span className="text-sm font-medium text-slate-900">{event.tag}</span>
                <span className="text-xs text-slate-600">{event.category}</span>
              </div>

              <div className="mb-2 text-xs text-slate-600">
                Player: {event.playerName || "Unknown"} | Session:{" "}
                {event.sessionName || "Unnamed"}
              </div>
              <div className="mb-2 text-xs text-slate-600">Count: {event.countLabel}</div>

              <label className="flex flex-col gap-1 text-xs text-slate-700">
                Note
                <input
                  type="text"
                  value={event.note}
                  onChange={(inputEvent) => onNoteChange(event.id, inputEvent.target.value)}
                  placeholder="Add coaching note..."
                  className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
