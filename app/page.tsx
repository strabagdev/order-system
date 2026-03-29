import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import {
  formatOrderReference,
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
  const pendingPreparation = summary.orders.filter(
    (order) => order.preparationStatus === "PENDING",
  ).length;
  const pendingPaymentTotal = summary.orders
    .filter((order) => order.paymentStatus === "PENDING")
    .reduce((sum, order) => sum + order.total, 0);
  const readyForCheckout = summary.orders.filter(
    (order) =>
      order.preparationStatus === "READY" && order.paymentStatus === "PENDING",
  ).length;

  return (
    <AppShell
      title="Panel general"
      description="Vista rápida del turno para saber qué tomar, qué preparar y qué cobrar primero."
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

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SectionCard
            title="Acciones del turno"
            description="Accesos pensados para el trabajo diario del local."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  href: "/pedido",
                  title: "Toma de pedido",
                  text: "Abrir un nuevo pedido desde la carta visual.",
                  meta: `${summary.orderCount} pedidos hoy`,
                },
                {
                  href: "/preparacion",
                  title: "Preparación",
                  text: "Revisar la cola pendiente y marcar pedidos listos.",
                  meta: `${pendingPreparation} pendientes`,
                },
                {
                  href: "/pago",
                  title: "Pago",
                  text: "Cobrar pedidos y registrar forma de pago.",
                  meta: `${summary.pendingCount} por cobrar`,
                },
                {
                  href: "/resumen",
                  title: "Resumen diario",
                  text: "Ver cierre parcial, pagos y movimientos del día.",
                  meta: formatCurrency(summary.totalSales),
                },
                {
                  href: "/admin/productos",
                  title: "Productos",
                  text: "Administrar la carta y mantener productos activos.",
                  meta: "Catálogo",
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  <p className="text-base font-semibold text-stone-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-stone-600">{item.text}</p>
                  <p className="mt-3 text-sm font-medium text-amber-700">{item.meta}</p>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Prioridades ahora"
            description="Indicadores rápidos para decidir dónde poner atención."
          >
            <div className="space-y-3 text-sm leading-6 text-stone-700">
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <p className="font-semibold text-stone-900">Cocina en espera</p>
                <p className="mt-1 text-stone-600">
                  {pendingPreparation} pedidos siguen pendientes de preparación.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <p className="font-semibold text-stone-900">Listos para cobrar</p>
                <p className="mt-1 text-stone-600">
                  {readyForCheckout} pedidos ya están listos pero siguen abiertos en pago.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-4">
                <p className="font-semibold text-stone-900">Monto pendiente</p>
                <p className="mt-1 text-stone-600">
                  Queda {formatCurrency(pendingPaymentTotal)} por cobrar en el turno.
                </p>
              </div>
            </div>
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
                        {formatOrderReference({
                          referenceType: order.referenceType,
                          referenceValue: order.referenceValue,
                        })}
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
