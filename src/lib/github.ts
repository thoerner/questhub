import { Octokit } from "@octokit/rest";
import type { QuestRepo, RepoFile, FileContent, Commit, Contributor, IssueItem, IssueListResult } from "./types";
import { computeOpenIssues, parseLinkCount } from "./utils";
import { cached } from "./cache";

const TTL_SHORT = 2 * 60 * 1000; // 2 min — commits, issues, PRs
const TTL_LONG = 5 * 60 * 1000; // 5 min — repo metadata, files, branches

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

async function _fetchQuestRepo(
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
        size: f.size,
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

export function fetchQuestRepo(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<QuestRepo> {
  if (accessToken) return _fetchQuestRepo(owner, repo, accessToken);
  return cached(`repo:${owner}/${repo}`, TTL_LONG, () =>
    _fetchQuestRepo(owner, repo),
  );
}

async function _fetchDirContents(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  accessToken?: string,
): Promise<RepoFile[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  if (!Array.isArray(data)) return [];
  return data.map((f) => ({
    name: f.name,
    type: f.type === "dir" ? ("dir" as const) : ("file" as const),
    path: f.path,
    size: f.size,
  }));
}

export function fetchDirContents(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  accessToken?: string,
): Promise<RepoFile[]> {
  if (accessToken) return _fetchDirContents(owner, repo, path, ref, accessToken);
  return cached(`dir:${owner}/${repo}:${ref}:${path}`, TTL_LONG, () =>
    _fetchDirContents(owner, repo, path, ref),
  );
}

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB

async function _fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  accessToken?: string,
): Promise<FileContent> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.getContent({ owner, repo, path, ref });
  if (Array.isArray(data) || data.type !== "file") {
    throw Object.assign(new Error("Not a file"), { status: 400 });
  }
  const size = data.size ?? 0;
  let content = "";
  if ("content" in data && data.content && size <= MAX_FILE_SIZE) {
    content = Buffer.from(data.content, "base64").toString("utf-8");
  }
  return { name: data.name, path: data.path, content, size };
}

export function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  ref: string,
  accessToken?: string,
): Promise<FileContent> {
  if (accessToken) return _fetchFileContent(owner, repo, path, ref, accessToken);
  return cached(`file:${owner}/${repo}:${ref}:${path}`, TTL_LONG, () =>
    _fetchFileContent(owner, repo, path, ref),
  );
}

const ITEMS_PER_PAGE = 25;

async function _fetchRepoIssues(
  owner: string,
  repo: string,
  state: "open" | "closed",
  page: number,
  accessToken?: string,
): Promise<IssueListResult> {
  const octokit = createOctokit(accessToken);
  const { data, headers } = await octokit.issues.listForRepo({
    owner,
    repo,
    state,
    per_page: ITEMS_PER_PAGE,
    page,
    sort: "created",
    direction: "desc",
  });

  const filtered = data.filter((i) => !i.pull_request);
  const linkHeader = headers.link ?? "";
  const hasMore = linkHeader.includes('rel="next"');
  const items: IssueItem[] = filtered.map((i) => ({
    number: i.number,
    title: i.title,
    state: i.state as "open" | "closed",
    author: i.user?.login ?? "Unknown",
    authorAvatar: i.user?.avatar_url ?? null,
    createdAt: i.created_at,
    commentsCount: i.comments,
    labels: (i.labels ?? [])
      .map((l) => (typeof l === "string" ? null : { name: l.name ?? "", color: l.color ?? "333" }))
      .filter((l): l is { name: string; color: string } => l !== null),
    isPR: false,
  }));

  return { items, hasMore };
}

export function fetchRepoIssues(
  owner: string,
  repo: string,
  state: "open" | "closed",
  page: number,
  accessToken?: string,
): Promise<IssueListResult> {
  if (accessToken) return _fetchRepoIssues(owner, repo, state, page, accessToken);
  return cached(`issues:${owner}/${repo}:${state}:${page}`, TTL_SHORT, () =>
    _fetchRepoIssues(owner, repo, state, page),
  );
}

async function _fetchRepoPulls(
  owner: string,
  repo: string,
  state: "open" | "closed",
  page: number,
  accessToken?: string,
): Promise<IssueListResult> {
  const octokit = createOctokit(accessToken);
  const { data, headers } = await octokit.pulls.list({
    owner,
    repo,
    state,
    per_page: ITEMS_PER_PAGE,
    page,
    sort: "created",
    direction: "desc",
  });

  const linkHeader = headers.link ?? "";
  const hasMore = linkHeader.includes('rel="next"');
  const items: IssueItem[] = data.map((p) => ({
    number: p.number,
    title: p.title,
    state: p.state as "open" | "closed",
    author: p.user?.login ?? "Unknown",
    authorAvatar: p.user?.avatar_url ?? null,
    createdAt: p.created_at,
    commentsCount: 0,
    labels: (p.labels ?? [])
      .map((l) => (typeof l === "string" ? null : { name: l.name ?? "", color: l.color ?? "333" }))
      .filter((l): l is { name: string; color: string } => l !== null),
    isPR: true,
  }));

  return { items, hasMore };
}

export function fetchRepoPulls(
  owner: string,
  repo: string,
  state: "open" | "closed",
  page: number,
  accessToken?: string,
): Promise<IssueListResult> {
  if (accessToken) return _fetchRepoPulls(owner, repo, state, page, accessToken);
  return cached(`pulls:${owner}/${repo}:${state}:${page}`, TTL_SHORT, () =>
    _fetchRepoPulls(owner, repo, state, page),
  );
}

async function _fetchBranches(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<string[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  });
  return data.map((b) => b.name);
}

export function fetchBranches(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<string[]> {
  if (accessToken) return _fetchBranches(owner, repo, accessToken);
  return cached(`branches:${owner}/${repo}`, TTL_LONG, () =>
    _fetchBranches(owner, repo),
  );
}

async function _fetchTags(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<string[]> {
  const octokit = createOctokit(accessToken);
  const { data } = await octokit.repos.listTags({
    owner,
    repo,
    per_page: 100,
  });
  return data.map((t) => t.name);
}

export function fetchTags(
  owner: string,
  repo: string,
  accessToken?: string,
): Promise<string[]> {
  if (accessToken) return _fetchTags(owner, repo, accessToken);
  return cached(`tags:${owner}/${repo}`, TTL_LONG, () =>
    _fetchTags(owner, repo),
  );
}

