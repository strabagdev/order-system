import { AppShell } from "@/components/app-shell";
import { OrderTakingClient } from "@/components/order-taking-client";
import { SetupNotice } from "@/components/setup-notice";
import { getActiveProducts } from "@/lib/queries";
import { hasDatabaseUrl } from "@/lib/prisma";

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

  const products = await getActiveProducts();

  return (
    <AppShell
      title="Toma de pedido"
      description="Selecciona productos desde la carta visual, asigna mesa o número y guarda el pedido."
    >
      <OrderTakingClient products={products} />
    </AppShell>
  );
}
