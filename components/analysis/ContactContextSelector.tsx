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
      ? "border-emerald-200 bg-emerald-50/40"
      : tone === "muted"
        ? "border-slate-200 bg-slate-50/70"
        : "border-slate-200 bg-white";
  const accentClasses =
    tone === "emphasized"
      ? "border-emerald-300 bg-emerald-100 text-emerald-950"
      : "border-slate-300 bg-slate-100 text-slate-800";
  const playResultHasFallbackValue = Boolean(playResult) && !PLAY_RESULT_OPTIONS.some((option) => option.value === playResult);
  const fallbackPlayResultValue = playResultHasFallbackValue ? playResult ?? "" : "";

  function renderChipGroup<T extends string>(
    label: string,
    value: T | null,
    options: Array<{ value: T; label: string }>,
    onChange: (next: T | null) => void
  ) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded-md border border-slate-300 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange(option.value)}
                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  selected
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
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
    <section className={`rounded-lg border p-4 ${sectionTone} ${compact ? "p-3" : "p-4"}`}>
      <div className="mb-3">
        <h2 className={`font-semibold text-slate-900 ${compact ? "text-base" : "text-lg"}`}>Contact & Result</h2>
        <p className="text-xs text-slate-500">
          Keep these details optional unless the pitch result makes contact context important.
        </p>
      </div>
      <div className="grid gap-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.2fr)]">
          {renderChipGroup("Contact Direction", contactType, CONTACT_TYPE_OPTIONS, onContactTypeChange)}
          {renderChipGroup("Contact Quality", contactQuality, CONTACT_QUALITY_OPTIONS, onContactQualityChange)}
          {renderChipGroup("At-Bat Result", playResult, PLAY_RESULT_OPTIONS, onPlayResultChange)}
        </div>

        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${accentClasses}`}>
            Direction: {getContactTypeLabel(contactType)}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${accentClasses}`}>
            Quality: {getContactQualityLabel(contactQuality)}
          </span>
          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${accentClasses}`}>
            Result: {getPlayResultLabel(playResult)}
          </span>
        </div>

        <label className="flex max-w-sm flex-col gap-1 text-sm text-slate-700">
          Fallback play result picker
          <select
            value={playResult || ""}
            onChange={(e) => {
              const val = e.target.value;
              onPlayResultChange(val === "" ? null : (val as TaggedEvent["playResult"]));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
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
          <span className="text-xs text-slate-500">Use this only if the quick buttons are not the fastest fit.</span>
        </label>
      </div>
    </section>
  );
}
