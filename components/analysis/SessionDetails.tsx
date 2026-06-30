import { Session } from "@/lib/analysis/types";

export interface SessionDetailsProps {
  session: Session;
  onUpdateSession: (updates: Partial<Session>) => void;
}

export function SessionDetails({
  session,
  onUpdateSession,
}: SessionDetailsProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-800">Session Details</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Session Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={session.name}
            onChange={(e) => onUpdateSession({ name: e.target.value })}
            placeholder="e.g. Pre-season Bullpen"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Session Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            value={session.sessionType}
            onChange={(e) => onUpdateSession({ sessionType: e.target.value as Session["sessionType"] })}
          >
            <option value="game">Game</option>
            <option value="player">Player</option>
            <option value="training">Training</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Date
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={session.date}
            onChange={(e) => onUpdateSession({ date: e.target.value })}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Context / Opponent
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            value={session.context}
            onChange={(e) => onUpdateSession({ context: e.target.value })}
            placeholder="e.g. vs Eagles or Week 1 Practice"
          />
        </div>
      </div>
    </div>
  );
}
