/**
 * Compute adventurer level from total repo activity (stars + forks + watchers + issues + PRs).
 * Uses log2 scaling so levels grow exponentially.
 */
export function computeLevel(totalActivity: number): number {
  return Math.min(Math.floor(Math.log2(Math.max(totalActivity, 0) + 1)) + 1, 99);
}

/**
 * Compute XP thresholds for a given level.
 * Returns [floor, ceiling] where floor is the minimum activity for this level
 * and ceiling is the minimum activity for the next level.
 */
export function computeXpThresholds(level: number): { xpFloor: number; xpCeil: number } {
  const xpFloor = Math.pow(2, level - 1) - 1;
  const xpCeil = Math.pow(2, level) - 1;
  return { xpFloor, xpCeil };
}

/**
 * Compute XP progress within the current level.
 * Always returns non-negative values.
 */
export function computeXpProgress(totalActivity: number): {
  level: number;
  xpProgress: number;
  xpNeeded: number;
} {
  const level = computeLevel(totalActivity);
  const { xpFloor, xpCeil } = computeXpThresholds(level);
  return {
    level,
    xpProgress: totalActivity - xpFloor,
    xpNeeded: xpCeil - xpFloor,
  };
}

/**
 * Compact number formatting for display in tight UI spaces.
 */
export function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString();
}

/**
 * Even more compact formatting for stat bar labels.
 */
export function formatCompact(n: number): string {
  if (n >= 10000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

/**
 * Compute stat bar percentage, clamped to [0, 100].
 */
export function statBarPercent(current: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min((current / max) * 100, 100);
}

/**
 * Number of filled icons for HP-style heart displays (0–10).
 */
export function filledIconCount(pct: number): number {
  return Math.round((Math.max(0, Math.min(pct, 100)) / 100) * 10);
}

/**
 * Map contribution count to terrain CSS class.
 */
export function terrainClass(count: number): string {
  if (count <= 0) return "terrain-wasteland";
  if (count === 1) return "terrain-dirt";
  if (count <= 3) return "terrain-grass";
  if (count <= 6) return "terrain-forest";
  if (count <= 10) return "terrain-mountain";
  return "terrain-shrine";
}

/**
 * Map contribution count to terrain label.
 */
export function terrainLabel(count: number): string {
  if (count <= 0) return "Wasteland";
  if (count === 1) return "Barren";
  if (count <= 3) return "Grassland";
  if (count <= 6) return "Forest";
  if (count <= 10) return "Mountain";
  return "Shrine";
}

/**
 * Expand weekly totals into per-day cells for the contribution grid.
 * Returns exactly 52*7 = 364 cells.
 */
export function expandWeeksToDays(weeks: number[]): number[] {
  const raw = weeks.length > 0 ? weeks.slice(-52) : [];
  const cells: number[] = [];

  for (const weekTotal of raw) {
    const perDay = weekTotal / 7;
    for (let d = 0; d < 7; d++) {
      const jitter = Math.floor(perDay + (d % 3 === 0 ? 1 : 0));
      cells.push(Math.max(0, jitter));
    }
  }

  while (cells.length < 52 * 7) cells.push(0);
  return cells.slice(-52 * 7);
}

/**
 * Format a date string as HH:MM:SS for the commit terminal.
 */
export function formatTimestamp(dateStr: string): string {
  if (!dateStr) return "        ";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "        ";
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  const s = d.getSeconds().toString().padStart(2, "0");
  return `${h}:${m}:${s}`;
}

/**
 * Format a date string as a relative time (e.g. "3d ago").
 */
export function formatRelative(dateStr: string, now?: number): string {
  if (!dateStr) return "";
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return "";
  const diff = (now ?? Date.now()) - then;
  if (diff < 0) return "just now";
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/**
 * Map file type and name to an icon emoji.
 */
export function fileIcon(type: "file" | "dir", name: string): string {
  if (type === "dir") return "📁";
  if (name === "LICENSE" || name.startsWith("LICENSE")) return "📋";
  if (name.startsWith(".git")) return "🔧";
  if (name.match(/\.(md|txt|rst)$/i)) return "📜";
  if (name.match(/\.(ts|tsx|js|jsx)$/i)) return "⚡";
  if (name.match(/\.(py)$/i)) return "🐍";
  if (name.match(/\.(rs)$/i)) return "🦀";
  if (name.match(/\.(go)$/i)) return "🔷";
  if (name.match(/\.(json|ya?ml|toml)$/i)) return "⚙️";
  if (name.match(/\.(css|scss|less)$/i)) return "🎨";
  if (name.match(/\.(png|jpe?g|gif|svg|webp)$/i)) return "🖼";
  return "📄";
}

/**
 * Sort repo files: directories first, then alphabetical within each group.
 */
export function sortRepoFiles<T extends { type: "file" | "dir"; name: string }>(
  files: T[],
): T[] {
  return [...files].sort((a, b) => {
    if (a.type !== b.type) return a.type === "dir" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Parse the total page count from a GitHub API Link header.
 */
export function parseLinkCount(link: string | undefined): number | null {
  if (!link) return null;
  const match = link.match(/page=(\d+)>; rel="last"/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Compute open issues excluding PRs (GitHub counts PRs as issues).
 * Clamps to 0 to avoid negative values.
 */
export function computeOpenIssues(
  openIssuesCount: number,
  openPRCount: number,
): number {
  return Math.max(0, openIssuesCount - openPRCount);
}

/**
 * Format a resource counter value for the top bar (compact with 1 decimal for thousands).
 */
export function formatResourceCounter(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}k`;
  return value.toString();
}

/**
 * Compute language percentages. Returns entries sorted by percentage descending.
 * Safe against empty/zero-total inputs.
 */
export function computeLanguagePercentages(
  languages: Record<string, number>,
): { lang: string; pct: number }[] {
  const total = Object.values(languages).reduce((a, b) => a + b, 0);
  if (total <= 0) return [];
  return Object.entries(languages)
    .map(([lang, bytes]) => ({ lang, pct: (bytes / total) * 100 }))
    .sort((a, b) => b.pct - a.pct);
}
