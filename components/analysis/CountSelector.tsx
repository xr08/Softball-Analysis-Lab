type CountSelectorProps = {
  balls: number | null;
  strikes: number | null;
  onBallsChange: (value: number | null) => void;
  onStrikesChange: (value: number | null) => void;
  compact?: boolean;
  embedded?: boolean;
};

export function CountSelector({
  balls,
  strikes,
  onBallsChange,
  onStrikesChange,
  compact = false,
  embedded = false
}: CountSelectorProps) {
  const countLabel = balls !== null && strikes !== null ? `${balls}-${strikes}` : "Unknown";

  function renderMarkers({
    label,
    total,
    value,
    onChange,
    activeClass
  }: {
    label: string;
    total: number;
    value: number | null;
    onChange: (value: number | null) => void;
    activeClass: string;
  }) {
    return (
      <div className="grid gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-wide text-slate-500">{label}</span>
          <span className="font-mono text-xs font-black text-slate-200">{value ?? "-"}</span>
        </div>
        <div className={`grid gap-1 ${total === 4 ? "grid-cols-4" : "grid-cols-3"}`}>
          {Array.from({ length: total }, (_, index) => {
            const markerValue = index + 1;
            const filled = value !== null && markerValue <= value;
            return (
              <button
                key={markerValue}
                type="button"
                aria-label={`Set ${label.toLowerCase()} to ${markerValue}`}
                aria-pressed={value === markerValue}
                onClick={() => onChange(markerValue)}
                className={`${embedded ? "h-5 rounded-full text-[0px]" : "h-8 rounded-md text-xs"} border font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  filled
                    ? activeClass
                    : "border-slate-700 bg-slate-900 text-slate-500 hover:border-sky-400 hover:text-slate-200"
                }`}
              >
                {markerValue}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const body = (
    <>
      <div className={embedded ? "grid grid-cols-[1fr_auto_1fr] items-end gap-2" : compact ? "grid gap-2" : "grid gap-3 sm:grid-cols-2"}>
        {renderMarkers({
          label: "Balls",
          total: 4,
          value: balls,
          onChange: onBallsChange,
          activeClass: "border-emerald-300 bg-emerald-400 text-slate-950"
        })}
        {embedded ? (
          <span className="mb-0.5 rounded-md border border-orange-400/40 bg-orange-500/10 px-2 py-1 font-mono text-xs font-black text-orange-100">
            {countLabel}
          </span>
        ) : null}
        {renderMarkers({
          label: "Strikes",
          total: 3,
          value: strikes,
          onChange: onStrikesChange,
          activeClass: "border-rose-300 bg-rose-400 text-slate-950"
        })}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => {
            onBallsChange(0);
            onStrikesChange(0);
          }}
          className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          0-0
        </button>
        <button
          type="button"
          onClick={() => {
            onBallsChange(null);
            onStrikesChange(null);
          }}
          className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          Clear
        </button>
      </div>
    </>
  );

  if (embedded) {
    return (
      <div className="rounded-md border border-slate-700 bg-slate-950/60 p-2">
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Count</span>
          <span className="text-[10px] text-slate-500">Pitch result updates this</span>
        </div>
        {body}
      </div>
    );
  }

  return (
    <section className={`rounded-lg border border-slate-700 bg-slate-950/50 ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className={`font-black text-slate-100 ${compact ? "text-sm" : "text-lg"}`}>Pitch Count</h2>
        <span className="rounded-md border border-orange-400/40 bg-orange-500/10 px-2 py-1 font-mono text-sm font-black text-orange-100">
          {countLabel}
        </span>
      </div>
      {body}

      <p className="mt-2 text-[11px] text-slate-500">Pitch result buttons update this during active at-bats.</p>
    </section>
  );
}
