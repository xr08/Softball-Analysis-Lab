import { STAGE_1_TAGS } from "@/lib/analysis/tags";
import { TagDefinition } from "@/lib/analysis/types";

type TagPanelProps = {
  onTagClick: (tag: TagDefinition) => void;
  disabled?: boolean;
};

export function TagPanel({ onTagClick, disabled = false }: TagPanelProps) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">Batter Tags</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {STAGE_1_TAGS.map((tag) => (
          <button
            key={tag.tag}
            type="button"
            disabled={disabled}
            onClick={() => onTagClick(tag)}
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-left text-sm text-slate-900 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="font-medium">{tag.tag}</div>
            <div className="text-xs text-slate-600">{tag.category}</div>
          </button>
        ))}
      </div>
      {disabled ? (
        <p className="mt-3 text-sm text-amber-700">
          Select a video before adding timeline events.
        </p>
      ) : null}
    </section>
  );
}
