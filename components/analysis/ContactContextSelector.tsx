import { TaggedEvent } from "@/lib/analysis/types";
import {
  CONTACT_QUALITY_OPTIONS,
  CONTACT_TYPE_OPTIONS,
  getContactQualityLabel,
  getContactTypeLabel,
  getPlayResultLabel,
  PLAY_RESULT_OPTIONS
} from "@/lib/analysis/pitch-window";

type ContactContextSelectorProps = {
  contactType: TaggedEvent["contactType"];
  contactQuality: TaggedEvent["contactQuality"];
  playResult: TaggedEvent["playResult"];
  onContactTypeChange: (val: TaggedEvent["contactType"]) => void;
  onContactQualityChange: (val: TaggedEvent["contactQuality"]) => void;
  onPlayResultChange: (val: TaggedEvent["playResult"]) => void;
  compact?: boolean;
  tone?: "normal" | "muted" | "emphasized";
};

export function ContactContextSelector({
  contactType,
  contactQuality,
  playResult,
  onContactTypeChange,
  onContactQualityChange,
  onPlayResultChange,
  compact = false,
  tone = "normal"
}: ContactContextSelectorProps) {
  const sectionTone =
    tone === "emphasized"
      ? "border-orange-500/50 bg-orange-500/10"
      : tone === "muted"
        ? "border-slate-700 bg-slate-950/40"
        : "border-slate-700 bg-slate-950/50";
  const accentClasses =
    tone === "emphasized"
      ? "border-orange-400/60 bg-orange-500/20 text-orange-100"
      : "border-slate-600 bg-slate-900 text-slate-300";
  const playResultHasFallbackValue = Boolean(playResult) && !PLAY_RESULT_OPTIONS.some((option) => option.value === playResult);
  const fallbackPlayResultValue = playResultHasFallbackValue ? playResult ?? "" : "";

  function renderChipGroup<T extends string>(
    label: string,
    value: T | null,
    options: Array<{ value: T; label: string }>,
    onChange: (next: T | null) => void
  ) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-slate-500">{label}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 text-[11px] font-black uppercase tracking-wide text-slate-300 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className={`rounded-full border px-2.5 py-1 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
                  selected
                    ? "border-orange-400 bg-orange-500 text-slate-950"
                    : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className={`rounded-lg border ${sectionTone} ${compact ? "p-2.5" : "p-4"}`}>
      <div className="mb-2">
        <h2 className={`font-black text-slate-100 ${compact ? "text-base" : "text-lg"}`}>Contact & Result</h2>
        {!compact ? (
          <p className="text-xs text-slate-500">
            Keep these details optional unless the pitch result makes contact context important.
          </p>
        ) : null}
      </div>
      <div className="grid gap-3">
        <div className="grid gap-3 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)]">
          {renderChipGroup("Contact Direction", contactType, CONTACT_TYPE_OPTIONS, onContactTypeChange)}
          {renderChipGroup("Contact Quality", contactQuality, CONTACT_QUALITY_OPTIONS, onContactQualityChange)}
          {renderChipGroup("At-Bat Result", playResult, PLAY_RESULT_OPTIONS, onPlayResultChange)}
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${accentClasses}`}>
            Direction: {getContactTypeLabel(contactType)}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${accentClasses}`}>
            Quality: {getContactQualityLabel(contactQuality)}
          </span>
          <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${accentClasses}`}>
            Result: {getPlayResultLabel(playResult)}
          </span>
        </div>

        <label className="flex max-w-xs flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
          Fallback result picker
          <select
            value={playResult || ""}
            onChange={(e) => {
              const val = e.target.value;
              onPlayResultChange(val === "" ? null : (val as TaggedEvent["playResult"]));
            }}
            className="rounded-md border border-slate-600 bg-[#0a0f16] px-2 py-1.5 text-xs font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          >
            <option value="">Unknown / Clear</option>
            {PLAY_RESULT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {playResultHasFallbackValue ? (
              <option value={fallbackPlayResultValue}>{getPlayResultLabel(playResult)}</option>
            ) : null}
          </select>
          <span className="text-[11px] font-normal normal-case tracking-normal text-slate-500">Use only when the quick buttons are not the fastest fit.</span>
        </label>
      </div>
    </section>
  );
}
