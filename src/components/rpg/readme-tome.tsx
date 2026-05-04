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
        className="readme-content prose prose-invert prose-lg max-w-none
          [&_a]:text-accent-gold [&_a:hover]:text-accent-gold/80 [&_a]:underline-offset-2
          [&_h1]:text-accent-gold [&_h1]:font-display [&_h1]:text-xl [&_h1]:border-b-2 [&_h1]:border-accent-gold-dim [&_h1]:pb-3 [&_h1]:mb-6 [&_h1]:mt-2
          [&_h2]:text-accent-gold [&_h2]:font-display [&_h2]:text-base [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-accent-gold-dim/40 [&_h2]:pb-2
          [&_h3]:text-accent-gold [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-8 [&_h3]:mb-3
          [&_h4]:text-accent-gold [&_h4]:text-sm [&_h4]:font-semibold
          [&_h1>a]:hidden [&_h2>a]:hidden [&_h3>a]:hidden [&_h4>a]:hidden
          [&_a:has(svg)]:hidden
          [&_code]:bg-surface [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded-sm [&_code]:text-accent [&_code]:text-[0.85em]
          [&_pre]:bg-surface [&_pre]:border [&_pre]:border-border-subtle [&_pre]:rounded-sm
          [&_img]:rounded-sm [&_img]:border [&_img]:border-border-subtle
          [&_blockquote]:border-accent-gold-dim [&_blockquote]:text-text-secondary [&_blockquote]:italic
          [&_table]:border-collapse [&_th]:border [&_th]:border-border-subtle [&_th]:px-3 [&_th]:py-2 [&_th]:bg-surface [&_th]:text-sm [&_th]:font-semibold
          [&_td]:border [&_td]:border-border-subtle [&_td]:px-3 [&_td]:py-2 [&_td]:text-sm
          [&_li]:text-text-secondary [&_li]:leading-7
          [&_p]:text-text-secondary [&_p]:leading-7
          [&_strong]:text-text-primary [&_strong]:font-semibold
          [&_hr]:border-accent-gold-dim/30
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </RpgPanel>
  );
}
