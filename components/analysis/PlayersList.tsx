import { Player, TeamSide } from "@/lib/analysis/types";
import { useState } from "react";

type PlayersListProps = {
  players: Player[];
  onAddPlayer: (name: string, teamSide: TeamSide) => void;
  onRemovePlayer: (id: string) => void;
};

export function PlayersList({ players, onAddPlayer, onRemovePlayer }: PlayersListProps) {
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerTeam, setNewPlayerTeam] = useState<TeamSide>("teamA");

  const handleAdd = () => {
    if (newPlayerName.trim()) {
      onAddPlayer(newPlayerName.trim(), newPlayerTeam);
      setNewPlayerName("");
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-100">Teams / Players</h2>
          <p className="mt-1 text-xs text-slate-500">Local roster for this tagging session.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled
            className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500"
            title="Saved teams are planned for a later milestone."
          >
            Save Team
          </button>
          <button
            type="button"
            disabled
            className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-slate-500"
            title="Saved teams are planned for a later milestone."
          >
            Load Team
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
          Name
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g., Sarah Smith"
            className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-black uppercase tracking-wide text-slate-400">
          Team
          <select
            value={newPlayerTeam || "neutral"}
            onChange={(e) => setNewPlayerTeam(e.target.value as TeamSide)}
            className="rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm normal-case tracking-normal text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
          >
            <option value="teamA">Team A</option>
            <option value="teamB">Team B</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
        <button
          onClick={handleAdd}
          disabled={!newPlayerName.trim()}
          className="rounded-md bg-orange-500 px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-950 transition-colors hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {players.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-md border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm"
            >
              <span className="truncate font-bold text-slate-100">
                {player.name}
                <span className="ml-2 text-xs text-sky-300">
                  ({player.teamSide === "teamA" ? "A" : player.teamSide === "teamB" ? "B" : "N"})
                </span>
              </span>
              <button
                onClick={() => onRemovePlayer(player.id)}
                className="rounded px-2 py-1 text-slate-500 hover:bg-red-950/60 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
                aria-label={`Remove ${player.name}`}
              >
                x
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-md border border-dashed border-slate-700 bg-slate-900/40 p-3 text-sm text-slate-500">
          No players added yet.
        </p>
      )}
    </section>
  );
}
