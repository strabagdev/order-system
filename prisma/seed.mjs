import "dotenv/config";
import pg from "pg";

const { Client } = pg;

function resolveDatabaseUrl() {
  const isRailwayRuntime = Boolean(
    process.env.RAILWAY_ENVIRONMENT_ID ||
      process.env.RAILWAY_ENVIRONMENT_NAME ||
      process.env.RAILWAY_PROJECT_ID,
  );

  const value = isRailwayRuntime
    ? process.env.DATABASE_URL ?? process.env.DATABASE_PUBLIC_URL
    : process.env.DATABASE_PUBLIC_URL ?? process.env.DATABASE_URL;

  if (!value) {
    throw new Error("DATABASE_URL no está configurada.");
  }

  if (value.includes("proxy.rlwy.net") && !value.includes("sslmode=")) {
    return `${value}${value.includes("?") ? "&" : "?"}sslmode=require`;
  }

  return value;
}

function shouldUseRailwayProxySsl(url) {
  return url.includes("proxy.rlwy.net");
}

const products = [
  { name: "Completo Italiano", price: 6500, category: "MAIN", icon: "🌭" },
  { name: "Hamburguesa Clásica", price: 8900, category: "MAIN", icon: "🍔" },
  { name: "Papas Fritas", price: 3500, category: "SIDE", icon: "🍟" },
  { name: "Empanada de Queso", price: 2800, category: "SIDE", icon: "🥟" },
  { name: "Bebida Lata", price: 2200, category: "DRINK", icon: "🥤" },
  { name: "Jugo Natural", price: 2900, category: "DRINK", icon: "🧃" },
  { name: "Torta del Día", price: 3900, category: "DESSERT", icon: "🍰" },
];

async function main() {
  const connectionString = resolveDatabaseUrl();
  const client = new Client({
    connectionString,
    ssl: shouldUseRailwayProxySsl(connectionString)
      ? { rejectUnauthorized: false }
      : undefined,
  });

  await client.connect();

  for (const product of products) {
    const id = `${product.name.toLowerCase().replaceAll(" ", "-")}`;

    await client.query(
      `
        INSERT INTO "Product" ("id", "name", "price", "category", "icon", "isActive", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4::"ProductCategory", $5, true, NOW(), NOW())
        ON CONFLICT ("id")
        DO UPDATE SET
          "name" = EXCLUDED."name",
          "price" = EXCLUDED."price",
          "category" = EXCLUDED."category",
          "icon" = EXCLUDED."icon",
          "isActive" = EXCLUDED."isActive",
          "updatedAt" = NOW()
      `,
      [id, product.name, product.price, product.category, product.icon],
    );
  }

  await client.end();
}

main()
  .catch(async (error) => {
    console.error(error);
    process.exit(1);
  });
