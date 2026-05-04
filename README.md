# QuestHub

A fantasy RPG-themed GitHub client. View any public repository as an adventure.

**Live:** [https://questhub.crypt0potam.us](https://questhub.crypt0potam.us)

## Features

- **Repo Dashboard** — Enter any `owner/repo` and see it rendered as an RPG terminal interface
- **Contribution Tilemap** — Activity mapped to terrain: wasteland, grassland, forest, mountain, shrine
- **Commit Terminal** — Recent commits as a scrolling green-text log
- **RPG Stats** — Stars, forks, and watchers as HP, MP, and EXP bars
- **Language Breakdown** — Color-coded language distribution
- **File Scroll** — Root file listing with type-aware icons
- **GitHub OAuth** — Sign in with GitHub for higher API rate limits and a personal dashboard

## Tech Stack

- Next.js 16 (App Router, React Server Components)
- Tailwind CSS 4
- Octokit (GitHub REST API)
- Auth.js (NextAuth v5) with GitHub OAuth
- Prisma with PostgreSQL
- Shiki (syntax highlighting)
- TypeScript

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL (local or Docker)

### Local Development

1. **Clone and install dependencies:**

```bash
pnpm install
```

2. **Set up environment variables:**

```bash
cp .env.example .env
```

Edit `.env` and fill in the required values (see [Environment Variables](#environment-variables) below).

3. **Start PostgreSQL** (if using Docker):

```bash
docker run -d --name questhub-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=questhub \
  -p 5432:5432 postgres:17
```

4. **Run database migrations:**

```bash
npx prisma migrate deploy
```

5. **Generate the Prisma client:**

```bash
npx prisma generate
```

6. **Start the dev server:**

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and enter a public repo (e.g. `vercel/next.js`).

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (see [SSL/TLS](#ssltls-with-rds) for production) |
| `AUTH_SECRET` | Yes | Auth.js secret. Generate with `openssl rand -base64 32` |
| `AUTH_GITHUB_ID` | Yes | GitHub OAuth App client ID |
| `AUTH_GITHUB_SECRET` | Yes | GitHub OAuth App client secret |
| `AUTH_URL` | Production | Canonical public URL (e.g. `https://questhub.crypt0potam.us`) |
| `AUTH_TRUST_HOST` | Production | Set to `true` when behind a reverse proxy or load balancer |
| `GITHUB_TOKEN` | No | GitHub PAT for higher API rate limits (5,000/hr vs 60/hr) |

To create a GitHub OAuth App, go to [GitHub Developer Settings](https://github.com/settings/applications/new) and set the callback URL to `http://localhost:3000/api/auth/callback/github` for local dev, or `https://your-domain.com/api/auth/callback/github` for production.

## Deployment

QuestHub is deployed on AWS using App Runner with a Docker container.

### Architecture

```
Route53 (questhub.crypt0potam.us)
  └─ AWS App Runner (Docker container)
       ├─ Next.js standalone server
       └─ PostgreSQL (RDS)
```

### Docker

The app uses a multi-stage Dockerfile with `output: "standalone"` for a minimal production image:

```bash
docker build -t questhub .
docker run -p 3000:3000 --env-file .env questhub
```

### Deploying to AWS App Runner

1. **Create an ECR repository:**

```bash
aws ecr create-repository --repository-name questhub
```

2. **Build, tag, and push the image:**

```bash
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker build -t questhub .
docker tag questhub:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/questhub:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/questhub:latest
```

3. **Create the App Runner service** via the AWS Console or CLI, pointing to the ECR image. Configure:
   - **Port:** 3000
   - **Health check:** TCP on port 3000
   - **Environment variables:** All variables from the table above
   - **Instance:** 1 vCPU / 2 GB RAM minimum

4. **Set up a custom domain** by associating it in App Runner and adding the CNAME/validation records to Route53.

5. **Run migrations** against the production database before the first deployment:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

6. **Update the GitHub OAuth App** callback URL to `https://your-domain.com/api/auth/callback/github`.

### SSL/TLS with RDS

RDS PostgreSQL uses AWS-issued certificates. Prisma v7 with `@prisma/adapter-pg` relies on the `pg` library for connections, and `pg` rejects the RDS certificate chain by default (`rejectUnauthorized: true`).

**Quick fix** — append `sslmode=no-verify` to `DATABASE_URL`:

```
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=no-verify"
```

This maps through `pg-connection-string` to `rejectUnauthorized: false` for the database connection only (unlike `NODE_TLS_REJECT_UNAUTHORIZED=0`, which disables TLS verification globally). See [Prisma's AWS deployment docs](https://www.prisma.io/docs/orm/prisma-client/deployment/caveats-when-deploying-to-aws-platforms).

**Better fix** — use the RDS CA bundle with `verify-full`. The Dockerfile already downloads the [AWS RDS global certificate bundle](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/UsingWithRDS.SSL.html) to `/app/certs/rds-global-bundle.pem`. To enable full verification:

```
DATABASE_URL="postgresql://user:pass@host:5432/dbname?sslmode=verify-full&sslrootcert=/app/certs/rds-global-bundle.pem"
```

### Gotchas

- **HOSTNAME binding:** The Dockerfile uses `node -e "process.env.HOSTNAME='0.0.0.0'; require('./server.js')"` as the entrypoint. Container orchestrators (App Runner, ECS, etc.) override the `HOSTNAME` env var with the container's internal hostname. Next.js standalone uses `HOSTNAME` to bind the server, so without this override the server only listens on the private IP and health checks fail.

- **AUTH_URL is required in production:** Without it, Auth.js can fall back to the container's internal address for OAuth redirects (e.g. `0.0.0.0:3000`), which breaks the login flow. Set it to your public HTTPS URL.

- **App Runner image caching:** When redeploying, App Runner may cache the image by digest. If an `update-service` call completes in under 20 seconds, it likely only applied env var changes without pulling the new image. Use a unique image tag (e.g. `:v2`, `:v3`) when the image content has changed to force a pull.

- **Special characters in DATABASE_URL:** URL-encode special characters in the password (e.g. `!` → `%21`).

## License

MIT
