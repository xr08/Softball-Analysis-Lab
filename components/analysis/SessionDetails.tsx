type SessionDetailsProps = {
  playerName: string;
  sessionName: string;
  sessionDate: string;
  opponent: string;
  batterHandedness: "right" | "left" | null;
  onPlayerNameChange: (value: string) => void;
  onSessionNameChange: (value: string) => void;
  onSessionDateChange: (value: string) => void;
  onOpponentChange: (value: string) => void;
  onBatterHandednessChange: (value: "right" | "left" | null) => void;
};

export function SessionDetails({
  playerName,
  sessionName,
  sessionDate,
  opponent,
  batterHandedness,
  onPlayerNameChange,
  onSessionNameChange,
  onSessionDateChange,
  onOpponentChange,
  onBatterHandednessChange
}: SessionDetailsProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Session Details</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
          Batter Handedness
          <select
            value={batterHandedness || ""}
            onChange={(event) => {
              const val = event.target.value;
              onBatterHandednessChange(val === "" ? null : (val as "right" | "left"));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown</option>
            <option value="right">Right-handed</option>
            <option value="left">Left-handed</option>
          </select>
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
