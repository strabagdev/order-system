import { AppShell } from "@/components/app-shell";
import { OrderTakingClient } from "@/components/order-taking-client";
import { SetupNotice } from "@/components/setup-notice";
import { getActiveProducts } from "@/lib/queries";
import { hasDatabaseUrl, usesRailwayInternalHost } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PedidoPage() {
  if (!hasDatabaseUrl()) {
    return (
      <AppShell
        title="Toma de pedido"
        description="Selecciona productos desde la carta visual, asigna mesa o número y guarda el pedido."
      >
        <SetupNotice />
      </AppShell>
    );
  }

  let products;

  try {
    products = await getActiveProducts();
  } catch {
    return (
      <AppShell
        title="Toma de pedido"
        description="Selecciona productos desde la carta visual, asigna mesa o número y guarda el pedido."
      >
        <SetupNotice
          title="No se pudo conectar a PostgreSQL"
          description={
            usesRailwayInternalHost()
              ? "Tu `DATABASE_URL` usa `postgres.railway.internal`, que solo funciona dentro de Railway. Para desarrollo local usa una URL pública o una base local."
              : "La base no respondió. Revisa host, puerto y credenciales de `DATABASE_URL`."
          }
        />
      </AppShell>
    );
  }

  return (
    <AppShell
      title="Toma de pedido"
      description="Selecciona productos desde la carta visual, asigna mesa o número y guarda el pedido."
    >
      <OrderTakingClient products={products} />
    </AppShell>
  );
}
