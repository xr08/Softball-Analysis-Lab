import { WORKFLOW_TAG_GROUPS, WorkflowTagDefinition } from "@/lib/analysis/tags";

type TagPanelProps = {
  onTagClick: (tag: WorkflowTagDefinition) => void;
  disabled?: boolean;
  message?: string;
};

export function TagPanel({ onTagClick, disabled = false, message = "" }: TagPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Tag Events</h2>
      <div className="grid gap-4 lg:grid-cols-2">
        {WORKFLOW_TAG_GROUPS.map((group) => (
          <div key={group.role} className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">{group.title}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.tags.map((tag) => (
                <button
                  key={`${tag.role}-${tag.id}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => onTagClick(tag)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="font-medium">{tag.label}</div>
                  <div className="text-xs text-slate-600">{tag.category}</div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {disabled ? (
        <p className="mt-3 text-sm text-amber-700">
          Select a video before adding timeline events.
        </p>
      ) : null}
      {message ? (
        <p className="mt-3 text-sm font-medium text-slate-700">{message}</p>
      ) : null}
    </section>
  );
}
