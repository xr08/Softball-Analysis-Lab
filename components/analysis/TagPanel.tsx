import { WORKFLOW_TAG_GROUPS, WorkflowTagDefinition } from "@/lib/analysis/tags";

type TagPanelProps = {
  onTagClick: (tag: WorkflowTagDefinition) => void;
  disabled?: boolean;
  message?: string;
};

export function TagPanel({ onTagClick, disabled = false, message = "" }: TagPanelProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-black uppercase tracking-[0.18em] text-slate-100">Tag Events</h2>
        <p className="mt-1 text-xs text-slate-500">
          Secondary coaching observations and bookmarks. Use the Pitch Window for structured pitch/play facts.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {WORKFLOW_TAG_GROUPS.map((group) => (
          <div key={group.role} className="rounded-md border border-slate-700 bg-slate-950/50 p-3">
            <h3 className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">{group.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.tags.map((tag) => (
                <button
                  key={`${tag.role}-${tag.id}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onTagClick(tag)}
                  className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-left text-sm text-slate-100 transition-colors hover:border-sky-400 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <div className="font-bold">{tag.label}</div>
                  <div className="text-xs text-slate-500">{tag.category}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {disabled ? (
        <p className="text-sm text-amber-300">
          Select a video before adding timeline events.
        </p>
      ) : null}
      {message ? (
        <p className="text-sm font-semibold text-sky-200">{message}</p>
      ) : null}
    </section>
  );
}
