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
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">Players</h2>
      
      <div className="mb-4 flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700">
          Name
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="e.g., Sarah Smith"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-slate-700">
          Team
          <select
            value={newPlayerTeam || "neutral"}
            onChange={(e) => setNewPlayerTeam(e.target.value as TeamSide)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2"
          >
            <option value="teamA">Team A</option>
            <option value="teamB">Team B</option>
            <option value="neutral">Neutral</option>
          </select>
        </label>
        <button
          onClick={handleAdd}
          disabled={!newPlayerName.trim()}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {players.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {players.map((player) => (
            <li
              key={player.id}
              className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="truncate font-medium text-slate-700">
                {player.name}
                <span className="ml-2 text-xs text-slate-500">
                  ({player.teamSide === "teamA" ? "A" : player.teamSide === "teamB" ? "B" : "N"})
                </span>
              </span>
              <button
                onClick={() => onRemovePlayer(player.id)}
                className="text-slate-400 hover:text-red-500"
                aria-label={`Remove ${player.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No players added yet.</p>
      )}
    </section>
  );
}
