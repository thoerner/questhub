import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import authConfig from "@/lib/auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: { strategy: "database" },
  events: {
    async linkAccount({ account }) {
      // On first link, token is already saved by the adapter
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.id) {
        await prisma.account.updateMany({
          where: { userId: user.id, provider: "github" },
          data: {
            access_token: account.access_token,
            scope: account.scope,
            token_type: account.token_type,
          },
        });
      }
      return true;
    },
    async session({ session, user }) {
      session.user.id = user.id;
      return session;
    },
  },
});
