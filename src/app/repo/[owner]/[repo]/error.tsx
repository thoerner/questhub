"use client";

import Link from "next/link";

export default function RepoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isRateLimit = error.message?.includes("rate limit");

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-accent-red">
          {isRateLimit ? "⚠️" : "💀"}
        </h1>
        <p className="font-display text-xs text-accent-gold glow-gold">
          {isRateLimit ? "RATE LIMIT EXCEEDED" : "QUEST FAILED"}
        </p>
      </div>
      <p className="text-text-muted text-sm max-w-md">
        {isRateLimit
          ? "The GitHub API rate limit has been reached. Unauthenticated requests are limited to 60 per hour. Try again shortly, or add a GITHUB_TOKEN to .env.local for 5,000 requests per hour."
          : "Something went wrong while fetching repository data. The dungeon may be temporarily sealed."}
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-accent-gold/20 border border-accent-gold text-accent-gold rounded-sm hover:bg-accent-gold/30 transition-colors"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="px-4 py-2 text-sm border border-border-subtle text-text-secondary rounded-sm hover:bg-surface-overlay transition-colors"
        >
          Return to Town
        </Link>
      </div>
    </div>
  );
}
