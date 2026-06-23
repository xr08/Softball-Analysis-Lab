type SessionDetailsProps = {
  playerName: string;
  sessionName: string;
  sessionDate: string;
  opponent: string;
  onPlayerNameChange: (value: string) => void;
  onSessionNameChange: (value: string) => void;
  onSessionDateChange: (value: string) => void;
  onOpponentChange: (value: string) => void;
};

export function SessionDetails({
  playerName,
  sessionName,
  sessionDate,
  opponent,
  onPlayerNameChange,
  onSessionNameChange,
  onSessionDateChange,
  onOpponentChange
}: SessionDetailsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Session Details</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Player name
          <input
            type="text"
            value={playerName}
            onChange={(event) => onPlayerNameChange(event.target.value)}
            placeholder="Player A"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Session name
          <input
            type="text"
            value={sessionName}
            onChange={(event) => onSessionNameChange(event.target.value)}
            placeholder="Test Session"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Session date
          <input
            type="date"
            value={sessionDate}
            onChange={(event) => onSessionDateChange(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Opponent / Context
          <input
            type="text"
            value={opponent}
            onChange={(event) => onOpponentChange(event.target.value)}
            placeholder="e.g. Finals vs Red Sox"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
      </div>
    </section>
  );
}
