import { CountSelector } from "./CountSelector";
import { ContactContextSelector } from "./ContactContextSelector";
import { PitchLocationSelector } from "./PitchLocationSelector";
import { PitchResultSelector } from "./PitchResultSelector";
import { PitchTypeSelector } from "./PitchTypeSelector";
import { TaggedEvent } from "@/lib/analysis/types";
import {
  getPitchResultLabel,
  getPitchWindowGuidance,
  isContactContextPrimary
} from "@/lib/analysis/pitch-window";

type PitchWindowProps = {
  balls: number | null;
  strikes: number | null;
  pitchResult: TaggedEvent["pitchResult"];
  pitchLocation: TaggedEvent["pitchLocation"];
  pitchType: TaggedEvent["pitchType"];
  contactType: TaggedEvent["contactType"];
  contactQuality: TaggedEvent["contactQuality"];
  playResult: TaggedEvent["playResult"];
  showPitchType: boolean;
  onBallsChange: (value: number | null) => void;
  onStrikesChange: (value: number | null) => void;
  onPitchResultChange: (value: TaggedEvent["pitchResult"]) => void;
  onPitchLocationChange: (zoneId: TaggedEvent["pitchLocation"], label: string | null) => void;
  onPitchTypeChange: (value: TaggedEvent["pitchType"]) => void;
  onContactTypeChange: (value: TaggedEvent["contactType"]) => void;
  onContactQualityChange: (value: TaggedEvent["contactQuality"]) => void;
  onPlayResultChange: (value: TaggedEvent["playResult"]) => void;
};

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900">
      {label}: {value}
    </span>
  );
}

export function PitchWindow({
  balls,
  strikes,
  pitchResult,
  pitchLocation,
  pitchType,
  contactType,
  contactQuality,
  playResult,
  showPitchType,
  onBallsChange,
  onStrikesChange,
  onPitchResultChange,
  onPitchLocationChange,
  onPitchTypeChange,
  onContactTypeChange,
  onContactQualityChange,
  onPlayResultChange
}: PitchWindowProps) {
  const countLabel = balls !== null && strikes !== null ? `${balls}-${strikes}` : "Unknown";
  const contactTone = isContactContextPrimary(pitchResult) ? "emphasized" : "muted";

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-3 flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Pitch Window</h2>
          <p className="mt-0.5 max-w-3xl text-xs text-slate-600">{getPitchWindowGuidance(pitchResult)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SummaryPill label="Result" value={getPitchResultLabel(pitchResult)} />
          <SummaryPill label="Count" value={countLabel} />
          {pitchType ? <SummaryPill label="Type" value={pitchType.replaceAll("_", " ")} /> : null}
        </div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <div className="grid gap-3">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_240px] xl:grid-cols-[minmax(0,1fr)_220px]">
            <PitchResultSelector value={pitchResult} onChange={onPitchResultChange} compact />
            <CountSelector
              balls={balls}
              strikes={strikes}
              onBallsChange={onBallsChange}
              onStrikesChange={onStrikesChange}
              compact
            />
          </div>
          {showPitchType ? (
            <PitchTypeSelector value={pitchType} onChange={onPitchTypeChange} compact />
          ) : (
            <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-1.5 text-xs text-slate-500">
              Pitch type is hidden for this session type.
            </p>
          )}
        </div>

        <div className="grid gap-3">
          <PitchLocationSelector value={pitchLocation} onChange={onPitchLocationChange} compact />
          <ContactContextSelector
            contactType={contactType}
            contactQuality={contactQuality}
            playResult={playResult}
            onContactTypeChange={onContactTypeChange}
            onContactQualityChange={onContactQualityChange}
            onPlayResultChange={onPlayResultChange}
            compact
            tone={contactTone}
          />
        </div>
      </div>
    </section>
  );
}
