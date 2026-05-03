import type { QuestRepo } from "@/lib/types";
import { computeXpProgress, compact } from "@/lib/utils";
import { StatBadge } from "./stat-badge";
import { StatBar } from "./stat-bar";

type InventorySidebarProps = {
  repo: QuestRepo;
};

const guildMenuItems = [
  { icon: "📋", label: "Overview", active: true },
  { icon: "📦", label: "Repositories" },
  { icon: "📊", label: "Projects" },
  { icon: "📦", label: "Packages" },
  { icon: "🏛", label: "Organizations" },
  { icon: "⚙", label: "Settings" },
];

export function InventorySidebar({ repo }: InventorySidebarProps) {
  const totalActivity =
    repo.stars + repo.forks + repo.watchers + repo.openIssues + repo.openPRs;
  const { level, xpProgress, xpNeeded } = computeXpProgress(totalActivity);

  return (
    <div className="space-y-3">
      {/* Adventurer Status */}
      <div className="ornate-border rounded-sm bg-surface-raised p-2.5 space-y-1.5">
        <h3 className="font-display text-[8px] text-accent-gold tracking-wider uppercase leading-none">
          Adventurer Status
        </h3>
        <div className="flex items-baseline justify-between">
          <span className="font-display text-accent-gold text-[10px] leading-none">
            LVL {level}
          </span>
          <span className="font-display text-[7px] text-text-muted leading-none">
            {compact(xpProgress)} / {compact(xpNeeded)} XP
          </span>
        </div>
        <StatBar label="HP" current={repo.stars} max={Math.max(repo.stars, 100)} color="red" />
        <StatBar label="MP" current={repo.forks} max={Math.max(repo.forks, 50)} color="blue" />
        <StatBar label="EXP" current={xpProgress} max={xpNeeded} color="green" />
      </div>

      {/* Repository Inventory */}
      <div className="ornate-border rounded-sm bg-surface-raised p-2.5 space-y-1.5">
        <h3 className="font-display text-[8px] text-accent-gold tracking-wider uppercase leading-none">
          Repository Inventory
        </h3>
        <div className="space-y-1">
          <StatBadge icon="⭐" value={repo.stars} label="Stars" />
          <StatBadge icon="🍴" value={repo.forks} label="Forks" />
          <StatBadge icon="👁" value={repo.watchers} label="Watchers" />
          <StatBadge icon="🐛" value={repo.openIssues} label="Issues" />
          <StatBadge icon="🔀" value={repo.openPRs} label="Pull Requests" />
        </div>
      </div>

      {/* Guild Menu */}
      <div className="ornate-border rounded-sm bg-surface-raised p-2.5 space-y-1.5">
        <h3 className="font-display text-[8px] text-accent-gold tracking-wider uppercase leading-none">
          Guild Menu
        </h3>
        <nav>
          <ul className="space-y-px">
            {guildMenuItems.map((item) => (
              <li key={item.label}>
                <div
                  className={`
                    flex items-center gap-2 px-2 py-1 rounded-sm text-xs cursor-default
                    ${
                      item.active
                        ? "bg-accent-gold/10 text-accent-gold border border-accent-gold-dim"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay"
                    }
                  `}
                >
                  <span className="text-[10px]">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
