import { AppShell } from "@/components/app-shell";
import { ProductAdminClient } from "@/components/product-admin-client";
import { SetupNotice } from "@/components/setup-notice";
import { getAllProducts } from "@/lib/queries";
import { hasDatabaseUrl } from "@/lib/prisma";

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
