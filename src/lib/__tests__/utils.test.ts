import { describe, it, expect } from "vitest";
import {
  computeLevel,
  computeXpThresholds,
  computeXpProgress,
  compact,
  formatCompact,
  statBarPercent,
  filledIconCount,
  terrainClass,
  terrainLabel,
  expandWeeksToDays,
  formatTimestamp,
  formatRelative,
  fileIcon,
  sortRepoFiles,
  parseLinkCount,
  computeOpenIssues,
  formatResourceCounter,
  computeLanguagePercentages,
} from "../utils";

// ---------------------------------------------------------------------------
// XP / Level System
// ---------------------------------------------------------------------------

describe("computeLevel", () => {
  it("returns 1 for zero activity", () => {
    expect(computeLevel(0)).toBe(1);
  });

  it("returns 2 for 1 activity", () => {
    expect(computeLevel(1)).toBe(2);
  });

  it("returns 3 for 3 activity", () => {
    expect(computeLevel(3)).toBe(3);
  });

  it("returns 4 for 7 activity", () => {
    expect(computeLevel(7)).toBe(4);
  });

  it("scales logarithmically for large repos", () => {
    expect(computeLevel(100)).toBe(7);
    expect(computeLevel(1000)).toBe(10);
    expect(computeLevel(100_000)).toBe(17);
    expect(computeLevel(1_000_000)).toBe(20);
  });

  it("caps at 99 even for astronomically large values", () => {
    expect(computeLevel(Number.MAX_SAFE_INTEGER)).toBe(54);
    // log2(MAX_SAFE_INTEGER) ≈ 53, so level=54 is correct
    // The cap at 99 would only trigger for values >= 2^98 which exceed safe integers
    expect(computeLevel(1e30)).toBeLessThanOrEqual(99);
  });

  it("handles negative input gracefully", () => {
    expect(computeLevel(-1)).toBe(1);
    expect(computeLevel(-1000)).toBe(1);
  });
});

describe("computeXpThresholds", () => {
  it("level 1: floor=0, ceil=1", () => {
    const { xpFloor, xpCeil } = computeXpThresholds(1);
    expect(xpFloor).toBe(0);
    expect(xpCeil).toBe(1);
  });

  it("level 2: floor=1, ceil=3", () => {
    const { xpFloor, xpCeil } = computeXpThresholds(2);
    expect(xpFloor).toBe(1);
    expect(xpCeil).toBe(3);
  });

  it("level 3: floor=3, ceil=7", () => {
    const { xpFloor, xpCeil } = computeXpThresholds(3);
    expect(xpFloor).toBe(3);
    expect(xpCeil).toBe(7);
  });

  it("thresholds increase exponentially", () => {
    const { xpFloor: f10, xpCeil: c10 } = computeXpThresholds(10);
    const { xpFloor: f11, xpCeil: c11 } = computeXpThresholds(11);
    expect(c10).toBe(f11);
    expect(c11 - f11).toBe(2 * (c10 - f10));
  });
});

describe("computeXpProgress", () => {
  it("zero activity: level 1, progress 0/1", () => {
    const { level, xpProgress, xpNeeded } = computeXpProgress(0);
    expect(level).toBe(1);
    expect(xpProgress).toBe(0);
    expect(xpNeeded).toBe(1);
  });

  it("1 activity: level 2, progress 0/2", () => {
    const { level, xpProgress, xpNeeded } = computeXpProgress(1);
    expect(level).toBe(2);
    expect(xpProgress).toBe(0);
    expect(xpNeeded).toBe(2);
  });

  it("2 activity: level 2, progress 1/2", () => {
    const { level, xpProgress, xpNeeded } = computeXpProgress(2);
    expect(level).toBe(2);
    expect(xpProgress).toBe(1);
    expect(xpNeeded).toBe(2);
  });

  it("xpProgress is never negative for any input", () => {
    const testValues = [0, 1, 2, 3, 5, 10, 50, 100, 999, 10_000, 300_000, 1_000_000];
    for (const v of testValues) {
      const { xpProgress, xpNeeded } = computeXpProgress(v);
      expect(xpProgress).toBeGreaterThanOrEqual(0);
      expect(xpNeeded).toBeGreaterThan(0);
      expect(xpProgress).toBeLessThanOrEqual(xpNeeded);
    }
  });

  it("large repo (facebook/react scale) has correct values", () => {
    const { level, xpProgress, xpNeeded } = computeXpProgress(300_000);
    expect(level).toBe(19);
    expect(xpProgress).toBe(300_000 - (Math.pow(2, 18) - 1));
    expect(xpNeeded).toBe(Math.pow(2, 19) - 1 - (Math.pow(2, 18) - 1));
    expect(xpProgress).toBeGreaterThan(0);
    expect(xpProgress).toBeLessThan(xpNeeded);
  });

  it("at exact level boundary, progress is 0", () => {
    // totalActivity = 3 is exactly the floor of level 3
    const { level, xpProgress } = computeXpProgress(3);
    expect(level).toBe(3);
    expect(xpProgress).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Number Formatting
// ---------------------------------------------------------------------------

describe("compact", () => {
  it("small numbers pass through", () => {
    expect(compact(0)).toBe("0");
    expect(compact(42)).toBe("42");
    expect(compact(999)).toBe("999");
  });

  it("thousands format with 1 decimal", () => {
    expect(compact(1000)).toBe("1.0k");
    expect(compact(1500)).toBe("1.5k");
    expect(compact(9999)).toBe("10.0k");
  });

  it("10k+ format without decimal", () => {
    expect(compact(10_000)).toBe("10k");
    expect(compact(50_000)).toBe("50k");
    expect(compact(999_999)).toBe("1000k");
  });

  it("millions format with 1 decimal", () => {
    expect(compact(1_000_000)).toBe("1.0M");
    expect(compact(2_500_000)).toBe("2.5M");
  });
});

describe("formatCompact", () => {
  it("small numbers use toString", () => {
    expect(formatCompact(0)).toBe("0");
    expect(formatCompact(999)).toBe("999");
  });

  it("thousands format with 1 decimal", () => {
    expect(formatCompact(1000)).toBe("1.0k");
    expect(formatCompact(5432)).toBe("5.4k");
  });

  it("10k+ drops the decimal", () => {
    expect(formatCompact(10_000)).toBe("10k");
    expect(formatCompact(245_000)).toBe("245k");
  });
});

describe("formatResourceCounter", () => {
  it("small values pass through", () => {
    expect(formatResourceCounter(0)).toBe("0");
    expect(formatResourceCounter(342)).toBe("342");
    expect(formatResourceCounter(999)).toBe("999");
  });

  it("thousands get compact format", () => {
    expect(formatResourceCounter(1200)).toBe("1.2k");
    expect(formatResourceCounter(8400)).toBe("8.4k");
    expect(formatResourceCounter(97000)).toBe("97.0k");
  });
});

// ---------------------------------------------------------------------------
// Stat Bar
// ---------------------------------------------------------------------------

describe("statBarPercent", () => {
  it("returns 0 for max=0", () => {
    expect(statBarPercent(50, 0)).toBe(0);
  });

  it("returns 0 for negative max", () => {
    expect(statBarPercent(50, -10)).toBe(0);
  });

  it("computes correct percentage", () => {
    expect(statBarPercent(25, 100)).toBe(25);
    expect(statBarPercent(50, 200)).toBe(25);
  });

  it("caps at 100 when current exceeds max", () => {
    expect(statBarPercent(200, 100)).toBe(100);
  });

  it("handles zero current", () => {
    expect(statBarPercent(0, 100)).toBe(0);
  });
});

describe("filledIconCount", () => {
  it("returns 0 for 0%", () => {
    expect(filledIconCount(0)).toBe(0);
  });

  it("returns 10 for 100%", () => {
    expect(filledIconCount(100)).toBe(10);
  });

  it("returns 5 for 50%", () => {
    expect(filledIconCount(50)).toBe(5);
  });

  it("clamps negative to 0", () => {
    expect(filledIconCount(-50)).toBe(0);
  });

  it("clamps over 100 to 10", () => {
    expect(filledIconCount(150)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Terrain / Contribution Map
// ---------------------------------------------------------------------------

describe("terrainClass", () => {
  it("maps 0 to wasteland", () => {
    expect(terrainClass(0)).toBe("terrain-wasteland");
  });

  it("maps negative to wasteland", () => {
    expect(terrainClass(-5)).toBe("terrain-wasteland");
  });

  it("maps 1 to dirt", () => {
    expect(terrainClass(1)).toBe("terrain-dirt");
  });

  it("maps 2-3 to grass", () => {
    expect(terrainClass(2)).toBe("terrain-grass");
    expect(terrainClass(3)).toBe("terrain-grass");
  });

  it("maps 4-6 to forest", () => {
    expect(terrainClass(4)).toBe("terrain-forest");
    expect(terrainClass(6)).toBe("terrain-forest");
  });

  it("maps 7-10 to mountain", () => {
    expect(terrainClass(7)).toBe("terrain-mountain");
    expect(terrainClass(10)).toBe("terrain-mountain");
  });

  it("maps 11+ to shrine", () => {
    expect(terrainClass(11)).toBe("terrain-shrine");
    expect(terrainClass(100)).toBe("terrain-shrine");
  });
});

describe("terrainLabel", () => {
  it("has a label for each terrain class", () => {
    expect(terrainLabel(0)).toBe("Wasteland");
    expect(terrainLabel(1)).toBe("Barren");
    expect(terrainLabel(3)).toBe("Grassland");
    expect(terrainLabel(6)).toBe("Forest");
    expect(terrainLabel(10)).toBe("Mountain");
    expect(terrainLabel(11)).toBe("Shrine");
  });

  it("handles negative", () => {
    expect(terrainLabel(-1)).toBe("Wasteland");
  });
});

describe("expandWeeksToDays", () => {
  it("returns 364 cells for empty input", () => {
    const cells = expandWeeksToDays([]);
    expect(cells).toHaveLength(364);
    expect(cells.every((c) => c === 0)).toBe(true);
  });

  it("returns 364 cells for normal input", () => {
    const weeks = Array.from({ length: 52 }, (_, i) => i);
    const cells = expandWeeksToDays(weeks);
    expect(cells).toHaveLength(364);
  });

  it("all cells are non-negative", () => {
    const weeks = [0, 0, 7, 14, 0, 100, -5];
    const cells = expandWeeksToDays(weeks);
    expect(cells.every((c) => c >= 0)).toBe(true);
  });

  it("trims to last 52 weeks if more are provided", () => {
    const weeks = Array.from({ length: 100 }, () => 7);
    const cells = expandWeeksToDays(weeks);
    expect(cells).toHaveLength(364);
  });
});

// ---------------------------------------------------------------------------
// Date/Time Formatting
// ---------------------------------------------------------------------------

describe("formatTimestamp", () => {
  it("returns padded spaces for empty string", () => {
    expect(formatTimestamp("")).toBe("        ");
  });

  it("returns padded spaces for invalid date", () => {
    expect(formatTimestamp("not-a-date")).toBe("        ");
  });

  it("formats valid ISO date as HH:MM:SS", () => {
    const result = formatTimestamp("2024-01-15T14:30:45Z");
    expect(result).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  });
});

describe("formatRelative", () => {
  const now = new Date("2024-06-15T12:00:00Z").getTime();

  it("returns empty string for empty input", () => {
    expect(formatRelative("", now)).toBe("");
  });

  it("returns empty string for invalid date", () => {
    expect(formatRelative("garbage", now)).toBe("");
  });

  it("returns 'just now' for very recent", () => {
    const recent = new Date(now - 10_000).toISOString(); // 10 seconds ago
    expect(formatRelative(recent, now)).toBe("just now");
  });

  it("returns minutes for <1 hour", () => {
    const ago = new Date(now - 15 * 60_000).toISOString();
    expect(formatRelative(ago, now)).toBe("15m ago");
  });

  it("returns hours for <24 hours", () => {
    const ago = new Date(now - 3 * 3600_000).toISOString();
    expect(formatRelative(ago, now)).toBe("3h ago");
  });

  it("returns days for <30 days", () => {
    const ago = new Date(now - 5 * 86400_000).toISOString();
    expect(formatRelative(ago, now)).toBe("5d ago");
  });

  it("returns months for <365 days", () => {
    const ago = new Date(now - 90 * 86400_000).toISOString();
    expect(formatRelative(ago, now)).toBe("3mo ago");
  });

  it("returns years for >=365 days", () => {
    const ago = new Date(now - 400 * 86400_000).toISOString();
    expect(formatRelative(ago, now)).toBe("1y ago");
  });

  it("handles future dates gracefully", () => {
    const future = new Date(now + 3600_000).toISOString();
    expect(formatRelative(future, now)).toBe("just now");
  });
});

// ---------------------------------------------------------------------------
// File Utilities
// ---------------------------------------------------------------------------

describe("fileIcon", () => {
  it("returns folder icon for dirs", () => {
    expect(fileIcon("dir", "src")).toBe("📁");
    expect(fileIcon("dir", "anything")).toBe("📁");
  });

  it("returns correct icons for file extensions", () => {
    expect(fileIcon("file", "README.md")).toBe("📜");
    expect(fileIcon("file", "index.ts")).toBe("⚡");
    expect(fileIcon("file", "Component.tsx")).toBe("⚡");
    expect(fileIcon("file", "main.py")).toBe("🐍");
    expect(fileIcon("file", "lib.rs")).toBe("🦀");
    expect(fileIcon("file", "main.go")).toBe("🔷");
    expect(fileIcon("file", "config.json")).toBe("⚙️");
    expect(fileIcon("file", "config.yaml")).toBe("⚙️");
    expect(fileIcon("file", "config.toml")).toBe("⚙️");
    expect(fileIcon("file", "styles.css")).toBe("🎨");
    expect(fileIcon("file", "logo.png")).toBe("🖼");
    expect(fileIcon("file", "photo.jpg")).toBe("🖼");
  });

  it("recognizes LICENSE files", () => {
    expect(fileIcon("file", "LICENSE")).toBe("📋");
    expect(fileIcon("file", "LICENSE.md")).toBe("📋");
  });

  it("recognizes .git files", () => {
    expect(fileIcon("file", ".gitignore")).toBe("🔧");
    expect(fileIcon("file", ".gitattributes")).toBe("🔧");
  });

  it("returns default for unknown extensions", () => {
    expect(fileIcon("file", "Makefile")).toBe("📄");
    expect(fileIcon("file", "unknown.xyz")).toBe("📄");
  });
});

describe("sortRepoFiles", () => {
  it("puts directories before files", () => {
    const files = [
      { type: "file" as const, name: "README.md" },
      { type: "dir" as const, name: "src" },
      { type: "file" as const, name: "index.ts" },
      { type: "dir" as const, name: "docs" },
    ];
    const sorted = sortRepoFiles(files);
    expect(sorted[0].name).toBe("docs");
    expect(sorted[1].name).toBe("src");
    expect(sorted[2].name).toBe("index.ts");
    expect(sorted[3].name).toBe("README.md");
  });

  it("sorts alphabetically within groups", () => {
    const files = [
      { type: "file" as const, name: "z.ts" },
      { type: "file" as const, name: "a.ts" },
      { type: "file" as const, name: "m.ts" },
    ];
    const sorted = sortRepoFiles(files);
    expect(sorted.map((f) => f.name)).toEqual(["a.ts", "m.ts", "z.ts"]);
  });

  it("does not mutate the original array", () => {
    const files = [
      { type: "file" as const, name: "b.ts" },
      { type: "file" as const, name: "a.ts" },
    ];
    sortRepoFiles(files);
    expect(files[0].name).toBe("b.ts");
  });

  it("handles empty array", () => {
    expect(sortRepoFiles([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// GitHub API Helpers
// ---------------------------------------------------------------------------

describe("parseLinkCount", () => {
  it("returns null for undefined", () => {
    expect(parseLinkCount(undefined)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(parseLinkCount("")).toBeNull();
  });

  it("returns null for link without last page", () => {
    expect(parseLinkCount('<https://api.github.com/repos?page=2>; rel="next"')).toBeNull();
  });

  it("parses last page from Link header", () => {
    const link =
      '<https://api.github.com/repos/owner/repo/branches?per_page=1&page=2>; rel="next", <https://api.github.com/repos/owner/repo/branches?per_page=1&page=23>; rel="last"';
    expect(parseLinkCount(link)).toBe(23);
  });

  it("parses single-digit page count", () => {
    const link =
      '<https://api.github.com/repos?page=5>; rel="last"';
    expect(parseLinkCount(link)).toBe(5);
  });
});

describe("computeOpenIssues", () => {
  it("subtracts PRs from total issue count", () => {
    expect(computeOpenIssues(100, 30)).toBe(70);
  });

  it("clamps to 0 when PRs exceed issue count", () => {
    expect(computeOpenIssues(10, 15)).toBe(0);
  });

  it("returns full count when no PRs", () => {
    expect(computeOpenIssues(50, 0)).toBe(50);
  });

  it("handles zeros", () => {
    expect(computeOpenIssues(0, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Language Percentages
// ---------------------------------------------------------------------------

describe("computeLanguagePercentages", () => {
  it("returns empty for empty input", () => {
    expect(computeLanguagePercentages({})).toEqual([]);
  });

  it("computes correct percentages", () => {
    const result = computeLanguagePercentages({
      TypeScript: 700,
      JavaScript: 300,
    });
    expect(result).toHaveLength(2);
    expect(result[0].lang).toBe("TypeScript");
    expect(result[0].pct).toBeCloseTo(70);
    expect(result[1].lang).toBe("JavaScript");
    expect(result[1].pct).toBeCloseTo(30);
  });

  it("sorts by percentage descending", () => {
    const result = computeLanguagePercentages({
      CSS: 10,
      TypeScript: 80,
      HTML: 10,
    });
    expect(result[0].lang).toBe("TypeScript");
  });

  it("handles single language", () => {
    const result = computeLanguagePercentages({ Rust: 5000 });
    expect(result).toHaveLength(1);
    expect(result[0].pct).toBeCloseTo(100);
  });

  it("handles all-zero bytes gracefully", () => {
    expect(computeLanguagePercentages({ TypeScript: 0, Rust: 0 })).toEqual([]);
  });
});
