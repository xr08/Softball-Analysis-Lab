import { TaggedEvent } from "@/lib/analysis/types";

type ContactContextSelectorProps = {
  contactType: TaggedEvent["contactType"];
  contactQuality: TaggedEvent["contactQuality"];
  playResult: TaggedEvent["playResult"];
  onContactTypeChange: (val: TaggedEvent["contactType"]) => void;
  onContactQualityChange: (val: TaggedEvent["contactQuality"]) => void;
  onPlayResultChange: (val: TaggedEvent["playResult"]) => void;
};

export function ContactContextSelector({
  contactType,
  contactQuality,
  playResult,
  onContactTypeChange,
  onContactQualityChange,
  onPlayResultChange,
}: ContactContextSelectorProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Contact & Result</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Contact Direction
          <select
            value={contactType || ""}
            onChange={(e) => {
              const val = e.target.value;
              onContactTypeChange(val === "" ? null : (val as TaggedEvent["contactType"]));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown / Clear</option>
            <option value="pull">Pull</option>
            <option value="middle">Middle</option>
            <option value="opposite">Opposite</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Contact Quality
          <select
            value={contactQuality || ""}
            onChange={(e) => {
              const val = e.target.value;
              onContactQualityChange(val === "" ? null : (val as TaggedEvent["contactQuality"]));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown / Clear</option>
            <option value="hard">Hard</option>
            <option value="medium">Medium</option>
            <option value="weak">Weak</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-slate-700">
          At-Bat Result
          <select
            value={playResult || ""}
            onChange={(e) => {
              const val = e.target.value;
              onPlayResultChange(val === "" ? null : (val as TaggedEvent["playResult"]));
            }}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="">Unknown / Clear</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="triple">Triple</option>
            <option value="home_run">Home Run</option>
            <option value="walk">Walk</option>
            <option value="strikeout">Strikeout</option>
            <option value="field_out">Field Out</option>
            <option value="fielders_choice">Fielder's Choice</option>
            <option value="reached_on_error">Reached on Error</option>
            <option value="sacrifice">Sacrifice</option>
            <option value="hit_by_pitch">Hit by Pitch</option>
          </select>
        </label>
      </div>
    </section>
  );
}
