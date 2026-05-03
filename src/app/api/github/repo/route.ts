import { NextRequest, NextResponse } from "next/server";
import { fetchQuestRepo } from "@/lib/github";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "Missing required query parameters: owner, repo" },
      { status: 400 },
    );
  }

  let accessToken: string | undefined;
  try {
    const session = await auth();
    if (session?.user?.id) {
      const account = await prisma.account.findFirst({
        where: { userId: session.user.id, provider: "github" },
        select: { access_token: true },
      });
      accessToken = account?.access_token ?? undefined;
    }
  } catch {
    // Fall through to unauthenticated access
  }

  try {
    const data = await fetchQuestRepo(owner, repo, accessToken);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const status =
      err instanceof Object && "status" in err
        ? (err as { status: number }).status
        : 500;

    if (status === 404) {
      return NextResponse.json(
        { error: `Repository ${owner}/${repo} not found` },
        { status: 404 },
      );
    }

    if (status === 403) {
      const retryAfter =
        err instanceof Object && "response" in err
          ? ((err as { response: { headers: Record<string, string> } }).response
              ?.headers?.["retry-after"] ?? "60")
          : "60";
      return NextResponse.json(
        { error: "GitHub API rate limit exceeded. Try again later." },
        { status: 429, headers: { "Retry-After": retryAfter } },
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch repository data" },
      { status },
    );
  }
}
