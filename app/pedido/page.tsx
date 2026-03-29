import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { OrderTakingClient } from "@/components/order-taking-client";
import { SectionCard } from "@/components/section-card";
import { productCategoryLabels } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { getActiveProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function PedidoPage() {
  const products = await getActiveProducts();
  const activeCategories = new Set(products.map((product) => product.category)).size;
  const averagePrice =
    products.length > 0
      ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
      : 0;

  return (
    <AppShell
      title="Toma de pedido"
      description="Pantalla pensada para meseros: catálogo claro, resumen visible y guardado rápido."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <DashboardMetric
            label="Productos activos"
            value={String(products.length)}
            detail="Ítems disponibles para tomar pedidos."
          />
          <DashboardMetric
            label="Categorías visibles"
            value={String(activeCategories)}
            detail="Grupos usados para ordenar la carta."
          />
          <DashboardMetric
            label="Precio promedio"
            value={formatCurrency(averagePrice)}
            detail="Referencia rápida del catálogo actual."
          />
        </section>

        <SectionCard
          title="Carta operativa"
          description="Toca productos para agregarlos al pedido y ajusta cantidades desde el resumen lateral."
        >
          <div className="mb-5 flex flex-wrap gap-2">
            {Array.from(new Set(products.map((product) => product.category))).map((category) => (
              <span
                key={category}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700"
              >
                {productCategoryLabels[category]}
              </span>
            ))}
          </div>
          <OrderTakingClient products={products} />
        </SectionCard>
      </div>
    </AppShell>
  );
}
