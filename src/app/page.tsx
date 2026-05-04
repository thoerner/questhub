import Link from "next/link";
import { SearchInput } from "@/components/rpg/search-input";
import { auth, signIn } from "@/auth";

const exampleRepos = [
  { slug: "facebook/react", label: "React" },
  { slug: "vercel/next.js", label: "Next.js" },
  { slug: "torvalds/linux", label: "Linux" },
  { slug: "denoland/deno", label: "Deno" },
  { slug: "thoerner/questhub", label: "QuestHub" },
];

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 bg-[url('/backgrounds/bg-hero-vignette.webp')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-lg text-center space-y-8">
        <div className="space-y-4">
          <img
            src="/images/hero-emblem.webp"
            alt=""
            aria-hidden="true"
            className="w-32 h-32 mx-auto drop-shadow-[0_0_12px_rgba(212,169,64,0.4)]"
          />
          <h1 className="font-display text-lg text-accent-gold glow-gold tracking-widest leading-none">
            QUEST FOR CODE
          </h1>
          <p className="text-text-muted text-xs font-display tracking-wider">
            The adventure begins with code.
          </p>
        </div>

        <div className="ornate-border rounded-sm bg-surface-raised p-6 space-y-5">
          <p className="text-text-secondary text-sm">
            Enter a public GitHub repository to begin your quest.
          </p>
          <SearchInput size="lg" placeholder="owner/repo (e.g. vercel/next.js)" />
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {exampleRepos.map(({ slug, label }) => (
              <Link
                key={slug}
                href={`/repo/${slug}`}
                className="px-2.5 py-1 text-[10px] border border-border-subtle rounded-sm text-text-muted hover:text-accent-gold hover:border-accent-gold-dim transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {!session?.user && (
          <div className="ornate-border rounded-sm bg-surface-raised p-5 space-y-3">
            <div className="font-display text-accent-gold text-2xl leading-none" aria-hidden="true">
              ⚔
            </div>
            <p className="font-display text-xs tracking-wider text-accent-gold">
              JOIN THE GUILD
            </p>
            <p className="text-text-secondary text-sm leading-relaxed">
              Sign in to unlock private repositories and track your quest
              progress on your personal dashboard.
            </p>
            <form
              action={async () => {
                "use server";
                await signIn("github", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="px-5 py-2 font-display text-[10px] tracking-wider border border-accent-gold-dim text-accent-gold rounded-sm hover:bg-accent-gold hover:text-surface transition-colors cursor-pointer"
              >
                <span className="text-base" aria-hidden="true">◆</span> SIGN IN WITH GITHUB <span className="text-base" aria-hidden="true">◆</span>
              </button>
            </form>
          </div>
        )}

        <div className="flex justify-center gap-4 text-[8px] text-text-muted font-display tracking-wider">
          <span>v1.0.0</span>
          <span className="text-accent-gold-dim">◈</span>
          <span>PHASE 1: READ-ONLY</span>
        </div>
      </div>
    </div>
  );
}
