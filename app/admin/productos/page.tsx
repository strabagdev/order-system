import { AppShell } from "@/components/app-shell";
import { ProductAdminClient } from "@/components/product-admin-client";
import { SetupNotice } from "@/components/setup-notice";
import { getAllProducts } from "@/lib/queries";
import { hasDatabaseUrl, usesRailwayInternalHost } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  if (!hasDatabaseUrl()) {
    return (
      <AppShell
        title="Admin de productos"
        description="Carga y mantiene la carta base del local sin login en esta primera etapa."
      >
        <SetupNotice />
      </AppShell>
    );
  }

  let products;

  try {
    products = await getAllProducts();
  } catch {
    return (
      <AppShell
        title="Admin de productos"
        description="Carga y mantiene la carta base del local sin login en esta primera etapa."
      >
        <SetupNotice
          title="No se pudo conectar a PostgreSQL"
          description={
            usesRailwayInternalHost()
              ? "Tu `DATABASE_URL` está usando `postgres.railway.internal`, que solo funciona dentro de Railway. Para desarrollo local usa una URL pública de Railway o una base PostgreSQL local."
              : "La variable `DATABASE_URL` existe, pero la base no respondió. Revisa host, puerto, credenciales y que PostgreSQL esté accesible."
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Admin de productos"
      description="Carga y mantiene la carta base del local sin login en esta primera etapa."
    >
      <ProductAdminClient products={products} />
    </AppShell>
  );
}
