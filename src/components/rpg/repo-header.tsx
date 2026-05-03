import type { QuestRepo } from "@/lib/types";

type RepoHeaderProps = {
  repo: QuestRepo;
};

export function RepoHeader({ repo }: RepoHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-lg text-text-primary">
        <span className="text-text-muted">{repo.owner}</span>
        <span className="text-text-muted mx-1">/</span>
        <span className="font-bold text-text-primary">{repo.name}</span>
      </h1>
      <span
        className={`
          px-2 py-0.5 rounded-sm text-[10px] font-medium border uppercase tracking-wider
          ${
            repo.visibility === "public"
              ? "border-accent-gold-dim text-accent-gold"
              : "border-accent-red/50 text-accent-red"
          }
        `}
      >
        {repo.visibility}
      </span>
      <div className="flex items-center gap-3 ml-auto">
        <ActionButton icon="👁" label="Watch" count={repo.watchers} />
        <ActionButton icon="⭐" label="Star" count={repo.stars} />
        <ActionButton icon="🍴" label="Fork" count={repo.forks} />
      </div>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-1 text-xs text-text-secondary border border-border-subtle rounded-sm px-2 py-1 bg-surface-overlay">
      <span>{icon}</span>
      <span>{label}</span>
      <span className="ml-1 text-text-primary font-medium tabular-nums">
        {count.toLocaleString()}
      </span>
    </div>
  );
}
