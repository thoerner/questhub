import { notFound } from "next/navigation";
import { fetchQuestRepo } from "@/lib/github";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TopBar } from "@/components/rpg/top-bar";
import { InventorySidebar } from "@/components/rpg/inventory-sidebar";
import { RepoHeader } from "@/components/rpg/repo-header";
import { RpgTabs } from "@/components/rpg/rpg-tabs";
import { FileScroll } from "@/components/rpg/file-scroll";
import { ReadmeTome } from "@/components/rpg/readme-tome";
import { AboutPanel } from "@/components/rpg/about-panel";
import { ContributionMap } from "@/components/rpg/contribution-map";
import { CommitTerminal } from "@/components/rpg/commit-terminal";

type PageProps = {
  params: Promise<{ owner: string; repo: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { owner, repo } = await params;
  return {
    title: `${owner}/${repo} — QuestHub`,
    description: `RPG-themed dashboard for ${owner}/${repo}`,
  };
}

async function getAccessToken(): Promise<string | undefined> {
  try {
    const session = await auth();
    if (!session?.user?.id) return undefined;
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    });
    return account?.access_token ?? undefined;
  } catch {
    return undefined;
  }
}

export default async function RepoPage({ params }: PageProps) {
  const { owner, repo } = await params;
  const accessToken = await getAccessToken();

  let data;
  try {
    data = await fetchQuestRepo(owner, repo, accessToken);
  } catch (err: unknown) {
    const status =
      err instanceof Object && "status" in err
        ? (err as { status: number }).status
        : 500;
    if (status === 404) notFound();
    throw err;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        stars={data.stars}
        forks={data.forks}
        issues={data.openIssues}
        prs={data.openPRs}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3">
        {/* Left sidebar */}
        <aside className="w-full lg:w-52 shrink-0">
          <InventorySidebar repo={data} />
        </aside>

        {/* Center content */}
        <main className="flex-1 min-w-0 space-y-3">
          <div className="ornate-border rounded-sm bg-surface-raised p-3 space-y-3">
            <RepoHeader repo={data} />

            <RpgTabs
              defaultTab="code"
              tabs={[
                {
                  id: "code",
                  label: "Code",
                  icon: "📜",
                  content: (
                    <div className="pt-3">
                      <FileScroll
                        files={data.files}
                        defaultBranch={data.defaultBranch}
                        latestCommit={data.latestCommits[0]}
                        totalCommits={data.totalCommits}
                        branchCount={data.branchCount}
                        tagCount={data.tagCount}
                      />
                    </div>
                  ),
                },
                {
                  id: "issues",
                  label: "Issues",
                  icon: "🐛",
                  count: data.openIssues,
                  content: (
                    <div className="py-8 text-center text-text-muted text-sm">
                      Issue tracking coming in Phase 3.
                    </div>
                  ),
                },
                {
                  id: "pulls",
                  label: "Pull Requests",
                  icon: "🔀",
                  count: data.openPRs,
                  content: (
                    <div className="py-8 text-center text-text-muted text-sm">
                      Pull request dashboard coming in Phase 3.
                    </div>
                  ),
                },
                {
                  id: "actions",
                  label: "Actions",
                  icon: "⚒️",
                  content: (
                    <div className="py-8 text-center text-text-muted text-sm">
                      Forge / Workshop coming in a future phase.
                    </div>
                  ),
                },
                {
                  id: "wiki",
                  label: "Wiki",
                  icon: "📖",
                  content: (
                    <div className="py-8 text-center text-text-muted text-sm">
                      Wiki coming in a future phase.
                    </div>
                  ),
                },
              ]}
            />
          </div>

          <ReadmeTome html={data.readmeHtml} />
        </main>

        {/* Right sidebar */}
        <aside className="w-full lg:w-64 shrink-0 space-y-3">
          <AboutPanel repo={data} />
          <ContributionMap weeks={data.contributionWeeks} />
          <CommitTerminal commits={data.latestCommits} />
        </aside>
      </div>

      <footer className="border-t-2 border-accent-gold-dim bg-surface-raised px-3 py-1 flex items-center justify-between text-[8px] text-text-muted font-display">
        <span className="text-accent-gold">PIP-80/13</span>
        <span className="tracking-widest">TERMINAL LINK</span>
      </footer>
    </div>
  );
}
