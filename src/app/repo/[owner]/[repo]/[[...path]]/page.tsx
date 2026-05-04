import { notFound } from "next/navigation";
import { fetchQuestRepo, fetchDirContents, fetchFileContent, fetchRepoIssues, fetchRepoPulls } from "@/lib/github";
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
import { Breadcrumb } from "@/components/rpg/breadcrumb";
import { CodeViewer } from "@/components/rpg/code-viewer";
import { IssueList } from "@/components/rpg/issue-list";
import { BranchSelector } from "@/components/rpg/branch-selector";

type PageProps = {
  params: Promise<{ owner: string; repo: string; path?: string[] }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { owner, repo, path } = await params;
  const suffix = path?.length ? ` / ${path[path.length - 1]}` : "";
  return {
    title: `${owner}/${repo}${suffix} — QuestHub`,
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

function parsePath(segments?: string[]) {
  if (!segments || segments.length === 0) {
    return { view: "dashboard" as const, ref: "", filePath: "" };
  }
  const [viewType, ref, ...rest] = segments;
  if ((viewType === "tree" || viewType === "blob") && ref) {
    return { view: viewType, ref, filePath: rest.join("/") };
  }
  notFound();
}

export default async function RepoPage({ params }: PageProps) {
  const { owner, repo, path: pathSegments } = await params;
  const accessToken = await getAccessToken();
  const { view, ref, filePath } = parsePath(pathSegments);

  if (view === "dashboard") {
    return <DashboardView owner={owner} repo={repo} accessToken={accessToken} />;
  }

  if (view === "tree") {
    return (
      <BrowseView
        owner={owner}
        repo={repo}
        branch={ref}
        filePath={filePath}
        accessToken={accessToken}
      />
    );
  }

  // view === "blob"
  return (
    <FileView
      owner={owner}
      repo={repo}
      branch={ref}
      filePath={filePath}
      accessToken={accessToken}
    />
  );
}

async function DashboardView({
  owner,
  repo,
  accessToken,
}: {
  owner: string;
  repo: string;
  accessToken?: string;
}) {
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

  const [issuesResult, pullsResult] = await Promise.all([
    fetchRepoIssues(owner, repo, "open", 1, accessToken).catch(() => ({ items: [], hasMore: false })),
    fetchRepoPulls(owner, repo, "open", 1, accessToken).catch(() => ({ items: [], hasMore: false })),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <TopBar
        stars={data.stars}
        forks={data.forks}
        issues={data.openIssues}
        prs={data.openPRs}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-3 p-3">
        <aside className="w-full lg:w-52 shrink-0">
          <InventorySidebar repo={data} />
        </aside>

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
                        owner={owner}
                        repo={repo}
                        branch={data.defaultBranch}
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
                    <IssueList
                      owner={owner}
                      repo={repo}
                      type="issues"
                      initialItems={issuesResult.items}
                      initialHasMore={issuesResult.hasMore}
                      openCount={data.openIssues}
                    />
                  ),
                },
                {
                  id: "pulls",
                  label: "Pull Requests",
                  icon: "🔀",
                  count: data.openPRs,
                  content: (
                    <IssueList
                      owner={owner}
                      repo={repo}
                      type="pulls"
                      initialItems={pullsResult.items}
                      initialHasMore={pullsResult.hasMore}
                      openCount={data.openPRs}
                    />
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

async function BrowseView({
  owner,
  repo,
  branch,
  filePath,
  accessToken,
}: {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  accessToken?: string;
}) {
  let files;
  try {
    files = await fetchDirContents(owner, repo, filePath, branch, accessToken);
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
      <TopBar />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
        <Breadcrumb owner={owner} repo={repo} branch={branch} path={filePath} />

        <FileScroll
          files={files}
          owner={owner}
          repo={repo}
          branch={branch}
          currentPath={filePath}
          viewType="tree"
        />
      </div>
    </div>
  );
}

async function FileView({
  owner,
  repo,
  branch,
  filePath,
  accessToken,
}: {
  owner: string;
  repo: string;
  branch: string;
  filePath: string;
  accessToken?: string;
}) {
  let file;
  try {
    file = await fetchFileContent(owner, repo, filePath, branch, accessToken);
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
      <TopBar />

      <div className="flex-1 max-w-5xl mx-auto w-full p-4 space-y-4">
        <div className="flex items-center gap-3">
          <BranchSelector
            owner={owner}
            repo={repo}
            currentRef={branch}
            currentPath={filePath}
            viewType="blob"
          />
          <Breadcrumb
            owner={owner}
            repo={repo}
            branch={branch}
            path={filePath}
            isFile
          />
        </div>

        <CodeViewer file={file} />
      </div>
    </div>
  );
}
