import { NextRequest, NextResponse } from "next/server";
import { fetchBranches, fetchTags } from "@/lib/github";
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
    const [branches, tags] = await Promise.all([
      fetchBranches(owner, repo, accessToken),
      fetchTags(owner, repo, accessToken),
    ]);
    return NextResponse.json({ branches, tags });
  } catch (err: unknown) {
    const status =
      err instanceof Object && "status" in err
        ? (err as { status: number }).status
        : 500;
    return NextResponse.json(
      { error: "Failed to fetch refs" },
      { status: Math.min(status, 500) },
    );
  }
}
