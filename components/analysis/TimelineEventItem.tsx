import { useState } from "react";
import { AnalysisEvent } from "@/lib/analysis/types";
import { PitchResultSelector } from "./PitchResultSelector";
import { PitchLocationSelector } from "./PitchLocationSelector";
import { ContactContextSelector } from "./ContactContextSelector";

type TimelineEventItemProps = {
  event: AnalysisEvent;
  onSeek: (timestampSeconds: number) => void;
  onUpdateEvent: (updatedEvent: AnalysisEvent) => void;
  onDeleteEvent: (id: string) => void;
  /** When true, renders a highlight ring to indicate this is the current review event */
  isSelected?: boolean;
};

export function TimelineEventItem({ event, onSeek, onUpdateEvent, onDeleteEvent, isSelected = false }: TimelineEventItemProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = (updates: Partial<AnalysisEvent>) => {
    onUpdateEvent({ ...event, ...updates });
  };

  const handleCountChange = (val: string) => {
    // Validate simple format like "0-0"
    if (val === "") {
      handleUpdate({ count: null });
    } else if (/^[0-3]-[0-2]$/.test(val)) {
      handleUpdate({ count: val });
    }
  };

  return (
    <li className={`rounded-md border p-3 transition-colors ${
      isSelected
        ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400"
        : "border-slate-200 bg-slate-50"
    }`}>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSeek(event.timestampSeconds)}
          className="rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {event.timestampLabel}
        </button>
        <span className="text-sm font-medium text-slate-900">{event.tagLabel}</span>
        <span className="text-xs text-slate-600">{event.category}</span>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200"
          >
            {isEditing ? "Close Editor" : "Edit"}
          </button>
          <button
            type="button"
            onClick={() => onDeleteEvent(event.id)}
            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {!isEditing ? (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mb-2">
          <div><span className="font-semibold">Count:</span> {event.count ?? "Unknown"}</div>
          {event.pitchResult && <div><span className="font-semibold">Pitch:</span> {event.pitchResult.replace("_", " ")}</div>}
          {event.pitchLocationLabel && <div><span className="font-semibold">Location:</span> {event.pitchLocationLabel}</div>}
          {event.contactDirection && <div><span className="font-semibold">Direction:</span> {event.contactDirection}</div>}
          {event.contactQuality && <div><span className="font-semibold">Quality:</span> {event.contactQuality}</div>}
          {event.result && <div><span className="font-semibold">Result:</span> {event.result.replace(/_/g, " ")}</div>}
        </div>
      ) : (
        <div className="mb-3 rounded-md border border-slate-300 bg-white p-3 shadow-inner">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">Edit Context Snapshot</h3>
          
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              Count (e.g., 2-1)
              <input
                type="text"
                defaultValue={event.count || ""}
                onBlur={(e) => handleCountChange(e.target.value)}
                placeholder="Balls-Strikes (0-3)-(0-2)"
                className="rounded border border-slate-300 px-2 py-1 outline-none ring-emerald-500 focus:ring-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              Pitch Result
              <select
                value={event.pitchResult || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ pitchResult: val === "" ? null : (val as AnalysisEvent["pitchResult"]) });
                }}
                className="rounded border border-slate-300 px-2 py-1 outline-none ring-emerald-500 focus:ring-2"
              >
                <option value="">Unknown</option>
                <option value="called_strike">Called Strike</option>
                <option value="swinging_strike">Swinging Strike</option>
                <option value="foul">Foul</option>
                <option value="ball">Ball</option>
                <option value="ball_in_play">Ball In Play</option>
                <option value="hit_by_pitch">Hit by Pitch</option>
              </select>
            </label>
          </div>

          <div className="mb-3">
            <PitchLocationSelector
              value={event.pitchLocationZone}
              batterHandedness={event.batterHandedness}
              onChange={(zoneId, label) => handleUpdate({ pitchLocationZone: zoneId, pitchLocationLabel: label })}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              Contact Direction
              <select
                value={event.contactDirection || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ contactDirection: val === "" ? null : (val as AnalysisEvent["contactDirection"]) });
                }}
                className="rounded border border-slate-300 px-2 py-1 outline-none ring-emerald-500 focus:ring-2"
              >
                <option value="">Unknown</option>
                <option value="pull">Pull</option>
                <option value="middle">Middle</option>
                <option value="opposite">Opposite</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              Contact Quality
              <select
                value={event.contactQuality || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ contactQuality: val === "" ? null : (val as AnalysisEvent["contactQuality"]) });
                }}
                className="rounded border border-slate-300 px-2 py-1 outline-none ring-emerald-500 focus:ring-2"
              >
                <option value="">Unknown</option>
                <option value="hard">Hard</option>
                <option value="medium">Medium</option>
                <option value="weak">Weak</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs text-slate-700">
              At-Bat Result
              <select
                value={event.result || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  handleUpdate({ result: val === "" ? null : (val as AnalysisEvent["result"]) });
                }}
                className="rounded border border-slate-300 px-2 py-1 outline-none ring-emerald-500 focus:ring-2"
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

      <label className="flex flex-col gap-1 text-xs text-slate-700">
        Note
        <input
          type="text"
          value={event.note}
          onChange={(e) => handleUpdate({ note: e.target.value })}
          placeholder="Add coaching note..."
          className="rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
        />
      </label>
    </li>
  );
}
