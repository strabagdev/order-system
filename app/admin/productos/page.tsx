import { AppShell } from "@/components/app-shell";
import { ProductAdminClient } from "@/components/product-admin-client";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await getAllProducts();

  return (
    <AppShell
      title="Admin de productos"
      description="Carga y mantiene la carta base del local sin login en esta primera etapa."
    >
      <ProductAdminClient products={products} />
    </AppShell>
  );
}
