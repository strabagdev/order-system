import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  hasDatabaseUrl,
  resolveDatabaseUrl,
  usesRailwayInternalHost,
} from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as {
  prisma:
    | {
        client: PrismaClient;
        configKey: string;
      }
    | undefined;
};

function createPrismaClient(connectionString: string) {
  const usesRailwayPublicProxy = connectionString.includes("proxy.rlwy.net");
  const sanitizedConnectionString = usesRailwayPublicProxy
    ? connectionString.replace(/([?&])sslmode=[^&]+/, "$1").replace(/[?&]$/, "")
    : connectionString;

  if (usesRailwayPublicProxy) {
    process.env.PGSSLMODE = "no-verify";
  }

  const pool = new Pool({
    connectionString: sanitizedConnectionString,
    ssl: usesRailwayPublicProxy ? { rejectUnauthorized: false } : undefined,
  });
  const adapter = new PrismaPg(pool, {
    disposeExternalPool: true,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export function getPrisma() {
  const connectionString = resolveDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  const configKey = `${connectionString}|${connectionString.includes("proxy.rlwy.net") ? "no-verify" : "default"}`;

  if (!globalForPrisma.prisma || globalForPrisma.prisma.configKey !== configKey) {
    globalForPrisma.prisma?.client?.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = {
      client: createPrismaClient(connectionString),
      configKey,
    };
  }

  return globalForPrisma.prisma.client;
}

export { hasDatabaseUrl, usesRailwayInternalHost };
