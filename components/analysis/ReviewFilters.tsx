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

// ---------------------------------------------------------------------------
// Multi-toggle helper
// ---------------------------------------------------------------------------

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
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
      className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function FilterSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ReviewFilters({ filters, onChange }: ReviewFiltersProps) {
  const active = hasActiveFilters(filters);

  // --- Tag toggles (from registry, not hardcoded) ---
  const groupedTags = STAGE_1_TAGS.reduce<Record<string, typeof STAGE_1_TAGS>>((acc, tag) => {
    if (!acc[tag.category]) acc[tag.category] = [];
    acc[tag.category].push(tag);
    return acc;
  }, {});

  const PITCH_RESULTS: Array<{ value: TaggedEvent["pitchResult"]; label: string }> = [
    { value: "called_strike", label: "Called Strike" },
    { value: "swinging_strike", label: "Swinging Strike" },
    { value: "foul", label: "Foul" },
    { value: "ball", label: "Ball" },
    { value: "ball_in_play", label: "Ball in Play" },
    { value: "hit_by_pitch", label: "Hit by Pitch" }
  ];

  const ZONES: Array<{ value: TaggedEvent["pitchLocation"]; label: string }> = [
    { value: "zone_1", label: "Z1" }, { value: "zone_2", label: "Z2" }, { value: "zone_3", label: "Z3" },
    { value: "zone_4", label: "Z4" }, { value: "zone_5", label: "Z5" }, { value: "zone_6", label: "Z6" },
    { value: "zone_7", label: "Z7" }, { value: "zone_8", label: "Z8" }, { value: "zone_9", label: "Z9" },
    { value: "high", label: "High" }, { value: "low", label: "Low" },
    { value: "inside", label: "Inside" }, { value: "outside", label: "Outside" }
  ];

  const CONTACT_DIRECTIONS: Array<{ value: TaggedEvent["contactType"]; label: string }> = [
    { value: "pull", label: "Pull" },
    { value: "middle", label: "Middle" },
    { value: "opposite", label: "Opposite" }
  ];

  const CONTACT_QUALITIES: Array<{ value: TaggedEvent["contactQuality"]; label: string }> = [
    { value: "hard", label: "Hard" },
    { value: "medium", label: "Medium" },
    { value: "weak", label: "Weak" }
  ];

  const AT_BAT_RESULTS: Array<{ value: TaggedEvent["playResult"]; label: string }> = [
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
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          Review Filters
          {active && (
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
              Active
            </span>
          )}
        </h2>
        {active && (
          <button
            type="button"
            onClick={() => onChange(emptyFilters())}
            className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Presets */}
      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Quick Presets</p>
        <div className="flex flex-wrap gap-1.5">
          {REVIEW_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onChange(applyPreset(preset))}
              className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 hover:bg-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {/* Tags — grouped by category */}
        {Object.entries(groupedTags).map(([category, tags]) => (
          <FilterSection key={category} label={`Tag — ${category}`}>
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

        {/* Pitch result */}
        <FilterSection label="Pitch Result">
          {PITCH_RESULTS.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.pitchResults.includes(value)}
              onClick={() => onChange({ ...filters, pitchResults: toggleInArray(filters.pitchResults, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* Pitch location */}
        <FilterSection label="Pitch Location">
          {ZONES.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.pitchLocationZones.includes(value)}
              onClick={() => onChange({ ...filters, pitchLocationZones: toggleInArray(filters.pitchLocationZones, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* Count */}
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">Count</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col gap-0.5 text-xs text-slate-700">
              Balls (0–3)
              <select
                value={filters.ballsFilter ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ ...filters, ballsFilter: val === "" ? null : Number(val) });
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any</option>
                {[0, 1, 2, 3].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-0.5 text-xs text-slate-700">
              Strikes (0–2)
              <select
                value={filters.strikesFilter ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({ ...filters, strikesFilter: val === "" ? null : Number(val) });
                }}
                className="rounded border border-slate-300 bg-white px-2 py-1 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Any</option>
                {[0, 1, 2].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        </div>



        {/* Contact direction */}
        <FilterSection label="Contact Direction">
          {CONTACT_DIRECTIONS.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.contactDirections.includes(value)}
              onClick={() => onChange({ ...filters, contactDirections: toggleInArray(filters.contactDirections, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* Contact quality */}
        <FilterSection label="Contact Quality">
          {CONTACT_QUALITIES.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.contactQualities.includes(value)}
              onClick={() => onChange({ ...filters, contactQualities: toggleInArray(filters.contactQualities, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* At-bat result */}
        <FilterSection label="At-Bat Result">
          {AT_BAT_RESULTS.map(({ value, label }) => (
            <ToggleButton
              key={label}
              active={filters.results.includes(value)}
              onClick={() => onChange({ ...filters, results: toggleInArray(filters.results, value) })}
            >
              {label}
            </ToggleButton>
          ))}
        </FilterSection>

        {/* Text search */}
        <div>
          <label htmlFor="review-text-search" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Text Search
          </label>
          <input
            id="review-text-search"
            type="text"
            value={filters.textSearch}
            onChange={(e) => onChange({ ...filters, textSearch: e.target.value })}
            placeholder="Search tag label or note…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </section>
  );
}
