import { useState } from "react";
import { AtBat, Player, TaggedEvent } from "@/lib/analysis/types";
import { getTimelineEventDisplayData } from "@/lib/analysis/workflow";
import { getPitchResultOptionsForValue } from "@/lib/analysis/pitch-window";
import { PitchLocationSelector } from "./PitchLocationSelector";
import { ContactContextSelector } from "./ContactContextSelector";

type TimelineEventItemProps = {
  event: TaggedEvent;
  player?: Player;
  relatedPlayer?: Player;
  atBat?: AtBat;
  /** Compact segment label for grouped timeline display */
  pitchLabel?: string;
  onSeek: (timestampSeconds: number) => void;
  onUpdateEvent: (updatedEvent: TaggedEvent) => void;
  onDeleteEvent: (id: string) => void;
  /** When true, renders a highlight ring to indicate this is the current review event */
  isSelected?: boolean;
};

export function TimelineEventItem({ event, player, relatedPlayer, atBat, pitchLabel, onSeek, onUpdateEvent, onDeleteEvent, isSelected = false }: TimelineEventItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const display = getTimelineEventDisplayData(
    event,
    [player, relatedPlayer].filter((candidate): candidate is Player => Boolean(candidate)),
    atBat ? [atBat] : []
  );
  const pitchResultOptions = getPitchResultOptionsForValue(event.pitchResult);

  const handleUpdate = (updates: Partial<TaggedEvent>) => {
    onUpdateEvent({ ...event, ...updates });
  };

  const handleCountChange = (val: string) => {
    // Validate simple format like "0-0"
    if (val === "") {
      handleUpdate({ pitchCount: null });
    } else if (/^[0-3]-[0-2]$/.test(val)) {
      handleUpdate({ pitchCount: val });
    }
  };

  return (
    <li className={`rounded-md border p-3 transition-colors ${
      isSelected
        ? "border-orange-400 bg-orange-500/10 ring-2 ring-orange-400/50"
        : "border-slate-700 bg-slate-950/50"
    }`}>
      {pitchLabel ? (
        <p className="mb-1 truncate text-xs font-semibold text-slate-300">{pitchLabel}</p>
      ) : null}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSeek(event.timestampSeconds)}
          className="rounded-md bg-orange-500 px-2 py-1 text-xs font-black text-slate-950 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          {event.timestampLabel}
        </button>
        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-xs font-black capitalize text-sky-200">
          {event.eventRole}
        </span>
        <span className="text-sm font-bold text-slate-100">{event.tag}</span>
        <span className="text-xs text-slate-500">{event.category}</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded px-2 py-1 text-xs font-bold text-slate-400 hover:bg-slate-800 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            {isEditing ? "Close Editor" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onDeleteEvent(event.id)}
            className="rounded px-2 py-1 text-xs font-bold text-red-300 hover:bg-red-950/50 focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            Delete
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <div><span className="font-semibold">Player:</span> {display.playerName}</div>
          <div><span className="font-semibold">Related:</span> {display.relatedPlayerName}</div>
          <div><span className="font-semibold">Team:</span> {display.teamLabel}</div>
          <div><span className="font-semibold">At-Bat:</span> {display.atBatLabel === "None" ? "None" : `${display.atBatLabel} (${display.atBatStatus})`}</div>
          <div><span className="font-semibold">Count:</span> {event.pitchCount ?? "Unknown"}</div>
          {event.pitchResult && <div><span className="font-semibold">Pitch:</span> {event.pitchResult.replace("_", " ")}</div>}
          {event.pitchLocation && <div><span className="font-semibold">Location:</span> {event.pitchLocation}</div>}
          {event.contactType && <div><span className="font-semibold">Direction:</span> {event.contactType}</div>}
          {event.contactQuality && <div><span className="font-semibold">Quality:</span> {event.contactQuality}</div>}
          {event.playResult && <div><span className="font-semibold">Result:</span> {event.playResult.replace(/_/g, " ")}</div>}
        </div>
      ) : (
        <div className="mb-3 rounded-md border border-slate-700 bg-slate-950/80 p-3 shadow-inner">
          <h3 className="mb-2 text-sm font-black uppercase tracking-wide text-slate-300">Edit Context Snapshot</h3>
          
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Count (e.g., 2-1)
              <input
                type="text"
                defaultValue={event.pitchCount || ""}
                onBlur={(e) => handleCountChange(e.target.value)}
                placeholder="Balls-Strikes (0-3)-(0-2)"
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 font-normal normal-case tracking-normal text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Pitch Result
              <select
                value={event.pitchResult || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ pitchResult: val === "" ? null : (val as TaggedEvent["pitchResult"]) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Unknown</option>
                {pitchResultOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mb-3">
            <PitchLocationSelector
              value={event.pitchLocation}

              onChange={(zoneId, label) => handleUpdate({ pitchLocation: zoneId })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Contact Direction
              <select
                value={event.contactType || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ contactType: val === "" ? null : (val as TaggedEvent["contactType"]) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Unknown</option>
                <option value="pull">Pull</option>
                <option value="middle">Middle</option>
                <option value="opposite">Opposite</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              Contact Quality
              <select
                value={event.contactQuality || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ contactQuality: val === "" ? null : (val as TaggedEvent["contactQuality"]) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Unknown</option>
                <option value="hard">Hard</option>
                <option value="medium">Medium</option>
                <option value="weak">Weak</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
              At-Bat Result
              <select
                value={event.playResult || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ playResult: val === "" ? null : (val as TaggedEvent["playResult"]) });
                }}
                className="rounded border border-slate-600 bg-[#0a0f16] px-2 py-1 font-normal normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
              >
                <option value="">Unknown</option>
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
        </div>
      )}

      <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
        Note
        <input
          type="text"
          value={event.note}
          onChange={(e) => handleUpdate({ note: e.target.value })}
          placeholder="Add coaching note..."
          className="rounded-md border border-slate-600 bg-[#0a0f16] px-2 py-1 text-sm font-normal normal-case tracking-normal text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
        />
      </label>
    </li>
  );
}
