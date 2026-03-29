import { AppShell } from "@/components/app-shell";
import { DashboardMetric } from "@/components/dashboard-metric";
import { SectionCard } from "@/components/section-card";
import { SetupNotice } from "@/components/setup-notice";
import { StatusBadge } from "@/components/status-badge";
import {
  orderReferenceLabels,
  paymentMethodLabels,
  paymentStatusLabels,
  preparationStatusLabels,
} from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getDailySummary } from "@/lib/queries";
import { hasDatabaseUrl, usesRailwayInternalHost } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResumenPage() {
  if (!hasDatabaseUrl()) {
    return (
      <AppShell
        title="Resumen diario"
        description="Vista consolidada de pedidos, cobros y formas de pago del día."
      >
        <SetupNotice />
      </AppShell>
    );
  }

  let summary;

  try {
    summary = await getDailySummary();
  } catch {
    return (
      <AppShell
        title="Resumen diario"
        description="Vista consolidada de pedidos, cobros y formas de pago del día."
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
      title="Resumen diario"
      description="Vista consolidada de pedidos, cobros y formas de pago del día."
    >
      <div className="grid gap-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <DashboardMetric
            label="Total vendido"
            value={formatCurrency(summary.totalSales)}
            detail="Suma total del día."
          />
          <DashboardMetric
            label="Cantidad de pedidos"
            value={String(summary.orderCount)}
            detail="Pedidos creados hoy."
          />
          <DashboardMetric
            label="Cantidad pagados"
            value={String(summary.paidCount)}
            detail="Pedidos con pago confirmado."
          />
          <DashboardMetric
            label="Cantidad pendientes"
            value={String(summary.pendingCount)}
            detail="Pedidos con pago pendiente."
          />
        </section>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <SectionCard
            title="Desglose por forma de pago"
            description="Solo considera pedidos que ya tienen una forma de pago registrada."
          >
            <div className="space-y-3">
              {Object.keys(summary.totalsByMethod).length === 0 ? (
                <p className="text-sm text-stone-600">
                  Aún no hay pagos registrados para hoy.
                </p>
              ) : (
                Object.entries(summary.totalsByMethod).map(([method, total]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between rounded-[1.5rem] border border-stone-200 bg-stone-50 px-4 py-3"
                  >
                    <p className="font-medium text-stone-800">
                      {paymentMethodLabels[method as keyof typeof paymentMethodLabels]}
                    </p>
                    <p className="font-semibold text-amber-700">
                      {formatCurrency(total)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Pedidos del día"
            description="Lista consolidada para control operacional y cierre."
          >
            <div className="grid gap-4">
              {summary.orders.length === 0 ? (
                <p className="text-sm text-stone-600">Todavía no hay pedidos hoy.</p>
              ) : (
                summary.orders.map((order) => (
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
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <p className="text-lg font-semibold text-amber-700">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <StatusBadge
                        tone={order.preparationStatus === "READY" ? "success" : "warning"}
                      >
                        {preparationStatusLabels[order.preparationStatus]}
                      </StatusBadge>
                      <StatusBadge
                        tone={order.paymentStatus === "PAID" ? "success" : "warning"}
                      >
                        {paymentStatusLabels[order.paymentStatus]}
                      </StatusBadge>
                      <StatusBadge tone="neutral">
                        {order.paymentMethod
                          ? paymentMethodLabels[order.paymentMethod]
                          : "Sin registrar"}
                      </StatusBadge>
                    </div>
                  </article>
                ))
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
