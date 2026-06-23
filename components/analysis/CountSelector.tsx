type CountSelectorProps = {
  balls: number | null;
  strikes: number | null;
  onBallsChange: (value: number | null) => void;
  onStrikesChange: (value: number | null) => void;
};

export function CountSelector({
  balls,
  strikes,
  onBallsChange,
  onStrikesChange
}: CountSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Pitch Count</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Balls
          <select
            value={balls === null ? "" : balls}
            onChange={(event) =>
              onBallsChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown</option>
            {[0, 1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Strikes
          <select
            value={strikes === null ? "" : strikes}
            onChange={(event) =>
              onStrikesChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown</option>
            {[0, 1, 2].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-700">
        Current count: {balls !== null && strikes !== null ? `${balls}-${strikes}` : "Unknown"}
      </p>
    </section>
  );
}
