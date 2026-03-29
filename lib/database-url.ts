const INTERNAL_RAILWAY_HOST = "postgres.railway.internal";
const PUBLIC_RAILWAY_HOST = "proxy.rlwy.net";

function isRailwayRuntime() {
  return Boolean(
    process.env.RAILWAY_ENVIRONMENT_ID ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID,
  );
}

function withRailwaySsl(url: string) {
  if (!url.includes(PUBLIC_RAILWAY_HOST) || url.includes("sslmode=")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";

  return `${url}${separator}sslmode=require`;
}

export function resolveDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;
  const databasePublicUrl = process.env.DATABASE_PUBLIC_URL;

  if (isRailwayRuntime()) {
    return withRailwaySsl(databaseUrl ?? databasePublicUrl ?? "");
  }

  if (databasePublicUrl) {
    return withRailwaySsl(databasePublicUrl);
  }

  return databaseUrl ? withRailwaySsl(databaseUrl) : undefined;
}

export function hasDatabaseUrl() {
  return Boolean(resolveDatabaseUrl());
}

export function usesRailwayInternalHost() {
  const resolvedUrl = resolveDatabaseUrl();

  return resolvedUrl?.includes(INTERNAL_RAILWAY_HOST) ?? false;
}
