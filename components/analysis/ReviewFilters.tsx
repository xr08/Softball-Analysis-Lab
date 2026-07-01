"use client";

import { STAGE_1_TAGS } from "@/lib/analysis/tags";
import {
  type ReviewFilters as ReviewFiltersType,
  REVIEW_PRESETS,
  emptyFilters,
  applyPreset,
  hasActiveFilters
} from "@/lib/analysis/review";
import { TaggedEvent } from "@/lib/analysis/types";

type ReviewFiltersProps = {
  filters: ReviewFiltersType;
  onChange: (updated: ReviewFiltersType) => void;
};

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((candidate) => candidate !== value) : [...arr, value];
}

function ToggleButton({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-black transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 ${
        active
          ? "border-orange-400 bg-orange-500 text-slate-950"
          : "border-slate-600 bg-slate-900 text-slate-200 hover:border-sky-400 hover:bg-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

export function ReviewFilters({ filters, onChange }: ReviewFiltersProps) {
  const active = hasActiveFilters(filters);
  const groupedTags = STAGE_1_TAGS.reduce<Record<string, typeof STAGE_1_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  const pitchResults: Array<{ value: TaggedEvent["pitchResult"]; label: string }> = [
    { value: "called_strike", label: "Called Strike" },
    { value: "swinging_strike", label: "Swinging Strike" },
    { value: "foul", label: "Foul" },
    { value: "ball", label: "Ball" },
    { value: "ball_in_play", label: "Ball in Play" },
    { value: "hit_by_pitch", label: "Hit by Pitch" },
    { value: "wild_pitch", label: "Wild Pitch" }
  ];

  const zones: Array<{ value: TaggedEvent["pitchLocation"]; label: string }> = [
    { value: "zone_1", label: "Z1" },
    { value: "zone_2", label: "Z2" },
    { value: "zone_3", label: "Z3" },
    { value: "zone_4", label: "Z4" },
    { value: "zone_5", label: "Z5" },
    { value: "zone_6", label: "Z6" },
    { value: "zone_7", label: "Z7" },
    { value: "zone_8", label: "Z8" },
    { value: "zone_9", label: "Z9" },
    { value: "high", label: "High" },
    { value: "low", label: "Low" },
    { value: "inside", label: "Inside" },
    { value: "outside", label: "Outside" }
  ];

  const contactDirections: Array<{ value: TaggedEvent["contactType"]; label: string }> = [
    { value: "pull", label: "Pull" },
    { value: "middle", label: "Middle" },
    { value: "opposite", label: "Opposite" }
  ];

  const contactQualities: Array<{ value: TaggedEvent["contactQuality"]; label: string }> = [
    { value: "hard", label: "Hard" },
    { value: "medium", label: "Medium" },
    { value: "weak", label: "Weak" }
  ];

  const atBatResults: Array<{ value: TaggedEvent["playResult"]; label: string }> = [
    { value: "single", label: "Single" },
    { value: "double", label: "Double" },
    { value: "triple", label: "Triple" },
    { value: "home_run", label: "Home Run" },
    { value: "walk", label: "Walk" },
    { value: "strikeout", label: "Strikeout" },
    { value: "field_out", label: "Field Out" },
    { value: "fielders_choice", label: "Fielder's Choice" },
    { value: "reached_on_error", label: "Reached on Error" },
    { value: "sacrifice", label: "Sacrifice" },
    { value: "hit_by_pitch", label: "HBP" }
  ];

  return (
    <section className="rounded-lg border border-slate-700 bg-[#101720] p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Review Query</p>
          <h2 className="mt-1 text-lg font-black text-white">
            Review Filters
            {active ? (
              <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-black text-slate-950">
                Active
              </span>
            ) : null}
          </h2>
        </div>
        {active ? (
          <button
            type="button"
            onClick={() => onChange(emptyFilters())}
            className="rounded-md border border-slate-600 bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-wide text-slate-200 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Clear All
          </button>
        ) : null}
      </div>

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-black uppercase tracking-wide text-slate-500">Quick Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(applyPreset(preset))}
              className="rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 text-xs font-black text-sky-200 hover:bg-sky-500/20 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedTags).map(([category, tags]) => (
          <FilterSection key={category} label={`Tag - ${category}`}>
            {tags.map((tag) => (
              <ToggleButton
                key={tag.id}
                active={filters.tagIds.includes(tag.id)}
                onClick={() => onChange({ ...filters, tagIds: toggleInArray(filters.tagIds, tag.id) })}
              >
                {tag.label}
              </ToggleButton>
            ))}
          </FilterSection>
        ))}

        <FilterSection label="Pitch Result">
          {pitchResults.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.pitchResults.includes(value)}
              onClick={() => onChange({ ...filters, pitchResults: toggleInArray(filters.pitchResults, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        <FilterSection label="Pitch Location">
          {zones.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.pitchLocationZones.includes(value)}
              onClick={() => onChange({ ...filters, pitchLocationZones: toggleInArray(filters.pitchLocationZones, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        <div>
          <p className="mb-1.5 text-xs font-black uppercase tracking-wide text-slate-500">Count</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Balls
              <select
                value={filters.ballsFilter ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onChange({ ...filters, ballsFilter: value === "" ? null : Number(value) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 text-sm font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Strikes
              <select
                value={filters.strikesFilter ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  onChange({ ...filters, strikesFilter: value === "" ? null : Number(value) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 text-sm font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Any</option>
                {[0, 1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>

        <FilterSection label="Contact Direction">
          {contactDirections.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.contactDirections.includes(value)}
              onClick={() => onChange({ ...filters, contactDirections: toggleInArray(filters.contactDirections, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        <FilterSection label="Contact Quality">
          {contactQualities.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.contactQualities.includes(value)}
              onClick={() => onChange({ ...filters, contactQualities: toggleInArray(filters.contactQualities, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        <FilterSection label="At-Bat Result">
          {atBatResults.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.results.includes(value)}
              onClick={() => onChange({ ...filters, results: toggleInArray(filters.results, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        <div>
          <label htmlFor="review-text-search" className="mb-1.5 block text-xs font-black uppercase tracking-wide text-slate-500">
            Text Search
          </label>
          <input
            id="review-text-search"
            type="text"
            value={filters.textSearch}
            onChange={(event) => onChange({ ...filters, textSearch: event.target.value })}
            placeholder="Search tag label or note..."
            className="w-full rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          />
        </div>
      </div>
    </section>
  );
}
