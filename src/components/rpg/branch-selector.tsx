"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

type BranchSelectorProps = {
  owner: string;
  repo: string;
  currentRef: string;
  currentPath?: string;
  viewType: "dashboard" | "tree" | "blob";
};

type RefsData = {
  branches: string[];
  tags: string[];
};

export function BranchSelector({
  owner,
  repo,
  currentRef,
  currentPath,
  viewType,
}: BranchSelectorProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [refs, setRefs] = useState<RefsData | null>(null);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchRefs = useCallback(async () => {
    if (refs) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ owner, repo });
      const res = await fetch(`/api/github/refs?${params}`);
      if (!res.ok) throw new Error("fetch failed");
      const data: RefsData = await res.json();
      setRefs(data);
    } catch {
      setRefs({ branches: [], tags: [] });
    } finally {
      setLoading(false);
    }
  }, [owner, repo, refs]);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setFilter("");
      fetchRefs();
    }
  };

  const handleSelect = (ref: string) => {
    setOpen(false);
    if (ref === currentRef) return;

    const base = `/repo/${owner}/${repo}`;
    if (viewType === "dashboard") {
      router.push(`${base}/tree/${encodeURIComponent(ref)}`);
    } else {
      const path = currentPath ? `/${currentPath}` : "";
      router.push(`${base}/${viewType}/${encodeURIComponent(ref)}${path}`);
    }
  };

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const lowerFilter = filter.toLowerCase();
  const filteredBranches = refs?.branches.filter((b) =>
    b.toLowerCase().includes(lowerFilter),
  ) ?? [];
  const filteredTags = refs?.tags.filter((t) =>
    t.toLowerCase().includes(lowerFilter),
  ) ?? [];

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={handleToggle}
        className="px-2 py-0.5 text-[10px] border border-border-subtle rounded-sm bg-surface-overlay text-text-secondary font-medium hover:border-accent-gold-dim hover:text-accent-gold transition-colors cursor-pointer"
      >
        📌 {currentRef} ▾
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-surface-raised border border-border-subtle rounded-sm shadow-lg z-50 overflow-hidden">
          <div className="p-1.5 border-b border-border-subtle">
            <input
              ref={inputRef}
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter branches/tags..."
              className="w-full px-2 py-1 text-xs bg-surface border border-border-subtle rounded-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold-dim"
            />
          </div>

          <div className="max-h-64 overflow-y-auto">
            {loading && (
              <div className="py-4 text-center text-text-muted text-xs animate-pulse">
                Loading...
              </div>
            )}

            {!loading && filteredBranches.length === 0 && filteredTags.length === 0 && (
              <div className="py-4 text-center text-text-muted text-xs">
                No matches found
              </div>
            )}

            {!loading && filteredBranches.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[9px] text-text-muted font-display tracking-wider uppercase">
                  🌿 Branches
                </div>
                {filteredBranches.map((branch) => (
                  <button
                    key={branch}
                    onClick={() => handleSelect(branch)}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-surface-overlay transition-colors cursor-pointer truncate ${
                      branch === currentRef
                        ? "text-accent-gold font-medium"
                        : "text-text-primary"
                    }`}
                  >
                    {branch === currentRef && <span className="mr-1">✓</span>}
                    {branch}
                  </button>
                ))}
              </div>
            )}

            {!loading && filteredTags.length > 0 && (
              <div>
                <div className="px-2 py-1 text-[9px] text-text-muted font-display tracking-wider uppercase border-t border-border-subtle">
                  🏷 Tags
                </div>
                {filteredTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleSelect(tag)}
                    className={`w-full text-left px-3 py-1 text-xs hover:bg-surface-overlay transition-colors cursor-pointer truncate ${
                      tag === currentRef
                        ? "text-accent-gold font-medium"
                        : "text-text-primary"
                    }`}
                  >
                    {tag === currentRef && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
