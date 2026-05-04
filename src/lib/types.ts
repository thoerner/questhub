export type RepoFile = {
  name: string;
  type: "file" | "dir";
  path: string;
  size?: number;
};

export type FileContent = {
  name: string;
  path: string;
  content: string;
  size: number;
};

export type Commit = {
  sha: string;
  message: string;
  authorName: string;
  authorAvatarUrl: string | null;
  date: string;
};

export type Contributor = {
  login: string;
  avatarUrl: string;
  contributions: number;
};

export type IssueItem = {
  number: number;
  title: string;
  state: "open" | "closed";
  author: string;
  authorAvatar: string | null;
  createdAt: string;
  commentsCount: number;
  labels: { name: string; color: string }[];
  isPR: boolean;
};

export type IssueListResult = {
  items: IssueItem[];
  hasMore: boolean;
};

export type QuestRepo = {
  name: string;
  owner: string;
  description: string | null;
  visibility: "public" | "private";
  stars: number;
  forks: number;
  watchers: number;
  openIssues: number;
  openPRs: number;
  defaultBranch: string;
  languages: Record<string, number>;
  topics: string[];
  license: string | null;
  files: RepoFile[];
  latestCommits: Commit[];
  totalCommits: number;
  branchCount: number;
  tagCount: number;
  readmeHtml: string | null;
  contributors: Contributor[];
  contributionWeeks: number[];
};
