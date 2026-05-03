import { Octokit } from "@octokit/rest";
import type { QuestRepo, RepoFile, Commit, Contributor } from "./types";
import { computeOpenIssues, parseLinkCount } from "./utils";

function createOctokit(accessToken?: string) {
  const auth = accessToken || process.env.GITHUB_TOKEN;
  return new Octokit(auth ? { auth } : {});
}

export interface UserRepo {
  name: string;
  owner: string;
  description: string | null;
  visibility: "public" | "private";
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
}

export async function fetchUserRepos(
  accessToken: string,
): Promise<UserRepo[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listForAuthenticatedUser({
    sort: "updated",
    per_page: 50,
    visibility: "all",
  });
  return data.map((r) => ({
    name: r.name,
    owner: r.owner.login,
    description: r.description,
    visibility: r.private ? "private" as const : "public" as const,
    stars: r.stargazers_count,
    forks: r.forks_count,
    language: r.language,
    updatedAt: r.updated_at ?? "",
  }));
}

export async function fetchQuestRepo(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<QuestRepo> {
  const octokit = createOctokit(accessToken);

  const [
    repoData,
    contents,
    readme,
    commits,
    languages,
    contributors,
    pulls,
    participation,
    branches,
    tags,
  ] = await Promise.all([
    octokit.repos.get({ owner, repo }),
    octokit.repos.getContent({ owner, repo, path: "" }).catch(() => null),
    octokit.repos
      .getReadme({ owner, repo, mediaType: { format: "html" } })
      .catch(() => null),
    octokit.repos.listCommits({ owner, repo, per_page: 10 }).catch(() => null),
    octokit.repos.listLanguages({ owner, repo }).catch(() => null),
    octokit.repos.listContributors({ owner, repo, per_page: 18 }).catch(() => null),
    octokit.pulls.list({ owner, repo, state: "open", per_page: 100 }).catch(() => null),
    octokit.repos.getParticipationStats({ owner, repo }).catch(() => null),
    octokit.repos.listBranches({ owner, repo, per_page: 1 }).catch(() => null),
    octokit.repos.listTags({ owner, repo, per_page: 1 }).catch(() => null),
  ]);

  const r = repoData.data;

  const files: RepoFile[] = Array.isArray(contents?.data)
    ? contents.data.map((f) => ({
        name: f.name,
        type: f.type === "dir" ? ("dir" as const) : ("file" as const),
        path: f.path,
      }))
    : [];

  const latestCommits: Commit[] = (commits?.data ?? []).map((c) => ({
    sha: c.sha,
    message: c.commit.message.split("\n")[0],
    authorName: c.commit.author?.name ?? c.author?.login ?? "Unknown",
    authorAvatarUrl: c.author?.avatar_url ?? null,
    date: c.commit.author?.date ?? "",
  }));

  const contributorList: Contributor[] = (
    Array.isArray(contributors?.data) ? contributors.data : []
  )
    .filter((c): c is NonNullable<typeof c> & { login: string } => !!c.login)
    .map((c) => ({
      login: c.login!,
      avatarUrl: c.avatar_url ?? "",
      contributions: c.contributions ?? 0,
    }));

  const readmeHtml =
    readme?.data != null
      ? typeof readme.data === "string"
        ? readme.data
        : (readme.data as unknown as { content?: string }).content ?? null
      : null;

  const contributionWeeks: number[] = participation?.data?.all ?? [];

  const branchCount = parseLinkCount(branches?.headers?.link as string | undefined) ?? 1;
  const tagCount = parseLinkCount(tags?.headers?.link as string | undefined) ?? 0;

  const totalCommits = contributorList.reduce((sum, c) => sum + c.contributions, 0);

  return {
    name: r.name,
    owner: r.owner.login,
    description: r.description,
    visibility: r.private ? "private" : "public",
    stars: r.stargazers_count,
    forks: r.forks_count,
    watchers: r.subscribers_count,
    openIssues: computeOpenIssues(r.open_issues_count, pulls?.data?.length ?? 0),
    openPRs: pulls?.data?.length ?? 0,
    defaultBranch: r.default_branch,
    languages: (languages?.data as Record<string, number>) ?? {},
    topics: r.topics ?? [],
    license: r.license?.spdx_id ?? null,
    files,
    latestCommits,
    totalCommits,
    branchCount,
    tagCount,
    readmeHtml,
    contributors: contributorList,
    contributionWeeks,
  };
}

