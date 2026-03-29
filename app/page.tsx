import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  orderReferenceLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  preparationStatusLabels,
} from "@/lib/constants";
import { formatCurrency, formatTime } from "@/lib/format";
import { getDailySummary } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const summary = await getDailySummary();
  const latestOrders = summary.orders.slice(0, 5);

  return (
    <AppShell
      title="Panel general"
      description="Base del MVP para toma, preparación, pago y resumen diario de pedidos."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric
            label="Venta del día"
            value={formatCurrency(summary.totalSales)}
            detail="Suma de todos los pedidos creados hoy."
          />
          <DashboardMetric
            label="Pedidos del día"
            value={String(summary.orderCount)}
            detail="Cantidad total registrada desde las 00:00."
          />
          <DashboardMetric
            label="Pedidos pagados"
            value={String(summary.paidCount)}
            detail="Pedidos con estado de pago actualizado a pagado."
          />
          <DashboardMetric
            label="Pendientes de pago"
            value={String(summary.pendingCount)}
            detail="Pedidos aún abiertos en caja."
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <SectionCard
            title="Rutas del MVP"
            description="Estructura inicial recomendada para construir por etapas sin sobrecomplejizar."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/pedido",
                  title: "Toma de pedido",
                  text: "Catálogo visual, resumen actual, referencia por mesa o número y guardado.",
                },
                {
                  href: "/preparacion",
                  title: "Preparación",
                  text: "Cola de pedidos con productos, hora y cambio de estado.",
                },
                {
                  href: "/pago",
                  title: "Pago",
                  text: "Estado independiente de pago y registro de método.",
                },
                {
                  href: "/resumen",
                  title: "Resumen diario",
                  text: "Indicadores del día y desglose por forma de pago.",
                },
                {
                  href: "/admin/productos",
                  title: "Admin productos",
                  text: "Alta, edición y activación/desactivación de la carta.",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <p className="text-base font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.text}</p>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Desarrollo por etapas"
            description="Orden exacto sugerido para construir este MVP con foco en funcionamiento y despliegue simple."
          >
            <ol className="space-y-3 text-sm leading-6 text-stone-700">
              <li>1. Configurar Prisma, PostgreSQL, utilidades base y datos semilla.</li>
              <li>2. Construir admin de productos para cargar la carta.</li>
              <li>3. Implementar la pantalla de toma de pedido con resumen y POST de órdenes.</li>
              <li>4. Implementar cola de preparación con cambio de estado independiente.</li>
              <li>5. Implementar cola de pago con método de pago y estado independiente.</li>
              <li>6. Implementar resumen diario con indicadores y desglose por forma de pago.</li>
              <li>7. Ajustar estilos, validaciones, documentación y despliegue en Railway.</li>
            </ol>
          </SectionCard>
        </div>

        <SectionCard
          title="Pedidos recientes"
          description="Lectura rápida del estado operativo actual del local."
        >
          {latestOrders.length === 0 ? (
            <p className="text-sm text-stone-600">
              Aún no hay pedidos cargados hoy. Puedes empezar desde la toma de pedido o cargar productos primero.
            </p>
          ) : (
            <div className="grid gap-4">
              {latestOrders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-base font-semibold text-stone-900">
                        {orderReferenceLabels[order.referenceType]} {order.referenceValue}
                      </p>
                      <p className="mt-1 text-sm text-stone-500">
                        {formatTime(order.createdAt)}
                      </p>
                      <p className="mt-3 text-sm text-stone-700">
                        {order.items
                          .map((item) => `${item.quantity} x ${item.productName}`)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-2 lg:items-end">
                      <p className="text-lg font-semibold text-amber-700">
                        {formatCurrency(order.total)}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge
                          tone={
                            order.preparationStatus === "READY" ? "success" : "warning"
                          }
                        >
                          {preparationStatusLabels[order.preparationStatus]}
                        </StatusBadge>
                        <StatusBadge
                          tone={order.paymentStatus === "PAID" ? "success" : "warning"}
                        >
                          {paymentStatusLabels[order.paymentStatus]}
                        </StatusBadge>
                        {order.paymentMethod ? (
                          <StatusBadge tone="neutral">
                            {paymentMethodLabels[order.paymentMethod]}
                          </StatusBadge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
