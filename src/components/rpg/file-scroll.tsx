import Link from "next/link";
import type { RepoFile, Commit } from "@/lib/types";
import { fileIcon, sortRepoFiles, formatRelative } from "@/lib/utils";

type FileScrollProps = {
  files: RepoFile[];
  owner: string;
  repo: string;
  branch: string;
  currentPath?: string;
  latestCommit?: Commit;
  totalCommits?: number;
  branchCount?: number;
  tagCount?: number;
  className?: string;
};

export function FileScroll({
  files,
  owner,
  repo,
  branch,
  currentPath,
  latestCommit,
  totalCommits,
  branchCount,
  tagCount,
  className = "",
}: FileScrollProps) {
  const sorted = sortRepoFiles(files);
  const base = `/repo/${owner}/${repo}`;
  const isSubdir = !!currentPath;

  function href(file: RepoFile) {
    const viewType = file.type === "dir" ? "tree" : "blob";
    return `${base}/${viewType}/${branch}/${file.path}`;
  }

  const parentPath = currentPath?.includes("/")
    ? currentPath.slice(0, currentPath.lastIndexOf("/"))
    : "";
  const parentHref = isSubdir
    ? parentPath
      ? `${base}/tree/${branch}/${parentPath}`
      : base
    : null;

  return (
    <div className={className}>
      {/* Branch/tag bar */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className="px-2 py-0.5 text-[10px] border border-border-subtle rounded-sm bg-surface-overlay text-text-secondary font-medium">
          📌 {branch} ▾
        </span>
        {branchCount != null && (
          <span className="text-[10px] text-text-muted">
            🌿 {branchCount} Branches
          </span>
        )}
        {tagCount != null && (
          <span className="text-[10px] text-text-muted">
            🏷 {tagCount} Tags
          </span>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="px-2 py-0.5 text-[10px] border border-border-subtle rounded-sm bg-surface-overlay text-text-muted">
            Go to file
          </span>
          <span className="px-2 py-0.5 text-[10px] border border-accent rounded-sm bg-accent/10 text-accent font-medium">
            ◇ Code ▾
          </span>
        </div>
      </div>

      {/* Latest commit bar */}
      {latestCommit && (
        <div className="flex items-center gap-2 px-3 py-1.5 border border-border-subtle rounded-t-sm bg-surface-overlay text-xs">
          <span className="text-accent-gold font-medium truncate max-w-[120px]">
            {latestCommit.authorName}
          </span>
          <span className="text-text-secondary truncate flex-1">
            {latestCommit.message}
          </span>
          <span className="text-text-muted shrink-0">
            ✓
          </span>
          <code className="text-accent text-[10px] shrink-0">
            {latestCommit.sha.slice(0, 7)}
          </code>
          <span className="text-text-muted text-[10px] shrink-0">
            {formatRelative(latestCommit.date)}
          </span>
          {totalCommits != null && (
            <span className="text-text-muted text-[10px] shrink-0 border-l border-border-subtle pl-2">
              📝 {totalCommits.toLocaleString()}
            </span>
          )}
        </div>
      )}

      {/* File listing */}
      <div
        className={`border border-border-subtle overflow-hidden ${
          latestCommit ? "border-t-0 rounded-b-sm" : "rounded-sm"
        }`}
      >
        {parentHref && (
          <Link
            href={parentHref}
            className="flex items-center gap-2 px-3 py-1 text-sm hover:bg-surface-overlay transition-colors"
          >
            <span className="text-xs shrink-0 w-5 text-center">⬆</span>
            <span className="text-accent-gold font-medium">..</span>
          </Link>
        )}
        {sorted.map((file, i) => (
          <Link
            key={file.path}
            href={href(file)}
            className={`
              flex items-center gap-2 px-3 py-1 text-sm
              hover:bg-surface-overlay transition-colors
              ${i > 0 || parentHref ? "border-t border-border-subtle" : ""}
            `}
          >
            <span className="text-xs shrink-0 w-5 text-center">
              {fileIcon(file.type, file.name)}
            </span>
            <span
              className={`shrink-0 ${
                file.type === "dir"
                  ? "text-accent-gold font-medium"
                  : "text-text-primary"
              }`}
            >
              {file.name}
            </span>
            <span className="text-text-muted text-xs truncate flex-1 text-right">
              —
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
