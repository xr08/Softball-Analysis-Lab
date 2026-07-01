import { TaggedEvent } from "@/lib/analysis/types";
import {
  BATTER_DIRECTION_POWER_BUTTONS,
  BATTER_ON_BASE_BUTTONS,
  BATTER_OUT_BUTTONS,
  BatterContextButton,
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

  function isButtonSelected(button: BatterContextButton): boolean {
    if (button.kind === "contactType") return contactType === button.value;
    if (button.kind === "contactQuality") return contactQuality === button.value;
    if (button.kind === "playResult") return playResult === button.value;
    return false;
  }

  function handleButtonClick(button: BatterContextButton): void {
    if (button.kind === "contactType") {
      onContactTypeChange(button.value);
      return;
    }
    if (button.kind === "contactQuality") {
      onContactQualityChange(button.value);
      return;
    }
    if (button.kind === "playResult") {
      onPlayResultChange(button.value);
    }
  }

  function renderButton(button: BatterContextButton) {
    const selected = isButtonSelected(button);
    const placeholder = button.kind === "placeholder";

    return (
      <button
        key={button.id}
        type="button"
        aria-pressed={placeholder ? undefined : selected}
        aria-disabled={placeholder}
        disabled={placeholder}
        title={placeholder ? "Placeholder only. This outcome is not wired to the current export schema yet." : undefined}
        onClick={() => handleButtonClick(button)}
        className={`min-h-8 rounded-md border px-1.5 py-1 text-[10px] font-black leading-tight transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
          placeholder
            ? "cursor-not-allowed border-dashed border-slate-700 bg-slate-950 text-slate-600"
            : selected
              ? "border-orange-400 bg-orange-500 text-slate-950"
              : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
        }`}
      >
        {button.label}
      </button>
    );
  }

  function renderSection({
    label,
    buttons,
    onClear
  }: {
    label: string;
    buttons: BatterContextButton[];
    onClear: () => void;
  }) {
    return (
      <section className="rounded-lg border border-slate-700 bg-slate-950/50 p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-100">{label}</h2>
          <button
            type="button"
            onClick={onClear}
            className="rounded px-2 py-1 text-xs font-black uppercase tracking-wide text-slate-500 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Clear
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1">{buttons.map(renderButton)}</div>
      </section>
    );
  }

  return (
    <section className={`rounded-lg border ${sectionTone} ${compact ? "p-2.5" : "p-4"}`}>
      <div className="grid gap-2">
        {renderSection({
          label: "Direction + Power",
          buttons: BATTER_DIRECTION_POWER_BUTTONS,
          onClear: () => {
            onContactTypeChange(null);
            onContactQualityChange(null);
          }
        })}
        {renderSection({
          label: "On Base",
          buttons: BATTER_ON_BASE_BUTTONS,
          onClear: () => onPlayResultChange(null)
        })}
        {renderSection({
          label: "Out",
          buttons: BATTER_OUT_BUTTONS,
          onClear: () => onPlayResultChange(null)
        })}

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

        <details>
          <summary className="cursor-pointer list-none text-[11px] font-black uppercase tracking-wide text-slate-500 hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-400">
            Fallback Result Picker
          </summary>
          <label className="mt-2 flex max-w-xs flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
            Imported / unusual result
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
          </label>
        </details>
      </div>
    </section>
  );
}
