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
    <section className={`rounded-lg border border-slate-700 bg-slate-950/50 ${compact ? "p-2.5" : "p-4"}`}>
      <h2 className={`mb-2 font-black text-slate-100 ${compact ? "text-sm" : "text-lg"}`}>Pitch Count</h2>
      <div className={`grid ${compact ? "gap-2" : "gap-3 sm:grid-cols-2"} ${compact ? "grid-cols-2" : ""}`}>
        <label className={`flex flex-col gap-1 font-black uppercase tracking-wide text-slate-400 ${compact ? "text-xs" : "text-sm"}`}>
          Balls
          <select
            value={balls === null ? "" : balls}
            onChange={(event) =>
              onBallsChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className={`rounded-md border border-slate-600 bg-[#0a0f16] font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
          >
            <option value="">Unknown</option>
            {[0, 1, 2, 3].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className={`flex flex-col gap-1 font-black uppercase tracking-wide text-slate-400 ${compact ? "text-xs" : "text-sm"}`}>
          Strikes
          <select
            value={strikes === null ? "" : strikes}
            onChange={(event) =>
              onStrikesChange(event.target.value === "" ? null : Number(event.target.value))
            }
            className={`rounded-md border border-slate-600 bg-[#0a0f16] font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"}`}
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
      <p className={`mt-2 text-slate-400 ${compact ? "text-xs" : "text-sm"}`}>
        Count: {balls !== null && strikes !== null ? `${balls}-${strikes}` : "Unknown"}
      </p>
    </section>
  );
}
