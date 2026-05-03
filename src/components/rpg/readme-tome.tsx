import { RpgPanel } from "./rpg-panel";

type ReadmeTomeProps = {
  html: string | null;
};

export function ReadmeTome({ html }: ReadmeTomeProps) {
  if (!html) {
    return (
      <RpgPanel title="README" variant="parchment">
        <p className="text-text-muted text-sm italic">
          No README found in this repository.
        </p>
      </RpgPanel>
    );
  }

  return (
    <RpgPanel title="README.md" variant="parchment">
      <div
        className="readme-content prose prose-invert prose-sm max-w-none
          [&_a]:text-accent-gold [&_a:hover]:text-accent-gold/80
          [&_h1]:text-accent-gold [&_h1]:font-display [&_h1]:text-sm [&_h1]:border-b [&_h1]:border-accent-gold-dim [&_h1]:pb-2
          [&_h2]:text-accent-gold [&_h2]:font-display [&_h2]:text-xs [&_h2]:mt-6
          [&_h3]:text-accent-gold [&_h3]:text-xs
          [&_code]:bg-surface [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-accent
          [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border-subtle [&_pre]:rounded-sm
          [&_img]:rounded-sm [&_img]:border [&_img]:border-border-subtle
          [&_blockquote]:border-accent-gold-dim [&_blockquote]:text-text-secondary
          [&_table]:border-collapse [&_th]:border [&_th]:border-border-subtle [&_th]:px-2 [&_th]:py-1 [&_th]:bg-surface
          [&_td]:border [&_td]:border-border-subtle [&_td]:px-2 [&_td]:py-1
          [&_li]:text-text-secondary
          [&_p]:text-text-secondary
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </RpgPanel>
  );
}
