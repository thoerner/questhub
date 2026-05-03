import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchUserRepos } from "@/lib/github";
import { redirect } from "next/navigation";
import { TopBar } from "@/components/rpg/top-bar";
import { RpgPanel } from "@/components/rpg/rpg-panel";
import { formatRelative } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) redirect("/login");

  const repos = await fetchUserRepos(account.access_token);

  const publicCount = repos.filter((r) => r.visibility === "public").length;
  const privateCount = repos.filter((r) => r.visibility === "private").length;

  return (
    <div className="flex flex-col min-h-screen">
    <TopBar />
    <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full space-y-6">
      <div className="flex items-center gap-4">
        {session.user.image && (
          <img
            src={session.user.image}
            alt=""
            className="w-10 h-10 rounded-sm border border-accent-gold-dim"
          />
        )}
        <div>
          <h1 className="font-display text-sm text-accent-gold tracking-wider">
            QUEST BOARD
          </h1>
          <p className="text-text-muted text-xs">
            {session.user.name ?? session.user.email ?? "Adventurer"}&apos;s
            Repositories
          </p>
        </div>
      </div>

      <div className="flex gap-4 text-[10px] font-display tracking-wider">
        <span className="text-accent">
          ◆ {repos.length} quest{repos.length !== 1 ? "s" : ""}
        </span>
        <span className="text-green-400">
          ⬡ {publicCount} public
        </span>
        <span className="text-yellow-400">
          ◈ {privateCount} private
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {repos.map((repo) => (
          <Link key={`${repo.owner}/${repo.name}`} href={`/repo/${repo.owner}/${repo.name}`}>
            <RpgPanel compact className="hover:border-accent-gold transition-colors h-full">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-[10px] text-accent-gold tracking-wider truncate">
                    {repo.owner}/{repo.name}
                  </h2>
                  <span
                    className={`text-[8px] font-display tracking-wider px-1.5 py-0.5 rounded-sm border ${
                      repo.visibility === "private"
                        ? "text-yellow-400 border-yellow-400/30"
                        : "text-green-400 border-green-400/30"
                    }`}
                  >
                    {repo.visibility === "private" ? "◈ PRIVATE" : "⬡ PUBLIC"}
                  </span>
                </div>

                {repo.description && (
                  <p className="text-text-secondary text-xs line-clamp-2">
                    {repo.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[10px] text-text-muted">
                  {repo.language && (
                    <span className="text-accent">● {repo.language}</span>
                  )}
                  <span>★ {repo.stars}</span>
                  <span>⑂ {repo.forks}</span>
                  <span className="ml-auto">
                    {formatRelative(repo.updatedAt)}
                  </span>
                </div>
              </div>
            </RpgPanel>
          </Link>
        ))}
      </div>

      {repos.length === 0 && (
        <RpgPanel>
          <div className="text-center py-8 space-y-2">
            <p className="font-display text-sm text-accent-gold tracking-wider">
              NO QUESTS FOUND
            </p>
            <p className="text-text-muted text-xs">
              You don&apos;t have any repositories yet. Create one on GitHub to
              see it here.
            </p>
          </div>
        </RpgPanel>
      )}
    </div>
    </div>
  );
}
