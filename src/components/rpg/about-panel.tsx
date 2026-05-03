import type { QuestRepo } from "@/lib/types";
import { computeLanguagePercentages } from "@/lib/utils";
import { RpgPanel } from "./rpg-panel";

type AboutPanelProps = {
  repo: QuestRepo;
};

export function AboutPanel({ repo }: AboutPanelProps) {
  const langEntries = computeLanguagePercentages(repo.languages);

  return (
    <RpgPanel title="About">
      <div className="space-y-3">
        {repo.description && (
          <p className="text-sm text-text-secondary">{repo.description}</p>
        )}

        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {repo.topics.map((topic) => (
              <span
                key={topic}
                className="px-2 py-0.5 text-[10px] rounded-sm bg-accent-gold/10 text-accent-gold border border-accent-gold-dim"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="space-y-1.5 text-xs text-text-secondary">
          {repo.license && (
            <div className="flex items-center gap-2">
              <span>📋</span>
              <span>{repo.license} License</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span>👥</span>
            <span>{repo.contributors.length} Contributors</span>
          </div>
        </div>

        {langEntries.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex h-2 rounded-sm overflow-hidden">
              {langEntries.map(({ lang, pct }) => (
                <div
                  key={lang}
                  className="h-full"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: languageColor(lang),
                  }}
                  title={`${lang}: ${pct.toFixed(1)}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {langEntries.slice(0, 6).map(({ lang, pct }) => (
                <div key={lang} className="flex items-center gap-1 text-[10px]">
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{ backgroundColor: languageColor(lang) }}
                  />
                  <span className="text-text-secondary">{lang}</span>
                  <span className="text-text-muted">{pct.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </RpgPanel>
  );
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Lua: "#000080",
  Zig: "#ec915c",
  Elixir: "#6e4a7e",
  Haskell: "#5e5086",
  Scala: "#c22d40",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

function languageColor(lang: string): string {
  return LANG_COLORS[lang] ?? "#888888";
}
