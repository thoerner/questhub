import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-6">
      <div className="space-y-2">
        <h1 className="font-display text-2xl text-accent-red">404</h1>
        <p className="font-display text-xs text-accent-gold glow-gold">
          QUEST NOT FOUND
        </p>
      </div>
      <p className="text-text-muted text-sm max-w-md">
        The repository you seek does not exist, or it lies beyond the reach of
        public access. Check the path and try again.
      </p>
      <Link
        href="/"
        className="px-4 py-2 text-sm bg-accent-gold/20 border border-accent-gold text-accent-gold rounded-sm hover:bg-accent-gold/30 transition-colors"
      >
        Return to Town
      </Link>
    </div>
  );
}
