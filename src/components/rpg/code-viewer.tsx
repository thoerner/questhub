import { codeToHtml } from "shiki";
import type { FileContent } from "@/lib/types";

type CodeViewerProps = {
  file: FileContent;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function guessLang(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    ts: "typescript", tsx: "tsx", js: "javascript", jsx: "jsx",
    py: "python", rb: "ruby", rs: "rust", go: "go",
    java: "java", kt: "kotlin", c: "c", cpp: "cpp", h: "c",
    cs: "csharp", swift: "swift", php: "php", sh: "bash",
    bash: "bash", zsh: "bash", fish: "fish",
    yml: "yaml", yaml: "yaml", toml: "toml", json: "json",
    md: "markdown", mdx: "mdx", html: "html", css: "css",
    scss: "scss", less: "less", sql: "sql", graphql: "graphql",
    dockerfile: "dockerfile", prisma: "prisma",
    vue: "vue", svelte: "svelte", astro: "astro",
    xml: "xml", svg: "xml", lock: "text", txt: "text",
    env: "bash", gitignore: "text", makefile: "makefile",
  };
  const lower = name.toLowerCase();
  if (lower === "dockerfile") return "dockerfile";
  if (lower === "makefile") return "makefile";
  return map[ext] || "text";
}

export async function CodeViewer({ file }: CodeViewerProps) {
  const lineCount = file.content.split("\n").length;
  const isBinary = !file.content && file.size > 0;

  let highlightedHtml = "";
  if (!isBinary && file.content) {
    try {
      highlightedHtml = await codeToHtml(file.content, {
        lang: guessLang(file.name),
        theme: "github-dark-default",
      });
    } catch {
      highlightedHtml = "";
    }
  }

  return (
    <div className="ornate-border rounded-sm bg-surface overflow-hidden">
      {/* File header */}
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-border-subtle bg-surface-raised text-xs">
        <span className="text-text-primary font-medium">{file.name}</span>
        <span className="text-text-muted ml-auto">
          {lineCount} lines
        </span>
        <span className="text-text-muted">
          {formatSize(file.size)}
        </span>
      </div>

      {/* Code body */}
      {isBinary ? (
        <div className="p-8 text-center text-text-muted text-sm">
          Binary file not shown ({formatSize(file.size)})
        </div>
      ) : highlightedHtml ? (
        <div
          className="code-viewer overflow-x-auto text-sm"
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      ) : (
        <pre className="p-4 overflow-x-auto text-sm text-text-primary">
          <code>{file.content}</code>
        </pre>
      )}
    </div>
  );
}
