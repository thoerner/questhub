# QuestHub

A fantasy RPG-themed GitHub client. View any public repository as an adventure.

## Features

- **Repo Dashboard** — Enter any `owner/repo` and see it rendered as an RPG terminal interface
- **Contribution Tilemap** — Activity mapped to terrain: wasteland, grassland, forest, mountain, shrine
- **Commit Terminal** — Recent commits as a scrolling green-text log
- **RPG Stats** — Stars, forks, and watchers as HP, MP, and EXP bars
- **Language Breakdown** — Color-coded language distribution
- **File Scroll** — Root file listing with type-aware icons

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and enter a public repo (e.g. `vercel/next.js`).

### Optional: Higher Rate Limits

Unauthenticated GitHub API requests are limited to 60/hour. To get 5,000/hour, create a [personal access token](https://github.com/settings/tokens) with no scopes and add it to `.env.local`:

```
GITHUB_TOKEN=ghp_your_token_here
```

## Tech Stack

- Next.js 16 (App Router, React Server Components)
- Tailwind CSS 4
- Octokit (GitHub REST API)
- TypeScript

## Status

Phase 1: Read-only public repo viewer. No auth, no write operations.

## License

MIT
