import { NextRequest, NextResponse } from "next/server";
import { fetchRepoIssues, fetchRepoPulls } from "@/lib/github";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const type = searchParams.get("type") ?? "issues";
  const state = searchParams.get("state") === "closed" ? "closed" : "open";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);

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
    const result =
      type === "pulls"
        ? await fetchRepoPulls(owner, repo, state, page, accessToken)
        : await fetchRepoIssues(owner, repo, state, page, accessToken);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const status =
      err instanceof Object && "status" in err
        ? (err as { status: number }).status
        : 500;
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: Math.min(status, 500) },
    );
  }
}
