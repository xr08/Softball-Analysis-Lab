type CountSelectorProps = {
  balls: number | null;
  strikes: number | null;
  onBallsChange: (value: number | null) => void;
  onStrikesChange: (value: number | null) => void;
  compact?: boolean;
};

export function CountSelector({
  balls,
  strikes,
  onBallsChange,
  onStrikesChange,
  compact = false
}: CountSelectorProps) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white ${compact ? "p-2.5" : "p-4"}`}>
      <h2 className={`mb-2 font-semibold text-slate-900 ${compact ? "text-sm" : "text-lg"}`}>Pitch Count</h2>
      <div className={`grid ${compact ? "gap-2" : "gap-3 sm:grid-cols-2"} ${compact ? "grid-cols-2" : ""}`}>
        <label className={`flex flex-col gap-1 text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
          Balls
          <select
            value={balls === null ? "" : balls}
            onChange={(event) =>
              onBallsChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className={`rounded-md border border-slate-300 bg-white text-slate-900 outline-none ring-emerald-500 focus:ring-2 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
          >
            <option value="">Unknown</option>
            {[0, 1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className={`flex flex-col gap-1 text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
          Strikes
          <select
            value={strikes === null ? "" : strikes}
            onChange={(event) =>
              onStrikesChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className={`rounded-md border border-slate-300 bg-white text-slate-900 outline-none ring-emerald-500 focus:ring-2 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
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
      <p className={`mt-2 text-slate-700 ${compact ? "text-xs" : "text-sm"}`}>
        Count: {balls !== null && strikes !== null ? `${balls}-${strikes}` : "Unknown"}
      </p>
    </section>
  );
}
