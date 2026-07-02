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
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-100">Session Details</h2>
        <p className="mt-1 text-xs text-slate-500">Setup context stays editable without taking over the workspace.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400">
            Session Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
            value={session.name}
            onChange={(e) => onUpdateSession({ name: e.target.value })}
            placeholder="e.g. Pre-season Bullpen"
          />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400">
            Session Type
          </label>
          <select
            className="mt-1 block w-full rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
            value={session.sessionType}
            onChange={(e) => onUpdateSession({ sessionType: e.target.value as Session["sessionType"] })}
          >
            <option value="game">Game</option>
            <option value="player">Player</option>
            <option value="training">Training</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400">
            Date
          </label>
          <input
            type="date"
            className="mt-1 block w-full rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm text-slate-100 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
            value={session.date}
            onChange={(e) => onUpdateSession({ date: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-black uppercase tracking-wide text-slate-400">
            Context / Opponent
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-slate-600 bg-[#0a0f16] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/30"
            value={session.context}
            onChange={(e) => onUpdateSession({ context: e.target.value })}
            placeholder="e.g. vs Eagles or Week 1 Practice"
          />
        </div>
      </div>
    </div>
  );
}
