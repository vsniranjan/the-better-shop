// packages/database/src/index.ts
import { PrismaClient } from "@prisma/client";

// Global variable type definition
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create or retrieve PrismaClient instance
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// Save globally only in development (hot reload support)
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export types
export * from "@prisma/client";
