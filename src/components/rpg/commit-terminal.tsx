import type { Commit } from "@/lib/types";
import { formatTimestamp } from "@/lib/utils";
import { RpgPanel } from "./rpg-panel";

type CommitTerminalProps = {
  commits: Commit[];
};

export function CommitTerminal({ commits }: CommitTerminalProps) {
  return (
    <RpgPanel title="Commit Log — Terminal" variant="dark" compact>
      <div className="font-mono text-[11px] max-h-56 overflow-y-auto space-y-0">
        {commits.map((commit) => (
          <div
            key={commit.sha}
            className="flex items-start gap-0 py-1 border-b border-border-subtle/50 last:border-0 leading-tight"
          >
            <span className="text-accent shrink-0 w-3">{">"}</span>
            <span className="text-accent-gold shrink-0 w-[60px] tabular-nums">
              {formatTimestamp(commit.date)}
            </span>
            <span className="text-accent-yellow shrink-0 w-[100px] truncate px-1">
              {commit.authorName}
            </span>
            <span className="text-accent glow-green truncate flex-1">
              {commit.message}
            </span>
          </div>
        ))}
        {commits.length === 0 && (
          <p className="text-text-muted italic text-xs">No commits found.</p>
        )}
      </div>
      <div className="flex gap-0 mt-1.5 border-t border-border-subtle pt-1.5">
        {["LOG", "DIFF", "STATS"].map((tab, i) => (
          <button
            key={tab}
            className={`px-3 py-0.5 text-[9px] font-display tracking-wider ${
              i === 0
                ? "bg-accent-gold/20 text-accent-gold border border-accent-gold-dim"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </RpgPanel>
  );
}
