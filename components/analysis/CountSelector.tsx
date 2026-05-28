type CountSelectorProps = {
  balls: number;
  strikes: number;
  onBallsChange: (value: number) => void;
  onStrikesChange: (value: number) => void;
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
            value={balls}
            onChange={(event) => onBallsChange(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
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
            value={strikes}
            onChange={(event) => onStrikesChange(Number(event.target.value))}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            {[0, 1, 2].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-sm text-slate-700">
        Current count: {balls}-{strikes}
      </p>
    </section>
  );
}
