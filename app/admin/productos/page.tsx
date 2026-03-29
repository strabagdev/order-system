import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { ProductAdminClient } from "@/components/product-admin-client";
import { SectionCard } from "@/components/section-card";
import { productCategoryLabels } from "@/lib/constants";
import { getAllProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProductosAdminPage() {
  const products = await getAllProducts();
  const activeProducts = products.filter((product) => product.isActive);
  const inactiveProducts = products.filter((product) => !product.isActive);
  const usedCategories = new Set(products.map((product) => product.category)).size;

  return (
    <AppShell
      title="Admin de productos"
      description="Mantenimiento simple de la carta para mantener la toma de pedidos al día."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-3">
          <DashboardMetric
            label="Productos activos"
            value={String(activeProducts.length)}
            detail="Disponibles en la toma de pedido."
          />
          <DashboardMetric
            label="Productos inactivos"
            value={String(inactiveProducts.length)}
            detail="Ocultos temporalmente de la carta."
          />
          <DashboardMetric
            label="Categorías usadas"
            value={String(usedCategories)}
            detail="Grupos visibles dentro del catálogo."
          />
        </section>

        <SectionCard
          title="Estado actual de la carta"
          description="Resumen rápido del catálogo antes de editar o crear productos."
        >
          <div className="flex flex-wrap gap-2">
            {Array.from(new Set(products.map((product) => product.category))).map((category) => (
              <span
                key={category}
                className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700"
              >
                {productCategoryLabels[category]}
              </span>
            ))}
          </div>
        </SectionCard>

        <ProductAdminClient products={products} />
      </div>
    </AppShell>
  );
}
