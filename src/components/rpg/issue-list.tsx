"use client";

import { useState, useCallback } from "react";
import type { IssueItem, IssueListResult } from "@/lib/types";
import { formatRelative } from "@/lib/utils";

type IssueListProps = {
  owner: string;
  repo: string;
  type: "issues" | "pulls";
  initialItems: IssueItem[];
  initialHasMore: boolean;
  openCount: number;
};

export function IssueList({
  owner,
  repo,
  type,
  initialItems,
  initialHasMore,
  openCount,
}: IssueListProps) {
  const [state, setState] = useState<"open" | "closed">("open");
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(
    async (newState: "open" | "closed", newPage: number) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          owner,
          repo,
          type,
          state: newState,
          page: String(newPage),
        });
        const res = await fetch(`/api/github/issues?${params}`);
        if (!res.ok) throw new Error("fetch failed");
        const data: IssueListResult = await res.json();
        if (newPage === 1) {
          setItems(data.items);
        } else {
          setItems((prev) => [...prev, ...data.items]);
        }
        setHasMore(data.hasMore);
        setPage(newPage);
        setState(newState);
      } catch {
        // Keep current items on error
      } finally {
        setLoading(false);
      }
    },
    [owner, repo, type],
  );

  const toggleState = (newState: "open" | "closed") => {
    if (newState === state && !loading) return;
    fetchItems(newState, 1);
  };

  const loadMore = () => {
    if (!hasMore || loading) return;
    fetchItems(state, page + 1);
  };

  return (
    <div className="pt-3 space-y-0">
      {/* Filter bar */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => toggleState("open")}
          className={`px-2.5 py-1 text-xs rounded-sm border transition-colors cursor-pointer ${
            state === "open"
              ? "border-green-500/50 bg-green-500/10 text-green-400"
              : "border-border-subtle text-text-muted hover:text-text-secondary"
          }`}
        >
          ● {openCount} Open
        </button>
        <button
          onClick={() => toggleState("closed")}
          className={`px-2.5 py-1 text-xs rounded-sm border transition-colors cursor-pointer ${
            state === "closed"
              ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
              : "border-border-subtle text-text-muted hover:text-text-secondary"
          }`}
        >
          ✓ Closed
        </button>
      </div>

      {/* Item list */}
      <div className="border border-border-subtle rounded-sm overflow-hidden">
        {items.length === 0 && !loading && (
          <div className="py-8 text-center text-text-muted text-sm">
            No {type === "pulls" ? "pull requests" : "issues"} found.
          </div>
        )}

        {items.map((item, i) => (
          <a
            key={item.number}
            href={`https://github.com/${owner}/${repo}/${type === "pulls" ? "pull" : "issues"}/${item.number}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              flex items-start gap-2 px-3 py-2 text-sm
              hover:bg-surface-overlay transition-colors
              ${i > 0 ? "border-t border-border-subtle" : ""}
            `}
          >
            <span className="mt-0.5 shrink-0">
              {item.state === "open" ? (
                <span className="text-green-400 text-xs">●</span>
              ) : (
                <span className="text-purple-400 text-xs">✓</span>
              )}
            </span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-text-primary font-medium hover:text-accent-gold transition-colors">
                  {item.title}
                </span>
                {item.labels.map((label) => (
                  <span
                    key={label.name}
                    className="px-1.5 py-0.5 text-[10px] rounded-full font-medium"
                    style={{
                      backgroundColor: `#${label.color}20`,
                      color: `#${label.color}`,
                      border: `1px solid #${label.color}40`,
                    }}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                #{item.number} opened {formatRelative(item.createdAt)} by{" "}
                {item.author}
              </div>
            </div>

            {item.commentsCount > 0 && (
              <span className="text-text-muted text-xs shrink-0 flex items-center gap-0.5 mt-1">
                💬 {item.commentsCount}
              </span>
            )}
          </a>
        ))}

        {loading && (
          <div className="py-4 text-center text-text-muted text-xs animate-pulse">
            Loading...
          </div>
        )}
      </div>

      {/* Load more */}
      {hasMore && !loading && (
        <button
          onClick={loadMore}
          className="w-full py-2 mt-2 text-xs text-accent-gold hover:text-accent border border-border-subtle rounded-sm hover:bg-surface-overlay transition-colors cursor-pointer"
        >
          Load more...
        </button>
      )}
    </div>
  );
}
