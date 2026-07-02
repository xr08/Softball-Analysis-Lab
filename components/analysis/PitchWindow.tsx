import { CountSelector } from "./CountSelector";
import { ContactContextSelector } from "./ContactContextSelector";
import { PitchLocationSelector } from "./PitchLocationSelector";
import { PitchResultSelector } from "./PitchResultSelector";
import { PitchTypeSelector } from "./PitchTypeSelector";
import { ReactNode } from "react";
import { TaggedEvent } from "@/lib/analysis/types";
import {
  getPitchResultLabel,
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
  onBallsChange: (value: number | null) => void;
  onStrikesChange: (value: number | null) => void;
  onPitchResultChange: (value: TaggedEvent["pitchResult"]) => void;
  onPitchLocationChange: (zoneId: TaggedEvent["pitchLocation"], label: string | null) => void;
  onPitchTypeChange: (value: TaggedEvent["pitchType"]) => void;
  onContactTypeChange: (value: TaggedEvent["contactType"]) => void;
  onContactQualityChange: (value: TaggedEvent["contactQuality"]) => void;
  onPlayResultChange: (value: TaggedEvent["playResult"]) => void;
  children?: ReactNode;
};

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full border border-sky-500/40 bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-sky-200">
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
  onBallsChange,
  onStrikesChange,
  onPitchResultChange,
  onPitchLocationChange,
  onPitchTypeChange,
  onContactTypeChange,
  onContactQualityChange,
  onPlayResultChange,
  children
}: PitchWindowProps) {
  const contactTone = isContactContextPrimary(pitchResult) ? "emphasized" : "muted";

  return (
    <section className="rounded-lg border border-orange-500/40 bg-[#101720] p-3 shadow-xl shadow-black/20">
      <div className="mb-2 flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-400">Tagging Cockpit</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SummaryPill label="Result" value={getPitchResultLabel(pitchResult)} />
          {pitchType ? <SummaryPill label="Type" value={pitchType.replaceAll("_", " ")} /> : null}
        </div>
      </div>

      <div className="grid items-start gap-3 xl:grid-cols-[280px_minmax(640px,1fr)_340px] 2xl:grid-cols-[300px_minmax(760px,1fr)_360px]">
        <div className="order-2 grid min-w-0 gap-2 rounded-lg border border-slate-700 bg-slate-950/30 p-2.5 xl:order-1">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Batter Box</p>
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

        <div className="order-1 min-w-0 xl:order-2">
          {children}
        </div>

        <div className="order-3 grid min-w-0 gap-2 rounded-lg border border-slate-700 bg-slate-950/30 p-2.5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-300">Pitcher Box</p>
          <PitchResultSelector value={pitchResult} onChange={onPitchResultChange} compact />
          <PitchTypeSelector value={pitchType} onChange={onPitchTypeChange} compact />
          <PitchLocationSelector
            value={pitchLocation}
            onChange={onPitchLocationChange}
            compact
            countControl={
              <CountSelector
                balls={balls}
                strikes={strikes}
                onBallsChange={onBallsChange}
                onStrikesChange={onStrikesChange}
                compact
                embedded
              />
            }
          />
        </div>
      </div>
    </section>
  );
}
