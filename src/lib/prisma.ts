import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function createPrismaClient() {
  if (process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL);
      console.log("DB config", {
        host: dbUrl.hostname,
        database: dbUrl.pathname.slice(1),
        sslmode: dbUrl.searchParams.get("sslmode"),
        schema: dbUrl.searchParams.get("schema"),
      });
    } catch {}
  }

  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
}

const g = globalThis as unknown as { prisma: PrismaClient };
export const prisma = g.prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
