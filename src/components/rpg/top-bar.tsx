import Link from "next/link";
import { formatResourceCounter } from "@/lib/utils";
import { auth, signOut } from "@/auth";
import { SearchInput } from "./search-input";

type TopBarProps = {
  stars?: number;
  forks?: number;
  issues?: number;
  prs?: number;
};

export async function TopBar({ stars, forks, issues, prs }: TopBarProps) {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="bg-surface-raised border-b-2 border-accent-gold px-3 py-1.5 flex items-center gap-3">
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <span className="font-display text-accent text-sm leading-none" aria-hidden="true">
          ◆
        </span>
        <span className="font-display text-[9px] text-accent-gold glow-gold tracking-widest leading-none">
          QUEST FOR CODE
        </span>
        <span className="text-[8px] text-text-muted font-display leading-none">
          v2.0.0
        </span>
      </Link>

      <SearchInput className="flex-1 max-w-sm" placeholder="Search or jump to..." />

      {stars != null && (
        <div className="hidden md:flex items-center gap-1">
          <ResourceCounter icon="♥" value={stars} color="text-accent-red" />
          <ResourceCounter icon="◈" value={forks ?? 0} color="text-accent" />
          <ResourceCounter icon="◆" value={issues ?? 0} color="text-accent-blue" />
          <ResourceCounter icon="⬡" value={prs ?? 0} color="text-accent-yellow" />
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto shrink-0">
        {user ? (
          <>
            <Link
              href="/dashboard"
              className="font-display text-[9px] text-text-muted hover:text-accent-gold tracking-wider transition-colors"
            >
              QUESTS
            </Link>
            <div className="flex items-center gap-1.5">
              {user.image && (
                <img
                  src={user.image}
                  alt=""
                  className="w-5 h-5 rounded-sm border border-accent-gold-dim"
                />
              )}
              <span className="font-display text-[9px] text-accent-gold tracking-wider hidden sm:inline">
                {user.name ?? "Adventurer"}
              </span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="font-display text-[8px] text-text-muted hover:text-accent-red tracking-wider transition-colors cursor-pointer"
              >
                SIGN OUT
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/login"
            className="font-display text-[9px] text-accent-gold hover:text-accent tracking-wider transition-colors border border-accent-gold-dim px-2 py-0.5 rounded-sm"
          >
            SIGN IN
          </Link>
        )}
      </div>
    </header>
  );
}

function ResourceCounter({
  icon,
  value,
  color,
}: {
  icon: string;
  value: number;
  color: string;
}) {
  return (
    <span
      className={`font-display text-[9px] ${color} px-1.5 py-0.5 flex items-center gap-1 leading-none`}
    >
      <span className="text-[10px]">{icon}</span>
      {formatResourceCounter(value)}
    </span>
  );
}
