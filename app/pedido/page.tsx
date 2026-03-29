import { AppShell } from "@/components/app-shell";
import { OrderTakingClient } from "@/components/order-taking-client";
import { getActiveProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PedidoPage() {
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
