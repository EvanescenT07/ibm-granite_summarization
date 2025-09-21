import { PrismaClient } from "@/generated/prisma";

// Avoid new connection
const globalPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

// Export instance (global cache)
export const prisma =
  globalPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Development environment set instance
if (process.env.NODE_ENV !== "production") globalPrisma.prisma = prisma;
